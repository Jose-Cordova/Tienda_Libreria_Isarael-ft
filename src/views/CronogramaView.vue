<template>
  <!-- Contenedor principal -->
  <div class="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-140px)] bg-[#f8faf9] font-dm-sans overflow-hidden">
    <!-- BARRA LATERAL: AGENDA DEL MES -->
    <aside class="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 flex-none h-[350px] lg:h-full">
      <div class="p-6 border-b border-gray-50 bg-[#fcfdfc] relative">
        <div class="absolute top-0 left-0 w-1.5 h-full bg-[#0a3622]"></div>
        <h2 class="text-[11px] font-black text-[#0a3622] uppercase tracking-[0.3em] flex items-center gap-3">
          <i class="pi pi-calendar-plus text-green-600"></i> Próximo recorrido
        </h2>
        <p class="text-[10px] text-gray-800 font-bold uppercase tracking-widest mt-1 opacity-60">Agenda del mes actual</p>
      </div>
      <div class="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#f8faf9]/50">
        <div
          v-for="event in agendaEventos"
          :key="event.id"
          class="bg-white p-4 rounded-2xl border border-gray-500 shadow-sm border-l-[6px] border-l-[#0a3622] hover:shadow-md transition-all group cursor-pointer"
          @click="abrirEditar(event)"
        >
          <p class="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">{{ event.fechaStr }}</p>
          <p class="text-sm font-black text-[#0a3622] uppercase leading-tight">{{ event.title }}</p>
          <p class="text-[13px] text-gray-800 font-bold mt-2 border-t border-gray-400 pt-2 line-clamp-2">{{ event.extendedProps.descripcion }}</p>
        </div>
        <div v-if="agendaEventos.length === 0" class="py-10 text-center flex flex-col items-center">
          <i class="pi pi-calendar text-4xl text-gray-100 mb-4"></i>
          <p class="text-xs font-black text-gray-300 uppercase tracking-widest">Sin Recorridos</p>
        </div>
      </div>
    </aside>

    <!-- ÁREA PRINCIPAL: CALENDARIO -->
    <section class="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
      <!-- CABECERA -->
      <div class="bg-white px-4 sm:px-6 py-4 border-b border-gray-500 flex flex-wrap items-center justify-between gap-4 shadow-sm z-20">
        <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Button
            label="Registrar"
            icon="pi pi-plus"
            class="p-button-sm font-black text-[12px] !bg-[#0a3622] hover:!bg-[#115033] text-white border-none rounded-xl px-4 h-[40px] shadow-md transition-all tracking-widest flex-1 sm:flex-none justify-center"
            @click="abrirNuevo"
          />
          <div class="h-6 w-px bg-gray-500 hidden sm:block"></div>
          <h1 class="text-base font-black text-[#0a3622] uppercase tracking-tighter hidden md:block">Cronograma Logístico</h1>
        </div>
        <div class="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button
            label="Hoy"
            class="p-button-sm font-black text-[10px] !bg-[#0a3622] hover:!bg-[#115033] text-white border-none rounded-xl px-4 h-[40px] shadow-md transition-all uppercase tracking-widest"
            @click="irAHoy"
          />
          <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-1 px-3 border border-gray-200 flex-1 sm:flex-none justify-between">
            <Button icon="pi pi-chevron-left" class="p-button-text p-button-sm !text-[#0a3622] !w-7 !h-7 hover:!bg-white" @click="prev" />
            <div class="min-w-[100px] sm:min-w-[120px] text-center">
              <span class="text-[10px] sm:text-xs font-black text-[#0a3622] uppercase tracking-widest">{{ mesAnioActual }}</span>
            </div>
            <Button icon="pi pi-chevron-right" class="p-button-text p-button-sm !text-[#0a3622] !w-7 !h-7 hover:!bg-white" @click="next" />
          </div>
        </div>
      </div>

      <!-- CALENDARIO -->
      <div class="flex-none p-4 sm:p-6 bg-[#f8faf9] overflow-hidden h-[350px] lg:h-full lg:flex-1">
        <div class="bg-white p-4 rounded-[24px] border border-gray-600 shadow-xl h-full relative overflow-hidden">
          <FullCalendar
            ref="fullCalendar"
            :options="calendarOptions"
            class="h-full font-dm-sans"
          />
        </div>
      </div>
    </section>

    <!-- MODAL: NUEVO / EDITAR -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4 font-dm-sans">
        <div class="bg-white rounded-[24px] w-[90vw] max-w-md shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
          <button @click="cerrarModal" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
            <i class="pi pi-times text-xl"></i>
          </button>
          <div class="p-10 text-left">
            <div class="mb-6">
              <h2 class="text-xl font-extrabold text-[#0a3622] mb-1 uppercase tracking-tight">{{ esEdicion ? 'Editar Registro' : 'Nuevo Registro' }}</h2>
              <p class="text-[14px] text-gray-400 font-medium">Agenda de visitas o pedidos</p>
            </div>

            <form @submit.prevent="guardar" class="space-y-6">
              <!-- Proveedor -->
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Proveedor *</label>
                <Dropdown
                  v-model="formulario.proveedor_id"
                  :options="store.proveedores"
                  optionLabel="nombre"
                  optionValue="id"
                  placeholder="Buscar Proveedor..."
                  class="w-full border border-gray-200 rounded-xl text-sm h-[54px] flex items-center font-bold"
                  :class="{ 'border-red-500': errores.proveedor_id }"
                  filter
                />
                <small v-if="errores.proveedor_id" class="text-red-500 text-xs block">{{ errores.proveedor_id }}</small>
              </div>

              <!-- Fecha -->
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Fecha Programada *</label>
                <Calendar
                  v-model="formulario.fecha"
                  :minDate="fechaMinima"
                  dateFormat="dd/mm/yy"
                  class="w-full"
                  inputClass="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none shadow-sm"
                  :class="{ 'border-red-500': errores.fecha }"
                />
                <small v-if="errores.fecha" class="text-red-500 text-xs block">{{ errores.fecha }}</small>
              </div>

              <!-- Descripción -->
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Descripción *</label>
                <Textarea
                  v-model="formulario.descripcion"
                  rows="3"
                  class="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none"
                  :class="{ 'border-red-500': errores.descripcion }"
                  placeholder="Detalles de la visita o pedido..."
                />
                <small v-if="errores.descripcion" class="text-red-500 text-xs block">{{ errores.descripcion }}</small>
              </div>

              <!-- Botón eliminar (solo en edición) -->
              <div v-if="esEdicion" class="flex justify-end">
                <Button
                  label="Eliminar"
                  icon="pi pi-trash"
                  class="p-button-danger p-button-text"
                  @click="confirmarEliminar"
                  type="button"
                />
              </div>

              <div class="flex items-center gap-4 mt-10">
                <button type="button" @click="cerrarModal" class="px-8 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm flex-1 uppercase tracking-widest">Cancelar</button>
                <button type="submit" :disabled="cargando" class="flex-[2] py-4 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-2">
                  <i v-if="cargando" class="pi pi-spin pi-spinner text-xs"></i>
                  {{ cargando ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import Swal from 'sweetalert2';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import { useCronogramaStore } from '@/stores/cronogramaStore';

const store = useCronogramaStore()
const toast = useToast()
const fullCalendar = ref(null)
const mesAnioActual = ref('')
const mostrarModal = ref(false)
const esEdicion = ref(false)
const cargando = ref(false)
const fechaMinima = ref(new Date())
fechaMinima.value.setHours(0, 0, 0, 0)

const formulario = ref({ id: null, proveedor_id: null, fecha: null, descripcion: '' })

// Errores inline para cada campo
const errores = ref({
  proveedor_id: '',
  fecha: '',
  descripcion: ''
})

const limpiarErrores = () => {
  errores.value = {
    proveedor_id: '',
    fecha: '',
    descripcion: ''
  }
}

const windowWidth = ref(window.innerWidth)
const updateWidth = () => { windowWidth.value = window.innerWidth; }
onMounted(() => window.addEventListener('resize', updateWidth))
onUnmounted(() => window.removeEventListener('resize', updateWidth))

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: esLocale,
  timeZone: 'UTC',
  headerToolbar: false,
  dayHeaderFormat: { weekday: windowWidth.value < 768 ? 'short' : 'long' },
  aspectRatio: windowWidth.value < 768 ? 2.5 : 1.8,
  events: store.eventos,
  editable: true,
  selectable: true,
  height: windowWidth.value < 768 ? 280 : '100%',
  dayMaxEvents: true,
  eventDisplay: 'block',
  displayEventTime: false,
  eventClassNames: 'font-bold uppercase text-[10px] border-none !bg-[#0a3622] text-white rounded-md p-1 shadow-sm',
  datesSet: async (info) => {
    mesAnioActual.value = info.view.title;
    await store.fetchEventos(info.startStr, info.endStr);
  },
  eventClick: (info) => {
    abrirEditar(info.event)
  }
}))

