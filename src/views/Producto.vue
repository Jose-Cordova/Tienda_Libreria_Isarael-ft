<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">

    <!-- Toast flotante -->
    <transition name="toast">
      <div
        v-if="toast.visible"
        class="fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl min-w-[340px] max-w-md border"
        :class="toast.tipo === 'success' ? 'bg-green-100 border-green-300 text-green-900' : 'bg-red-100 border-red-300 text-red-900'"
      >
        <i v-if="toast.tipo === 'success'" class="pi pi-check-circle text-green-600 text-xl shrink-0"></i>
        <i v-else class="pi pi-times-circle text-red-600 text-xl shrink-0"></i>
        <span class="text-sm font-bold leading-snug">{{ toast.mensaje }}</span>
      </div>
    </transition>

    <!-- Encabezado -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3">
        <i class="pi pi-box text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Productos</h1>
      </div>
      <div class="flex items-center gap-3">
        <span class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
          <InputText
            v-model="buscar"
            placeholder="Buscar..."
            class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-56 focus:border-green-600"
            @input="buscarProductos"
          />
        </span>
        <Button
          label="Nuevo Producto"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all duration-300"
          @click="abrirDialogoTipo"
        />
      </div>
    </section>

    <!-- Tabla de productos -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
              <th class="py-3 px-4">Producto</th>
              <th class="py-3 px-4">Categoría</th>
              <th class="py-3 px-4">Marca</th>
              <th class="py-3 px-4">P. Detalle</th>
              <th class="py-3 px-4">P. Mayor</th>
              <th class="py-3 px-4">Stock</th>
              <th class="py-3 px-4">Stock Mínimo</th>
              <th class="py-3 px-4 text-center">Perec.</th>
              <th class="py-3 px-4 text-center">Estado</th>
              <th class="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 divide-y divide-gray-100">
            <tr v-for="prod in productos" :key="prod.id" class="hover:bg-gray-50 transition">
              <td class="py-4 px-4 font-bold text-gray-800 text-sm">{{ prod.nombre }}</td>
              <td class="py-4 px-4">
                <span class="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">
                  {{ prod.categoria?.nombre || 'N/A' }}
                </span>
              </td>
              <td class="py-4 px-4 font-bold text-gray-800 text-sm">{{ prod.marca?.nombre || 'N/A' }}</td>
              <td class="py-4 px-4 font-bold text-gray-800 text-sm">${{ formatPrice(prod.precio_detalle) }}</td>
              <td class="py-4 px-4 font-bold text-gray-800 text-sm">${{ formatPrice(prod.precio_mayor) }}</td>
              <td class="py-4 px-4">
                <div :class="prod.stock <= prod.stock_minimo ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-700 border-green-200'" class="w-16 text-center py-1 rounded font-black border text-[10px]">
                  {{ prod.stock }} u.
                </div>
              </td>
              <td class="py-4 px-4 text-center text-sm font-semibold text-gray-600">
                {{ prod.stock_minimo }} u.
              </td>
              <td class="py-4 px-4 text-center">
                <Checkbox :binary="true" :modelValue="prod.perecedero === 'PERECEDERO'" disabled class="p-checkbox-sm" />
              </td>
              <td class="py-4 px-4 text-center">
                <Tag :severity="prod.estado === 'ACTIVO' ? 'success' : 'danger'" :value="prod.estado" />
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center justify-center gap-1">
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" @click="abrirModalEditar(prod)" />
                 <Button
                 icon="pi pi-power-off"
                  class="p-button-rounded p-button-sm text-white !border-none"
                  :class="prod.estado === 'ACTIVO' ? '!bg-red-600 hover:!bg-red-700 focus:!ring-0 focus:!ring-offset-0' : '!bg-green-600 hover:!bg-green-700 focus:!ring-0 focus:!ring-offset-0'"
                   @click="cambiarEstado(prod.id, prod.estado)"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="productos.length === 0">
              <td colspan="10" class="py-10 text-center italic text-gray-400">No se encontraron productos.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Paginación (fija a 10 productos por página, sin selector de cantidad) -->
      <div class="p-3 border-t border-gray-400 bg-gray-50/50">
        <Paginator
          :rows="10"
          :totalRecords="pagination.total"
          :first="(pagination.current_page - 1) * 10"
          @page="cambiarPagina"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          class="custom-paginator text-[10px]"
        />
      </div>
    </section>

    <!-- Diálogo tipo de producto -->
    <div v-if="dialogoTipoVisible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-[24px] w-full max-w-md shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
        <div class="p-8 text-center">
          <i class="pi pi-box text-5xl text-[#034e03] mb-4 block"></i>
          <h2 class="text-2xl font-extrabold text-[#003d00] mb-2">Nuevo Producto</h2>
          <p class="text-gray-500 mb-6">Selecciona el tipo de producto</p>
          <div class="flex flex-col gap-3">
            <button @click="seleccionarTipo('NORMAL')" class="py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition">Normal</button>
            <button @click="seleccionarTipo('PERECEDERO')" class="py-3 bg-[#8b5e3c] text-white font-bold rounded-xl shadow-md hover:bg-[#6b4226] transition">Perecedero</button>
            <button @click="dialogoTipoVisible = false" class="py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal principal de Producto (crear/editar) -->
    <div v-if="mostrarModalProducto" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-[24px] w-full max-w-4xl shadow-2xl relative overflow-y-auto max-h-[90vh] animate-fade-up border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
        <button @click="cerrarModalProducto" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
          <i class="pi pi-times text-xl"></i>
        </button>
        <div class="p-8">
          <div class="mb-6 text-left">
            <h2 class="text-2xl font-extrabold text-[#003d00] mb-1">{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
            <p class="text-gray-400 font-medium">Complete los datos del producto</p>
          </div>
          <form @submit.prevent="guardarProducto" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre</label>
                <InputText v-model="productoForm.nombre" class="w-full border border-gray-200 rounded-xl p-3 focus:border-[#003d00]" :class="{ 'border-red-500': errors.nombre }" />
                <small class="text-red-500">{{ errors.nombre }}</small>
              </div>
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
                  <i class="pi pi-tags mr-1 text-[#034e03]"></i> Categoría
                </label>
                <div class="flex gap-2">
                  <Dropdown v-model="productoForm.categoria_id" :options="categorias" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="flex-1 border border-gray-200 rounded-xl" :class="{ 'border-red-500': errors.categoria_id }" />
                  <Button icon="pi pi-plus" class="!bg-[#003d00] !text-white !rounded-full !w-8 !h-8" @click="abrirSubModal('categoria')" />
                </div>
                <small class="text-red-500">{{ errors.categoria_id }}</small>
              </div>
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
                  <i class="pi pi-bookmark mr-1 text-[#034e03]"></i> Marca
                </label>
                <div class="flex gap-2">
                  <Dropdown v-model="productoForm.marca_id" :options="marcas" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="flex-1 border border-gray-200 rounded-xl" :class="{ 'border-red-500': errors.marca_id }" />
                  <Button icon="pi pi-plus" class="!bg-[#003d00] !text-white !rounded-full !w-8 !h-8" @click="abrirSubModal('marca')" />
                </div>
                <small class="text-red-500">{{ errors.marca_id }}</small>
              </div>
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
                  <i class="pi pi-sliders-h mr-1 text-[#034e03]"></i> Unidad de Medida
                </label>
                <div class="flex gap-2">
                  <Dropdown v-model="productoForm.unidad_medida_id" :options="unidades" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="flex-1 border border-gray-200 rounded-xl" :class="{ 'border-red-500': errors.unidad_medida_id }" />
                  <Button icon="pi pi-plus" class="!bg-[#003d00] !text-white !rounded-full !w-8 !h-8" @click="abrirSubModal('unidad')" />
                </div>
                <small class="text-red-500">{{ errors.unidad_medida_id }}</small>
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
            <!-- Campos solo para perecedero -->
            <div v-if="!esEdicion && productoForm.perecedero" class="border-t border-gray-200 pt-6 mt-4">
              <h3 class="text-md font-extrabold text-[#003d00] uppercase tracking-wide mb-4">Datos del Lote</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <!-- Botones -->
            <div class="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button type="button" @click="cerrarModalProducto" class="px-8 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition">Cancelar</button>
              <button type="submit" :disabled="loading" class="flex-1 py-3 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50">
                {{ loading ? 'GUARDANDO...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Submodal Categoría -->
    <div v-if="subModal.categoria" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-[24px] w-full max-w-lg shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
        <div class="p-8">
          <h3 class="text-xl font-extrabold text-[#003d00] mb-4">Nueva Categoría</h3>
          <InputText v-model="nuevaCategoria.nombre" placeholder="Nombre" class="w-full border border-gray-200 rounded-xl p-3" />
          <div class="flex gap-3 mt-8">
            <button @click="cerrarSubModal('categoria')" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar</button>
            <button @click="crearCategoriaDesdeSub" class="flex-1 py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Submodal Marca -->
    <div v-if="subModal.marca" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-[24px] w-full max-w-lg shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
        <div class="p-8">
          <h3 class="text-xl font-extrabold text-[#003d00] mb-4">Nueva Marca</h3>
          <InputText v-model="nuevaMarca.nombre" placeholder="Nombre" class="w-full border border-gray-200 rounded-xl p-3" />
          <div class="flex gap-3 mt-8">
            <button @click="cerrarSubModal('marca')" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar</button>
            <button @click="crearMarcaDesdeSub" class="flex-1 py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Submodal Unidad de Medida -->
    <div v-if="subModal.unidad" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-[24px] w-full max-w-lg shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
        <div class="p-8">
          <h3 class="text-xl font-extrabold text-[#003d00] mb-4">Nueva Unidad</h3>
          <div class="space-y-4">
            <InputText v-model="nuevaUnidad.nombre" placeholder="Nombre" class="w-full border border-gray-200 rounded-xl p-3" />
            <InputNumber v-model="nuevaUnidad.equivalencia" placeholder="Equivalencia" :min="1" class="w-full border border-gray-200 rounded-xl p-3" />
          </div>
          <div class="flex gap-3 mt-8">
            <button @click="cerrarSubModal('unidad')" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar</button>
            <button @click="crearUnidadDesdeSub" class="flex-1 py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition">Guardar</button>
          </div>
        </div>
      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

defineOptions({ name: 'ProductoView' })

import { useProductoStore } from '@/stores/productoStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useMarcaStore } from '@/stores/marcaStore'
import { useUnidadMedidaStore } from '@/stores/unidadMedidaStore'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'
import Paginator from 'primevue/paginator'
import Swal from 'sweetalert2'

const productoStore = useProductoStore()
const categoriaStore = useCategoriaStore()
const marcaStore = useMarcaStore()
const unidadStore = useUnidadMedidaStore()

const buscar = ref('')
const dialogoTipoVisible = ref(false)
const mostrarModalProducto = ref(false)
const esEdicion = ref(false)
const loading = ref(false)
// Se elimina la variable perPage, ahora fijo a 10
const productoForm = ref({
  id: null, nombre: '', categoria_id: null, marca_id: null, unidad_medida_id: null,
  precio_detalle: null, precio_mayor: null, stock_minimo: 1, perecedero: false,
  codigo_lote: '', fecha_vencimiento: null, cantidad_inicial: 1
})
const errors = ref({})

const subModal = ref({ categoria: false, marca: false, unidad: false })
const nuevaCategoria = ref({ nombre: '' })
const nuevaMarca = ref({ nombre: '' })
const nuevaUnidad = ref({ nombre: '', equivalencia: 1 })

// Toast nativo (sin cambios)
const toast = ref({ visible: false, tipo: 'success', mensaje: '' })
let toastTimer = null
const mostrarToast = (tipo, mensaje) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { visible: true, tipo, mensaje }
  toastTimer = setTimeout(() => { toast.value.visible = false }, 4000)
}

const categorias = computed(() => categoriaStore.categorias || [])
const marcas = computed(() => marcaStore.marcas || [])
const unidades = computed(() => unidadStore.unidadesMedida || [])
const productos = computed(() => productoStore.productos)
const pagination = computed(() => productoStore.pagination)

const formatPrice = (value) => Number(value).toFixed(2)

// Cargar productos: siempre per_page = 10
const cargarProductos = async (page = null) => {
  const params = { page: page ?? pagination.value.current_page ?? 1, per_page: 10 }
  if (buscar.value) params.search = buscar.value
  await productoStore.fetchProductos(params)
}

const cambiarPagina = async (event) => {
  const params = { page: event.page + 1, per_page: 10 }
  if (buscar.value) params.search = buscar.value
  await productoStore.fetchProductos(params)
}

let timer = null
const buscarProductos = () => {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    await productoStore.fetchProductos({ page: 1, per_page: 10, search: buscar.value })
  }, 500)
}

