import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createPinia, setActivePinia } from 'pinia'
import { createServer } from 'vite'

let server
const catalogos = []

before(async () => {
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
  for (const [entidad, archivo, plural] of [['Categoria', 'categoria', 'categorias'], ['Marca', 'marca', 'marcas']]) {
    const modulo = await server.ssrLoadModule(`/src/stores/${archivo}Store.js`)
    const { default: service } = await server.ssrLoadModule(`/src/services/${archivo}Service.js`)
    catalogos.push({ entidad, plural, useStore: modulo[`use${entidad}Store`], service })
  }
})
after(async () => { await server?.close() })

for (let index = 0; index < 2; index++) {
  const etiqueta = index === 0 ? 'categoría' : 'marca'

  test(`${etiqueta}: duplicado bloquea POST y conserva la página que se está consultando`, async () => {
    setActivePinia(createPinia())
    const { entidad, plural, useStore, service } = catalogos[index]
    const store = useStore()
    store[plural] = [{ id: 99, nombre: 'Listado actual' }]
    store.pagination.current_page = 3
    let escrituras = 0
    service[`get${entidad}s`] = async () => ({ data: { data: [{ id: 1, nombre: 'Ropa', seccion: 'TIENDA' }], last_page: 1 } })
    service[`create${entidad}`] = async () => { escrituras++ }
    await assert.rejects(store[`create${entidad}`]({ nombre: ' R O p A ', seccion: 'LIBRERIA' }), /ya existente/)
    assert.equal(escrituras, 0)
    assert.equal(store.loading, false)
    assert.equal(store.pagination.current_page, 3)
    assert.equal(store[plural][0].id, 99)
  })

  test(`${etiqueta}: nombre nuevo conserva su formato y el flujo de guardado`, async () => {
    setActivePinia(createPinia())
    const { entidad, useStore, service } = catalogos[index]
    const store = useStore()
    const datos = { nombre: 'Ropa de bebé', seccion: 'TIENDA' }
    let guardado
    service[`get${entidad}s`] = async () => ({ data: { data: [], last_page: 1 } })
    service[`create${entidad}`] = async data => { guardado = data }
    await store[`create${entidad}`](datos)
    assert.deepEqual(guardado, datos)
    assert.equal(store.loading, false)
  })

  test(`${etiqueta}: editar permite su propio nombre pero impide usar el de otro registro`, async () => {
    setActivePinia(createPinia())
    const { entidad, useStore, service } = catalogos[index]
    const store = useStore()
    let escrituras = 0
    service[`get${entidad}s`] = async () => ({ data: { data: [{ id: 1, nombre: 'Ropa' }, { id: 2, nombre: 'Escolar' }], last_page: 1 } })
    service[`update${entidad}`] = async () => { escrituras++ }
    await store[`update${entidad}`]('1', { nombre: 'R O P A', seccion: 'TIENDA' })
    assert.equal(escrituras, 1)
    await assert.rejects(store[`update${entidad}`](1, { nombre: 'E S C O L A R', seccion: 'TIENDA' }), /ya existente/)
    assert.equal(escrituras, 1)
    assert.equal(store.loading, false)
  })

  test(`${etiqueta}: si no se puede verificar el catálogo no se envía la creación`, async () => {
    setActivePinia(createPinia())
    const { entidad, useStore, service } = catalogos[index]
    const store = useStore()
    let escrituras = 0
    service[`get${entidad}s`] = async () => { throw new Error('Sin conexión') }
    service[`create${entidad}`] = async () => { escrituras++ }
    await assert.rejects(store[`create${entidad}`]({ nombre: 'Ropa', seccion: 'TIENDA' }), /Sin conexión/)
    assert.equal(escrituras, 0)
    assert.equal(store.loading, false)
  })
}
