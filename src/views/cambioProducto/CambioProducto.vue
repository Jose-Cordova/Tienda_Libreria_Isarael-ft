<template>
  <main class="flex-1 bg-[#f4f7f6] p-3 sm:p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">
    <!-- Encabezado -->
    <section class="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <!-- Fila Superior: Título y Botón Registrar -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 w-full">
        <div class="flex items-center gap-3 text-left w-full sm:w-auto">
          <i class="pi pi-refresh text-xl text-green-600"></i>
          <h1 class="text-lg font-extrabold text-[#0a3622]">Cambio de Producto</h1>
        </div>
        <Button
          label="Registrar"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all w-full sm:w-auto shrink-0"
          @click="abrirNuevo"
        />
      </div>

      <!-- Fila Inferior: Filtros -->
      <div class="flex flex-wrap items-center gap-3 w-full">
        <span class="relative flex-1 sm:flex-none">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
          <InputText
            v-model="busqueda"
            placeholder="Buscar..."
            class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-full sm:w-48 focus:border-green-600 transition-all"
            @input="buscarRegistros"
          />
        </span>
        <Dropdown
          v-model="filtroEstado"
          :options="opcionesEstado"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          class="p-dropdown-sm border-gray-500 rounded-lg text-sm text-[#0a3622] w-full sm:w-36 flex items-center font-bold"
          @change="cargarRegistros"
        />
        <div class="flex items-center gap-2 flex-1 sm:flex-none">
          <Calendar
            v-model="fechaInicio"
            placeholder="Desde"
            dateFormat="yy-mm-dd"
            showIcon
            iconDisplay="input"
            :maxDate="fechaFin || null"
            class="p-calendar-sm flex-1 sm:w-32 custom-prime-calendar custom-calendar-input"
            @date-select="cargarRegistros"
          />
          <Calendar
            v-model="fechaFin"
            dateFormat="yy-mm-dd"
            placeholder="Hasta"
            showIcon
            iconDisplay="input"
            :minDate="fechaInicio || null"
            class="p-calendar-sm flex-1 sm:w-32 custom-prime-calendar custom-calendar-input"
            @date-select="cargarRegistros"
          />
          <Button
            v-if="fechaInicio || fechaFin || filtroEstado || busqueda"
            icon="pi pi-filter-slash"
            class="p-button-rounded p-button-text p-button-sm !text-red-900 !w-9 !h-9 shrink-0"
            @click="limpiarFiltros"
          />
        </div>
      </div>
    </section>

    <!-- Tabla de los registros -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 text-left">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-[11px] font-extrabold uppercase tracking-widest border-b border-gray-200">
              <th class="py-4 px-5">Fecha</th>
              <th class="py-4 px-5">Producto devuelto</th>
              <th class="py-4 px-5">Lote</th>
              <th class="py-4 px-5 text-center">Cant.</th>
              <th class="py-4 px-5 text-center">Valor</th>
              <th class="py-4 px-5">Efecto en stock</th>
              <th class="py-4 px-5 text-center">Estado</th>
              <th class="py-4 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-800 divide-y divide-gray-100">
            <tr v-for="item in cambios" :key="item.id" class="hover:bg-gray-50/80 transition text-sm">
              <td class="py-4 px-5 font-bold text-gray-600">{{ formatearFecha(item.fecha) }}</td>
              <td class="py-4 px-5 font-bold">
                <div class="flex flex-col">
                  <span class="text-gray-800">{{ item.producto?.nombre }}</span>
                  <span class="text-[11px] text-gray-400">{{ item.producto?.marca?.nombre || 'Sin marca' }}</span>
                </div>
              </td>
              <td class="py-4 px-5">
                <span v-if="item.producto?.perecedero === 'PERECEDERO'" class="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-1 rounded border border-blue-100 shadow-sm">
                  {{ item.lote?.codigo_lote || 'Sin Lote' }}
                </span>
                <span v-else class="text-[11px] text-gray-400 italic">No aplica</span>
              </td>
              <td class="py-4 px-5 text-center font-bold text-gray-800">{{ item.cantidad }}</td>
              <td class="py-4 px-5 text-center font-bold text-gray-800">${{ parseFloat(item.total_perdida).toFixed(2) }}</td>
              <td class="py-4 px-5">
                <div v-html="efectoStockHtml(item)" class="text-xs"></div>
              </td>
              <td class="py-4 px-5 text-center">
                <span :class="obtenerBadgeClase(item.estado_reclamacion)" class="text-[10px] font-bold px-2 py-1 rounded-full uppercase inline-flex items-center gap-1 shadow-sm border border-gray-100">
                  <span class="w-1.5 h-1.5 rounded-full" :class="obtenerPuntoClase(item.estado_reclamacion)"></span>
                  {{ item.estado_reclamacion }}
                </span>
              </td>
              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-1">
                  <template v-if="item.estado_reclamacion === 'PENDIENTE'">
                    <Button icon="pi pi-check" v-tooltip.top="'Aceptar reemplazo'" class="p-button-rounded p-button-text p-button-sm p-button-success !text-green-600 hover:!bg-green-50" @click="procesarAceptar(item)" />
                    <Button icon="pi pi-times" v-tooltip.top="'Rechazar reclamación'" class="p-button-rounded p-button-text p-button-sm p-button-danger !text-red-600 hover:!bg-red-50" @click="procesarRechazar(item)" />
                    <Button icon="pi pi-ban" v-tooltip.top="'Anular registro (Revertir)'" class="p-button-rounded p-button-text p-button-sm p-button-warning !text-amber-600 hover:!bg-amber-50" @click="procesarAnular(item)" />
                  </template>
                  <span v-else class="text-xs text-gray-400 italic font-medium">Completado</span>
                </div>
              </td>
            </tr>
            <tr v-if="cambios.length === 0">
              <td colspan="8" class="py-12 text-center text-gray-400">
                <span class="italic text-sm">No hay registros de devoluciones al proveedor.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-3 border-t border-gray-100 bg-gray-50/50">
        <Paginator
          :rows="paginacion.filas_por_pagina"
          :totalRecords="paginacion.total"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          :first="(paginacion.pagina_actual - 1) * paginacion.filas_por_pagina"
          @page="cambiarPagina"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          class="custom-paginator text-[10px]"
        />
      </div>
    </section>

    <!-- Modal: Nuevo Registro -->
    <CambioModalForm v-model:visible="mostrarModal" @guardado="cargarRegistros" />

    <!-- Wizard: Aceptar Reemplazo -->
    <CambioWizardAceptar v-model:visible="mostrarModalAceptar" :itemAceptar="itemAceptar" @procesado="cargarRegistros" />
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Paginator from 'primevue/paginator';
import { useCambioProductoStore } from '@/stores/cambioProductoStore';
import CambioModalForm from './CambioModalForm.vue';
import CambioWizardAceptar from './CambioWizardAceptar.vue';