const limpiarErrores = () => { errors.value = {} }

const cerrarModalProducto = () => {
  mostrarModalProducto.value = false
  esEdicion.value = false
  productoForm.value = {
    id: null, nombre: '', categoria_id: null, marca_id: null, unidad_medida_id: null,
    precio_detalle: null, precio_mayor: null, stock_minimo: 1, perecedero: false,
    codigo_lote: '', fecha_vencimiento: null, cantidad_inicial: 1
  }
  limpiarErrores()
}

const abrirDialogoTipo = () => { dialogoTipoVisible.value = true }

const seleccionarTipo = (tipo) => {
  dialogoTipoVisible.value = false
  esEdicion.value = false
  cerrarModalProducto()
  productoForm.value.perecedero = (tipo === 'PERECEDERO')
  mostrarModalProducto.value = true
}

const abrirModalEditar = (producto) => {
  esEdicion.value = true
  productoForm.value = {
    id: producto.id,
    nombre: producto.nombre,
    categoria_id: producto.categoria_id,
    marca_id: producto.marca_id,
    unidad_medida_id: producto.unidad_medida_id,
    precio_detalle: Number(producto.precio_detalle),   // ← conversión explícita
    precio_mayor: Number(producto.precio_mayor),       // ← conversión explícita
    stock_minimo: producto.stock_minimo,
    perecedero: producto.perecedero === 'PERECEDERO',
    codigo_lote: '',
    fecha_vencimiento: null,
    cantidad_inicial: 1
  }
  limpiarErrores()
  mostrarModalProducto.value = true
}

