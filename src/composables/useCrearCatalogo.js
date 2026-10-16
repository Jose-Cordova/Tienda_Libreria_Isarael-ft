import { ref, watch } from 'vue'
import { validarNombreCatalogoDisponible } from '../utils/catalogos.js'

// Cada modal aporta sus acciones de store; no depende del formulario de productos.
export function useCrearCatalogo(props, emit, { crear, listar, recargar, obtenerLista, entidad, articulo }) {
  const nombre = ref('')
  const seccion = ref('')
  const loading = ref(false)
  const error = ref('')

  watch(() => props.visible, visible => {
    if (visible) {
      nombre.value = ''
      seccion.value = props.seccion
      error.value = ''
    }
  }, { immediate: true })

  watch([nombre, seccion], () => { error.value = '' }, { flush: 'sync' })

  const guardar = async () => {
    if (loading.value) return
    error.value = ''
    const datos = { nombre: nombre.value.trim(), seccion: seccion.value }
    if (!datos.nombre || !datos.seccion) {
      error.value = 'Complete el nombre y la sección.'
      return
    }
    loading.value = true
    try {
      // Validar aquí también: una sesión abierta puede conservar acciones antiguas del store.
      await validarNombreCatalogoDisponible({
        nombre: datos.nombre,
        listar,
        entidad: entidad === 'categoría' ? 'Categoría' : 'Marca'
      })
      await crear(datos)
      await recargar()
      // Nombre y sección identifican el registro; nunca escoger el último arbitrariamente.
      const registro = obtenerLista().find(item =>
        item.nombre.trim().toLocaleLowerCase() === datos.nombre.toLocaleLowerCase() && item.seccion === datos.seccion
      )
      if (!registro) {
        error.value = `Se creó ${articulo} ${entidad}, pero no se pudo recuperar de la lista. Cierre y actualice el listado.`
        return
      }
      emit('creado', registro)
      emit('update:visible', false)
      emit('toast', { tipo: 'success', mensaje: `${entidad === 'categoría' ? 'Categoría creada' : 'Marca creada'} correctamente.` })
    } catch (err) {
      const data = err.response?.data || {}
      const validaciones = data.errors || data.error
      const primero = validaciones && typeof validaciones === 'object' ? Object.values(validaciones)[0] : null
      error.value = (Array.isArray(primero) ? primero[0] : primero) || data.message || `Error al crear ${entidad}.`
      emit('toast', { tipo: 'error', mensaje: error.value })
    } finally {
      loading.value = false
    }
  }

  return { nombre, seccion, loading, error, guardar }
}
