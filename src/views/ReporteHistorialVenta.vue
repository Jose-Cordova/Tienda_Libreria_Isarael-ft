<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto relative">

    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-green-50 rounded-lg text-[#0a3622]">
          <i class="pi pi-receipt text-xl"></i>
        </div>
        <div>
          <h1 class="text-lg font-extrabold text-[#0a3622] leading-tight">Reporte de Historial de Ventas</h1>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Tienda & Librería Israel</p>
        </div>
      </div>
      <button @click="generarPDF" :disabled="cargando"
        class="bg-[#0a3622] hover:bg-[#115033] text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 border-none cursor-pointer disabled:opacity-50">
        Generar PDF
      </button>
    </section>

    <section class="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo cliente</label>
        <select v-model="filtros.tipo_cliente" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-[#c6e5d3] cursor-pointer">
          <option value="">Todos</option>
          <option value="DETALLES">Detalle</option>
          <option value="MAYORISTA">Mayorista</option>
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

    <div v-if="error" class="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
      <i class="pi pi-exclamation-triangle text-lg"></i>
      <span>{{ error }}</span>
      <button @click="error = null" class="ml-auto text-red-400 hover:text-red-600 cursor-pointer border-none bg-transparent"><i class="pi pi-times"></i></button>
    </div>

    <section class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div class="bg-[#c6e5d3] px-6 py-4 border-b border-[#b5d9c5] flex items-center justify-between">
        <h3 class="text-[11px] font-black text-[#0a3622] uppercase tracking-widest">Detalle de Ventas</h3>
        <span class="text-[10px] font-black text-[#0a3622]/50">{{ ventas.length }} registros</span>
      </div>

      <div v-if="cargando" class="divide-y divide-gray-50">
        <div v-for="n in 5" :key="n" class="flex justify-between px-6 py-4 gap-4">
          <div class="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
          <div class="h-4 bg-gray-100 rounded w-32 animate-pulse"></div>
          <div class="h-4 bg-gray-100 rounded w-20 animate-pulse"></div>
          <div class="h-4 bg-gray-100 rounded w-16 animate-pulse"></div>
        </div>
      </div>

      <div v-else-if="ventas.length === 0" class="flex flex-col items-center justify-center py-12 px-6 gap-3">
        <div class="p-4 bg-amber-50 rounded-full"><i class="pi pi-inbox text-2xl text-amber-400"></i></div>
        <p class="text-sm font-black text-gray-500">Sin ventas registradas</p>
        <p class="text-[11px] text-gray-400 text-center">No se encontraron ventas {{ filtros.fecha_inicio || filtros.fecha_fin ? 'en el período seleccionado' : 'en el sistema' }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
              <th class="py-3 px-4 text-[#0a3622]/60">Fecha</th>
              <th class="py-3 px-4 text-[#0a3622]/60">Tipo</th>
              <th class="py-3 px-4 text-[#0a3622]/60">Método pago</th>
              <th class="py-3 px-4 text-right text-[#0a3622]/60">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-sm">
            <tr v-for="venta in ventasPaginadas" :key="venta.correlativo" class="hover:bg-gray-50 transition-colors">
              <td class="py-3 px-4 text-gray-500">{{ venta.fecha }}</td>
              <td class="py-3 px-4 text-gray-500">{{ venta.tipo_cliente }}</td>
              <td class="py-3 px-4 text-gray-500">{{ venta.metodo_pago }}</td>
              <td class="py-3 px-4 text-right font-black text-[#0a3622]">${{ Number(venta.total).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex items-center justify-between px-6 py-3 border-t border-gray-50">
          <span class="text-[10px] text-gray-400 font-bold">Pág. {{ pagina }} de {{ totalPaginas }}</span>
          <div class="flex gap-1">
            <button @click="pagina--" :disabled="pagina === 1"
              class="px-2 py-1 rounded text-xs font-black border border-gray-200 disabled:opacity-30 hover:bg-gray-50 cursor-pointer transition-all">‹</button>
            <button v-for="p in totalPaginas" :key="p" @click="pagina = p"
              class="px-2.5 py-1 rounded text-xs font-black border transition-all cursor-pointer"
              :class="p === pagina ? 'bg-[#0a3622] text-white border-[#0a3622]' : 'border-gray-200 hover:bg-gray-50'">{{ p }}</button>
            <button @click="pagina++" :disabled="pagina === totalPaginas"
              class="px-2 py-1 rounded text-xs font-black border border-gray-200 disabled:opacity-30 hover:bg-gray-50 cursor-pointer transition-all">›</button>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const ventas    = ref([]);
const cargando  = ref(false);
const error     = ref(null);
const pagina    = ref(1);
const porPagina = 10;

const filtros = ref({ tipo_cliente: '', fecha_inicio: '', fecha_fin: '' });

const totalPaginas    = computed(() => Math.max(1, Math.ceil(ventas.value.length / porPagina)));
const ventasPaginadas = computed(() => ventas.value.slice((pagina.value - 1) * porPagina, pagina.value * porPagina));

const cargarDatos = async () => {
  cargando.value = true;
  error.value    = null;
  pagina.value   = 1;
  try {
    const params = {};
    if (filtros.value.tipo_cliente) params.tipo_cliente = filtros.value.tipo_cliente;
    if (filtros.value.fecha_inicio) params.fecha_inicio = filtros.value.fecha_inicio;
    if (filtros.value.fecha_fin)    params.fecha_fin    = filtros.value.fecha_fin;

    const { data } = await api.get('/reportes/historial-datos', { params });
    ventas.value = data.ventas;
  } catch {
    error.value = 'No se pudo cargar el reporte. Verifica la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
};

const limpiarFiltros = () => {
  filtros.value = { tipo_cliente: '', fecha_inicio: '', fecha_fin: '' };
  cargarDatos();
};

const generarPDF = async () => {
  error.value = null;
  try {
    const params = {};
    if (filtros.value.tipo_cliente) params.tipo_cliente = filtros.value.tipo_cliente;
    if (filtros.value.fecha_inicio) params.fecha_inicio = filtros.value.fecha_inicio;
    if (filtros.value.fecha_fin)    params.fecha_fin    = filtros.value.fecha_fin;

    const response = await api.get('/reportes/historial', { params, responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch  {
    error.value = 'No se pudo generar el PDF.';
  }
};

onMounted(cargarDatos);
</script>