const guardarProducto = async () => {
  limpiarErrores()
  loading.value = true

  const data = {
    nombre: productoForm.value.nombre,
    categoria_id: productoForm.value.categoria_id,
    marca_id: productoForm.value.marca_id,
    unidad_medida_id: productoForm.value.unidad_medida_id,
    precio_detalle: productoForm.value.precio_detalle,
    precio_mayor: productoForm.value.precio_mayor,
    stock_minimo: productoForm.value.stock_minimo,
    perecedero: productoForm.value.perecedero ? 'PERECEDERO' : 'NORMAL'
  }

  if (!esEdicion.value) {
    data.cantidad_inicial = productoForm.value.cantidad_inicial
    if (productoForm.value.perecedero) {
      data.codigo_lote = productoForm.value.codigo_lote
      data.fecha_vencimiento = productoForm.value.fecha_vencimiento
    }
  }

  try {
    if (esEdicion.value) {
      await productoStore.updateProducto(productoForm.value.id, data)
      cerrarModalProducto()
      await cargarProductos()
      mostrarToast('success', 'Producto actualizado correctamente.')
    } else {
      await productoStore.createProducto(data)
      cerrarModalProducto()
      await cargarProductos()
      Swal.fire({
        title: '¡Producto creado!',
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
      if (esEdicion.value) {
        const primerError = Object.values(errors.value)[0] || 'Por favor, corrige los errores del formulario.'
        mostrarToast('error', primerError)
      } else {
        Swal.fire({ title: 'Error de validación', text: 'Revisa los campos marcados en rojo.', icon: 'error', confirmButtonColor: '#d33' })
      }
    } else {
      const msg = error.response?.data?.message || 'Ocurrió un error inesperado al guardar el producto.'
      if (esEdicion.value) {
        mostrarToast('error', msg)
      } else {
        Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonColor: '#d33' })
      }
    }
  } finally {
    loading.value = false
  }
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
    customClass: {
      cancelButton: '!text-[#3a5a3a] !font-bold'
    },
    reverseButtons: true
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

const abrirSubModal = (tipo) => { subModal.value[tipo] = true }

const cerrarSubModal = (tipo) => {
  subModal.value[tipo] = false
  if (tipo === 'categoria') nuevaCategoria.value.nombre = ''
  if (tipo === 'marca') nuevaMarca.value.nombre = ''
  if (tipo === 'unidad') nuevaUnidad.value = { nombre: '', equivalencia: 1 }
}

const crearCategoriaDesdeSub = async () => {
  if (!nuevaCategoria.value.nombre) {
    mostrarToast('error', 'El nombre de la categoría es obligatorio.')
    return
  }
  try {
    await categoriaStore.createCategoria({ nombre: nuevaCategoria.value.nombre })
    await categoriaStore.fetchCategorias()
    productoForm.value.categoria_id = categoriaStore.categorias[categoriaStore.categorias.length - 1]?.id
    cerrarSubModal('categoria')
    mostrarToast('success', 'Categoría creada correctamente.')
  } catch (error) {
    mostrarToast('error', error.response?.data?.message || 'Error al crear categoría.')
  }
}

const crearMarcaDesdeSub = async () => {
  if (!nuevaMarca.value.nombre) {
    mostrarToast('error', 'El nombre de la marca es obligatorio.')
    return
  }
  try {
    await marcaStore.createMarca({ nombre: nuevaMarca.value.nombre })
    await marcaStore.fetchMarcas()
    productoForm.value.marca_id = marcaStore.marcas[marcaStore.marcas.length - 1]?.id
    cerrarSubModal('marca')
    mostrarToast('success', 'Marca creada correctamente.')
  } catch (error) {
    mostrarToast('error', error.response?.data?.message || 'Error al crear marca.')
  }
}

const crearUnidadDesdeSub = async () => {
  if (!nuevaUnidad.value.nombre || !nuevaUnidad.value.equivalencia) {
    mostrarToast('error', 'Debe completar el nombre y la equivalencia.')
    return
  }
  try {
    await unidadStore.createUnidadMedida({ nombre: nuevaUnidad.value.nombre, equivalencia: nuevaUnidad.value.equivalencia })
    await unidadStore.fetchUnidadesMedida()
    productoForm.value.unidad_medida_id = unidadStore.unidadesMedida[unidadStore.unidadesMedida.length - 1]?.id
    cerrarSubModal('unidad')
    mostrarToast('success', 'Unidad de medida creada correctamente.')
  } catch (error) {
    mostrarToast('error', error.response?.data?.message || 'Error al crear unidad.')
  }
}

onMounted(async () => {
  await Promise.all([
    categoriaStore.fetchCategorias(),
    marcaStore.fetchMarcas(),
    unidadStore.fetchUnidadesMedida(),
    cargarProductos(1)
  ])
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #c6e5d3; border-radius: 4px; }
.animate-fade-up { animation: fadeUp 0.3s ease-out forwards; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(60px); }
:deep(.p-paginator) { background: transparent; border: none; padding: 0; }
:deep(.p-paginator-page.p-highlight) { background: #0b580b !important; color: white !important; font-weight: bold; }
:deep(.p-inputtext) { font-size: 0.875rem !important; font-weight: 600 !important; }
:deep(.p-calendar) { width: 100%; }
:deep(.p-calendar .p-inputtext) { width: 100%; padding: 0.75rem; }
</style>
