<template>
  <div class="p-8 pb-24 bg-[#f4f7f6] font-dm-sans min-h-full space-y-8">

    <!-- ENCABEZADO -->
    <div class="bg-shop-sidebar-bg text-white rounded-2xl p-6 flex justify-between items-center shadow-shop animate-fade-up">
      <div>
        <h1 class="text-2xl font-bold mb-1 italic">Buenos días 🌤️, <span class="not-italic">Administrador</span></h1>
        <p class="text-xs text-shop-accent font-black uppercase tracking-[0.3em]">Tienda y Librería Israel · Panel de Control</p>
      </div>
      <div class="text-right">
        <span class="text-1xl font-jetbrains font-bold text-gray-300 block">{{ currentDate }}</span>
      </div>
    </div>

    <!-- ACCESOS RÁPIDOS -->
    <section>
      <h3 class="text-[11px] font-black text-shop-green-deep uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
        <i class="pi pi-th-large text-shop-accent"></i> Accesos Rápidos
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div v-for="(acceso, index) in quickAccess" :key="index" @click="irA(acceso.ruta)"
          class="bg-white border border-shop-border p-4 rounded-shop text-center shadow-shop hover:border-shop-accent cursor-pointer transition-all duration-300 hover:-translate-y-1 group">
          <i :class="acceso.icon" class="text-2xl block mb-2 text-shop-accent group-hover:scale-110 transition-transform"></i>
          <p class="text-[10px] font-black text-shop-green-deep uppercase tracking-tighter group-hover:text-shop-accent">{{ acceso.label }}</p>
        </div>
      </div>
    </section>

    <!-- MÉTRICAS CLAVE (Cierre de Caja) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="stat in mainStats" :key="stat.label" class="bg-white p-6 rounded-2xl border border-shop-border shadow-shop flex items-center gap-5">
        <div :class="stat.bgIcon" class="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm">
          <i :class="stat.icon" class="text-2xl"></i>
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-800 uppercase tracking-widest">{{ stat.label }}</p>
          <h4 class="text-2xl font-black text-shop-green-deep tracking-tighter">{{ stat.value }}</h4>
        </div>
      </div>
    </div>

    <!-- GRÁFICOS (Reportes Históricos) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Tendencias de Ventas -->
      <div class="bg-white p-8 rounded-3xl border border-shop-border shadow-shop">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-sm font-black text-shop-green-deep uppercase tracking-widest">Tendencia de Ventas</h3>
          <select class="text-[12px] font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none">
            <option>Por Día</option>
            <option>Por Mes</option>
            <option>Por Año</option>
          </select>
        </div>
        <div class="h-[320px] w-full relative">
          <canvas id="salesChart"></canvas>
        </div>
      </div>

      <!-- Ganancias y Pérdidas -->
      <div class="bg-white p-8 rounded-3xl border border-shop-border shadow-shop">
        <h3 class="text-sm font-black text-shop-green-deep uppercase tracking-widest mb-6">Ganancias vs Pérdidas</h3>
        <div class="h-[320px] w-full relative text-gray-800">
           <canvas id="profitPerdChart"></canvas>
        </div>
      </div>

      <!-- Top 5 Productos -->
      <div class="bg-white p-8 rounded-3xl border border-shop-border shadow-shop">
        <h3 class="text-sm font-black text-shop-green-deep uppercase tracking-widest mb-6">Top 5 Productos más Vendidos</h3>
        <div class="h-[320px] w-full relative">
           <canvas id="topProductsChart"></canvas>
        </div>
      </div>

      <!-- Distribución de Métodos de Pago -->
      <div class="bg-white p-8 rounded-3xl border border-shop-border shadow-shop">
        <h3 class="text-sm font-black text-shop-green-deep uppercase tracking-widest mb-6">Métodos de Pago</h3>
        <div class="h-[320px] w-full relative">
           <canvas id="paymentMethodsChart"></canvas>
        </div>
      </div>
    </div>

    <!-- ALERTAS CRÍTICAS (Vencimientos y Stock Mínimo) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Alertas de Inventario -->
      <div class="lg:col-span-3 space-y-4">
        <h3 class="text-[11px] font-black text-shop-red uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
          <i class="pi pi-bell text-shop-red animate-swing"></i> Alertas del Sistema
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Cuadro Único de Stock Crítico -->
          <div class="bg-red-100 border border-red-200 rounded-3xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6 border-b border-red-200 pb-4">
              <div class="flex items-center gap-3">
                <div class="bg-red-700 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <i class="pi pi-exclamation-triangle text-lg"></i>
                </div>
                <div>
                  <h5 class="text-sm font-black text-red-900 uppercase tracking-[0.1em] leading-tight">Productos con Stock Bajo</h5>
                </div>
              </div>
              <button
                @click="irA('/productos')"
                class="text-[10px] font-black text-gray-200 bg-shop-sidebar-bg px-4 py-2 rounded-xl hover:bg-black transition-all shadow-md uppercase tracking-wider border border-white/10"
              >
                Abastecer
              </button>
            </div>

            <!-- Lista de productos -->
            <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <div
                v-for="prod in lowStockProducts"
                :key="prod.id"
                class="bg-white/90 hover:bg-white border border-red-100 rounded-xl p-3 flex justify-between items-center transition-all group shadow-sm"
              >
                <div>
                  <p class="text-[13px] font-bold text-gray-800 tracking-tight">{{ prod.nombre }}</p>
                  <span class="text-[10px] font-black text-red-700 bg-red-100 px-1.5 py-0.5 rounded w-max uppercase">Mínimo: {{ prod.minimo }}</span>
                </div>
                <div class="text-right flex flex-col items-end">
                  <span class="text-[10px] font-black text-red-900 block mb-0.5 uppercase">Actual</span>
                  <span class="text-[13px] font-bold text-red-600">{{ prod.stock }}</span>
                </div>
              </div>

              <!-- Si no hay stock bajo -->
              <div v-if="lowStockProducts.length === 0" class="py-10 text-center">
                <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
                <p class="text-xs text-green-800 font-black uppercase tracking-widest">Inventario en niveles óptimos</p>
              </div>
            </div>
          </div>

          <!-- Cuadro de Vencimientos Próximos -->
          <div class="bg-amber-100 border border-amber-200 rounded-3xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6 border-b border-amber-200 pb-4">
              <div class="flex items-center gap-3">
                <div class="bg-amber-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <i class="pi pi-clock text-lg"></i>
                </div>
                <div>
                  <h5 class="text-sm font-black text-amber-900 uppercase tracking-[0.1em] leading-tight">Productos Próximos a Vencer</h5>
                </div>
              </div>
            </div>

            <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar text-left">
              <div
                v-for="prod in expiringProducts"
                :key="prod.id"
                class="bg-white/90 hover:bg-white border border-amber-100 rounded-xl p-3 flex justify-between items-center transition-all group shadow-sm"
              >
                <div>
                  <p class="text-[13px] font-bold text-gray-800 tracking-tight">{{ prod.nombre }}</p>
                  <span class="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded w-max uppercase">Lote: {{ prod.lote }}</span>
                </div>
                <div class="text-right flex flex-col items-end">
                  <span class="text-[10px] font-black text-amber-900 block mb-0.5 uppercase">Vence</span>
                  <span class="text-[12px] font-bold text-amber-600">{{ prod.fecha }}</span>
                </div>
              </div>

              <!-- Si no hay vencimientos próximos -->
              <div v-if="expiringProducts.length === 0" class="py-10 text-center">
                <i class="pi pi-calendar-check text-4xl text-green-500 mb-2"></i>
                <p class="text-xs text-green-800 font-black uppercase tracking-widest">Sin vencimientos cercanos</p>
              </div>
            </div>
          </div>

          <!-- Pedidos a Proveedores -->
          <div class="bg-blue-100 border border-blue-200 rounded-3xl p-6 shadow-sm font-dm-sans">
            <div class="flex items-center justify-between mb-6 border-b border-blue-200 pb-4">
              <div class="flex items-center gap-3">
                <div class="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <i class="pi pi-truck text-lg"></i>
                </div>
                <div>
                  <h5 class="text-sm font-black text-blue-900 uppercase tracking-[0.1em] leading-tight">Recorrido de proveedores</h5>
                </div>
              </div>
            </div>

            <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar text-left">
              <div v-for="order in providerVisits" :key="order.id"
                class="bg-white/90 hover:bg-white border border-blue-100 rounded-xl p-3 flex justify-between items-center transition-all group shadow-sm">
                <div>
                  <p class="text-[13px] font-bold text-gray-800 tracking-tight">{{ order.nombre }}</p>
                  <span class="text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded w-max uppercase">Visita en {{ order.dias }} días</span>
                </div>
                <div class="text-right flex flex-col items-end">
                    <span class="text-[9px] font-black text-blue-900 block mb-0.5 uppercase">Fecha</span>
                    <span class="text-[12px] font-bold text-blue-600">{{ order.fecha }}</span>
                </div>
              </div>

              <div v-if="providerVisits.length === 0" class="py-10 text-center">
                <i class="pi pi-calendar text-4xl text-gray-300 mb-2"></i>
                <p class="text-xs text-gray-500 font-black uppercase tracking-widest">Sin pedidos pendientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Chart from 'chart.js/auto';

