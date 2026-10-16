import { computed, ref, watch } from 'vue'
import { opcionesLotesStock } from '../../utils/productos/formularioProducto.js'
import { validarAjusteStock } from '../../utils/productos/validacionesProducto.js'

export function useProductoAjusteStock(props, emit) {
  const borrador = ref({ lote_id: null, nuevo_stock: null, motivo_ajuste: '' })
  const errors = ref({})
  const lotesDisponibles = computed(() => opcionesLotesStock(props.formulario.lotes))

  watch(() => props.visible, visible => {
    if (!visible) return
    borrador.value = props.ajuste ? { ...props.ajuste } : {
      lote_id: null,
      nuevo_stock: props.formulario.perecedero ? null : props.formulario.stock_actual,
      motivo_ajuste: ''
    }
    errors.value = { ...props.erroresServidor }
  }, { immediate: true })

  const seleccionarLote = id => {
    borrador.value.lote_id = id
    const lote = props.formulario.lotes.find(item => item.id === id)
    borrador.value.nuevo_stock = lote ? Number(lote.cantidad_actual) : null
  }
  const confirmar = () => {
    errors.value = validarAjusteStock(props.formulario, borrador.value)
    if (Object.keys(errors.value).length) return
    emit('aplicar', { ...borrador.value, motivo_ajuste: borrador.value.motivo_ajuste.trim() })
    emit('update:visible', false)
  }
  return { borrador, errors, lotesDisponibles, seleccionarLote, confirmar }
}
