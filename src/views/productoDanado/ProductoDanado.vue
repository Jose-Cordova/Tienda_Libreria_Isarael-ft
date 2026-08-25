<template>
  <main class="flex-1 bg-[#f4f7f6] p-3 sm:p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">
    <!-- Encabezado -->
    <section class="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <!-- Fila Superior: Título y Botón Registrar -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3 w-full">
        <div class="flex items-center gap-3 text-left w-full sm:w-auto">
          <i class="pi pi-box text-xl text-green-600"></i>
          <h1 class="text-lg font-extrabold text-[#0a3622]">Registro de Productos Dañados</h1>
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
        <Dropdown
          v-model="filtroOrigen"
          :options="opcionesOrigen"
          optionLabel="label"
          optionValue="value"
          placeholder="Origen"
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
            v-if="fechaInicio || fechaFin || filtroEstado || filtroOrigen || busqueda"
            icon="pi pi-filter-slash"
            class="p-button-rounded p-button-text p-button-sm !text-red-900 !w-9 !h-9 shrink-0"
            @click="limpiarFiltros"
          />
        </div>
      </div>
    </section>

    <!-- Sumatorias -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group transition-all text-left border-[1px] border-[#d1333e] border-l-[10px] overflow-hidden">
        <div>
          <p class="text-[10px] font-black text-[#d1333e] uppercase tracking-[0.2em] mb-1">Sumatoria Pérdidas</p>
          <p class="text-2xl font-black text-[#d1333e] tracking-tighter">${{ totalPerdidas }}</p>
        </div>
      </div>
    </div>

    <!-- Tabla modular -->
    <DanadoTabla :registros="registros" @anular="procesarAnular" />

    <!-- Paginador -->
    <div class="p-3 border-t border-gray-400 bg-gray-50/50 mt-4 rounded-xl shadow-sm bg-white">
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

    <!-- Formulario Modal modular -->
    <DanadoModalForm v-model:visible="mostrarModal" @guardado="cargarRegistros" />
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
import { useProductoDaniadoStore } from '@/stores/productoDaniadoStore';
import DanadoTabla from './DanadoTabla.vue';
import DanadoModalForm from './DanadoModalForm.vue';

defineOptions({ name: 'ProductoDanadoView' });

const store = useProductoDaniadoStore();
const toast = useToast();

const registros = computed(() => store.registros);

const paginacion = ref({
  pagina_actual: 1,
  filas_por_pagina: 10,
  total: 0
});

const busqueda = ref('');
const filtroEstado = ref(null);
const filtroOrigen = ref(null);
const fechaInicio = ref(null);
const fechaFin = ref(null);

const opcionesEstado = ref([
  { label: 'Todos', value: null },
  { label: 'Registrado', value: 'REGISTRADO' },
  { label: 'Anulado', value: 'ANULADO' }
]);

const opcionesOrigen = ref([
  { label: 'Todos', value: null },
  { label: 'Daño Directo', value: 'DIRECTO' },
  { label: 'Vencimiento', value: 'VENCIMIENTO' },
  { label: 'Venta', value: 'VENTA' }
]);

const mostrarModal = ref(false);

const mostrarToast = (mensaje, tipo = 'success') => {
  toast.add({
    severity: tipo,
    summary: tipo === 'success' ? 'Éxito' : (tipo === 'warn' ? 'Advertencia' : 'Error'),
    detail: mensaje,
    life: 3000
  });
};

const cargarRegistros = async () => {
  const params = {
    buscar: busqueda.value || undefined,
    estado: filtroEstado.value || undefined,
    origen: filtroOrigen.value || undefined,
    fecha_inicio: fechaInicio.value ? formatearFechaParaEnvio(fechaInicio.value) : undefined,
    fecha_fin: fechaFin.value ? formatearFechaParaEnvio(fechaFin.value) : undefined,
    pagina: paginacion.value.pagina_actual,
    per_page: paginacion.value.filas_por_pagina
  };
  await store.fetchRegistros(params);
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
  filtroOrigen.value = null;
  fechaInicio.value = null;
  fechaFin.value = null;
  paginacion.value.pagina_actual = 1;
  cargarRegistros();
};

const totalPerdidas = computed(() => {
  return registros.value.reduce((sum, r) => sum + (parseFloat(r.cantidad) * parseFloat(r.costo_unitario)), 0).toFixed(2);
});

const abrirNuevo = () => {
  mostrarModal.value = true;
};

const procesarAnular = (item) => {
  Swal.fire({
    title: '¿Anular Registro?',
    text: `Se cancelará este registro de daño y se devolverán ${item.cantidad} unidades de "${item.producto?.nombre}" al stock.`,
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
        const response = await store.anularRegistro(item.id);
        mostrarToast(response.data.message);
        cargarRegistros();
      } catch (error) {
        console.error(error);
        mostrarToast(error.response?.data?.message || 'Error al anular el registro.', 'error');
      }
    }
  });
};

const formatearFechaParaEnvio = (dateObj) => {
  if (!dateObj) return '';
  const d = new Date(dateObj);
  return d.toISOString().split('T')[0];
};

onMounted(() => {
  cargarRegistros();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #c6e5d3; border-radius: 4px; }
</style>
