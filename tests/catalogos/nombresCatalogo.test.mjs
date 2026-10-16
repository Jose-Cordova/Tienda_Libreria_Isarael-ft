import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizarNombreCatalogo, validarNombreCatalogoDisponible } from '../../src/utils/catalogos.js'

test('normalización considera iguales mayúsculas y espacios interiores/exteriores', () => {
  for (const nombre of ['ropa', ' ROPA ', 'R O p A', 'r\to\np\u00a0a', 'R  o  P  a']) {
    assert.equal(normalizarNombreCatalogo(nombre), 'ropa')
  }
  assert.equal(normalizarNombreCatalogo('Ropa de bebé'), normalizarNombreCatalogo('R O P A D E B E B É'))
})

test('la comparación no confunde caracteres distintos ni pierde la ñ', () => {
  assert.notEqual(normalizarNombreCatalogo('ropa'), normalizarNombreCatalogo('ropero'))
  assert.notEqual(normalizarNombreCatalogo('año'), normalizarNombreCatalogo('ano'))
  assert.equal(normalizarNombreCatalogo('café'), normalizarNombreCatalogo('cafe\u0301'))
})

for (const entidad of ['Categoría', 'Marca']) {
  test(`${entidad}: rechaza nombres equivalentes incluso en otra sección`, async () => {
    await assert.rejects(validarNombreCatalogoDisponible({
      nombre: ' R O p A ', entidad,
      listar: async () => ({ data: { data: [{ id: 1, nombre: 'ropa', seccion: 'TIENDA' }], last_page: 1 } })
    }), error => {
      assert.equal(error.response.status, 422)
      assert.deepEqual(error.response.data.errors.nombre, [`${entidad} ya existente.`])
      return true
    })
  })
}

test('la búsqueda revisa todas las páginas, sin filtro de nombre o sección', async () => {
  const consultas = []
  await assert.rejects(validarNombreCatalogoDisponible({
    nombre: 'ropa', entidad: 'Categoría',
    listar: async params => {
      consultas.push(params)
      return { data: { data: params.page === 3 ? [{ id: 3, nombre: 'R O P A' }] : [], last_page: 3 } }
    }
  }), /Categoría ya existente/)
  assert.deepEqual(consultas, [1, 2, 3].map(page => ({ page, per_page: 100 })))
})

test('editar excluye el propio ID aunque llegue como cadena', async () => {
  await validarNombreCatalogoDisponible({
    nombre: 'R O P A', entidad: 'Categoría', omitirId: '1',
    listar: async () => ({ data: [{ id: 1, nombre: 'Ropa' }] })
  })
  await assert.rejects(validarNombreCatalogoDisponible({
    nombre: 'R O P A', entidad: 'Categoría', omitirId: 1,
    listar: async () => ({ data: [{ id: 1, nombre: 'Ropa' }, { id: 2, nombre: 'ropa' }] })
  }), /Categoría ya existente/)
})

test('un nombre diferente se permite tras revisar el catálogo completo', async () => {
  await validarNombreCatalogoDisponible({
    nombre: 'Ropa de bebé', entidad: 'Categoría',
    listar: async () => ({ data: { data: [{ id: 1, nombre: 'Ropa' }], last_page: 1 } })
  })
})

test('si falla la consulta se propaga el error y no se considera disponible el nombre', async () => {
  const error = new Error('Sin conexión')
  await assert.rejects(validarNombreCatalogoDisponible({
    nombre: 'Ropa', entidad: 'Categoría', listar: async () => { throw error }
  }), error)
})
