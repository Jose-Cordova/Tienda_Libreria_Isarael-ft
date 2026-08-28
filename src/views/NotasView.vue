<template>
  <main class="flex-1 bg-[#f4f7f6] p-4 sm:p-6 overflow-y-auto custom-scrollbar font-dm-sans">
    <!-- Encabezado -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3">
        <i class="pi pi-file-edit text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Mis Notas</h1>
      </div>
      <Button
        label="Nueva Nota"
        icon="pi pi-plus"
        class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all duration-300"
        @click="abrirModalNueva"
      />
    </section>

    <!-- Grid de notas -->
    <section v-if="!store.loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="nota in store.notas"
        :key="nota.id"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {{ formatearFecha(nota.fecha) }}
            </span>
            <div class="flex gap-1">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-text p-button-sm p-button-warning"
                @click="abrirModalEditar(nota)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text p-button-sm p-button-danger"
                @click="confirmarEliminar(nota.id)"
              />
            </div>
          </div>
          <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-4">
            {{ nota.contenido }}
          </p>
        </div>
      </div>
      <div v-if="store.notas.length === 0" class="col-span-full text-center py-12 text-gray-400">
        <i class="pi pi-inbox text-4xl block mb-2"></i>
        <p class="text-sm font-bold">No tienes notas aún.</p>
        <p class="text-xs">Crea tu primera nota con el botón "Nueva Nota".</p>
      </div>
    </section>

    <!-- Skeleton de carga -->
    <section v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div class="h-20 bg-gray-100 rounded"></div>
      </div>
    </section>

    <!-- Paginador -->
    <div v-if="store.pagination.total > store.pagination.per_page" class="mt-6 flex justify-center">
      <Paginator
        :rows="store.pagination.per_page"
        :totalRecords="store.pagination.total"
        :first="(store.pagination.current_page - 1) * store.pagination.per_page"
        @page="cambiarPagina"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        class="custom-paginator"
      />
    </div>

    <!-- MODAL: Nueva / Editar -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
        <div class="bg-white rounded-[24px] w-[95vw] max-w-lg shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
          <button @click="cerrarModal" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
            <i class="pi pi-times text-xl"></i>
          </button>
          <div class="p-8">
            <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">
              {{ esEdicion ? 'Editar Nota' : 'Nueva Nota' }}
            </h2>
            <p class="text-sm text-gray-400 mb-6">Escribe lo que quieras.</p>

            <form @submit.prevent="guardarNota" class="space-y-5">
              <div>
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Contenido *</label>
                <Textarea
                  v-model="formulario.contenido"
                  rows="6"
                  class="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-[#0a3622] outline-none shadow-sm"
                  placeholder="Escribe tu nota aquí..."
                  :class="{ 'border-red-500': errorContenido }"
                />
                <small v-if="errorContenido" class="text-red-500">{{ errorContenido }}</small>
              </div>

              <div class="flex items-center gap-4 pt-4">
                <button type="button" @click="cerrarModal" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200">
                  Cancelar
                </button>
                <button type="submit" :disabled="cargando" class="flex-[2] py-3 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50">
                  {{ cargando ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useNotaStore } from '@/stores/notaStore';
  import { useToast } from 'primevue/usetoast';
  import Button from 'primevue/button';
  import Textarea from 'primevue/textarea';
  import Paginator from 'primevue/paginator';
  import Swal from 'sweetalert2';

  const store = useNotaStore()
  const toast = useToast()

  const mostrarModal = ref(false)
  const esEdicion = ref(false)
  const cargando = ref(false)
  const errorContenido = ref('')
  const formulario = ref({
    id: null,
    contenido: '',
  })

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    if(!fecha) return 'Sin fecha'
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Paginación
  const cambiarPagina = (event) => {
    store.fetchNotas(event.page + 1)
  }

  // Modal
  const abrirModalNueva = () => {
    esEdicion.value = false
    formulario.value = { id: null, contenido: '' }
    errorContenido.value = ''
    mostrarModal.value = true
  }
  const abrirModalEditar = (nota) => {
    esEdicion.value = true
    formulario.value = {
      id: nota.id,
      contenido: nota.contenido,
    }
    errorContenido.value = ''
    mostrarModal.value = true
  }
  const cerrarModal = () => {
    mostrarModal.value = false
    formulario.value = { id: null, contenido: '' }
    errorContenido.value = ''
  }

  // Guardar (crear/editar)
  const guardarNota = async () => {
    // Validación inline antes de enviar
    if(!formulario.value.contenido.trim()){
      errorContenido.value = 'El contenido es obligatorio.'
      return
    }
    errorContenido.value = ''
    cargando.value = true

    try{
      const datos = {
        contenido: formulario.value.contenido.trim(),
      }

      if(!esEdicion.value){
        const hoy = new Date()
        const offset = hoy.getTimezoneOffset()
        datos.fecha = new Date(hoy.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0]
      }

      if(esEdicion.value){
        await store.actualizarNota(formulario.value.id, datos)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Nota actualizada con éxito',
          life: 3500
        })
      }else{
        await store.crearNota(datos)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Nota creada con éxito',
          life: 3500
        })
      }
      cerrarModal()
    } catch(error){
      // Si es error de validación 422, mostrar inline bajo el campo
      if(error.response?.status === 422){
        const errors = error.response.data.errors || error.response.data.error || {}
        errorContenido.value = errors.contenido ? (Array.isArray(errors.contenido) ? errors.contenido[0] : errors.contenido) : 'Error de validación.'
      } else {
        // Errores de servidor o red mostrados mediante Toast
        const msg = error.response?.data?.message || 'Error al guardar la nota.'
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: msg,
          life: 5000
        })
      }
    }finally{
      cargando.value = false
    }
  }

  // Confirmación destructiva de eliminación únicamente con SweetAlert2
  const confirmarEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar nota?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d1333e',
      cancelButtonColor: '#d6dfd6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { cancelButton: '!text-[#3a5a3a] !font-bold' },
      reverseButtons: true,
      allowOutsideClick: false
    })

    if(result.isConfirmed){
      try{
        await store.eliminarNota(id)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Nota eliminada correctamente',
          life: 3500
        })
      }catch(error){
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'No se pudo eliminar la nota.',
          life: 5000
        })
      }
    }
  }

  // Carga inicial
  onMounted(() => {
    store.fetchNotas(1)
  })

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar{
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb{
  background-color: #c6e5d3;
  border-radius: 4px;
}
.line-clamp-4{
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
:deep(.p-paginator){
  background: transparent;
  border: none;
  padding: 0;
}
:deep(.p-paginator-page.p-highlight){
  background: #0b580b !important;
  color: white !important;
  font-weight: bold;
}
</style>
