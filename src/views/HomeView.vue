<template>
  <div class="p-3 sm:p-8 pb-24 bg-[#f4f7f6] font-dm-sans min-h-full space-y-6 sm:space-y-8">
    <!-- ENCABEZADO -->
    <div class="bg-shop-sidebar-bg text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-shop animate-fade-up">
      <div class="text-center sm:text-left">
        <h1 class="text-xl sm:text-2xl font-bold mb-1 italic">Buenos días 🌤️, <span class="not-italic">Administrador</span></h1>
        <p class="text-[10px] sm:text-xs text-shop-accent font-black uppercase tracking-[0.3em]">Tienda y Librería Israel · Panel de Control</p>
      </div>
      <div class="text-center sm:text-right">
        <span class="text-xs sm:text-sm font-jetbrains font-bold text-gray-300 block">{{ currentDate }}</span>
      </div>
    </div>
    <!-- ACCESOS RÁPIDOS -->
    <section>
      <h3 class="text-[10px] sm:text-[11px] font-black text-shop-green-deep uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
        <i class="pi pi-th-large text-shop-accent"></i> Accesos Rápidos
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <div v-for="(acceso, index) in quickAccess" :key="index" @click="irA(acceso.ruta)"
          class="bg-white border border-shop-border p-3 sm:p-4 rounded-shop text-center shadow-shop hover:border-shop-accent cursor-pointer transition-all duration-300 hover:-translate-y-1 group">
          <i :class="acceso.icon" class="text-xl sm:text-2xl block mb-2 text-shop-accent group-hover:scale-110 transition-transform"></i>
          <p class="text-[9px] sm:text-[10px] font-black text-shop-green-deep uppercase tracking-tighter group-hover:text-shop-accent">{{ acceso.label }}</p>
        </div>
      </div>
    </section>
    <!-- MÉTRICAS CLAVE -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div v-for="stat in mainStats" :key="stat.label" class="bg-white p-5 sm:p-6 rounded-2xl border border-shop-border shadow-shop flex items-center gap-4 sm:gap-5">
        <div :class="stat.bgIcon" class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <i :class="stat.icon" class="text-xl sm:text-2xl"></i>
        </div>
        <div>
          <p class="text-[9px] sm:text-[10px] font-black text-gray-800 uppercase tracking-widest">{{ stat.label }}</p>
          <h4 class="text-xl sm:text-2xl font-black text-shop-green-deep tracking-tighter">{{ stat.value }}</h4>
        </div>
      </div>
    </div>
    <!-- GRÁFICOS (Reportes Históricos) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      <div class="bg-white p-5 sm:p-8 rounded-3xl border border-shop-border shadow-shop">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 class="text-xs sm:text-sm font-black text-shop-green-deep uppercase tracking-widest">Tendencia de Ventas</h3>
          <select
            v-model="selectedPeriodo"
            @change="handlePeriodoChange"
            class="text-[10px] sm:text-[12px] font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none w-full sm:w-auto"
          >
            <option value="day">Por Día</option>
            <option value="month">Por Mes</option>
            <option value="year">Por Año</option>
          </select>
        </div>
        <div class="h-[250px] sm:h-[320px] w-full relative">
          <canvas id="salesChart"></canvas>
        </div>
      </div>
      <!-- Ganancias y Pérdidas -->
      <div class="bg-white p-5 sm:p-8 rounded-3xl border border-shop-border shadow-shop">
        <h3 class="text-xs sm:text-sm font-black text-shop-green-deep uppercase tracking-widest mb-6 text-left">Ganancias vs Pérdidas</h3>
        <div class="h-[250px] sm:h-[320px] w-full relative text-gray-800">
           <canvas id="profitPerdChart"></canvas>
        </div>
      </div>
      <!-- Top 5 Productos -->
      <div class="bg-white p-5 sm:p-8 rounded-3xl border border-shop-border shadow-shop">
        <h3 class="text-xs sm:text-sm font-black text-shop-green-deep uppercase tracking-widest mb-6 text-left">Top 5 Productos</h3>
        <div class="h-[250px] sm:h-[320px] w-full relative">
           <canvas id="topProductsChart"></canvas>
        </div>
      </div>
      <!-- Distribución de Métodos de Pago -->
      <div class="bg-white p-5 sm:p-8 rounded-3xl border border-shop-border shadow-shop">
        <h3 class="text-xs sm:text-sm font-black text-shop-green-deep uppercase tracking-widest mb-6 text-left">Métodos de Pago</h3>
        <div class="h-[250px] sm:h-[320px] w-full relative">
           <canvas id="paymentMethodsChart"></canvas>
        </div>
      </div>
    </div>
    <!-- ALERTAS CRÍTICAS (Vencimientos y Stock Mínimo) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      <!-- Alertas de Inventario -->
      <div class="lg:col-span-3 space-y-4">
        <h3 class="text-[10px] sm:text-[11px] font-black text-shop-red uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
          <i class="pi pi-bell text-shop-red animate-swing"></i> Alertas del Sistema
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Cuadro Único de Stock Crítico -->
          <div class="bg-red-50 border border-red-200 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6 border-b border-red-200 pb-4">
              <div class="flex items-center gap-3">
                <div class="bg-red-700 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <i class="pi pi-exclamation-triangle text-base sm:text-lg"></i>
                </div>
                <div>
                  <h5 class="text-xs sm:text-sm font-black text-red-900 uppercase tracking-[0.05em] leading-tight">Stock Bajo</h5>
                </div>
              </div>
              <button
                @click="irA('/compras')"
                class="text-[9px] sm:text-[10px] font-black text-gray-200 bg-shop-sidebar-bg px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl hover:bg-black transition-all shadow-md uppercase tracking-wider border border-white/10"
              >
                Abastecer
              </button>
            </div>
            <!-- Lista de productos -->
            <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <div
                v-for="prod in lowStockProducts"
                :key="prod.id"
                class="bg-white/90 border border-red-100 rounded-xl p-3 flex justify-between items-center transition-all shadow-sm"
              >
                <div class="text-left">
                  <p class="text-[12px] sm:text-[13px] font-bold text-gray-800 tracking-tight">{{ prod.nombre }}</p>
                  <span class="text-[9px] sm:text-[10px] font-black text-red-700 bg-red-100 px-1.5 py-0.5 rounded w-max uppercase">Mín: {{ prod.minimo }}</span>
                </div>
                <div class="text-right flex flex-col items-end">
                  <span class="text-[9px] font-black text-red-900 block mb-0.5 uppercase">Actual</span>
                  <span class="text-[12px] sm:text-[13px] font-bold text-red-600">{{ prod.stock }}</span>
                </div>
              </div>
              <div v-if="lowStockProducts.length === 0" class="py-10 text-center">
                <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
                <p class="text-xs text-green-800 font-black uppercase tracking-widest">Stock óptimo</p>
              </div>
            </div>
          </div>
          <!-- Cuadro de Vencimientos Próximos -->
          <div class="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6 border-b border-amber-200 pb-4">
              <div class="flex items-center gap-3">
                <div class="bg-amber-500 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <i class="pi pi-clock text-base sm:text-lg"></i>
                </div>
                <div>
                  <h5 class="text-xs sm:text-sm font-black text-amber-900 uppercase tracking-[0.05em] leading-tight">Vencimientos</h5>
                </div>
              </div>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar text-left">
              <div
                v-for="prod in expiringProducts"
                :key="prod.id"
                class="bg-white/90 border border-amber-100 rounded-xl p-3 flex justify-between items-center transition-all shadow-sm"
              >
                <div class="text-left">
                  <p class="text-[12px] sm:text-[13px] font-bold text-gray-800 tracking-tight">{{ prod.nombre }}</p>
                  <span class="text-[9px] sm:text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded w-max uppercase">Lote: {{ prod.lote }}</span>
                </div>
                <div class="text-right flex flex-col items-end">
                  <span class="text-[9px] font-black text-amber-900 block mb-0.5 uppercase">Vence</span>
                  <span class="text-[11px] sm:text-[12px] font-bold text-amber-600">{{ prod.fecha }}</span>
                </div>
              </div>
              <div v-if="expiringProducts.length === 0" class="py-10 text-center">
                <i class="pi pi-calendar-check text-4xl text-green-500 mb-2"></i>
                <p class="text-xs text-green-800 font-black uppercase tracking-widest">Sin vencimientos</p>
              </div>
            </div>
          </div>
          <!-- Pedidos a Proveedores -->
          <div class="bg-blue-50 border border-blue-200 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6 border-b border-blue-200 pb-4">
              <div class="flex items-center gap-3">
                <div class="bg-blue-600 text-white w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <i class="pi pi-truck text-base sm:text-lg"></i>
                </div>
                <div>
                  <h5 class="text-xs sm:text-sm font-black text-blue-900 uppercase tracking-[0.05em] leading-tight">Proveedores</h5>
                </div>
              </div>
            </div>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar text-left">
              <div v-for="order in providerVisits" :key="order.id"
                class="bg-white/90 border border-blue-100 rounded-xl p-3 flex justify-between items-center transition-all shadow-sm">
                <div class="text-left">
                  <p class="text-[12px] sm:text-[13px] font-bold text-gray-800 tracking-tight">{{ order.nombre }}</p>
                  <span class="text-[9px] sm:text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded w-max uppercase">En {{ order.dias }} días</span>
                </div>
                <div class="text-right flex flex-col items-end">
                    <span class="text-[8px] font-black text-blue-900 block mb-0.5 uppercase">Fecha</span>
                    <span class="text-[11px] sm:text-[12px] font-bold text-blue-600">{{ order.fecha }}</span>
                </div>
              </div>
              <div v-if="providerVisits.length === 0" class="py-10 text-center">
                <i class="pi pi-calendar text-4xl text-gray-300 mb-2"></i>
                <p class="text-xs text-gray-500 font-black uppercase tracking-widest">Sin visitas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed} from "vue";
