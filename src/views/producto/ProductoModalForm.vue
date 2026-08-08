<template>
  <div>
    <!-- Modal principal de Producto (crear/editar) -->
    <Teleport to="body">
      <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
        <form @submit.prevent="guardarProducto" class="bg-white rounded-[24px] w-[95vw] max-w-4xl shadow-2xl relative animate-fade-up border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03] z-20"></div>
          <button type="button" @click="cerrarModalProducto" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition z-10">
            <i class="pi pi-times text-xl"></i>
          </button>

          <div class="p-6 md:p-8 pb-4 border-b border-gray-100 text-left pr-16">
            <h2 class="text-2xl font-extrabold text-[#003d00] mb-1">{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
            <p class="text-gray-400 font-medium text-sm">Complete los datos del producto</p>
          </div>

          <div class="p-6 md:p-8 overflow-y-auto flex-1 space-y-4 md:space-y-6 text-left">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre</label>
                <InputText v-model="productoForm.nombre" class="w-full border border-gray-200 rounded-xl p-3 focus:border-[#003d00]" :class="{ 'border-red-500': errors.nombre }" />
                <small class="text-red-500">{{ errors.nombre }}</small>
              </div>

              <!-- Sección -->
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
                  <i class="pi pi-tags mr-1 text-[#034e03]"></i> Sección
                </label>
                <Dropdown
                  v-model="productoForm.seccion"
                  :options="secciones"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccionar sección"
                  class="w-full border border-gray-200 rounded-xl"
                  :class="{ 'border-red-500': errors.seccion }"
                  :disabled="esEdicion && productoForm.stock_actual > 0 && productoForm.perecedero === true"
                />
                <small v-if="esEdicion && productoForm.stock_actual > 0 && productoForm.perecedero === true" class="text-amber-600 block mt-1">
                  <i class="pi pi-exclamation-triangle mr-1"></i> No se puede cambiar la sección porque el producto es perecedero y tiene stock.
                </small>
                <small class="text-red-500">{{ errors.seccion }}</small>
              </div>

              <!-- Categoría -->
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1" :class="{'text-gray-400': !productoForm.seccion && !esEdicion}">
                  <i class="pi pi-tags mr-1" :class="!productoForm.seccion && !esEdicion ? 'text-gray-400' : 'text-[#034e03]'"></i> Categoría
                </label>
                <div class="flex gap-2">
                  <Dropdown
                    v-model="productoForm.categoria_id"
                    :options="categoriasFiltradas"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar"
                    class="flex-1 border border-gray-200 rounded-xl"
                    :class="{ 'border-red-500': errors.categoria_id }"
                    :disabled="!productoForm.seccion && !esEdicion"
                  />
                  <Button icon="pi pi-plus" class="!bg-[#003d00] !text-white !rounded-full !w-8 !h-8" @click="abrirSubModal('categoria')" :disabled="!productoForm.seccion && !esEdicion" />
                </div>
                <small class="text-red-500">{{ errors.categoria_id }}</small>
              </div>

              <!-- Marca -->
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1" :class="{'text-gray-400': !productoForm.seccion && !esEdicion}">
                  <i class="pi pi-bookmark mr-1" :class="!productoForm.seccion && !esEdicion ? 'text-gray-400' : 'text-[#034e03]'"></i> Marca
                </label>
                <div class="flex gap-2">
                  <Dropdown
                    v-model="productoForm.marca_id"
                    :options="marcasFiltradas"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar"
                    class="flex-1 border border-gray-200 rounded-xl"
                    :class="{ 'border-red-500': errors.marca_id }"
                    :disabled="!productoForm.seccion && !esEdicion"
                  />
                  <Button icon="pi pi-plus" class="!bg-[#003d00] !text-white !rounded-full !w-8 !h-8" @click="abrirSubModal('marca')" :disabled="!productoForm.seccion && !esEdicion" />
                </div>
                <small class="text-red-500">{{ errors.marca_id }}</small>
              </div>

              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Precio Detalle ($)</label>
                <InputNumber v-model="productoForm.precio_detalle" mode="currency" currency="USD" locale="en-US" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.precio_detalle }" />
                <small class="text-red-500">{{ errors.precio_detalle }}</small>
              </div>
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Precio Mayorista ($)</label>
                <InputNumber v-model="productoForm.precio_mayor" mode="currency" currency="USD" locale="en-US" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.precio_mayor }" />
                <small class="text-red-500">{{ errors.precio_mayor }}</small>
              </div>
              <div>
                <label class="text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                  <i class="pi pi-exclamation-triangle text-amber-600 text-sm"></i>
                  <span class="text-amber-700">Stock Mínimo</span>
                </label>
                <InputNumber v-model="productoForm.stock_minimo" :min="1" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.stock_minimo }" />
                <small class="text-red-500">{{ errors.stock_minimo }}</small>
              </div>
              <div v-if="!esEdicion">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Cantidad Inicial</label>
                <InputNumber v-model="productoForm.cantidad_inicial" :min="1" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.cantidad_inicial }" />
                <small class="text-red-500">{{ errors.cantidad_inicial }}</small>
              </div>
            </div>

            <!-- Campos de lote para perecederos (solo creación) -->
            <div v-if="!esEdicion && productoForm.perecedero" class="border-t border-gray-200 pt-4 md:pt-6 mt-4">
              <h3 class="text-md font-extrabold text-[#003d00] uppercase tracking-wide mb-3 md:mb-4">Datos del Lote</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Código de Lote</label>
                  <InputText v-model="productoForm.codigo_lote" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.codigo_lote }" />
                  <small class="text-red-500">{{ errors.codigo_lote }}</small>
                </div>
                <div>
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Fecha Vencimiento</label>
                  <Calendar v-model="productoForm.fecha_vencimiento" dateFormat="yy-mm-dd" class="w-full" :class="{ 'border-red-500': errors.fecha_vencimiento }" />
                  <small class="text-red-500">{{ errors.fecha_vencimiento }}</small>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 md:p-8 pt-4 border-t border-gray-200 flex items-center gap-4 bg-gray-50/50 rounded-b-[24px]">
            <button type="button" @click="cerrarModalProducto" class="px-8 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition">Cancelar</button>
            <button type="submit" :disabled="loading" class="flex-1 py-3 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50">
              {{ loading ? 'GUARDANDO...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>

    <!-- Submodal para crear categoría -->
    <Teleport to="body">
      <div v-if="subModal.categoria" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] backdrop-blur-sm p-4">
        <div class="bg-white rounded-[24px] w-[90vw] max-w-lg shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
          <div class="p-8">
            <h3 class="text-xl font-extrabold text-[#003d00] mb-4">Nueva Categoría</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre *</label>
                <InputText v-model="nuevaCategoria.nombre" placeholder="Nombre de categoría" class="w-full border border-gray-200 rounded-xl p-3" />
              </div>
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Sección *</label>
                <Dropdown v-model="nuevaCategoria.seccion" :options="secciones" optionLabel="label" optionValue="value" placeholder="Seleccionar sección" class="w-full border border-gray-200 rounded-xl bg-gray-100" disabled />
              </div>
            </div>
            <div class="flex gap-3 mt-8">
              <button @click="cerrarSubModal('categoria')" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar</button>
              <button @click="crearCategoriaDesdeSub" class="flex-1 py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Submodal para crear marca -->
    <Teleport to="body">
      <div v-if="subModal.marca" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] backdrop-blur-sm p-4">
        <div class="bg-white rounded-[24px] w-[90vw] max-w-lg shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
          <div class="p-8">
            <h3 class="text-xl font-extrabold text-[#003d00] mb-4">Nueva Marca</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre *</label>
                <InputText v-model="nuevaMarca.nombre" placeholder="Nombre de marca" class="w-full border border-gray-200 rounded-xl p-3" />
              </div>
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Sección *</label>
                <Dropdown v-model="nuevaMarca.seccion" :options="secciones" optionLabel="label" optionValue="value" placeholder="Seleccionar sección" class="w-full border border-gray-200 rounded-xl bg-gray-100" disabled />
              </div>
            </div>
            <div class="flex gap-3 mt-8">
              <button @click="cerrarSubModal('marca')" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar</button>
              <button @click="crearMarcaDesdeSub" class="flex-1 py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useProductoStore } from '@/stores/productoStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useMarcaStore } from '@/stores/marcaStore'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Swal from 'sweetalert2'

