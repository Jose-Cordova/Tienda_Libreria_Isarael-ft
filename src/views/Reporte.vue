<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto relative scrollbar-thin scrollbar-thumb-[#c6e5d3] scrollbar-track-transparent">

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
        class="bg-[#0a3622] hover:bg-[#115033] text-white px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 border-none cursor-pointer text-sm font-black uppercase tracking-wider"
      >
        Generar Reporte
      </button>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-[6px] border-l-green-600">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Efectivo en Caja</p>
        <h2 class="text-2xl font-black text-[#0a3622]">${{ ingresosCaja.toFixed(2) }}</h2>
        <span class="inline-block mt-3 px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-black rounded-md uppercase">Cobrado</span>
      </div>

      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-[6px] border-l-amber-500">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Fiado</p>
        <h2 class="text-2xl font-black text-[#0a3622]">${{ fiadoTotal.toFixed(2) }}</h2>
        <span class="inline-block mt-3 px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-black rounded-md uppercase">Pendiente</span>
      </div>

      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-[6px] border-l-slate-400">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Compras</p>
        <h2 class="text-2xl font-black text-[#0a3622]">${{ totalCompras.toFixed(2) }}</h2>
        <span class="inline-block mt-3 px-2 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-black rounded-md uppercase">Egresos</span>
      </div>

      <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-l-[6px] border-l-red-600">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pérdida Neta</p>
        <h2 class="text-2xl font-black text-red-700">${{ Math.abs(balanceNeto).toFixed(2) }}</h2>
        <span class="inline-block mt-3 px-2 py-0.5 bg-red-50 text-red-700 text-[9px] font-black rounded-md uppercase">Diferencia</span>
      </div>
    </section>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <section class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div class="bg-[#c6e5d3] px-6 py-4 border-b border-[#b5d9c5]">
           <h3 class="text-[11px] font-black text-[#0a3622] uppercase tracking-widest">Últimas Ventas</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50">
                <th class="py-4 px-6 text-[#0a3622]/60">Detalle</th>
                <th class="py-4 px-6 text-right text-[#0a3622]/60">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm">
              <tr v-for="venta in ventas" :key="venta.id" class="hover:bg-gray-50 transition-colors">
                <td class="py-4 px-6 font-bold text-[#0a3622]">{{ venta.cliente }}</td>
                <td class="py-4 px-6 text-right font-black text-[#0a3622] text-sm">${{ venta.total.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div class="bg-[#c6e5d3] px-6 py-4 border-b border-[#b5d9c5]">
           <h3 class="text-[11px] font-black text-[#0a3622] uppercase tracking-widest">Compras a Proveedores</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50">
                <th class="py-4 px-6 text-[#0a3622]/60">Proveedor</th>
                <th class="py-4 px-6 text-right text-[#0a3622]/60">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm">
              <tr v-for="(compra, index) in compras" :key="index" class="hover:bg-gray-50 transition-colors">
                <td class="py-4 px-6 font-bold text-[#0a3622]">{{ compra.proveedor }}</td>
                <td class="py-4 px-6 text-right font-black text-red-600 text-sm">-${{ compra.total.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

  </main>
</template>

<script setup>
import { ref } from 'vue';

const ingresosCaja = ref(75.00);
const fiadoTotal = ref(50.00);
const totalCompras = ref(150.00);
const balanceNeto = ref(75.00 - 150.00);

const ventas = ref([
  { id: 1002, cliente: 'Jose Zamora', total: 50.00 },
  { id: 1001, cliente: 'Consumidor final', total: 75.00 }
]);

const compras = ref([
  { proveedor: 'Distribuidora El Sol', total: 100.00 },
  { proveedor: 'Papelería Central', total: 50.00 }
]);

const descargarPDF = () => {
  window.open('http://localhost:8000/api/reportes/general', '_blank');
};
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { width: 6px; }
.scrollbar-thumb-[#c6e5d3]::-webkit-scrollbar-thumb { background-color: #c6e5d3; border-radius: 20px; }
</style>
