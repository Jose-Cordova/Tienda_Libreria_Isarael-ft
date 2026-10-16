import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calcularStockProyectado, construirPayloadProducto, crearFormularioProducto,
  opcionesLotesStock, serializarFecha
} from '../../src/utils/productos/formularioProducto.js'
import {
  erroresValidacionServidor, validarAjusteStock, validarProducto
} from '../../src/utils/productos/validacionesProducto.js'

const hoy = '2026-10-15'
const formularioValido = () => ({
  ...crearFormularioProducto(), nombre: 'Cuaderno #1', categoria_id: 1, marca_id: 2,
  seccion: 'LIBRERIA', precio_detalle: 5, precio_mayor: 4, cantidad_inicial: 10
})
const contextoValido = () => ({ formulario: formularioValido(), esEdicion: false, lotes: [], nuevoLote: null, ajuste: null })
const loteValido = () => ({ codigo_lote: ' lot-01 ', fecha_vencimiento: new Date(2026, 10, 15), cantidad: 5 })

test('crear producto normal valida y envía solo los campos correspondientes', () => {
  const contexto = contextoValido()
  assert.deepEqual(validarProducto(contexto, hoy), {})
  const data = construirPayloadProducto(contexto)
  assert.equal(data.perecedero, 'NORMAL')
  assert.equal(data.cantidad_inicial, 10)
  for (const campo of ['id', 'stock_actual', 'lotes', 'nuevo_lote', 'nuevo_stock', 'lote_id']) assert.equal(campo in data, false)
})

test('crear perecedero serializa múltiples lotes y normaliza códigos sin mutar el borrador', () => {
  const contexto = contextoValido()
  contexto.formulario.perecedero = true
  contexto.lotes = [loteValido(), { ...loteValido(), codigo_lote: 'lot-02', cantidad: 3 }]
  assert.deepEqual(validarProducto(contexto, hoy), {})
  const data = construirPayloadProducto(contexto)
  assert.equal(data.perecedero, 'PERECEDERO')
  assert.equal('cantidad_inicial' in data, false)
  assert.deepEqual(data.lotes[0], { codigo_lote: 'LOT-01', fecha_vencimiento: '2026-11-15', cantidad: 5 })
  assert.equal(contexto.lotes[0].codigo_lote, ' lot-01 ')
})

test('editar producto sin ajuste no envía stock ni cantidad inicial ni lotes de creación', () => {
  const contexto = { ...contextoValido(), esEdicion: true }
  const data = construirPayloadProducto(contexto)
  assert.equal('cantidad_inicial' in data, false)
  assert.equal('nuevo_stock' in data, false)
  assert.equal('lotes' in data, false)
})

test('editar perecedero puede ajustar un lote y agregar otro simultáneamente', () => {
  const contexto = { ...contextoValido(), esEdicion: true, nuevoLote: loteValido() }
  contexto.formulario.perecedero = true
  contexto.formulario.stock_actual = 10
  contexto.formulario.lotes = [{ id: 8, cantidad_actual: 5 }]
  contexto.ajuste = { lote_id: 8, nuevo_stock: 10, motivo_ajuste: 'Conteo físico' }
  assert.deepEqual(validarProducto(contexto, hoy), {})
  const data = construirPayloadProducto(contexto)
  assert.equal(data.lote_id, 8)
  assert.equal(data.nuevo_stock, 10)
  assert.equal(data.nuevo_lote.codigo_lote, 'LOT-01')
  assert.equal(calcularStockProyectado(contexto.formulario, contexto.ajuste), 15)
})

test('un stock de lote igual al stock total sigue siendo un ajuste válido', () => {
  const contexto = { ...contextoValido(), esEdicion: true }
  contexto.formulario.perecedero = true
  contexto.formulario.stock_actual = 10
  contexto.formulario.lotes = [{ id: 8, cantidad_actual: 4 }]
  contexto.ajuste = { lote_id: 8, nuevo_stock: 10, motivo_ajuste: 'Conteo físico' }
  assert.deepEqual(validarProducto(contexto, hoy), {})
  assert.equal(construirPayloadProducto(contexto).nuevo_stock, 10)
  assert.equal(calcularStockProyectado(contexto.formulario, contexto.ajuste), 16)
})

test('ajuste normal permite cero y no envía lote_id', () => {
  const contexto = { ...contextoValido(), esEdicion: true }
  contexto.formulario.stock_actual = 5
  contexto.ajuste = { lote_id: null, nuevo_stock: 0, motivo_ajuste: 'Merma total' }
  assert.deepEqual(validarProducto(contexto, hoy), {})
  const data = construirPayloadProducto(contexto)
  assert.equal(data.nuevo_stock, 0)
  assert.equal('lote_id' in data, false)
  assert.equal(calcularStockProyectado(contexto.formulario, contexto.ajuste), 0)
})