const props = defineProps({
  visible: { type: Boolean, required: true },
  productoAEditar: { type: Object, default: null },
  esEdicion: { type: Boolean, required: true },
  tipoPerecedero: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'guardado', 'toast'])

const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()

const loading = ref(false)
const errors = ref({})
const subModal = ref({ categoria: false, marca: false })
const nuevaCategoria = ref({ nombre: '', seccion: '' })
const nuevaMarca = ref({ nombre: '', seccion: '' })

const secciones = [
  { label: 'Tienda', value: 'TIENDA', icono: 'pi pi-shopping-cart' },
  { label: 'Librería', value: 'LIBRERIA', icono: 'pi pi-book' },
  { label: 'Medicamentos', value: 'MEDICAMENTO', icono: 'pi pi-heart' }
]

const productoForm = ref({
  id: null,
  nombre: '',
  categoria_id: null,
  marca_id: null,
  precio_detalle: null,
  precio_mayor: null,
  stock_minimo: 1,
  perecedero: false,
  codigo_lote: '',
  fecha_vencimiento: null,
  cantidad_inicial: 1,
  seccion: '',
  stock_actual: 0
})

const initialForm = () => ({
  id: null, nombre: '', categoria_id: null, marca_id: null,
  precio_detalle: null, precio_mayor: null, stock_minimo: 1, perecedero: false,
  codigo_lote: '', fecha_vencimiento: null, cantidad_inicial: 1,
  seccion: '', stock_actual: 0
})

