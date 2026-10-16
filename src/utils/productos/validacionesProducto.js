import { SECCIONES_PRODUCTO, serializarFecha } from './formularioProducto.js'

const esCantidad = (valor, minimo, maximo) => Number.isInteger(valor) && valor >= minimo && valor <= maximo
const esPrecio = valor => Number.isFinite(valor) && valor > 0 && valor <= 999999.99
const esFechaValida = fecha => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false
  const [year, month, day] = fecha.split('-').map(Number)
  return serializarFecha(new Date(year, month - 1, day)) === fecha
}

export const validarMotivoAjuste = (motivo) => {
  const texto = (motivo || '').trim()
  if (texto.length < 3) return 'Ingrese un motivo de ajuste válido (mín. 3 caracteres).'
  if (texto.length > 255) return 'El motivo del ajuste no debe superar los 255 caracteres.'
  if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,():#!¡?¿/]+$/.test(texto)) {
    return 'Solo se permiten letras, números y signos de puntuación básicos (. , - () : # ! ¡ ? ¿ /).'
  }
  return null
}

export const validarAjusteStock = (formulario, ajuste) => {
  const errors = {}
  const lote = formulario.lotes.find(item => item.id === ajuste.lote_id)
  if (formulario.perecedero && !lote) errors.lote_id = 'Debe seleccionar el lote a afectar.'
  if (!esCantidad(ajuste.nuevo_stock, 0, 999999999)) {
    errors.nuevo_stock = 'Ingrese un stock entero entre 0 y 999,999,999 unidades.'
  } else {
    const actual = formulario.perecedero ? Number(lote?.cantidad_actual) : formulario.stock_actual
    if (ajuste.nuevo_stock === actual) errors.nuevo_stock = `El nuevo stock debe ser diferente al stock actual (${actual}).`
  }
  const motivoError = validarMotivoAjuste(ajuste.motivo_ajuste)
  if (motivoError) errors.motivo_ajuste = motivoError
  return errors
}

const validarLote = (lote, prefijo, errors, hoy) => {
  if (!lote.codigo_lote?.trim()) errors[`${prefijo}.codigo_lote`] = 'El código de lote es obligatorio.'
  const fecha = serializarFecha(lote.fecha_vencimiento)
  if (!fecha) {
    errors[`${prefijo}.fecha_vencimiento`] = 'La fecha de vencimiento es obligatoria.'
  } else if (!esFechaValida(fecha) || fecha <= hoy) {
    errors[`${prefijo}.fecha_vencimiento`] = 'La fecha de vencimiento debe ser posterior a hoy.'
  }
  if (!esCantidad(lote.cantidad, 1, 999999999)) errors[`${prefijo}.cantidad`] = 'Ingrese una cantidad entera entre 1 y 999,999,999 unidades.'
}

export const validarProducto = ({ formulario, esEdicion, lotes, nuevoLote, ajuste }, hoy = serializarFecha(new Date())) => {
  const errors = {}
  const nombre = (formulario.nombre || '').trim()
  if (!nombre) errors.nombre = 'El nombre del producto es obligatorio.'
  else if (nombre.length < 3) errors.nombre = 'El nombre del producto debe tener al menos 3 caracteres.'
  else if (nombre.length > 100) errors.nombre = 'El nombre del producto no debe superar los 100 caracteres.'
  else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,#]+$/.test(nombre)) errors.nombre = 'Solo se permiten letras, números, espacios y los símbolos: - . , #'

  if (!SECCIONES_PRODUCTO.some(item => item.value === formulario.seccion)) errors.seccion = 'La sección es obligatoria.'
  if (!formulario.categoria_id) errors.categoria_id = 'La categoría es obligatoria.'
  if (!formulario.marca_id) errors.marca_id = 'La marca es obligatoria.'
  if (!esPrecio(formulario.precio_detalle)) errors.precio_detalle = 'El precio detalle debe ser mayor a 0 y no superar los $999,999.99.'
  if (!esPrecio(formulario.precio_mayor)) errors.precio_mayor = 'El precio mayorista debe ser mayor a 0 y no superar los $999,999.99.'
  else if (formulario.precio_mayor >= formulario.precio_detalle) errors.precio_mayor = 'El precio mayorista debe ser menor que el precio detalle.'
  if (!esCantidad(formulario.stock_minimo, 1, 999999)) errors.stock_minimo = 'El stock mínimo debe ser un entero entre 1 y 999,999 unidades.'

  if (esEdicion) {
    if (ajuste) Object.assign(errors, validarAjusteStock(formulario, ajuste))
    if (formulario.perecedero && nuevoLote) validarLote(nuevoLote, 'nuevo_lote', errors, hoy)
  } else if (formulario.perecedero) {
    if (!lotes.length) errors.lotes = 'Debe registrar al menos un lote.'
    const codigos = new Set()
    lotes.forEach((lote, index) => {
      const prefijo = `lotes.${index}`
      validarLote(lote, prefijo, errors, hoy)
      const codigo = (lote.codigo_lote || '').trim().toUpperCase()
      if (codigo && codigos.has(codigo)) errors[`${prefijo}.codigo_lote`] = 'Código de lote duplicado en el formulario.'
      codigos.add(codigo)
    })
  } else if (!esCantidad(formulario.cantidad_inicial, 1, 999999999)) {
    errors.cantidad_inicial = 'La cantidad inicial debe ser un entero entre 1 y 999,999,999 unidades.'
  }
  return errors
}

export const erroresValidacionServidor = (errors = {}) => Object.fromEntries(
  Object.entries(errors).map(([campo, mensajes]) => [campo, Array.isArray(mensajes) ? mensajes[0] : mensajes])
)