test('validación de stock rechaza lote inexistente, cantidades inválidas y motivo vacío', () => {
  const formulario = { ...formularioValido(), perecedero: true, lotes: [{ id: 8, cantidad_actual: 5 }] }
  assert.ok(validarAjusteStock(formulario, { lote_id: 99, nuevo_stock: 3, motivo_ajuste: 'Conteo físico' }).lote_id)
  assert.ok(validarAjusteStock(formulario, { lote_id: 8, nuevo_stock: 5, motivo_ajuste: 'Conteo físico' }).nuevo_stock)
  for (const nuevo_stock of [null, -1, 1.5, NaN, 1000000000]) {
    const errors = validarAjusteStock(formulario, { lote_id: 8, nuevo_stock, motivo_ajuste: '' })
    assert.ok(errors.nuevo_stock)
    assert.ok(errors.motivo_ajuste)
  }
})

test('validaciones básicas detectan sección, nombre, precios y cantidades inválidas', () => {
  const contexto = contextoValido()
  Object.assign(contexto.formulario, { nombre: 'A', seccion: '', categoria_id: null, marca_id: null, precio_detalle: NaN, precio_mayor: -1, stock_minimo: null, cantidad_inicial: 1.5 })
  const errors = validarProducto(contexto, hoy)
  for (const campo of ['nombre', 'seccion', 'categoria_id', 'marca_id', 'precio_detalle', 'precio_mayor', 'stock_minimo', 'cantidad_inicial']) assert.ok(errors[campo])
})

test('el precio mayorista debe ser estrictamente menor que el precio detalle', () => {
  const contexto = contextoValido()
  for (const precio of [5, 6]) {
    contexto.formulario.precio_mayor = precio
    assert.ok(validarProducto(contexto, hoy).precio_mayor)
  }
})

test('lotes vacíos y duplicados se reportan con la clave del campo correspondiente', () => {
  const contexto = contextoValido()
  contexto.formulario.perecedero = true
  assert.ok(validarProducto(contexto, hoy).lotes)
  contexto.lotes = [loteValido(), { ...loteValido(), codigo_lote: 'LOT-01' }]
  assert.ok(validarProducto(contexto, hoy)['lotes.1.codigo_lote'])
})

test('nuevo lote requiere fecha futura válida y cantidad entera positiva', () => {
  const contexto = { ...contextoValido(), esEdicion: true }
  contexto.formulario.perecedero = true
  for (const fecha of [null, hoy, '2026-10-14', '2027-02-30', new Date('invalid')]) {
    contexto.nuevoLote = { ...loteValido(), fecha_vencimiento: fecha, cantidad: 0 }
    const errors = validarProducto(contexto, hoy)
    assert.ok(errors['nuevo_lote.fecha_vencimiento'])
    assert.ok(errors['nuevo_lote.cantidad'])
  }
})

test('la fecha enviada conserva el día local incluso cerca de medianoche', () => {
  assert.equal(serializarFecha(new Date(2026, 9, 20, 23, 30)), '2026-10-20')
  assert.equal(serializarFecha('2026-10-20'), '2026-10-20')
})

test('la edición no comparte objetos de lotes con los productos del store', () => {
  const producto = { stock: '10', perecedero: 'PERECEDERO', lotes: [{ id: 8, cantidad_actual: 5 }] }
  const formulario = crearFormularioProducto(producto)
  formulario.lotes[0].cantidad_actual = 99
  assert.equal(producto.lotes[0].cantidad_actual, 5)
  assert.equal(formulario.stock_actual, 10)
})

test('lotes con el mismo código y fecha conservan sus IDs y cantidades individuales', () => {
  const opciones = opcionesLotesStock([
    { id: 1, codigo_lote: 'LOT', fecha_vencimiento: '2026-11-01', cantidad_actual: 5 },
    { id: 2, codigo_lote: 'LOT', fecha_vencimiento: '2026-11-01', cantidad_actual: 8 }
  ], hoy)
  assert.deepEqual(opciones.map(lote => lote.id), [1, 2])
  assert.match(opciones[0].label, /Stock: 5/)
  assert.match(opciones[1].label, /Stock: 8/)
})

test('errores 422 mantienen las rutas de campos anidados para mostrarlos en su sección', () => {
  assert.deepEqual(erroresValidacionServidor({ 'lotes.1.cantidad': ['Cantidad inválida'], nombre: 'Nombre duplicado' }), {
    'lotes.1.cantidad': 'Cantidad inválida', nombre: 'Nombre duplicado'
  })
})