const resetForm = () => {
  productoForm.value = initialForm()
  errors.value = {}
}

const initializeForm = (producto) => {
  if (producto) {
    productoForm.value = {
      id: producto.id,
      nombre: producto.nombre,
      categoria_id: producto.categoria_id,
      marca_id: producto.marca_id,
      precio_detalle: Number(producto.precio_detalle),
      precio_mayor: Number(producto.precio_mayor),
      stock_minimo: producto.stock_minimo,
      perecedero: producto.perecedero === 'PERECEDERO',
      codigo_lote: '',
      fecha_vencimiento: null,
      cantidad_inicial: 1,
      seccion: producto.seccion,
      stock_actual: producto.stock
    }
  } else {
    resetForm()
    productoForm.value.perecedero = props.tipoPerecedero
  }
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      initializeForm(props.productoAEditar)
    } else {
      resetForm()
    }
  }
)

const categorias = computed(() => categoriaStore.categorias || [])
const marcas = computed(() => marcaStore.marcas || [])

const categoriasFiltradas = computed(() => {
  if (!productoForm.value.seccion) return categorias.value
  return categorias.value.filter(c => c.seccion === productoForm.value.seccion)
})

const marcasFiltradas = computed(() => {
  if (!productoForm.value.seccion) return marcas.value
  return marcas.value.filter(m => m.seccion === productoForm.value.seccion)
})

const cerrarModalProducto = () => {
  emit('update:visible', false)
}

const guardarProducto = async () => {
  errors.value = {}
  loading.value = true

  const data = {
    nombre: productoForm.value.nombre,
    categoria_id: productoForm.value.categoria_id,
    marca_id: productoForm.value.marca_id,
    precio_detalle: productoForm.value.precio_detalle,
    precio_mayor: productoForm.value.precio_mayor,
    stock_minimo: productoForm.value.stock_minimo,
    perecedero: productoForm.value.perecedero ? 'PERECEDERO' : 'NORMAL',
    seccion: productoForm.value.seccion
  }

  if (!props.esEdicion) {
    data.cantidad_inicial = productoForm.value.cantidad_inicial
    if (productoForm.value.perecedero) {
      data.codigo_lote = productoForm.value.codigo_lote
      data.fecha_vencimiento = productoForm.value.fecha_vencimiento instanceof Date
      ? productoForm.value.fecha_vencimiento.toISOString().split('T')[0]
      : productoForm.value.fecha_vencimiento
    }
  }

  try {
    if (props.esEdicion) {
      await productoStore.updateProducto(productoForm.value.id, data)
      cerrarModalProducto()
      emit('guardado')
      emit('toast', { tipo: 'success', mensaje: 'Producto actualizado correctamente.' })
    } else {
      await productoStore.createProducto(data)
      cerrarModalProducto()
      emit('guardado')
      Swal.fire({
        title: 'Producto creado',
        text: 'El producto se registró con éxito.',
        icon: 'success',
        confirmButtonColor: '#003d00',
        confirmButtonText: 'Aceptar'
      })
    }
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors || error.response.data.error
      errors.value = {}
      for (const key in validationErrors) {
        errors.value[key] = validationErrors[key][0]
      }
      if (props.esEdicion) {
        const primerError = Object.values(errors.value)[0] || 'Por favor, corrige los errores del formulario.'
        emit('toast', { tipo: 'error', mensaje: primerError })
      } else {
        Swal.fire({ title: 'Error de validación', text: 'Revisa los campos marcados en rojo.', icon: 'error', confirmButtonColor: '#d33' })
      }
    } else {
      const msg = error.response?.data?.message || 'Ocurrió un error inesperado al guardar el producto.'
      if (props.esEdicion) {
        emit('toast', { tipo: 'error', mensaje: msg })
      } else {
        Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonColor: '#d33' })
      }
    }
  } finally {
    loading.value = false
  }
}

