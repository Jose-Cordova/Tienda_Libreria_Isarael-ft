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

      <!-- Tarjetas Resumen KPI -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl shrink-0">
            <i class="pi pi-dollar"></i>
          </div>
          <div class="text-left">
            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pérdida Total</p>
            <h4 class="text-lg font-extrabold text-gray-800">${{ kpis.totalPerdida.toFixed(2) }}</h4>
          </div>
        </div>

        <div class="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl shrink-0">
            <i class="pi pi-box"></i>
          </div>
          <div class="text-left">
            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Piezas Perdidas</p>
            <h4 class="text-lg font-extrabold text-gray-800">{{ kpis.piezasPerdidas }} uds.</h4>
          </div>
        </div>

        <div class="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
            <i class="pi pi-briefcase"></i>
          </div>
          <div class="text-left">
            <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rechazos Proveedor</p>
            <h4 class="text-lg font-extrabold text-gray-800">{{ kpis.rechazosProveedor }} reg.</h4>
          </div>
        </div>
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

    <!-- Tabla modular -->
    <DanadoTabla :registros="registros" @anular="procesarAnular" @verResumen="verResumen" />

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

    <!-- Modal Resumen del Producto Dañado -->
    <Teleport to="body">
      <div v-if="mostrarResumen && itemResumen" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[200] backdrop-blur-sm p-4 font-dm-sans">
        <div class="bg-white rounded-[24px] w-[95vw] max-w-xl shadow-2xl relative overflow-hidden border border-gray-100 animate-fade-up">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
          <button @click="cerrarResumen" class="absolute top-5 right-6 text-gray-400 hover:text-gray-700 transition z-10">
            <i class="pi pi-times text-lg"></i>
          </button>

          <div class="p-8 pt-10 text-left">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <i class="pi pi-eye text-lg"></i>
              </div>
              <div>
                <h2 class="text-lg font-extrabold text-[#0a3622]">Resumen de Producto Dañado</h2>
                <p class="text-[12px] text-gray-400 font-medium">Detalle del registro de salida por avería</p>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Producto -->
              <div class="flex justify-between items-start border-b border-gray-100 pb-3">
                <span class="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Producto</span>
                <div class="text-right">
                  <p class="text-sm font-extrabold text-gray-800">{{ itemResumen.producto?.nombre }}</p>
                  <p class="text-[11px] text-gray-400">{{ itemResumen.producto?.marca?.nombre || 'Sin marca' }}</p>
                </div>
              </div>

              <!-- Origen -->
              <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                <span class="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Origen del Daño</span>
                <span class="text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-orange-100 text-orange-800">
                  {{ formatOrigen(itemResumen.origen) }}
                </span>
              </div>

              <!-- Lote (si perecedero) -->
              <div v-if="itemResumen.lote" class="flex justify-between items-center border-b border-gray-100 pb-3">
                <span class="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Lote</span>
                <span class="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {{ itemResumen.lote?.codigo_lote }}
                </span>
              </div>

              <!-- Cantidad y Costo -->
              <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                <span class="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Cantidad / Costo Unit.</span>
                <span class="text-sm font-extrabold text-gray-800">{{ itemResumen.cantidad }} uds. × ${{ parseFloat(itemResumen.costo_unitario || 0).toFixed(2) }}</span>
              </div>

              <!-- Total Pérdida -->
              <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                <span class="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Total Pérdida</span>
                <span class="text-sm font-extrabold text-red-600">${{ parseFloat(itemResumen.total_perdida || 0).toFixed(2) }}</span>
              </div>

              <!-- Fecha -->
              <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                <span class="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Fecha de Salida</span>
                <span class="text-sm font-bold text-gray-600">{{ formatearFecha(itemResumen.fecha) }}</span>
              </div>

              <!-- Motivo / Descripción -->
              <div class="flex justify-between items-start border-b border-gray-100 pb-3">
                <span class="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Motivo / Descripción</span>
                <p class="text-xs font-bold text-gray-700 max-w-xs text-right">{{ itemResumen.descripcion || 'Sin descripción' }}</p>
              </div>

              <!-- Estado -->
              <div class="flex justify-between items-center">
                <span class="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Estado</span>
                <span class="text-[11px] font-extrabold px-3 py-1 rounded-full uppercase bg-gray-100 text-gray-800 border">
                  {{ itemResumen.estado }}
                </span>
              </div>
            </div>

            <button @click="cerrarResumen" class="w-full mt-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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

const kpis = computed(() => {
  const lista = registros.value || [];
  let totalPerdida = 0;
  let piezasPerdidas = 0;
  let rechazosProveedor = 0;

  lista.forEach(item => {
    if (item.estado !== 'ANULADO') {
      totalPerdida += parseFloat(item.total_perdida || 0);
      piezasPerdidas += parseInt(item.cantidad || 0);
    }
    if (item.origen === 'PROVEEDOR') rechazosProveedor++;
  });

  return {
    totalPerdida,
    piezasPerdidas,
    rechazosProveedor
  };
});

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
  { label: 'Rechazo Proveedor', value: 'PROVEEDOR' },
  { label: 'Devolución Venta', value: 'VENTA' }
]);

const mostrarModal = ref(false);
const mostrarResumen = ref(false);
const itemResumen = ref(null);

const verResumen = (item) => {
  itemResumen.value = item;
  mostrarResumen.value = true;
};

const cerrarResumen = () => {
  mostrarResumen.value = false;
  itemResumen.value = null;
};

const formatOrigen = (origen) => {
  switch (origen) {
    case 'DIRECTO': return 'Daño Directo';
    case 'PROVEEDOR': return 'Rechazo Proveedor';
    case 'VENTA': return 'Devolución Venta';
    default: return origen || 'Directo';
  }
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  return new Date(fechaStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

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
.animate-fade-up { animation: fadeUp 0.25s ease-out forwards; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
