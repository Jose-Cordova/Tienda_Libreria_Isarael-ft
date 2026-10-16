import test from 'node:test'
import assert from 'node:assert/strict'
import { effectScope, nextTick, reactive } from 'vue'
import { useCrearCatalogo } from '../../src/composables/useCrearCatalogo.js'

function preparar(t, cambios = {}) {
  const scope = effectScope()
  t.after(() => scope.stop())
  const props = reactive({ visible: true, seccion: 'LIBRERIA' })
  const eventos = []
  const config = {
    crear: async () => {}, recargar: async () => {},
    listar: async () => ({ data: { data: [], last_page: 1 } }),
    obtenerLista: () => [
      { id: 1, nombre: 'Escolar', seccion: 'TIENDA' },
      { id: 2, nombre: 'Escolar', seccion: 'LIBRERIA' }
    ], entidad: 'categoría', articulo: 'la', ...cambios
  }
  const estado = scope.run(() => useCrearCatalogo(props, (...args) => eventos.push(args), config))
  return { props, eventos, estado }
}

test('catálogo selecciona nombre y sección, no el primer nombre coincidente', async t => {
  const { estado, eventos } = preparar(t)
  estado.nombre.value = ' Escolar '
  await estado.guardar()
  assert.equal(eventos.find(([evento]) => evento === 'creado')[1].id, 2)
  assert.equal(estado.loading.value, false)
})

test('reabrir un catálogo limpia datos y toma la sección del nuevo contexto', async t => {
  const { estado, props } = preparar(t)
  estado.nombre.value = 'Borrador'
  props.visible = false
  await nextTick()
  props.seccion = 'TIENDA'
  props.visible = true
  await nextTick()
  assert.equal(estado.nombre.value, '')
  assert.equal(estado.seccion.value, 'TIENDA')
})

test('catálogo maneja errores 422 sin cerrar y permite corregir el formulario', async t => {
  const { estado, eventos } = preparar(t, {
    crear: async () => { throw { response: { status: 422, data: { errors: { nombre: ['Ya existe'] } } } } }
  })
  estado.nombre.value = 'Escolar'
  await estado.guardar()
  assert.equal(estado.error.value, 'Ya existe')
  assert.equal(estado.loading.value, false)
  assert.equal(eventos.some(([evento]) => evento === 'update:visible'), false)
  estado.nombre.value = 'Otro nombre'
  assert.equal(estado.error.value, '')
})

test('catálogo impide envíos duplicados mientras la creación está en curso', async t => {
  let resolver
  let llamadas = 0
  const { estado } = preparar(t, { crear: () => { llamadas++; return new Promise(resolve => { resolver = resolve }) } })
  estado.nombre.value = 'Escolar'
  const primero = estado.guardar()
  await estado.guardar()
  await nextTick()
  assert.equal(llamadas, 1)
  resolver()
  await primero
})

test('catálogo no escoge un registro arbitrario si no encuentra el recién creado', async t => {
  const { estado, eventos } = preparar(t, { obtenerLista: () => [{ id: 99, nombre: 'Otro', seccion: 'LIBRERIA' }] })
  estado.nombre.value = 'Escolar'
  await estado.guardar()
  assert.equal(eventos.some(([evento]) => evento === 'creado'), false)
  assert.match(estado.error.value, /no se pudo recuperar/)
})

for (const entidad of ['categoría', 'marca']) {
  test(`${entidad}: el modal bloquea duplicados aunque el guardado del store no valide`, async t => {
    let escrituras = 0
    const { estado, eventos } = preparar(t, {
      entidad,
      // Reproduce una acción de Pinia conservada desde antes de añadir la validación.
      crear: async () => { escrituras++ },
      listar: async () => ({ data: { data: [{ id: 1, nombre: 'ropa' }], last_page: 1 } })
    })
    estado.nombre.value = ' R O p A '
    await estado.guardar()
    assert.equal(escrituras, 0)
    assert.equal(estado.error.value, entidad === 'categoría' ? 'Categoría ya existente.' : 'Marca ya existente.')
    assert.equal(estado.loading.value, false)
    assert.equal(eventos.some(([evento]) => evento === 'update:visible'), false)
    assert.equal(eventos.some(([evento]) => evento === 'creado'), false)
  })
}

test('modal comprueba páginas que no estaban cargadas y permite corregir el duplicado', async t => {
  let escrituras = 0
  let consultas = []
  const { estado, eventos } = preparar(t, {
    crear: async () => { escrituras++ },
    listar: async ({ page }) => {
      consultas.push(page)
      return { data: { data: page === 2 ? [{ id: 1, nombre: 'ropa' }] : [], last_page: 2 } }
    },
    obtenerLista: () => [{ id: 2, nombre: 'Escolar', seccion: 'LIBRERIA' }]
  })
  estado.nombre.value = 'R O P A'
  await estado.guardar()
  assert.deepEqual(consultas, [1, 2])
  assert.equal(escrituras, 0)
  estado.nombre.value = 'Escolar'
  assert.equal(estado.error.value, '')
  consultas = []
  await estado.guardar()
  assert.deepEqual(consultas, [1, 2])
  assert.equal(escrituras, 1)
  assert.equal(eventos.find(([evento]) => evento === 'creado')[1].id, 2)
})
