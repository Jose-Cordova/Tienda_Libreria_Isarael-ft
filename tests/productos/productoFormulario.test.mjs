import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { effectScope, nextTick, reactive } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createServer } from 'vite'

let server
let useProductoFormulario
let useProductoStore
let useCategoriaStore
let useMarcaStore

before(async () => {
  // Vite resuelve los alias del proyecto; las acciones se sustituyen sin acceder a la API.
  server = await createServer({
    configFile: false,
    plugins: [{
      name: 'aislar-api-en-pruebas',
      load(id) {
        if (id.replaceAll('\\', '/').endsWith('/src/services/api.js')) return 'export default {}'
      }
    }],
    resolve: { alias: { '@': fileURLToPath(new URL('../../src', import.meta.url)) } },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
    appType: 'custom'
  })
  ;({ useProductoFormulario } = await server.ssrLoadModule('/src/composables/productos/useProductoFormulario.js'))
  ;({ useProductoStore } = await server.ssrLoadModule('/src/stores/productoStore.js'))
  ;({ useCategoriaStore } = await server.ssrLoadModule('/src/stores/categoriaStore.js'))
  ;({ useMarcaStore } = await server.ssrLoadModule('/src/stores/marcaStore.js'))
})
after(async () => { await server?.close() })

const producto = (cambios = {}) => ({
  id: 5, nombre: 'Cuaderno', categoria_id: 1, marca_id: 2,
  precio_detalle: '5.00', precio_mayor: '4.00', stock_minimo: 1,
  seccion: 'LIBRERIA', perecedero: 'NORMAL', stock: 10, lotes: [], ...cambios
})

function preparar(t, cambios = {}) {
  setActivePinia(createPinia())
  const scope = effectScope()
  t.after(() => scope.stop())
  const props = reactive({ visible: true, esEdicion: true, productoAEditar: producto(), tipoPerecedero: false, ...cambios })
  const eventos = []
  const store = useProductoStore()
  const estado = scope.run(() => useProductoFormulario(props, (...args) => eventos.push(args)))
  return { props, eventos, store, estado }
}

test('abrir y reabrir hidrata correctamente sin borrar categoría/marca ni conservar submodales', async t => {
  const { props, estado } = preparar(t)
  assert.equal(estado.productoForm.value.categoria_id, 1)
  estado.categoriaVisible.value = true
  estado.ajusteStock.value = { nuevo_stock: 0, motivo_ajuste: 'Merma' }
  props.visible = false
  await nextTick()
  props.productoAEditar = producto({ categoria_id: 7, marca_id: 8, seccion: 'TIENDA' })
  props.visible = true
  await nextTick()
  assert.equal(estado.productoForm.value.categoria_id, 7)
  assert.equal(estado.productoForm.value.marca_id, 8)
  assert.equal(estado.categoriaVisible.value, false)
  assert.equal(estado.ajusteStock.value, null)
})

test('cambiar de sección limpia IDs y filtra ambos catálogos', t => {
  const { estado } = preparar(t)
  useCategoriaStore().categorias = [{ id: 1, seccion: 'LIBRERIA' }, { id: 7, seccion: 'TIENDA' }]
  useMarcaStore().marcas = [{ id: 2, seccion: 'LIBRERIA' }, { id: 8, seccion: 'TIENDA' }]
  estado.productoForm.value.seccion = 'TIENDA'
  assert.equal(estado.productoForm.value.categoria_id, null)
  assert.equal(estado.productoForm.value.marca_id, null)
  assert.deepEqual(estado.categoriasFiltradas.value.map(item => item.id), [7])
  assert.deepEqual(estado.marcasFiltradas.value.map(item => item.id), [8])
})

test('guardar valida antes de llamar al store', async t => {
  const { estado, store, eventos } = preparar(t, { esEdicion: false, productoAEditar: null })
  let llamadas = 0
  store.createProducto = async () => { llamadas++ }
  await estado.guardar()
  assert.equal(llamadas, 0)
  assert.ok(estado.errors.value.nombre)
  assert.equal(eventos.some(([evento]) => evento === 'guardado'), false)
})

test('crear y editar llaman a la acción correcta y conservan el contrato de eventos', async t => {
  const { estado, props, store, eventos } = preparar(t)
  let editado
  let creado
  store.updateProducto = async (id, data) => { editado = { id, data } }
  store.createProducto = async data => { creado = data }
  await estado.guardar()
  assert.equal(editado.id, 5)
  assert.equal(editado.data.nombre, 'Cuaderno')
  assert.equal('cantidad_inicial' in editado.data, false)
  assert.equal(eventos.filter(([evento]) => evento === 'guardado').length, 1)
  props.esEdicion = false
  await estado.guardar()
  assert.equal(creado.cantidad_inicial, 1)
  assert.equal(eventos.filter(([evento]) => evento === 'guardado').length, 2)
})

test('errores del servidor quedan en el formulario abierto y se libera el estado de carga', async t => {
  const { estado, store, eventos } = preparar(t)
  store.updateProducto = async () => { throw { response: { status: 422, data: { errors: { nombre: ['Ya existe'] } } } } }
  await estado.guardar()
  assert.equal(estado.errors.value.nombre, 'Ya existe')
  assert.equal(estado.loading.value, false)
  assert.equal(eventos.some(([evento]) => evento === 'update:visible'), false)
})

test('durante el guardado se bloquean el cierre y el segundo envío', async t => {
  const { estado, store, eventos } = preparar(t)
  let resolver
  let llamadas = 0
  store.updateProducto = () => { llamadas++; return new Promise(resolve => { resolver = resolve }) }
  const primero = estado.guardar()
  estado.cerrar()
  await estado.guardar()
  assert.equal(llamadas, 1)
  assert.equal(eventos.some(([evento]) => evento === 'update:visible'), false)
  resolver()
  await primero
  assert.equal(estado.loading.value, false)
  assert.equal(eventos.filter(([evento]) => evento === 'update:visible').length, 1)
})