import { useRouter } from "vue-router";
import { useDashboardStore } from '@/stores/dashboardStore';
import Chart from 'chart.js/auto';

const router = useRouter();
const dashboardStore = useDashboardStore();
const currentDate = ref(new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

const selectedPeriodo = ref('day');

// Referencias para las instancias de los gráficos
let salesChart = null;
let paymentMethodsChart = null;
let profitPerdChart = null;
let topProductsChart = null;

const quickAccess = ref([
  { label: "Ventas", icon: "pi pi-shopping-cart", ruta: "/punto-venta" },
  { label: "Créditos", icon: "pi pi-credit-card", ruta: "/creditos" },
  { label: "Productos", icon: "pi pi-box", ruta: "/productos" },
  { label: "Compras", icon: "pi pi-shopping-bag", ruta: "/compras" },
  { label: "Reportes", icon: "pi pi-chart-bar", ruta: "/reportes" },
  { label: "Cierre", icon: "pi pi-lock", ruta: "/cierre" },
  { label: "Usuarios", icon: "pi pi-users", ruta: "/usuarios" },
  { label: "Notas", icon: "pi pi-file-edit", ruta: "/notas", destacado: true}
]);

// Mapeo dinámico de las estadísticas superiores
const mainStats = computed(() => [
  {
    label: "Ventas del Día",
    value: `$${dashboardStore.stats.ventas_hoy || '0.00'}`,
    icon: "pi pi-money-bill",
    bgIcon: "bg-green-100 text-green-700"
  },
  {
    label: "Créditos Pendientes",
    value: `$${dashboardStore.stats.creditos_pendientes || '0.00'}`,
    icon: "pi pi-wallet",
    bgIcon: "bg-blue-100 text-blue-700"
  },
]);

// Alertas desde el store
const lowStockProducts = computed(() => dashboardStore.stats.stock_bajo || []);
const expiringProducts = computed(() => dashboardStore.stats.vencimientos || []);
const providerVisits = computed(() => dashboardStore.stats.proximas_visitas || []);

const irA = (ruta) => router.push(ruta);

const initCharts = () => {
  // 1. Tendencias de Ventas
  const salesCtx = document.getElementById('salesChart');
  if (salesChart) salesChart.destroy();
  salesChart = new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: dashboardStore.stats.tendencia.labels,
      datasets: [{
        label: 'Ventas',
        data: dashboardStore.stats.tendencia.data,
        borderColor: '#0a3622',
        backgroundColor: 'rgba(10, 54, 34, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 6,
        pointBackgroundColor: '#0a3622'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // 2. Métodos de Pago
  const paymentCtx = document.getElementById('paymentMethodsChart');
  if (paymentMethodsChart) paymentMethodsChart.destroy();

  const paymentLabels = Object.keys(dashboardStore.stats.metodos_pago || {});
  const paymentData = Object.values(dashboardStore.stats.metodos_pago || {});

  paymentMethodsChart = new Chart(paymentCtx, {
    type: 'pie',
    data: {
      labels: paymentLabels,
      datasets: [{
        data: paymentData,
        backgroundColor: ['#0a3622', '#529931', '#99bba7', '#76b852'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { font: { weight: 'bold' }, color: '#0a3622' } },
        tooltip: { callbacks: { label: (ctx) => ` Monto: $${ctx.raw.toFixed(2)}` } }
      },
      responsive: true,
      maintainAspectRatio: false,
    }
  });

  // 3. Ganancias vs Pérdidas
  const profitCtx = document.getElementById('profitPerdChart');
  if (profitPerdChart) profitPerdChart.destroy();
  profitPerdChart = new Chart(profitCtx, {
    type: 'bar',
    data: {
      labels: dashboardStore.stats.ganancias_perdidas.labels,
      datasets: [
        { label: 'Ganancias', data: dashboardStore.stats.ganancias_perdidas.ganancias, backgroundColor: '#0a3622', borderRadius: 6 },
        { label: 'Pérdidas', data: dashboardStore.stats.ganancias_perdidas.perdidas, backgroundColor: '#d32f2f', borderRadius: 6 }
      ]
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { weight: 'bold' } } } },
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.03)' } } }
    }
  });

  // 4. Top 5 Productos
  const topCtx = document.getElementById('topProductsChart');
  if (topProductsChart) topProductsChart.destroy();
  topProductsChart = new Chart(topCtx, {
    type: 'bar',
    data: {
      labels: dashboardStore.stats.top_productos.map(p => p.nombre),
      datasets: [{
        label: 'Unidades Vendidas',
        data: dashboardStore.stats.top_productos.map(p => p.total_vendido),
        backgroundColor: '#0a3622',
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { grid: { display: false } }, y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } } }
    }
  });
};

const handlePeriodoChange = async () => {
  await dashboardStore.fetchDashboardData(selectedPeriodo.value);
  initCharts();
};

onMounted(async () => {
  await dashboardStore.fetchDashboardData(selectedPeriodo.value);
  initCharts();
});
</script>

<style scoped>
@keyframes swing {
  0% { transform: rotate(0deg); }
  20% { transform: rotate(10deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(100deg); }
  100% { transform: rotate(0deg); }
}
.animate-swing {
  animation: swing 2s infinite;
}
</style>
