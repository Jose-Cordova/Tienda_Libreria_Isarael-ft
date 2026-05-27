<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto relative">

    <!-- Header -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-green-50 rounded-lg text-[#0a3622]">
          <i class="pi pi-chart-line text-xl"></i>
        </div>
        <div>
          <h1 class="text-lg font-extrabold text-[#0a3622] leading-tight">Reporte General</h1>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Tienda & Librería Israel</p>
        </div>
      </div>
      <button
        @click="descargarPDF"
        class="bg-[#0a3622] hover:bg-[#115033] text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 border-none cursor-pointer"
      >
        <i class="pi pi-file-pdf mr-1"></i> Generar PDF
      </button>
    </section>

    <!-- Filtros de fecha -->
    <section class="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desde</label>
        <input type="date" v-model="fechaInicio"
          class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-[#c6e5d3] cursor-pointer" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hasta</label>
        <input type="date" v-model="fechaFin" :min="fechaInicio"
          class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-[#c6e5d3] cursor-pointer" />
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
      <button @click="error = null" class="ml-auto text-red-400 hover:text-red-600 cursor-pointer border-none bg-transparent">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- Tablas -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- Tabla Ventas -->
      <section class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div class="bg-[#c6e5d3] px-6 py-4 border-b border-[#b5d9c5] flex items-center justify-between">
          <h3 class="text-[11px] font-black text-[#0a3622] uppercase tracking-widest">Últimas Ventas</h3>
          <span class="text-[10px] font-black text-[#0a3622]/50">{{ ventas.length }} registros</span>
        </div>

        <!-- Skeleton -->
        <div v-if="cargando" class="divide-y divide-gray-50">
          <div v-for="n in 4" :key="n" class="flex justify-between px-6 py-4">
            <div class="h-4 bg-gray-100 rounded w-32 animate-pulse"></div>
            <div class="h-4 bg-gray-100 rounded w-16 animate-pulse"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="ventas.length === 0" class="flex flex-col items-center justify-center py-12 px-6 gap-3">
          <div class="p-4 bg-amber-50 rounded-full">
            <i class="pi pi-inbox text-2xl text-amber-400"></i>
          </div>
          <p class="text-sm font-black text-gray-500">Sin ventas registradas</p>
          <p class="text-[11px] text-gray-400 text-center">
            No se encontraron ventas {{ fechaInicio || fechaFin ? 'en el período seleccionado' : 'en el sistema' }}
          </p>
        </div>

        <!-- Tabla -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50">
                <th class="py-3 px-6 text-[#0a3622]/60">Detalle</th>
                <th class="py-3 px-6 text-right text-[#0a3622]/60">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm">
              <tr v-for="venta in ventasPaginadas" :key="venta.correlativo" class="hover:bg-gray-50 transition-colors">
                <td class="py-3 px-6 font-bold text-[#0a3622]">{{ venta.cliente }}</td>
                <td class="py-3 px-6 text-right font-black text-[#0a3622]">${{ Number(venta.total).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <!-- Paginación -->
          <div class="flex items-center justify-between px-6 py-3 border-t border-gray-50">
            <span class="text-[10px] text-gray-400 font-bold">Pág. {{ paginaVentas }} de {{ totalPaginasVentas }}</span>
            <div class="flex gap-1">
              <button @click="paginaVentas--" :disabled="paginaVentas === 1"
                class="px-2 py-1 rounded text-xs font-black border border-gray-200 disabled:opacity-30 hover:bg-gray-50 cursor-pointer transition-all">‹</button>
              <button v-for="p in totalPaginasVentas" :key="p" @click="paginaVentas = p"
                class="px-2.5 py-1 rounded text-xs font-black border transition-all cursor-pointer"
                :class="p === paginaVentas ? 'bg-[#0a3622] text-white border-[#0a3622]' : 'border-gray-200 hover:bg-gray-50'">
                {{ p }}
              </button>
              <button @click="paginaVentas++" :disabled="paginaVentas === totalPaginasVentas"
                class="px-2 py-1 rounded text-xs font-black border border-gray-200 disabled:opacity-30 hover:bg-gray-50 cursor-pointer transition-all">›</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabla Compras -->
      <section class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div class="bg-[#c6e5d3] px-6 py-4 border-b border-[#b5d9c5] flex items-center justify-between">
          <h3 class="text-[11px] font-black text-[#0a3622] uppercase tracking-widest">Compras a Proveedores</h3>
          <span class="text-[10px] font-black text-[#0a3622]/50">{{ compras.length }} registros</span>
        </div>

        <!-- Skeleton -->
        <div v-if="cargando" class="divide-y divide-gray-50">
          <div v-for="n in 4" :key="n" class="flex justify-between px-6 py-4">
            <div class="h-4 bg-gray-100 rounded w-32 animate-pulse"></div>
            <div class="h-4 bg-gray-100 rounded w-16 animate-pulse"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="compras.length === 0" class="flex flex-col items-center justify-center py-12 px-6 gap-3">
          <div class="p-4 bg-slate-50 rounded-full">
            <i class="pi pi-shopping-cart text-2xl text-slate-400"></i>
          </div>
          <p class="text-sm font-black text-gray-500">Sin compras registradas</p>
          <p class="text-[11px] text-gray-400 text-center">
            No se encontraron compras {{ fechaInicio || fechaFin ? 'en el período seleccionado' : 'en el sistema' }}
          </p>
        </div>

        <!-- Tabla -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50">
                <th class="py-3 px-6 text-[#0a3622]/60">Proveedor</th>
                <th class="py-3 px-6 text-right text-[#0a3622]/60">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm">
              <tr v-for="(compra, index) in comprasPaginadas" :key="index" class="hover:bg-gray-50 transition-colors">
                <td class="py-3 px-6 font-bold text-[#0a3622]">{{ compra.proveedor }}</td>
                <td class="py-3 px-6 text-right font-black text-red-600">-${{ Number(compra.total).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <!-- Paginación -->
          <div class="flex items-center justify-between px-6 py-3 border-t border-gray-50">
            <span class="text-[10px] text-gray-400 font-bold">Pág. {{ paginaCompras }} de {{ totalPaginasCompras }}</span>
            <div class="flex gap-1">
              <button @click="paginaCompras--" :disabled="paginaCompras === 1"
                class="px-2 py-1 rounded text-xs font-black border border-gray-200 disabled:opacity-30 hover:bg-gray-50 cursor-pointer transition-all">‹</button>
              <button v-for="p in totalPaginasCompras" :key="p" @click="paginaCompras = p"
                class="px-2.5 py-1 rounded text-xs font-black border transition-all cursor-pointer"
                :class="p === paginaCompras ? 'bg-[#0a3622] text-white border-[#0a3622]' : 'border-gray-200 hover:bg-gray-50'">
                {{ p }}
              </button>
              <button @click="paginaCompras++" :disabled="paginaCompras === totalPaginasCompras"
                class="px-2 py-1 rounded text-xs font-black border border-gray-200 disabled:opacity-30 hover:bg-gray-50 cursor-pointer transition-all">›</button>
            </div>
          </div>
        </div>
      </section>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const ventas        = ref([]);
const compras       = ref([]);
const cargando      = ref(false);
const error         = ref(null);
const fechaInicio   = ref('');
const fechaFin      = ref('');

const porPagina         = 5;
const paginaVentas      = ref(1);
const paginaCompras     = ref(1);

const totalPaginasVentas  = computed(() => Math.max(1, Math.ceil(ventas.value.length / porPagina)));
const totalPaginasCompras = computed(() => Math.max(1, Math.ceil(compras.value.length / porPagina)));

const ventasPaginadas = computed(() => {
  const inicio = (paginaVentas.value - 1) * porPagina;
  return ventas.value.slice(inicio, inicio + porPagina);
});

const comprasPaginadas = computed(() => {
  const inicio = (paginaCompras.value - 1) * porPagina;
  return compras.value.slice(inicio, inicio + porPagina);
});

async function cargarDatos() {
  cargando.value      = true;
  error.value         = null;
  paginaVentas.value  = 1;
  paginaCompras.value = 1;

  try {
    const params = {};
    if (fechaInicio.value) params.fecha_inicio = fechaInicio.value;
    if (fechaFin.value)    params.fecha_fin    = fechaFin.value;

    const { data } = await axios.get(`${API_BASE}/reportes/resumen`, { params });
    ventas.value  = data.ventas;
    compras.value = data.compras;
  } catch (e) {
    error.value = 'No se pudo cargar el reporte. Verifica la conexión con el servidor.';
    console.error(e);
  } finally {
    cargando.value = false;
  }
}

function limpiarFiltros() {
  fechaInicio.value = '';
  fechaFin.value    = '';
  cargarDatos();
}

const descargarPDF = () => {
  const params = new URLSearchParams();
  if (fechaInicio.value) params.append('fecha_inicio', fechaInicio.value);
  if (fechaFin.value)    params.append('fecha_fin',    fechaFin.value);
  const query = params.toString() ? `?${params.toString()}` : '';
  window.open(`${API_BASE}/reportes/general${query}`, '_blank');
};

onMounted(cargarDatos);
</script>