const router = useRouter();
const currentDate = ref(new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

const quickAccess = ref([
  { label: "Ventas", icon: "pi pi-shopping-cart", ruta: "/punto-venta" },
  { label: "Créditos", icon: "pi pi-credit-card", ruta: "/creditos" },
  { label: "Productos", icon: "pi pi-box", ruta: "/productos" },
  { label: "Compras", icon: "pi pi-shopping-bag", ruta: "/compras" },
  { label: "Reportes", icon: "pi pi-chart-bar", ruta: "/reportes" },
  { label: "Cierre", icon: "pi pi-lock", ruta: "/cierre" },
  { label: "Usuarios", icon: "pi pi-users", ruta: "/usuarios" },
]);

const mainStats = ref([
  { label: "Ventas del Día", value: "$425.50", icon: "pi pi-money-bill", bgIcon: "bg-green-100 text-green-700" },
  { label: "Créditos Pendientes", value: "$120.00", icon: "pi pi-wallet", bgIcon: "bg-blue-100 text-blue-700" },
]);

const lowStockProducts = ref([
  { id: 1, nombre: "Pasta Colgate", stock: 2, minimo: 10 },
  { id: 2, nombre: "Jabón de Trastes", stock: 5, minimo: 15 },
]);

const expiringProducts = ref([
  { id: 1, nombre: "Leche Semidescremada", lote: "L-202405", fecha: "15/06/2026" },
  { id: 2, nombre: "Pan Molde", lote: "L-9982", fecha: "02/06/2026" },
]);

const providerVisits = ref([
  { id: 1, nombre: "Coca-Cola", dias: 2, fecha: "30/05/2026" },
]);

const irA = (ruta) => router.push(ruta);

onMounted(() => {
  // Gráfico de Tendencias de Ventas
  new Chart(document.getElementById('salesChart'), {
    type: 'line',
    data: {
      labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
      datasets: [
        {
          label: 'Ventas',
          data: [320, 450, 210, 560, 425, 780, 600],
          borderColor: '#0a3622',
          backgroundColor: 'rgba(10, 54, 34, 0.05)',
          fill: true,
          tension: 0.4,
          borderWidth: 4,
          pointRadius: 6,
          pointBackgroundColor: '#0a3622'
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          display: false
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 13, family: 'DM Sans' } } },
        x: { grid: { display: false }, ticks: { font: { size: 13, family: 'DM Sans' } } }
      }
    }
  });

  // Gráfico de Métodos de Pago
  new Chart(document.getElementById('paymentMethodsChart'), {
    type: 'pie',
    data: {
      labels: ['Efectivo', 'Transferencia'],
      datasets: [{
        data: [276.50, 149.00],
        backgroundColor: ['#0a3622', '#529931'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 15,
            font: { size: 13, weight: 'bold', family: 'DM Sans' },
            padding: 25,
            color: '#0a3622'
          }
        },
        tooltip: {
          bodyFont: { size: 14, family: 'DM Sans' },
          callbacks: {
            label: function(context) {
              return ` Monto: $${context.raw.toFixed(2)}`;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
    }
  });

  // Gráfico de Ganancias vs Pérdidas
  new Chart(document.getElementById('profitPerdChart'), {
    type: 'bar',
    data: {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
      datasets: [
        {
          label: 'Ganancias',
          data: [1200, 1900, 1500, 2500, 2200, 3000],
          backgroundColor: '#0a3622',
          borderRadius: 6,
        },
        {
          label: 'Pérdidas',
          data: [300, 400, 200, 600, 400, 250],
          backgroundColor: '#d32f2f',
          borderRadius: 6,
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 13, weight: 'bold', family: 'DM Sans' }, padding: 20 }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 13, family: 'DM Sans' } } },
        y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 13, family: 'DM Sans' } } }
      }
    }
  });

  // Gráfico de Top 5 Productos (Horizontal Bar)
  new Chart(document.getElementById('topProductsChart'), {
    type: 'bar',
    data: {
      labels: ['Coca Cola 500ml', 'Cuaderno Espiral', 'Lapicero Bic', 'Churro Diana', 'Agua Pura'],
      datasets: [{
        label: 'Unidades Vendidas',
        data: [120, 95, 80, 75, 60],
        backgroundColor: '#0a3622',
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y', // Hace que las barras sean horizontales
      plugins: {
        legend: { display: false }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 13, family: 'DM Sans' } } },
        y: {
          grid: { display: false },
          ticks: {
            color: '#1f2937',
            font: {
              size: 13,
              weight: 'bold',
              family: 'DM Sans'
            }
          }
        }
      }
    }
  });
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
