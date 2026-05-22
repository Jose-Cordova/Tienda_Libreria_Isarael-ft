<template>
  <div class="flex-1 flex flex-col h-screen relative bg-[#f4f7f6] font-sans overflow-hidden">
    <main class="flex-1 overflow-y-auto p-8 pb-24">

      <div class="bg-[#092212] text-white rounded-2xl p-4 mb-5 flex justify-between items-center shadow-md">
        <div>
          <h1 class="text-2xl font-bold mb-1 font-serif">Buenos días 🌤️, Administrador</h1>
          <p class="text-sm text-gray-300">Tienda y Librería Israel</p>
        </div>
        <span class="text-sm font-semibold text-gray-300">{{ currentDate }}</span>
      </div>

      <section class="mb-8">
        <h3 class="text-sm font-bold text-green-700 uppercase tracking-widest mb-3">ACCESOS RÁPIDOS</h3>

        <div class="grid grid-cols-4 gap-3">
          <div
            v-for="(acceso, index) in quickAccess"
            :key="index"
            @click="irA(acceso.ruta)"
            class="bg-white border-[1.5px] border-[#c6e5d3] p-3 rounded-xl text-center shadow-sm hover:border-[#529931] cursor-pointer transition flex flex-col items-center justify-center gap-1"
          >
            <span class="text-3xl">{{ acceso.emoji }}</span>
            <p class="text-sm font-extrabold text-green-900">{{ acceso.label }}</p>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-sm font-bold text-green-700 uppercase tracking-widest mb-3">RESUMEN DEL DÍA</h3>
        <div class="grid grid-cols-3 gap-3">
          <div v-for="resumen in dailySummary" :key="resumen.label" class="bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-center flex flex-col items-center justify-center">
            <div class="w-11 h-11 bg-gray-50 rounded-lg flex items-center justify-center mb-1">
              <span class="text-2xl">{{ resumen.emoji }}</span>
            </div>
            <p class="text-2xl font-extrabold text-[#0a3622] mb-0.5">{{ resumen.value }}</p>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">{{ resumen.label }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ resumen.subtitle }}</p>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <div class="bg-[#e8f5e9] border border-[#a5d6a7] rounded-lg p-4 flex items-center gap-3 shadow-sm">
          <div class="bg-green-600 rounded-sm w-6 h-6 flex items-center justify-center text-white">
            <i class="pi pi-check text-xs font-bold"></i>
          </div>
          <p class="text-base text-green-800 font-bold">
            Todo en orden - sin alertas por el momento
          </p>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-6">

        <div class="bg-white border border-green-200 p-6 rounded-2xl shadow-sm">
          <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <div class="flex items-center gap-2 text-[#0a3622]">
              <i class="pi pi-chart-line text-2xl"></i>
              <h3 class="text-lg font-bold">Productos Más Vendidos</h3>
            </div>
            <a @click.prevent="irA('/productos')" class="text-green-700 text-base font-bold flex items-center gap-2 hover:underline cursor-pointer">
              Ver todo <i class="pi pi-arrow-right text-sm"></i>
            </a>
          </div>

          <ul class="space-y-0">
            <li v-for="producto in topProducts" :key="producto.id" class="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-orange-50 text-orange-500 border border-orange-100 rounded-md flex items-center justify-center">
                  <i :class="producto.icon" class="text-xl"></i>
                </div>
                <div>
                  <p class="text-base font-bold text-[#0a3622] truncate w-48" :title="producto.name">{{ producto.name }}</p>
                  <p class="text-sm text-gray-500">{{ producto.sales }} unidades</p>
                </div>
              </div>
              <span class="text-lg font-extrabold text-orange-500">{{ producto.revenue }}</span>
            </li>
          </ul>
        </div>

        <div class="bg-white border border-green-200 p-6 rounded-2xl shadow-sm">
          <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
            <div class="flex items-center gap-2 text-[#0a3622]">
              <i class="pi pi-credit-card text-2xl"></i>
              <h3 class="text-lg font-bold">Créditos Pendientes</h3>
            </div>
            <a @click.prevent="irA('/creditos')" class="text-green-700 text-base font-bold flex items-center gap-2 hover:underline cursor-pointer">
              Ver todo <i class="pi pi-arrow-right text-sm"></i>
            </a>
          </div>

          <ul class="space-y-0">
            <li v-for="credito in pendingCredits" :key="credito.id" class="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 bg-red-500 rounded-full flex items-center justify-center text-white text-base font-bold border-2 border-white shadow-sm">
                  {{ credito.initials }}
                </div>
                <div>
                  <p class="text-base font-bold text-[#0a3622]">{{ credito.name }}</p>
                  <p class="text-sm text-gray-500">{{ credito.number }}</p>
                </div>
              </div>
              <span class="text-lg font-extrabold text-red-500">{{ credito.amount }}</span>
            </li>
          </ul>
        </div>

      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

//FECHA ESTÁTICA//
const currentDate = ref('Viernes, 8 de mayo 2026');

const quickAccess = ref([
  { label: 'Nueva Venta', emoji: '🛒', ruta: '/punto-venta' },
  { label: 'Créditos', emoji: '💳', ruta: '/creditos' },
  { label: 'Productos', emoji: '📦', ruta: '/productos' },
  { label: 'Compras', emoji: '🛍️', ruta: '/compras' },
  { label: 'Reportes', emoji: '📊', ruta: '/reportes' },
  { label: 'Cierre Diario', emoji: '🧾', ruta: '/cierre-diario' },
  { label: 'Notas', emoji: '📝', ruta: '/notas' },
]);

const irA = (ruta) => {
  router.push(ruta);
};

const dailySummary = ref([
  { label: 'Ventas Hoy', value: '$0.00', emoji: '💰', subtitle: '0 transacciones' },
  { label: 'Deudas Pendientes', value: '$0.00', emoji: '💳', subtitle: '3 créditos activos' },
  { label: 'Productos', value: '8', emoji: '📦', subtitle: '8 activos' },
]);

// Productos más vendidos //
const topProducts = ref([
  { id: 1, name: 'Coca Cola 500ml', icon: 'pi pi-verified', sales: 12, revenue: '$15.00' },
  { id: 2, name: 'Churro Diana', icon: 'pi pi-verified', sales: 8, revenue: '$2.00' },
  { id: 3, name: 'Agua Pura 500ml', icon: 'pi pi-verified', sales: 5, revenue: '$2.50' }
]);

const pendingCredits = ref([
  { id: 1, initials: 'MA', name: 'María López', number: '7018-5432', amount: '$6.25' },
  { id: 2, initials: 'AG', name: 'Ana González', number: '2356-9865', amount: '$6.25' }
]);
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #529931;
  border-radius: 6px;
}
::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
