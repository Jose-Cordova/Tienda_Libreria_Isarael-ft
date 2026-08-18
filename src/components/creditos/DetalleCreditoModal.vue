<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4"
  >
    <div class="bg-white rounded-xl w-[95vw] max-w-4xl shadow-2xl overflow-hidden animate-fade-up border border-gray-100 flex flex-col max-h-[90vh]">
      <!-- Cabecera -->
      <div class="bg-[#0a3622] text-white px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold flex items-center gap-2">
          <i class="pi pi-wallet"></i>
          Detalle de crédito: {{ cliente?.nombre }}
        </h2>
        <button @click="$emit('update:visible', false)" class="text-white/80 hover:text-white">
          <i class="pi pi-times text-xl"></i>
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6" v-if="cliente">
        <!-- Información del cliente (KPIs) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-stretch">
          <!-- Card cliente -->
          <div class="relative bg-[#f8fbf8] border border-[#dbe9dc] rounded-xl p-4 flex items-center gap-4 min-w-0">
            <!-- Botón editar en la esquina superior derecha -->
            <button
              class="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:text-[#0a3622] hover:bg-green-50 transition"
              title="Editar cliente"
              @click="$emit('editar-cliente', cliente)"
            >
              <i class="pi pi-pencil"></i>
            </button>

            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-extrabold text-xl">
              {{ cliente.iniciales }}
            </div>
            <div class="min-w-0">
              <p class="text-gray-800 text-[10px] uppercase font-extrabold">Cliente</p>
              <p class="text-gray-600 font-bold text-base truncate">{{ cliente.nombre }}</p>
              <p class="text-xs text-gray-600 font-bold truncate">DUI: {{ cliente.dui || '-' }}</p>
              <p class="text-xs text-gray-600 font-bold truncate">Teléfono: {{ cliente.telefono || '-' }}</p>
            </div>
          </div>

          <!-- Card saldo pendiente -->
          <div class="bg-white border border-red-200 border-l-[4px] border-l-red-500 rounded-lg p-4 shadow-sm flex flex-col justify-center">
            <p class="text-[10px] uppercase tracking-wider font-extrabold text-red-400 mb-1">Saldo pendiente</p>
            <h2 class="text-xl font-extrabold text-red-500">${{ cliente.kpi.saldoPendiente.toFixed(2) }}</h2>
          </div>

          <!-- Card total abonado -->
          <div class="bg-white border border-green-200 border-l-[4px] border-l-green-600 rounded-lg p-4 shadow-sm flex flex-col justify-center">
            <p class="text-[10px] uppercase tracking-wider font-extrabold text-green-500 mb-1">Total abonado</p>
            <h2 class="text-xl font-extrabold text-[#0a3622]">${{ cliente.kpi.totalAbonado.toFixed(2) }}</h2>
          </div>
        </div>

        <!-- Tabla de créditos -->
        <h3 class="font-extrabold !text-gray-800 mb-2 text-sm uppercase tracking-wider">Créditos del cliente</h3>
        <div class="overflow-x-auto border border-black rounded-lg">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#99bba7]">
              <tr class="text-black font-bold uppercase">
                <th class="py-2 px-3">Fecha</th>
                <th class="py-2 px-3">Monto original</th>
                <th class="py-2 px-3">Abonado</th>
                <th class="py-2 px-3">Saldo pendiente</th>
                <th class="py-2 px-3">Estado</th>
                <th class="py-2 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="credito in creditosPaginados" :key="credito.id">
                <td class="py-3 px-3 font-bold text-gray-600">{{ credito.fecha }}</td>
                <td class="py-3 px-3 font-extrabold text-gray-800">${{ Number(credito.montoOriginal).toFixed(2) }}</td>
                <td class="py-3 px-3 font-bold text-green-700">${{ Number(credito.abonado).toFixed(2) }}</td>

                <td
                  class="py-3 px-3 font-extrabold"
                  :class="Number(credito.saldoPendiente) === 0 ? 'text-gray-800' : 'text-red-600'"
                >
                  ${{ Number(credito.saldoPendiente).toFixed(2) }}
                </td>

                <td class="py-3 px-3">
                  <CreditoEstadoBadge :estado="credito.estado" />
                </td>
                <td class="py-3 px-3">
                  <div class="flex items-center justify-center gap-2">
                    <Button
                      icon="pi pi-eye"
                      class="p-button-rounded p-button-text p-button-sm p-button-info"
                      v-tooltip="'Ver abonos'"
                      @click="abrirHistorial(credito)"
                    />
                    <Button
                      v-if="credito.estado !== 'PAGADO'"
                      icon="pi pi-plus"
                      class="p-button-rounded p-button-text p-button-sm p-button-success"
                      v-tooltip="'Registrar abono'"
                      @click="$emit('registrar-abono', credito)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginador de créditos -->
        <div v-if="totalPaginasCreditos > 1" class="mt-4 flex justify-center">
          <Paginator
            :rows="porPaginaCreditos"
            :totalRecords="cliente?.creditos?.length || 0"
            :first="(paginaCreditos - 1) * porPaginaCreditos"
            @page="cambiarPaginaCreditos"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            class="custom-paginator text-xs"
          />
        </div>
      </div>

      <!-- Cargando -->
      <div v-else class="p-10 text-center text-gray-500">
        <i class="pi pi-spin pi-spinner text-3xl"></i>
        <p class="mt-2 text-sm font-bold">Cargando detalles...</p>
      </div>
    </div>

    <!-- Modal de historial de abonos -->
    <AbonoHistorialModal
      v-model:visible="mostrarHistorial"
      :abonos="abonosSeleccionados"
      @anular-abono="$emit('anular-abono', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import CreditoEstadoBadge from './CreditoEstadoBadge.vue';
import AbonoHistorialModal from './AbonoHistorialModal.vue';

const props = defineProps({
  visible: Boolean,
  cliente: { type: Object, default: null }
});

defineEmits(['update:visible', 'registrar-abono', 'anular-abono', 'editar-cliente']);

const mostrarHistorial = ref(false);
const abonosSeleccionados = ref([]);

const paginaCreditos = ref(1);
const porPaginaCreditos = 10;

const creditosPaginados = computed(() => {
  if (!props.cliente?.creditos) return [];
  const inicio = (paginaCreditos.value - 1) * porPaginaCreditos;
  return props.cliente.creditos.slice(inicio, inicio + porPaginaCreditos);
});

const totalPaginasCreditos = computed(() => Math.ceil((props.cliente?.creditos?.length || 0) / porPaginaCreditos));

const cambiarPaginaCreditos = (event) => {
  paginaCreditos.value = event.page + 1;
};

const abrirHistorial = (credito) => {
  abonosSeleccionados.value = credito.abonos || [];
  mostrarHistorial.value = true;
};
</script>

<style scoped>
.animate-fade-up {
  animation: fadeUp 0.3s ease-out forwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
:deep(.custom-paginator .p-paginator-page.p-highlight) {
  background: #0b580b !important;
  color: white !important;
  font-weight: bold;
}
</style>
