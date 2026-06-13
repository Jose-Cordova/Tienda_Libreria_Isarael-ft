<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">

    <!-- Toast flotante -->
    <transition name="toast">
      <div
        v-if="toast.visible"
        class="fixed top-5 right-5 sm:right-5 left-5 sm:left-auto z-[99999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl min-w-0 sm:min-w-[340px] max-w-md border"
        :class="toast.tipo === 'success' ? 'bg-green-100 border-green-300 text-green-900' : 'bg-red-100 border-red-300 text-red-900'"
      >
        <i v-if="toast.tipo === 'success'" class="pi pi-check-circle text-green-600 text-xl shrink-0"></i>
        <i v-else class="pi pi-times-circle text-red-600 text-xl shrink-0"></i>
        <span class="text-sm font-bold leading-snug">{{ toast.mensaje }}</span>
      </div>
    </transition>

    <!-- Encabezado con búsqueda -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <i class="pi pi-bookmark text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Marcas</h1>
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <span class="relative flex-1 sm:flex-none">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
          <InputText
            v-model="buscar"
            placeholder="Buscar..."
            class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-full sm:w-56 focus:border-green-600 transition-all"
            @input="buscarMarcas"
          />
        </span>
        <Button
          label="Nueva Marca"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all duration-300 w-full sm:w-auto"
          @click="abrirModalNueva"
        />
      </div>
    </section>

    <!-- Tabla -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Nombre</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 divide-y divide-gray-100">
            <tr v-for="marca in marcas" :key="marca.id" class="hover:bg-gray-50 transition">
              <td class="py-4 px-5 font-bold text-gray-800 text-sm">{{ marca.nombre }}</td>
              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-1">
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" @click="abrirModalEditar(marca)" />
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger" @click="confirmarEliminar(marca.id)" />
                </div>
              </td>
            </tr>
            <tr v-if="marcas.length === 0">
              <td colspan="2" class="py-10 text-center italic text-gray-400">No se encontraron marcas.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Paginación -->
      <div class="p-3 border-t border-gray-400 bg-gray-50/50">
        <Paginator
          :rows="perPage"
          :totalRecords="pagination.total"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          :first="(pagination.current_page - 1) * perPage"
          @page="cambiarPagina"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          class="custom-paginator text-[10px]"
        />
      </div>
    </section>

    <!-- Modal -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-[24px] w-[90vw] max-w-md shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
        <button @click="cerrarModal" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
          <i class="pi pi-times text-xl"></i>
        </button>
        <div class="p-8">
          <div class="mb-6 text-left">
            <h2 class="text-2xl font-extrabold text-[#003d00] mb-1">{{ esEdicion ? 'Editar Marca' : 'Nueva Marca' }}</h2>
            <p class="text-gray-400 font-medium">Complete los datos</p>
          </div>

          <form @submit.prevent="guardar">
            <div class="mb-6">
              <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre *</label>
              <InputText v-model="form.nombre" :maxlength="50" class="w-full border border-gray-200 rounded-xl p-3 focus:border-[#003d00]" :class="{ 'border-red-500': errorNombre }" />
              <small class="text-red-500">{{ errorNombre }}</small>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" @click="cerrarModal" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">
                Cancelar
              </button>
              <button type="submit" :disabled="loading" class="flex-1 py-3 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50">
                {{ loading ? 'GUARDANDO...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMarcaStore } from '@/stores/marcaStore'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'
import Swal from 'sweetalert2'

defineOptions({ name: 'MarcaView' })

const marcaStore = useMarcaStore()

const buscar = ref('')
const mostrarModal = ref(false)
const esEdicion = ref(false)
const loading = ref(false)
const perPage = ref(5)
const form = ref({ id: null, nombre: '' })
const errorNombre = ref('')

const marcas = computed(() => marcaStore.marcas || [])
const pagination = computed(() => marcaStore.pagination)

// Toast nativo
const toast = ref({ visible: false, tipo: 'success', mensaje: '' })
let toastTimer = null
const mostrarToast = (tipo, mensaje) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { visible: true, tipo, mensaje }
  toastTimer = setTimeout(() => { toast.value.visible = false }, 4000)
}

const cargarMarcas = async () => {
  await marcaStore.fetchMarcas({
    page: pagination.value.current_page || 1,
    per_page: perPage.value,
    search: buscar.value || undefined
  })
}

const cambiarPagina = async (event) => {
  perPage.value = event.rows
  await marcaStore.fetchMarcas({
    page: event.page + 1,
    per_page: event.rows,
    search: buscar.value || undefined
  })
}

let timer = null
const buscarMarcas = () => {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    await marcaStore.fetchMarcas({
      page: 1,
      per_page: perPage.value,
      search: buscar.value || undefined
    })
  }, 500)
}