const store = useCambioProductoStore();
const toast = useToast();

const cambios = computed(() => store.cambios);

const paginacion = ref({ pagina_actual: 1, filas_por_pagina: 10, total: 0 });
const busqueda = ref('');
const filtroEstado = ref(null);
const fechaInicio = ref(null);
const fechaFin = ref(null);

const opcionesEstado = ref([
  { label: 'Todos', value: null },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Aceptado', value: 'ACEPTADO' },
  { label: 'Rechazado', value: 'RECHAZADO' },
  { label: 'Anulado', value: 'ANULADO' }
]);

const mostrarModal = ref(false);
const mostrarModalAceptar = ref(false);
const itemAceptar = ref(null);

const mostrarToast = (mensaje, tipo = 'success') => {
  toast.add({ severity: tipo, summary: tipo === 'success' ? 'Éxito' : (tipo === 'warn' ? 'Advertencia' : 'Error'), detail: mensaje, life: 3000 });
};

const formatearFechaParaEnvio = (dateObj) => {
  if (!dateObj) return '';
  return new Date(dateObj).toISOString().split('T')[0];
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  return new Date(fechaStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const cargarRegistros = async () => {
  const params = {
    buscar: busqueda.value || undefined,
    estado_reclamacion: filtroEstado.value || undefined,
    fecha_inicio: fechaInicio.value ? formatearFechaParaEnvio(fechaInicio.value) : undefined,
    fecha_fin: fechaFin.value ? formatearFechaParaEnvio(fechaFin.value) : undefined,
    pagina: paginacion.value.pagina_actual,
    per_page: paginacion.value.filas_por_pagina
  };
  await store.fetchCambios(params);
  paginacion.value.total = store.pagination.total;
};

const buscarRegistros = () => {
  paginacion.value.pagina_actual = 1;
  cargarRegistros();
};

const cambiarPagina = (e) => {
  paginacion.value.pagina_actual = e.page + 1;
  paginacion.value.filas_por_pagina = e.rows;
  cargarRegistros();
};

const limpiarFiltros = () => {
  busqueda.value = '';
  filtroEstado.value = null;
  fechaInicio.value = null;
  fechaFin.value = null;
  paginacion.value.pagina_actual = 1;
  cargarRegistros();
};

const abrirNuevo = () => { mostrarModal.value = true; };

const procesarAceptar = (item) => {
  itemAceptar.value = item;
  mostrarModalAceptar.value = true;
};

const procesarRechazar = (item) => {
  Swal.fire({
    title: '¿Rechazar Reclamación?',
    text: `Se declarará el cambio de "${item.producto?.nombre}" (${item.cantidad} uds) como pérdida definitiva asumida por el negocio.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#708090',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await store.rechazarCambio(item.id);
        mostrarToast(response.data.message);
        cargarRegistros();
      } catch (error) {
        console.error(error);
        mostrarToast(error.response?.data?.message || 'Error al rechazar la reclamación.', 'error');
      }
    }
  });
};

const procesarAnular = (item) => {
  Swal.fire({
    title: '¿Anular Registro?',
    text: `Se cancelará el cambio de "${item.producto?.nombre}" (${item.cantidad} uds) y se devolverán al stock.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff9900',
    cancelButtonColor: '#708090',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await store.anularCambio(item.id);
        mostrarToast(response.data.message);
        cargarRegistros();
      } catch (error) {
        console.error(error);
        mostrarToast(error.response?.data?.message || 'Error al anular el registro.', 'error');
      }
    }
  });
};

