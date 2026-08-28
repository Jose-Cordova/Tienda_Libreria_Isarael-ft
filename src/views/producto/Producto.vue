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
