<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto relative">

    <!-- Header -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-green-50 rounded-lg text-[#0a3622]">
          <i class="pi pi-wallet text-xl"></i>
        </div>
        <div>
          <h1 class="text-lg font-extrabold text-[#0a3622] leading-tight">Reporte de Créditos / Fiados</h1>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Tienda & Librería Israel</p>
        </div>
      </div>
      <button @click="generarPDF" :disabled="cargando"
        class="bg-[#0a3622] hover:bg-[#115033] text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 border-none cursor-pointer disabled:opacity-50">
        Generar PDF
      </button>
    </section>

    <!-- Filtros -->
    <section class="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</label>
        <select v-model="filtros.estado" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-[#c6e5d3] cursor-pointer">
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADO">Pagado</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desde</label>
        <input type="date" v-model="filtros.fecha_inicio" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-[#c6e5d3] cursor-pointer" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hasta</label>
        <input type="date" v-model="filtros.fecha_fin" :min="filtros.fecha_inicio" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-[#c6e5d3] cursor-pointer" />
      </div>
      <button @click="cargarDatos" :disabled="cargando"
        class="bg-[#0a3622] hover:bg-[#115033] text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer">
        {{ cargando ? 'Buscando...' : 'Filtrar' }}
      </button>
      <button @click="limpiarFiltros"
        class="border border-gray-200 text-gray-500 hover:bg-gray-50 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer">
        Limpiar
      </button>
    </section>

    <!-- Error -->
    <div v-if="error" class="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
      <i class="pi pi-exclamation-triangle text-lg"></i>
      <span>{{ error }}</span>
      <button @click="error = null" class="ml-auto text-red-400 hover:text-red-600 cursor-pointer border-none bg-transparent"><i class="pi pi-times"></i></button>
    </div>

    <!-- Tabla -->
    <section class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div class="bg-[#c6e5d3] px-6 py-4 border-b border-[#b5d9c5] flex items-center justify-between">
        <h3 class="text-[11px] font-black text-[#0a3622] uppercase tracking-widest">Clientes con Saldo Pendiente</h3>
        <span class="text-[10px] font-black text-[#0a3622]/50">{{ deudores.length }} registros</span>
      </div>

      <div v-if="cargando" class="divide-y divide-gray-50">
        <div v-for="n in 4" :key="n" class="flex justify-between px-6 py-4 gap-4">
          <div class="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
        </div>
      </div>

      <div v-else-if="deudores.length === 0" class="flex flex-col items-center justify-center py-12 px-6 gap-3">
        <div class="p-4 bg-green-50 rounded-full"><i class="pi pi-check-circle text-2xl text-green-400"></i></div>
        <p class="text-sm font-black text-gray-500">Sin deudas pendientes</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
              <th class="py-3 px-4 text-[#0a3622]/60">Cliente</th>
              <th class="py-3 px-4 text-right text-[#0a3622]/60">Total deuda</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-sm">
            <tr v-for="deudor in deudores" :key="deudor.id" class="hover:bg-gray-50 transition-colors">
              <td class="py-3 px-4 font-black text-[#0a3622]">{{ deudor.nombre }}</td>
              <td class="py-3 px-4 text-right font-black text-amber-600">${{ Number(deudor.saldo_pendiente).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="border-t-2 border-[#0a3622] bg-[#e8f5ee]">
          <div class="flex justify-between px-6 py-3 text-sm font-black text-[#0a3622]">
            <span>Total pendiente por cobrar</span>
            <span>${{ totalPendiente }}</span>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const deudores = ref([]);
const cargando = ref(false);
const error    = ref(null);
const filtros  = ref({ estado: '', fecha_inicio: '', fecha_fin: '' });

const totalPendiente = computed(() =>
  deudores.value.reduce((s, d) => s + Number(d.saldo_pendiente), 0).toFixed(2)
);

const cargarDatos = async () => {
  cargando.value = true;
  error.value    = null;
  try {
    const params = {};
    if (filtros.value.estado)       params.estado       = filtros.value.estado;
    if (filtros.value.fecha_inicio) params.fecha_inicio = filtros.value.fecha_inicio;
    if (filtros.value.fecha_fin)    params.fecha_fin    = filtros.value.fecha_fin;

    const { data } = await api.get('/reportes/creditos-datos', { params });
    deudores.value = data.deudores;
  } catch {
    error.value = 'No se pudo cargar el reporte.';
  } finally {
    cargando.value = false;
  }
};

const limpiarFiltros = () => {
  filtros.value = { estado: '', fecha_inicio: '', fecha_fin: '' };
  cargarDatos();
};

const generarPDF = async () => {
  try {
    const params = {};
    if (filtros.value.estado)       params.estado       = filtros.value.estado;
    if (filtros.value.fecha_inicio) params.fecha_inicio = filtros.value.fecha_inicio;
    if (filtros.value.fecha_fin)    params.fecha_fin    = filtros.value.fecha_fin;

    const response = await api.get('/reportes/creditos', { params, responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch {
    error.value = 'No se pudo generar el PDF.';
  }
};

onMounted(cargarDatos);
</script>