const agendaEventos = computed(() => {
  return store.eventos.map(e => {
    let dateObj
    if (e.start && typeof e.start === 'string') {
      const parts = e.start.split('T')[0].split('-')
      if (parts.length === 3) {
        dateObj = new Date(parts[0], parts[1] - 1, parts[2])
      } else {
        dateObj = new Date(e.start)
      }
    } else {
      dateObj = e.start ? new Date(e.start) : new Date()
    }
    return {
      ...e,
      fechaStr: dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' }),
      dateObj
    }
  }).sort((a, b) => a.dateObj - b.dateObj)
})

const prev = () => fullCalendar.value?.getApi()?.prev()
const next = () => fullCalendar.value?.getApi()?.next()
const irAHoy = () => fullCalendar.value?.getApi()?.today()

const abrirNuevo = async () => {
  if(store.proveedores.length === 0){
    try{
      await store.fetchProveedores()
    }catch(error){
      console.error('Error al cargar proveedores:', error)
    }
  }
  esEdicion.value = false
  formulario.value = { id: null, proveedor_id: null, fecha: new Date(), descripcion: '' }
  limpiarErrores()
  mostrarModal.value = true
}

const abrirEditar = (fcEvent) => {
  esEdicion.value = true
  let fechaParsed = null
  if (fcEvent.start) {
    if (typeof fcEvent.start === 'string') {
      const parts = fcEvent.start.split('T')[0].split('-')
      if (parts.length === 3) {
        fechaParsed = new Date(parts[0], parts[1] - 1, parts[2])
      } else {
        fechaParsed = new Date(fcEvent.start)
      }
    } else {
      fechaParsed = new Date(fcEvent.start)
    }
  }
  formulario.value = {
    id: fcEvent.id,
    proveedor_id: fcEvent.extendedProps.proveedor_id || null,
    fecha: fechaParsed,
    descripcion: fcEvent.extendedProps.descripcion || ''
  }
  limpiarErrores()
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  formulario.value = { id: null, proveedor_id: null, fecha: null, descripcion: '' }
  limpiarErrores()
}

