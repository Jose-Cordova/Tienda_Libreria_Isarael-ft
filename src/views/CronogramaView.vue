<template>
  <!-- Contenedor principal con altura fija para evitar desorden -->
  <div class="flex flex-col lg:flex-row h-[calc(100vh-140px)] bg-[#f8faf9] font-dm-sans overflow-hidden">
    <!-- BARRA LATERAL: AGENDA DEL MES -->
    <aside class="w-full lg:w-80 bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 flex-none">
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
          class="bg-white p-4 rounded-2xl border border-gray-500 shadow-sm border-l-[6px] border-l-[#0a3622] hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
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
    <section class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- CABECERA DE NAVEGACIÓN -->
      <div class="bg-white px-6 py-4 border-b border-gray-500 flex flex-wrap items-center justify-between gap-4 shadow-sm z-20">
        <div class="flex items-center gap-4">
          <Button
            label="Registrar"
            icon="pi pi-plus"
            class="p-button-sm font-black text-[12px] !bg-[#0a3622] hover:!bg-[#115033] text-white border-none rounded-xl px-4 h-[40px] shadow-md transition-all tracking-widest"
            @click="abrirNuevo"
          />
          <div class="h-6 w-px bg-gray-500 hidden sm:block"></div>
          <h1 class="text-base font-black text-[#0a3622] tracking-tighter hidden md:block">Cronograma Logístico</h1>
        </div>
        <div class="flex items-center gap-4">
          <Button
            label="Hoy"
            class="p-button-sm font-black text-[10px] !bg-[#0a3622] hover:!bg-[#115033] text-white border-none rounded-xl px-5 h-[40px] shadow-md transition-all uppercase tracking-widest"
            @click="irAHoy"
          />
          <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-1 px-3 border border-gray-200">
             <Button icon="pi pi-chevron-left" class="p-button-text p-button-sm !text-[#0a3622] !w-7 !h-7 hover:!bg-white" @click="prev" />
             <div class="min-w-[120px] text-center">
               <span class="text-xs font-black text-[#0a3622] uppercase tracking-widest">{{ mesAnioActual }}</span>
             </div>
             <Button icon="pi pi-chevron-right" class="p-button-text p-button-sm !text-[#0a3622] !w-7 !h-7 hover:!bg-white" @click="next" />
          </div>
        </div>
      </div>
      <!-- Contenedor del Calendario -->
      <div class="flex-1 p-4 sm:p-6 bg-[#f8faf9] overflow-hidden">
        <div class="bg-white p-4 rounded-[24px] border border-gray-600 shadow-xl h-full overflow-hidden relative">
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
        <div class="bg-white rounded-[24px] w-full max-w-md shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
          <button @click="mostrarModal = false" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
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
                  :options="proveedoresMock"
                  optionLabel="nombre"
                  optionValue="id"
                  placeholder="Buscar Proveedor..."
                  class="w-full border border-gray-200 rounded-xl text-sm h-[54px] flex items-center font-bold"
                  filter
                />
              </div>
              <!-- Fecha -->
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Fecha Programada *</label>
                <Calendar v-model="formulario.fecha" dateFormat="dd/mm/yy" class="w-full" inputClass="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none shadow-sm" />
              </div>

              <!-- Descripción -->
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Descripción *</label>
                <Textarea v-model="formulario.descripcion" rows="3" class="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" placeholder="Detalles de la visita o pedido..." />
              </div>
              <div class="flex items-center gap-4 mt-10">
                <button type="button" @click="mostrarModal = false" class="px-8 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm flex-1 uppercase tracking-widest">Cancelar</button>
                <button type="submit" class="flex-[2] py-4 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-[0.2em]">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import FullCalendar from '@fullcalendar/vue3';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import esLocale from '@fullcalendar/core/locales/es';
  import Swal from 'sweetalert2';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import Calendar from 'primevue/calendar';
  import Textarea from 'primevue/textarea';

  // --- REFERENCIAS Y ESTADOS ---
  const fullCalendar = ref(null);
  const mesAnioActual = ref('');
  const mostrarModal = ref(false);
  const esEdicion = ref(false);
  const formulario = ref({ id: null, proveedor_id: null, fecha: null, descripcion: '' });

  // --- DATOS ESTÁTICOS ---
  const proveedoresMock = [
    { id: 1, nombre: 'Distribuidora García' },
    { id: 2, nombre: 'Papelería Internacional' },
    { id: 3, nombre: 'Librería El Centro' }
  ];

  const eventos = ref([
    { id: 1, title: 'Distribuidora García', start: '2026-05-28', extendedProps: { descripcion: 'Pedido de papelería general' } },
    { id: 2, title: 'Librería El Centro', start: '2026-05-30', extendedProps: { descripcion: 'Visita de agente de ventas' } },
    { id: 3, title: 'Papelería Internacional', start: '2026-06-02', extendedProps: { descripcion: 'Entrega de cuadernos espirales' } }
  ]);

  // --- CONFIGURACIÓN DE FULLCALENDAR ---
  const calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: false, // Desactivamos la cabecera nativa para usar la nuestra
    dayHeaderFormat: { weekday: 'long' }, // Nombres de días completos (Lunes, Martes...)
    events: eventos.value,
    editable: true,
    selectable: true,
    height: '100%',
    dayMaxEvents: true,
    eventDisplay: 'block',
    eventClassNames: 'font-bold uppercase text-[10px] border-none !bg-[#0a3622] text-white rounded-md p-1 shadow-sm',
    datesSet: (info) => {
      // Actualizamos el nombre del mes/año en nuestra cabecera personalizada
      mesAnioActual.value = info.view.title;
    },
    eventClick: (info) => {
      abrirEditar(info.event);
    }
  };

  // --- LÓGICA DE AGENDA (Sidebar) ---
  const agendaEventos = computed(() => {
    // Filtramos solo los eventos del mes actual para la lista lateral
    return eventos.value.map(e => ({
      ...e,
      fechaStr: new Date(e.start).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })
    })).sort((a,b) => new Date(a.start) - new Date(b.start));
  });

  // --- ACCIONES DE NAVEGACIÓN ---
  const prev = () => fullCalendar.value.getApi().prev();
  const next = () => fullCalendar.value.getApi().next();
  const irAHoy = () => fullCalendar.value.getApi().today();

  // --- ACCIONES DE MODAL ---
  const abrirNuevo = () => {
    esEdicion.value = false;
    formulario.value = { id: null, proveedor_id: null, fecha: new Date(), descripcion: '' };
    mostrarModal.value = true;
  };

  const abrirEditar = (fcEvent) => {
    esEdicion.value = true;
    const prov = proveedoresMock.find(p => p.nombre === fcEvent.title);
    formulario.value = {
      id: fcEvent.id,
      proveedor_id: prov ? prov.id : null,
      fecha: fcEvent.start,
      descripcion: fcEvent.extendedProps.descripcion
    };
    mostrarModal.value = true;
  };

  const guardar = () => {
    if (!formulario.value.proveedor_id || !formulario.value.fecha || !formulario.value.descripcion) {
      return Swal.fire('Incompleto', 'Por favor llena todos los campos', 'warning');
    }

    Swal.fire({
      icon: 'success',
      title: esEdicion.value ? '¡Evento Actualizado!' : '¡Evento Guardado!',
      showConfirmButton: false,
      timer: 2500
    });
    mostrarModal.value = false;
  };
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #c6e5d3;
    border-radius: 10px;
  }

  /* Estilos para sobrescribir FullCalendar y que se vea Premium */
  :deep(.fc-theme-standard td), :deep(.fc-theme-standard th) {
    border: 1px solid #2b2a2a !important;
  }
  :deep(.fc-col-header-cell) {
    background: #578357 !important;
    padding: 12px 0 !important;
  }
  :deep(.fc-col-header-cell-cushion) {
    font-size: 10px;
    font-weight: 900;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  :deep(.fc-daygrid-day) {
    background-color: #fcfdfc; /* Fondo muy ligeramente verde/blanco */
  }
  :deep(.fc-daygrid-day-number) {
    font-size: 12px;
    font-weight: 800;
    color: #21262b;
    padding: 10px !important;
  }
  :deep(.fc-day-today) {
    background-color: #aef3c3 !important;
  }
  :deep(.fc-event) {
    cursor: pointer;
    transition: transform 0.2s;
  }
  :deep(.fc-event:hover) {
    transform: scale(1.02);
    filter: brightness(1.1);
  }
</style>
