<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">

    <!-- Encabezado -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <i class="pi pi-box text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Productos</h1>
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <span class="relative flex-1 sm:flex-none">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
          <InputText
            v-model="buscar"
            placeholder="Buscar..."
            class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-full sm:w-56 focus:border-green-600 transition-all"
            @input="buscarProductos"
          />
        </span>
        <Button
          label="Nuevo Producto"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all duration-300 w-full sm:w-auto"
          @click="abrirDialogoTipo"
        />
      </div>
    </section>

    <!-- Pestañas de sección para filtro del listado -->
    <section class="flex flex-wrap gap-2 mb-4 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
      <button
        v-for="seccion in secciones"
        :key="seccion.value"
        @click="cambiarSeccion(seccion.value)"
        class="px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 whitespace-nowrap"
        :class="seccionActiva === seccion.value
          ? 'bg-[#0a3622] text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        <i :class="seccion.icono" class="mr-1"></i>
        {{ seccion.label }}
      </button>
      <button
        @click="cambiarSeccion(null)"
        class="px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 whitespace-nowrap"
        :class="!seccionActiva
          ? 'bg-[#0a3622] text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        <i class="pi pi-th-large mr-1"></i> Todos
      </button>
    </section>

    <!-- Tabla de productos -->
    <ProductoTabla
      :productos="productos"
      :pagination="pagination"
      :isTableLoading="isTableLoading"
      :perPage="perPage"
      @editar="abrirModalEditar"
      @cambiarEstado="cambiarEstado"
      @cambiarPagina="cambiarPagina"
      @verResumen="abrirResumenProducto"
    />

    <!-- Diálogo tipo de producto (Normal / Perecedero) -->
    <div v-if="dialogoTipoVisible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-[24px] w-[90vw] max-w-md shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
        <div class="p-8 text-center">
          <i class="pi pi-box text-5xl text-[#034e03] mb-4 block"></i>
          <h2 class="text-2xl font-extrabold text-[#003d00] mb-2">Nuevo Producto</h2>
          <p class="text-gray-500 mb-6">Selecciona el tipo de producto</p>
          <div class="flex flex-col gap-3">
            <button @click="seleccionarTipo('NORMAL')" class="py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition">Normal</button>
            <button @click="seleccionarTipo('PERECEDERO')" class="py-3 bg-[#8b5e3c] text-white font-bold rounded-xl shadow-md hover:bg-[#6b4226] transition">Perecedero</button>
            <button @click="dialogoTipoVisible = false" class="py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal principal de Producto (crear/editar) -->
    <ProductoModalForm
      v-model:visible="mostrarModalProducto"
      :producto-a-editar="productoSeleccionado"
      :es-edicion="esEdicion"
      :tipo-perecedero="tipoPerecedero"
      @guardado="onGuardado"
      @toast="mostrarToastFromChild"
    />

    <!-- Modal Resumen de Producto -->
    <Teleport to="body">
      <div v-if="mostrarResumen && productoResumen" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[150] backdrop-blur-sm p-4 font-dm-sans">
        <div class="bg-white rounded-[24px] w-[95vw] max-w-4xl shadow-2xl relative overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#003d00]"></div>
          <button @click="cerrarResumen" class="absolute top-5 right-6 text-gray-400 hover:text-gray-700 transition z-10">
            <i class="pi pi-times text-xl"></i>
          </button>

          <!-- Encabezado del modal -->
          <div class="p-6 md:p-8 pb-4 border-b border-gray-100 text-left pr-16">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-green-50 text-[#003d00] flex items-center justify-center font-bold text-lg shrink-0">
                <i class="pi pi-box"></i>
              </div>
              <div>
                <h2 class="text-xl font-extrabold text-[#003d00]">{{ productoResumen.nombre }}</h2>
                <p class="text-xs text-gray-400 font-medium">Resumen del producto e historial de movimientos</p>
              </div>
            </div>
          </div>

          <!-- Contenido deslizable -->
          <div class="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-left">
            <!-- Ficha informativa / Tarjeta de detalles -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
              <div>
                <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Estado</span>
                <span :class="productoResumen.estado === 'ACTIVO' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'" class="inline-block mt-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border">
                  {{ productoResumen.estado }}
                </span>
              </div>
              <div>
                <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Tipo Producto</span>
                <span :class="productoResumen.perecedero === 'PERECEDERO' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'" class="inline-block mt-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase">
                  {{ productoResumen.perecedero === 'PERECEDERO' ? 'Perecedero' : 'Normal' }}
                </span>
              </div>
              <div>
                <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Categoría</span>
                <span class="block text-sm font-bold text-gray-800 mt-1">{{ productoResumen.categoria?.nombre || 'N/A' }}</span>
              </div>
              <div>
                <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Marca</span>
                <span class="block text-sm font-bold text-gray-800 mt-1">{{ productoResumen.marca?.nombre || 'N/A' }}</span>
              </div>
              <div>
                <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Sección</span>
                <span class="block text-sm font-bold text-gray-800 mt-1">{{ productoResumen.seccion || 'N/A' }}</span>
              </div>
              <div>
                <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Stock Actual</span>
                <span class="block text-sm font-extrabold text-gray-900 mt-1">{{ productoResumen.stock }} u.</span>
              </div>
              <div>
                <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Stock Mínimo</span>
                <span class="block text-sm font-bold text-gray-700 mt-1">{{ productoResumen.stock_minimo }} u.</span>
              </div>
              <div>
                <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Precio Detalle / Mayor</span>
                <span class="block text-sm font-bold text-gray-800 mt-1">${{ Number(productoResumen.precio_detalle).toFixed(2) }} / ${{ Number(productoResumen.precio_mayor).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Sección de Lotes (si es perecedero) -->
            <div v-if="productoResumen.perecedero === 'PERECEDERO'" class="space-y-2">
              <h3 class="text-xs font-extrabold text-[#003d00] uppercase tracking-wider flex items-center gap-1.5">
                <i class="pi pi-calendar-times text-amber-600"></i> Lotes y Fechas de Vencimiento
              </h3>
              <div v-if="productoResumen.lotes && productoResumen.lotes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="lote in productoResumen.lotes" :key="lote.id" class="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span class="font-bold text-gray-800">Lote: {{ lote.codigo_lote }}</span>
                    <p class="text-gray-400">Vence: <strong class="text-gray-700">{{ formatearFecha(lote.fecha_vencimiento) }}</strong></p>
                  </div>
                  <div class="text-right">
                    <span class="font-extrabold text-[#003d00] bg-green-50 px-2 py-1 rounded border border-green-100">
                      {{ lote.cantidad_actual }} u.
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="text-xs text-gray-400 italic">No hay lotes activos registrados.</p>
            </div>

            <!-- Sección: Historial de Movimientos / Ajustes de Stock -->
            <div class="space-y-3">
              <h3 class="text-xs font-extrabold text-[#003d00] uppercase tracking-wider flex items-center gap-1.5">
                <i class="pi pi-history text-[#003d00]"></i> Historial de Movimientos / Ajustes de Stock
              </h3>

              <div v-if="cargandoAjustes" class="py-6 text-center text-gray-400 text-sm italic">
                Cargando historial de movimientos...
              </div>

              <div v-else-if="ajustesHistorial.length > 0" class="overflow-x-auto border border-gray-200 rounded-xl">
                <table class="w-full text-left text-xs border-collapse whitespace-nowrap">
                  <thead>
                    <tr class="bg-gray-50 text-gray-500 font-extrabold uppercase tracking-wider border-b border-gray-200">
                      <th class="py-2.5 px-4">Fecha</th>
                      <th class="py-2.5 px-4">Hora</th>
                      <th class="py-2.5 px-4 text-center">Tipo</th>
                      <th class="py-2.5 px-4 text-center">Cantidad</th>
                      <th class="py-2.5 px-4 text-center">Stock Antes &rarr; Después</th>
                      <th class="py-2.5 px-4">Motivo</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 text-gray-700">
                    <tr v-for="ajuste in ajustesHistorial" :key="ajuste.id" class="hover:bg-gray-50/80 transition">
                      <td class="py-2.5 px-4 font-bold text-gray-800">{{ formatearFecha(ajuste.created_at) }}</td>
                      <td class="py-2.5 px-4 font-bold text-gray-600">{{ formatearHora(ajuste.created_at) }}</td>
                      <td class="py-2.5 px-4 text-center">
                        <span :class="ajuste.tipo_ajuste === 'INCREMENTO' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'" class="px-2 py-0.5 rounded font-black text-[10px] border uppercase">
                          {{ ajuste.tipo_ajuste }}
                        </span>
                      </td>
                      <td class="py-2.5 px-4 text-center font-black" :class="ajuste.tipo_ajuste === 'INCREMENTO' ? 'text-green-700' : 'text-red-700'">
                        {{ ajuste.tipo_ajuste === 'INCREMENTO' ? '+' : '-' }}{{ ajuste.cantidad }} u.
                      </td>
                      <td class="py-2.5 px-4 text-center font-semibold text-gray-600">
                        {{ ajuste.stock_anterior }} &rarr; <strong>{{ ajuste.stock_nuevo }}</strong>
                      </td>
                      <td class="py-2.5 px-4 font-medium text-gray-700 max-w-xs truncate" :title="ajuste.motivo">
                        {{ ajuste.motivo || 'Sin motivo especificado' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="py-8 text-center text-gray-400 text-xs italic bg-gray-50/50 rounded-xl border border-gray-100">
                No se registran movimientos ni ajustes de stock para este producto.
              </div>
            </div>
          </div>

          <!-- Pie del modal -->
          <div class="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-[24px]">
            <button @click="cerrarResumen" class="w-full py-2.5 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl transition text-sm">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProductoStore } from '@/stores/productoStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useMarcaStore } from '@/stores/marcaStore'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Swal from 'sweetalert2'
import { useToast } from 'primevue/usetoast'
import productoService from '@/services/productoService'
import ProductoTabla from './ProductoTabla.vue'
import ProductoModalForm from './ProductoModalForm.vue'

defineOptions({ name: 'ProductoView' })

const productoStore = useProductoStore()
const toast = useToast()
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()

// Estado general
const buscar = ref('')
const dialogoTipoVisible = ref(false)
const mostrarModalProducto = ref(false)
const esEdicion = ref(false)
const tipoPerecedero = ref(false)
const productoSeleccionado = ref(null)
const isInitialLoading = ref(true)
const perPage = ref(10)
const isTableLoading = computed(() => productoStore.loading || isInitialLoading.value)
const seccionActiva = ref(null)
const secciones = [
  { label: 'Tienda', value: 'TIENDA', icono: 'pi pi-shopping-cart' },
  { label: 'Librería', value: 'LIBRERIA', icono: 'pi pi-book' },
  { label: 'Medicamentos', value: 'MEDICAMENTO', icono: 'pi pi-heart' }
]

// Toast de PrimeVue
const mostrarToast = (tipo, mensaje) => {
  toast.add({
    severity: tipo === 'success' ? 'success' : 'error',
    summary: tipo === 'success' ? 'Éxito' : 'Error',
    detail: mensaje,
    life: tipo === 'success' ? 3500 : 5000
  })
}

const mostrarToastFromChild = ({ tipo, mensaje }) => {
  mostrarToast(tipo, mensaje)
}

// Computed
const productos = computed(() => productoStore.productos)
const pagination = computed(() => productoStore.pagination)

// Métodos
const cargarProductos = async (page = null) => {
  const params = {
    page: page ?? pagination.value.current_page ?? 1,
    per_page: 10
  }
  if (buscar.value) params.search = buscar.value
  if (seccionActiva.value) params.seccion = seccionActiva.value
  await productoStore.fetchProductos(params)
  isInitialLoading.value = false
}

const cambiarSeccion = (seccion) => {
  seccionActiva.value = seccion
  cargarProductos(1)
}

const cambiarPagina = async (event) => {
  const params = { page: event.page + 1, per_page: 10 }
  if (buscar.value) params.search = buscar.value
  if (seccionActiva.value) params.seccion = seccionActiva.value
  await productoStore.fetchProductos(params)
}

let timer = null
const buscarProductos = () => {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    await productoStore.fetchProductos({ page: 1, per_page: 10, search: buscar.value })
  }, 500)
}

// Control de modales
const abrirDialogoTipo = () => { dialogoTipoVisible.value = true }

const seleccionarTipo = (tipo) => {
  dialogoTipoVisible.value = false
  esEdicion.value = false
  productoSeleccionado.value = null
  tipoPerecedero.value = (tipo === 'PERECEDERO')
  mostrarModalProducto.value = true
}

const abrirModalEditar = (producto) => {
  esEdicion.value = true
  productoSeleccionado.value = producto
  tipoPerecedero.value = (producto.perecedero === 'PERECEDERO')
  mostrarModalProducto.value = true
}

const onGuardado = async () => {
  await cargarProductos()
}

const cambiarEstado = async (id, estadoActual) => {
  const confirmacion = await Swal.fire({
    title: `¿${estadoActual === 'ACTIVO' ? 'Desactivar' : 'Activar'} producto?`,
    text: `El producto quedará ${estadoActual === 'ACTIVO' ? 'inactivo' : 'activo'}.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d1333e',
    cancelButtonColor: '#d6dfd6',
    confirmButtonText: 'Sí, cambiar',
    cancelButtonText: 'Cancelar',
    customClass: { cancelButton: '!text-[#3a5a3a] !font-bold' },
    reverseButtons: true,
    allowOutsideClick: false
  })
  if (confirmacion.isConfirmed) {
    try {
      await productoStore.cambiarEstado(id)
      await cargarProductos()
      mostrarToast('success', `Estado actualizado a ${estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'} con éxito.`)
    } catch (error) {
      mostrarToast('error', error.response?.data?.message || 'No se pudo cambiar el estado del producto.')
    }
  }
}

// Modal Resumen de Producto
const mostrarResumen = ref(false)
const productoResumen = ref(null)
const ajustesHistorial = ref([])
const cargandoAjustes = ref(false)

const abrirResumenProducto = async (producto) => {
  productoResumen.value = producto
  mostrarResumen.value = true
  cargandoAjustes.value = true
  ajustesHistorial.value = []
  try {
    const res = await productoService.getAjustesStock(producto.id)
    ajustesHistorial.value = res.data || []
  } catch (error) {
    console.error('Error al cargar historial de ajustes:', error)
  } finally {
    cargandoAjustes.value = false
  }
}

const cerrarResumen = () => {
  mostrarResumen.value = false
  productoResumen.value = null
  ajustesHistorial.value = []
}

// Formateo de Fecha: YYYY/MM/DD
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'N/A'
  const date = new Date(fechaStr)
  if (isNaN(date)) {
    // Si viene como 'YYYY-MM-DD'
    return String(fechaStr).split('T')[0].replace(/-/g, '/')
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

// Formateo de Hora: hh:mm am/pm
const formatearHora = (fechaStr) => {
  if (!fechaStr) return 'N/A'
  const date = new Date(fechaStr)
  if (isNaN(date)) return 'N/A'
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toLowerCase()
}

// Ciclo de vida
onMounted(async () => {
  await Promise.all([
    categoriaStore.fetchCategorias({ per_page: 9999 }),
    marcaStore.fetchMarcas({ per_page: 9999 }),
    cargarProductos(1)
  ])
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #c6e5d3; border-radius: 4px; }
</style>
