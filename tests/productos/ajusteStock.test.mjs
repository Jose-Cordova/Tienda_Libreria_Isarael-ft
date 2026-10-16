import test from 'node:test'
import assert from 'node:assert/strict'
import { effectScope, nextTick, reactive } from 'vue'
import { useProductoAjusteStock } from '../../src/composables/productos/useProductoAjusteStock.js'

function preparar(t, cambios = {}) {
  const scope = effectScope()
  t.after(() => scope.stop())
  const props = reactive({
    visible: true,
    formulario: { stock_actual: 10, perecedero: false, lotes: [] },
    ajuste: null, erroresServidor: {}, ...cambios
  })
  const eventos = []
  const estado = scope.run(() => useProductoAjusteStock(props, (...args) => eventos.push(args)))
  return { props, eventos, estado }
}

test('cancelar un primer borrador no aplica stock ni lo conserva al reabrir', async t => {
  const { props, estado, eventos } = preparar(t)
  estado.borrador.value.nuevo_stock = 0
  estado.borrador.value.motivo_ajuste = 'Merma'
  props.visible = false
  await nextTick()
  props.visible = true
  await nextTick()
  assert.equal(props.ajuste, null)
  assert.equal(estado.borrador.value.nuevo_stock, 10)
  assert.equal(estado.borrador.value.motivo_ajuste, '')
  assert.equal(eventos.length, 0)
})

test('cancelar cambios posteriores conserva el ajuste previamente aceptado', async t => {
  const ajuste = { lote_id: null, nuevo_stock: 6, motivo_ajuste: 'Conteo físico' }
  const { props, estado } = preparar(t, { ajuste })
  estado.borrador.value.nuevo_stock = 1
  props.visible = false
  await nextTick()
  props.visible = true
  await nextTick()
  assert.equal(props.ajuste.nuevo_stock, 6)
  assert.equal(estado.borrador.value.nuevo_stock, 6)
})

test('ajuste inválido no se aplica ni cierra el submodal', t => {
  const { estado, eventos } = preparar(t)
  estado.confirmar()
  assert.ok(estado.errors.value.nuevo_stock)
  assert.ok(estado.errors.value.motivo_ajuste)
  assert.equal(eventos.length, 0)
})

test('ajuste válido se aplica como copia y permite llevar el stock a cero', t => {
  const { estado, eventos } = preparar(t)
  estado.borrador.value.nuevo_stock = 0
  estado.borrador.value.motivo_ajuste = ' Merma total '
  estado.confirmar()
  assert.deepEqual(eventos, [
    ['aplicar', { lote_id: null, nuevo_stock: 0, motivo_ajuste: 'Merma total' }],
    ['update:visible', false]
  ])
  estado.borrador.value.nuevo_stock = 99
  assert.equal(eventos[0][1].nuevo_stock, 0)
})

test('elegir otro lote toma su cantidad individual y no modifica el producto original', t => {
  const { estado, props } = preparar(t, {
    formulario: { stock_actual: 10, perecedero: true, lotes: [{ id: 1, cantidad_actual: 4 }, { id: 2, cantidad_actual: 6 }] }
  })
  estado.seleccionarLote(2)
  assert.equal(estado.borrador.value.nuevo_stock, 6)
  estado.borrador.value.nuevo_stock = 8
  assert.equal(props.formulario.lotes[1].cantidad_actual, 6)
})
