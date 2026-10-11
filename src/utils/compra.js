//Unidades de un detalle: suma de lotes si es perecedero, si no la cantidad directa
export const calcularCantidadDetalle = (item) => {
  if (item.perecedero === 'PERECEDERO') {
    return (item.lotes || []).reduce((sum, l) => sum + (parseInt(l.cantidad) || 0), 0)
  }
  return parseInt(item.cantidad) || 0
}

//Total de la factura (costo x cantidad de cada detalle)
export const calcularTotalCompra = (detalles = []) =>
  detalles.reduce((sum, item) => sum + ((parseFloat(item.precio_unitario) || 0) * calcularCantidadDetalle(item)), 0).toFixed(2)

//Datos exactos que espera el backend (los usan el paso 2 para validar y el resumen para registrar)
export const armarDatosCompra = (datos) => ({
  proveedor_id: datos.proveedor_id,
  numero_factura: datos.numero_factura,
  codigo_factura: datos.codigo_factura,
  fecha_emision: datos.fecha_emision instanceof Date
    ? datos.fecha_emision.toISOString().split('T')[0]
    : datos.fecha_emision,
  total: calcularTotalCompra(datos.detalles),
  detalles: (datos.detalles || []).map(d => {
    const detalle = {
      producto_id: d.producto_id || null,
      precio_unitario: d.precio_unitario,
      factor_conversion: d.factor_conversion || 1,
      margen_detalle: d.margen_detalle,
      margen_mayor: d.margen_mayor
    }
    // Solo para producto nuevo
    if (!d.producto_id) {
      detalle.nombre = d.nombre
      detalle.categoria_id = d.categoria_id
      detalle.marca_id = d.marca_id
      detalle.stock_minimo = d.stock_minimo
      detalle.perecedero = d.perecedero
      detalle.seccion = d.seccion
    }
    // PERECEDERO → lotes, NORMAL → cantidad
    if (d.perecedero === 'PERECEDERO') {
      detalle.lotes = d.lotes
    } else {
      detalle.cantidad = calcularCantidadDetalle(d)
    }
    return detalle
  })
})