const limpiarErrores = () => { errorNombre.value = '' }
const cerrarModal = () => {
  mostrarModal.value = false
  form.value = { id: null, nombre: '' }
  esEdicion.value = false
  limpiarErrores()
}

const abrirModalNueva = () => {
  esEdicion.value = false
  form.value = { id: null, nombre: '' }
  limpiarErrores()
  mostrarModal.value = true
}

const abrirModalEditar = (marca) => {
  esEdicion.value = true
  form.value = { id: marca.id, nombre: marca.nombre }
  limpiarErrores()
  mostrarModal.value = true
}

const guardar = async () => {
  if (!form.value.nombre.trim()) {
    errorNombre.value = 'El nombre es obligatorio'
    return
  }
  loading.value = true
  try {
    if (esEdicion.value) {
      // EDICIÓN → Toast flotante nativo
      await marcaStore.updateMarca(form.value.id, { nombre: form.value.nombre })
      cerrarModal()
      await cargarMarcas()
      mostrarToast('success', 'Marca actualizada correctamente.')
    } else {
      // CREACIÓN → Swal modal clásico
      await marcaStore.createMarca({ nombre: form.value.nombre })
      cerrarModal()
      await cargarMarcas()
      Swal.fire({
        title: '¡Marca creada!',
        text: 'La marca se registró con éxito.',
        icon: 'success',
        confirmButtonColor: '#003d00',
        confirmButtonText: 'Aceptar'
      })
    }
  } catch (error) {
    if (error.response?.status === 422) {
      const errors = error.response.data.errors || error.response.data.error
      if (errors?.nombre) {
        errorNombre.value = errors.nombre[0]
      }
      if (esEdicion.value) {
        mostrarToast('error', errors?.nombre?.[0] || 'Error de validación en los datos.')
      } else {
        if (!errors?.nombre) {
          Swal.fire({ title: 'Error de validación', text: 'Revisa los datos ingresados.', icon: 'error', confirmButtonColor: '#d33' })
        }
      }
    } else {
      const msg = error.response?.data?.message || 'Error al guardar.'
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

const confirmarEliminar = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar marca?',
    text: 'Esta acción no se puede revertir.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d1333e',
    cancelButtonColor: '#d6dfd6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    customClass: {
      cancelButton: '!text-[#3a5a3a] !font-bold'
    },
    reverseButtons: true
  })
  if (result.isConfirmed) {
    try {
      await marcaStore.deleteMarca(id)
      await cargarMarcas()
      Swal.fire({ title: 'Eliminada', text: 'La marca fue eliminada.', icon: 'success', confirmButtonColor: '#003d00', confirmButtonText: 'Aceptar' })
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Error al eliminar.', icon: 'error', confirmButtonColor: '#d33' })
    }
  }
}

onMounted(() => cargarMarcas())
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #c6e5d3; border-radius: 4px; }
.animate-fade-up { animation: fadeUp 0.3s ease-out forwards; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(60px); }
:deep(.p-paginator) { background: transparent; border: none; padding: 0; }
:deep(.p-paginator-page.p-highlight) { background: #0b580b !important; color: white !important; font-weight: bold; }
:deep(.p-inputtext) { font-size: 0.875rem !important; font-weight: 600 !important; }
</style>