// Helpers de tabla (badges y efectos de stock)
const efectoStockHtml = (item) => {
  const estaResuelto = item.estado_reclamacion === 'ACEPTADO' || item.estado_reclamacion === 'ANULADO';
  const texto = estaResuelto ? `+${item.cantidad}` : `-${item.cantidad}`;
  const clase = estaResuelto ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200';
  const stock = item.producto?.stock ?? '—';
  return `<span class="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-black border ${clase}">${texto}</span> <span class="text-[10px] text-gray-400 ml-1">Stock: ${stock}</span>`;
};

const obtenerBadgeClase = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'ACEPTADO': return 'bg-green-100 text-green-800 border border-green-200';
    case 'RECHAZADO': return 'bg-red-100 text-red-800 border border-red-200';
    case 'ANULADO': return 'bg-gray-100 text-gray-800 border border-gray-200';
    default: return 'bg-blue-100 text-blue-800 border border-blue-200';
  }
};

const obtenerPuntoClase = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return 'bg-amber-500';
    case 'ACEPTADO': return 'bg-green-600';
    case 'RECHAZADO': return 'bg-red-600';
    case 'ANULADO': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
};

onMounted(() => cargarRegistros());
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #c6e5d3; border-radius: 10px; }
:deep(.p-paginator) { background: transparent; border: none; padding: 0; }
:deep(.p-paginator-page.p-highlight) { background: #0b580b !important; color: white !important; font-weight: bold; }
:deep(.custom-prime-calendar) { width: 100%; }
:deep(.custom-prime-calendar .p-inputtext) { border-radius: 12px; padding: 0.75rem; border: 1px solid #e2e8f0; font-weight: bold; font-size: 0.875rem; }
:deep(.custom-calendar-input .p-datepicker-trigger) { background: transparent; border: none; color: #64748b; position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); width: auto; height: auto; box-shadow: none; padding: 0; }
:deep(.custom-calendar-input .p-inputtext) { padding-right: 2.5rem; }
</style>