const guardar = async () => {
  limpiarErrores()
  let valido = true

  // Validaciones inline
  if(!formulario.value.proveedor_id){
    errores.value.proveedor_id = 'Debe seleccionar un proveedor.'
    valido = false
  }

  if(!formulario.value.fecha){
    errores.value.fecha = 'Debe seleccionar una fecha programada.'
    valido = false
  } else {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaSel = new Date(formulario.value.fecha)
    fechaSel.setHours(0, 0, 0, 0)

    if(fechaSel < hoy){
      errores.value.fecha = 'No puedes seleccionar una fecha anterior a hoy.'
      valido = false
    }
  }

  if(!formulario.value.descripcion || !formulario.value.descripcion.trim()){
    errores.value.descripcion = 'La descripción es obligatoria.'
    valido = false
  }

  if(!valido) return

  cargando.value = true

  try{
    const year = formulario.value.fecha.getFullYear()
    const month = String(formulario.value.fecha.getMonth() + 1).padStart(2, '0')
    const day = String(formulario.value.fecha.getDate()).padStart(2, '0')
    const fechaLocal = `${year}-${month}-${day}`

    const datos = {
      fecha: fechaLocal,
      contenido: formulario.value.descripcion.trim(),
      proveedor_id: formulario.value.proveedor_id
    }

    if(esEdicion.value){
      await store.actualizarEvento(formulario.value.id, datos)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Evento actualizado con éxito',
        life: 3500
      })
    }else{
      await store.crearEvento(datos)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Evento programado con éxito',
        life: 3500
      })
    }

    cerrarModal()
    const calendarApi = fullCalendar.value?.getApi()
    if(calendarApi){
      const view = calendarApi.view
      await store.fetchEventos(view.activeStart.toISOString().split('T')[0], view.activeEnd.toISOString().split('T')[0])
      calendarApi.refetchEvents()
    }
  }catch(error){
    // Errores de validación 422 mostrados inline
    if(error.response?.status === 422){
      const valErrors = error.response.data.errors || error.response.data.error || {}
      if(valErrors.proveedor_id) errores.value.proveedor_id = Array.isArray(valErrors.proveedor_id) ? valErrors.proveedor_id[0] : valErrors.proveedor_id
      if(valErrors.fecha) errores.value.fecha = Array.isArray(valErrors.fecha) ? valErrors.fecha[0] : valErrors.fecha
      if(valErrors.contenido || valErrors.descripcion) errores.value.descripcion = Array.isArray(valErrors.contenido || valErrors.descripcion) ? (valErrors.contenido || valErrors.descripcion)[0] : (valErrors.contenido || valErrors.descripcion)
    } else {
      // Errores generales de servidor o red mostrados mediante Toast
      const msg = error.response?.data?.message || 'Error al guardar el evento.'
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
const confirmarEliminar = async () => {
  const result = await Swal.fire({
    title: '¿Eliminar evento?',
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
    try {
      await store.eliminarEvento(formulario.value.id)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Evento eliminado correctamente',
        life: 3500
      })
      cerrarModal()
      const calendarApi = fullCalendar.value?.getApi()
      if(calendarApi){
        const view = calendarApi.view
        await store.fetchEventos(view.activeStart.toISOString().split('T')[0], view.activeEnd.toISOString().split('T')[0])
        calendarApi.refetchEvents()
      }
    }catch(error){
      const msg = error.response?.data?.message || 'Error al eliminar el evento.'
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: msg,
        life: 5000
      })
    }
  }
}

