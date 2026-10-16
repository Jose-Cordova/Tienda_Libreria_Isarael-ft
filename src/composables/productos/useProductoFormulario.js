import { computed, ref, watch } from 'vue'
import { useProductoStore } from '@/stores/productoStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useMarcaStore } from '@/stores/marcaStore'
import {
  calcularStockProyectado, construirPayloadProducto, crearFormularioProducto, crearLoteVacio
} from '@/utils/productos/formularioProducto'
import { erroresValidacionServidor, validarProducto } from '@/utils/productos/validacionesProducto'

export function useProductoFormulario(props, emit) {
  const productoStore = useProductoStore()
  const categoriaStore = useCategoriaStore()
  const marcaStore = useMarcaStore()
  const productoForm = ref(crearFormularioProducto())
  const lotesCreacion = ref([crearLoteVacio()])
  const nuevoLote = ref(null)
  const ajusteStock = ref(null)
  const errors = ref({})
  const loading = ref(false)
  const categoriaVisible = ref(false)
  const marcaVisible = ref(false)
  const ajusteVisible = ref(false)

  const reiniciar = () => {
    productoForm.value = crearFormularioProducto(props.visible ? props.productoAEditar : null, props.tipoPerecedero)
    lotesCreacion.value = [crearLoteVacio()]
    nuevoLote.value = null
    ajusteStock.value = null
    errors.value = {}
    categoriaVisible.value = false
    marcaVisible.value = false
    ajusteVisible.value = false
  }
  watch(() => props.visible, reiniciar, { immediate: true })

  // Solo limpiar por un cambio de sección del usuario, nunca al hidratar el objeto.
  watch(() => [productoForm.value, productoForm.value.seccion], ([formulario, seccion], [anteriorForm, anterior]) => {
    if (formulario === anteriorForm && seccion !== anterior) {
      productoForm.value.categoria_id = null
      productoForm.value.marca_id = null
    }
  }, { flush: 'sync' })

  const categoriasFiltradas = computed(() => categoriaStore.categorias.filter(item =>
    !productoForm.value.seccion || item.seccion === productoForm.value.seccion
  ))
  const marcasFiltradas = computed(() => marcaStore.marcas.filter(item =>
    !productoForm.value.seccion || item.seccion === productoForm.value.seccion
  ))
  const totalStockCalculado = computed(() => lotesCreacion.value.reduce((sum, lote) => sum + (Number(lote.cantidad) || 0), 0))
  const stockProyectado = computed(() => calcularStockProyectado(productoForm.value, ajusteStock.value))
  const fechaMinima = computed(() => {
    // Recalcular al abrir, incluso si el componente sigue montado desde ayer.
    if (!props.visible) return new Date()
    const fecha = new Date()
    fecha.setHours(0, 0, 0, 0)
    fecha.setDate(fecha.getDate() + 1)
    return fecha
  })

  const seleccionarCategoria = registro => { productoForm.value.categoria_id = registro.id }
  const seleccionarMarca = registro => { productoForm.value.marca_id = registro.id }
  const aplicarAjuste = ajuste => {
    ajusteStock.value = ajuste
    for (const campo of ['nuevo_stock', 'lote_id', 'motivo_ajuste']) delete errors.value[campo]
  }
  const cerrar = () => {
    if (!loading.value) emit('update:visible', false)
  }
  const guardar = async () => {
    if (loading.value) return
    const contexto = {
      formulario: productoForm.value,
      esEdicion: props.esEdicion,
      lotes: lotesCreacion.value,
      nuevoLote: nuevoLote.value,
      ajuste: ajusteStock.value
    }
    errors.value = validarProducto(contexto)
    if (Object.keys(errors.value).length) {
      emit('toast', { tipo: 'warn', mensaje: 'Revise los campos marcados del formulario.' })
      return
    }
    loading.value = true
    try {
      const data = construirPayloadProducto(contexto)
      if (props.esEdicion) await productoStore.updateProducto(productoForm.value.id, data)
      else await productoStore.createProducto(data)
      emit('update:visible', false)
      emit('guardado')
      emit('toast', { tipo: 'success', mensaje: props.esEdicion ? 'Producto actualizado con éxito' : 'Producto guardado con éxito' })
    } catch (error) {
      const data = error.response?.data || {}
      if (error.response?.status === 422 && data.errors && Object.keys(data.errors).length) {
        errors.value = erroresValidacionServidor(data.errors)
        emit('toast', { tipo: 'warn', mensaje: 'Revise los campos marcados del formulario.' })
      } else {
        emit('toast', {
          tipo: error.response?.status === 422 ? 'warn' : 'error',
          mensaje: data.message || 'Ocurrió un error inesperado al guardar el producto.'
        })
      }
    } finally {
      loading.value = false
    }
  }

  return {
    productoForm, lotesCreacion, nuevoLote, ajusteStock, errors, loading,
    categoriaVisible, marcaVisible, ajusteVisible, categoriasFiltradas, marcasFiltradas,
    totalStockCalculado, stockProyectado, fechaMinima,
    seleccionarCategoria, seleccionarMarca, aplicarAjuste, cerrar, guardar
  }
}