// Submodales para crear categoría/marca
const abrirSubModal = (tipo) => {
  subModal.value[tipo] = true
  if (tipo === 'categoria') nuevaCategoria.value.seccion = productoForm.value.seccion
  if (tipo === 'marca') nuevaMarca.value.seccion = productoForm.value.seccion
}

const cerrarSubModal = (tipo) => {
  subModal.value[tipo] = false
  if (tipo === 'categoria') nuevaCategoria.value = { nombre: '', seccion: '' }
  if (tipo === 'marca') nuevaMarca.value = { nombre: '', seccion: '' }
}

const crearCategoriaDesdeSub = async () => {
  if (!nuevaCategoria.value.nombre) {
    emit('toast', { tipo: 'error', mensaje: 'El nombre de la categoría es obligatorio.' })
    return
  }
  try {
    await categoriaStore.createCategoria({ nombre: nuevaCategoria.value.nombre, seccion: nuevaCategoria.value.seccion })
    await categoriaStore.fetchCategorias({ per_page: 9999 })
    const nueva = categoriaStore.categorias.find(c => c.nombre === nuevaCategoria.value.nombre)
    productoForm.value.categoria_id = nueva?.id ?? categoriaStore.categorias[categoriaStore.categorias.length - 1]?.id
    cerrarSubModal('categoria')
    emit('toast', { tipo: 'success', mensaje: 'Categoría creada correctamente.' })
  } catch (error) {
    let msg = 'Error al crear categoría.'
    if (error.response?.status === 422) {
      const valErrors = error.response.data.errors || error.response.data.error
      if (valErrors) {
        const first = Object.values(valErrors)[0]
        msg = Array.isArray(first) ? first[0] : (first || msg)
      }
    } else {
      msg = error.response?.data?.message || msg
    }
    emit('toast', { tipo: 'error', mensaje: msg })
  }
}

const crearMarcaDesdeSub = async () => {
  if (!nuevaMarca.value.nombre) {
    emit('toast', { tipo: 'error', mensaje: 'El nombre de la marca es obligatorio.' })
    return
  }
  try {
    await marcaStore.createMarca({ nombre: nuevaMarca.value.nombre, seccion: nuevaMarca.value.seccion })
    await marcaStore.fetchMarcas({ per_page: 9999 })
    const nueva = marcaStore.marcas.find(m => m.nombre === nuevaMarca.value.nombre)
    productoForm.value.marca_id = nueva?.id ?? marcaStore.marcas[marcaStore.marcas.length - 1]?.id
    cerrarSubModal('marca')
    emit('toast', { tipo: 'success', mensaje: 'Marca creada correctamente.' })
  } catch (error) {
    let msg = 'Error al crear marca.'
    if (error.response?.status === 422) {
      const valErrors = error.response.data.errors || error.response.data.error
      if (valErrors) {
        const first = Object.values(valErrors)[0]
        msg = Array.isArray(first) ? first[0] : (first || msg)
      }
    } else {
      msg = error.response?.data?.message || msg
    }
    emit('toast', { tipo: 'error', mensaje: msg })
  }
}
</script>

<style scoped>
.animate-fade-up { animation: fadeUp 0.3s ease-out forwards; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
:deep(.p-inputtext) { font-size: 0.875rem !important; font-weight: 600 !important; }
:deep(.p-calendar) { width: 100%; }
:deep(.p-calendar .p-inputtext) { width: 100%; padding: 0.75rem; }
</style>
