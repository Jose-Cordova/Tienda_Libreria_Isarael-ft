export const SECCIONES_PRODUCTO = [
  { label: 'Tienda', value: 'TIENDA', icono: 'pi pi-shopping-cart' },
  { label: 'Librería', value: 'LIBRERIA', icono: 'pi pi-book' },
  { label: 'Medicamentos', value: 'MEDICAMENTO', icono: 'pi pi-heart' }
]

export const crearLoteVacio = () => ({ codigo_lote: '', fecha_vencimiento: null, cantidad: 1 })

export const crearFormularioProducto = (producto = null, tipoPerecedero = false) => ({
  id: producto?.id ?? null,
  nombre: producto?.nombre ?? '',
  categoria_id: producto?.categoria_id ?? null,
  marca_id: producto?.marca_id ?? null,
  precio_detalle: producto ? Number(producto.precio_detalle) : null,
  precio_mayor: producto ? Number(producto.precio_mayor) : null,
  stock_minimo: Number(producto?.stock_minimo ?? 1),
  perecedero: producto ? producto.perecedero === 'PERECEDERO' : tipoPerecedero,
  cantidad_inicial: 1,
  seccion: producto?.seccion ?? '',
  stock_actual: Number(producto?.stock ?? 0),
  lotes: (producto?.lotes ?? []).map(lote => ({ ...lote }))
})

// Las fechas del calendario son locales; no convertir a UTC (puede cambiar el día).
export const serializarFecha = (fecha) => {
  if (!(fecha instanceof Date)) return fecha
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const serializarLote = lote => ({
  codigo_lote: lote.codigo_lote.trim().toUpperCase(),
  fecha_vencimiento: serializarFecha(lote.fecha_vencimiento),
  cantidad: lote.cantidad
})

export const construirPayloadProducto = ({ formulario, esEdicion, lotes, nuevoLote, ajuste }) => {
  const data = {
    nombre: formulario.nombre,
    categoria_id: formulario.categoria_id,
    marca_id: formulario.marca_id,
    precio_detalle: formulario.precio_detalle,
    precio_mayor: formulario.precio_mayor,
    stock_minimo: formulario.stock_minimo,
    perecedero: formulario.perecedero ? 'PERECEDERO' : 'NORMAL',
    seccion: formulario.seccion
  }
  if (esEdicion) {
    if (ajuste) {
      data.nuevo_stock = ajuste.nuevo_stock
      data.motivo_ajuste = ajuste.motivo_ajuste
      if (formulario.perecedero) data.lote_id = ajuste.lote_id
    }
    if (formulario.perecedero && nuevoLote) data.nuevo_lote = serializarLote(nuevoLote)
  } else if (formulario.perecedero) {
    data.lotes = lotes.map(serializarLote)
  } else {
    data.cantidad_inicial = formulario.cantidad_inicial
  }
  return data
}

export const calcularStockProyectado = (formulario, ajuste) => {
  if (!ajuste) return formulario.stock_actual
  if (!formulario.perecedero) return ajuste.nuevo_stock
  const lote = formulario.lotes.find(item => item.id === ajuste.lote_id)
  return formulario.stock_actual + ajuste.nuevo_stock - Number(lote?.cantidad_actual ?? 0)
}

export const opcionesLotesStock = (lotes, hoy = serializarFecha(new Date())) => lotes.map(lote => {
  const fecha = lote.fecha_vencimiento ? String(lote.fecha_vencimiento).split('T')[0] : ''
  const tag = Number(lote.cantidad_actual) <= 0 || lote.estado === 'INACTIVO'
    ? ' - AGOTADO' : fecha && fecha < hoy ? ' - VENCIDO' : ''
  const fechaTexto = fecha ? fecha.split('-').reverse().join('/') : 'Sin fecha'
  // Un ID representa un lote real del backend, nunca la suma de varios IDs.
  return {
    id: lote.id,
    label: `${lote.codigo_lote} (Stock: ${lote.cantidad_actual} u. | Vence: ${fechaTexto})${tag}`
  }
})