onMounted(async () => {
    try {
      await store.fetchProveedores()
    }catch(error){
     console.error('Error al precargar proveedores:', error)
  }
})
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar{
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb{
    background-color: #c6e5d3;
    border-radius: 10px;
  }

  :deep(.fc-theme-standard td),
  :deep(.fc-theme-standard th){
    border: 1px solid #2b2a2a !important;
  }
  :deep(.fc-col-header-cell){
    background: #578357 !important;
    padding: 12px 0 !important;
  }
  :deep(.fc-col-header-cell-cushion){
    font-size: 10px;
    font-weight: 900;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  :deep(.fc-daygrid-day){
    background-color: #fcfdfc;
  }
  :deep(.fc-daygrid-day-number){
    font-size: 12px;
    font-weight: 800;
    color: #21262b;
    padding: 10px !important;
  }
  :deep(.fc-day-today){
    background-color: #aef3c3 !important;
  }
  :deep(.fc-event){
    cursor: pointer;
    transition: transform 0.2s;
  }
  :deep(.fc-event:hover){
    transform: scale(1.02);
    filter: brightness(1.1);
  }
  :deep(.fc-popover){
    z-index: 100 !important;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
    border-radius: 12px !important;
    border: 1px solid #e2e8f0 !important;
  }
</style>
