<template>
  <div class="flex flex-col h-full bg-shop-bg">
    <!-- Barra de búsqueda -->
    <div class="p-4 bg-white border-b border-shop-border shrink-0">
      <span class="p-input-icon-left w-full flex items-center">
        <i class="pi pi-search absolute z-10 ml-0 text-shop-green" />
        <InputText
          v-model="busqueda"
          placeholder="Buscar por nombre..."
          class="w-full pl-14 border-2 focus:border-shop-green transition-colors font-bold rounded-shop"
          @input="debouncedSearch"
        />
      </span>
    </div>

    <!-- Estado de carga yes-->
    <div v-if="loading" class="flex-1 flex justify-center items-center">
      <ProgressSpinner />
    </div>

    <!-- Grid de productos -->
    <div v-else class="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        <div
          v-for="prod in productos"
          :key="prod.id"
          @click="seleccionarProducto(prod)"
          class="bg-white border border-shop-border rounded-shop-sm p-3 cursor-pointer hover:border-shop-green hover:shadow-shop transition-all flex flex-col justify-between"
        >
          <div class="mb-2">
            <span class="text-[10px] uppercase font-bold text-shop-text tracking-wider">
              {{ prod.categoria?.nombre ?? 'Sin categoría' }}
            </span>
            <h3 class="font-bold text-sm text-shop-text leading-tight mt-0.5">
              {{ prod.nombre }}
            </h3>
            <span class="text-xs text-shop-text">{{ prod.marca?.nombre ?? '' }}</span>
          </div>

          <div class="flex justify-between items-end mt-2">
            <span class="font-black text-lg text-shop-green">
              ${{ precioMostrar(prod).toFixed(2) }}
            </span>
            <span class="text-[10px] font-bold px-2 py-1 rounded bg-shop-green-pale text-shop-green-dark">
              {{ prod.stock }} DISP.
            </span>
          </div>
        </div>
      </div>
      <div v-if="productos.length === 0 && !loading" class="text-center py-10 text-shop-text-3 font-bold">
        No se encontraron productos
      </div>

      <!-- Paginador -->
      <div v-if="!loading && productos.length > 0" class="flex justify-center mt-4">
        <Paginator
          :rows="20"
          :totalRecords="totalRegistros"
          v-model:first="first"
          @update:first="onPageChange"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          class="bg-transparent p-0"
          :pt="{
            pageButton: { class: 'w-8 h-8 text-sm font-bold rounded-shop-sm text-shop-text-2 hover:bg-shop-green-pale hover:text-shop-green' },
            activePageButton: { class: 'bg-shop-green text-white hover:bg-shop-green-dark' }
          }"
        />
      </div>
    </div>

    <!-- Modal de confirmación con cantidad -->
    <Dialog
      v-model:visible="mostrarModalProducto"
      modal
      :header="productoSeleccionado?.nombre"
      :style="{ width: '350px' }"
      :pt="{ root: { class: 'rounded-shop overflow-hidden' }, header: { class: 'bg-white pb-2' } }"
    >
      <div class="flex flex-col gap-4 pt-4" v-if="productoSeleccionado">
        <div class="bg-shop-surface-2 p-4 rounded-shop-sm text-center border border-shop-border">
          <span class="text-xs font-bold text-shop-text-2 uppercase flex items-center justify-center gap-2">
            <i class="pi pi-tag"></i> Precio ({{ ventaStore.tipo_cliente }})
          </span>
          <div class="text-4xl font-black text-shop-green mt-1">
            ${{ precioCalculado.toFixed(2) }}
          </div>
        </div>

        <div class="flex items-center gap-3">
          <label class="font-bold text-shop-text-2 text-sm">Cantidad:</label>
          <InputNumber
            v-model="cantidadSeleccionada"
            :min="1"
            :max="productoSeleccionado.stock"
            class="flex-1"
            inputClass="w-full text-center font-bold rounded-shop-sm"
          />
        </div>

        <Button
          label="Agregar al Carrito"
          icon="pi pi-shopping-cart"
          class="w-full py-3 text-lg font-bold rounded-shop-sm"
          severity="success"
          @click="confirmarAgregar"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVentaStore } from '@/stores/venta/ventaStore'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import { InputText, Dialog, Button, ProgressSpinner, InputNumber, Paginator } from '@/utils/primevue'

const ventaStore = useVentaStore()
const toast = useToast()

const busqueda = ref('')
const mostrarModalProducto = ref(false)
const productoSeleccionado = ref(null)
const cantidadSeleccionada = ref(1)
const productos = ref([])
const loading = ref(true)
const pagina = ref(1)
const ultimaPagina = ref(1)
const totalRegistros = ref(0)
const first = ref(0)

const cargarProductos = async (search = '', page = 1) => {
  loading.value = true
  try {
    const params = { estado: 'ACTIVO', page }
    if (search) params.search = search
    const { data } = await api.get('/productos', { params })
    productos.value = data.data
    pagina.value = data.current_page
    ultimaPagina.value = data.last_page
    totalRegistros.value = data.total
    first.value = (data.current_page - 1) * data.per_page
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos', life: 4000 })
  } finally {
    loading.value = false
  }
}

let timeout
const debouncedSearch = () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    pagina.value = 1
    cargarProductos(busqueda.value.trim(), 1)
  }, 300)
}

const onPageChange = (event) => {
  const nuevaPagina = Math.floor(event / 20) + 1
  pagina.value = nuevaPagina
  cargarProductos(busqueda.value.trim(), nuevaPagina)
}

onMounted(() => cargarProductos())

// Precio según tipo de cliente (convertido a número)
const precioMostrar = (prod) => {
  const precio = ventaStore.tipo_cliente === 'MAYORISTA'
    ? Number(prod.precio_mayor)
    : Number(prod.precio_detalle)
  return precio
}

const precioCalculado = computed(() => {
  if (!productoSeleccionado.value) return 0
  return precioMostrar(productoSeleccionado.value)
})

const seleccionarProducto = (prod) => {
  productoSeleccionado.value = prod
  cantidadSeleccionada.value = 1
  mostrarModalProducto.value = true
}

const confirmarAgregar = () => {
  try {
    ventaStore.agregarProducto({
      ...productoSeleccionado.value,
      cantidad: cantidadSeleccionada.value
    })
    toast.add({ severity: 'success', summary: 'Agregado', detail: `${productoSeleccionado.value.nombre} x${cantidadSeleccionada.value}`, life: 1500 })
    mostrarModalProducto.value = false
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo agregar el producto', life: 4000 })
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #a7f3d0; border-radius: 10px; }
</style>
