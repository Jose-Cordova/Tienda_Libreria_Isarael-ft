<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4"
  >
    <div class="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden animate-fade-up border border-gray-100">
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-[#f8fbf8] border border-[#dbe9dc] rounded-xl p-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-extrabold">
              {{ cliente.iniciales }}
            </div>
            <div>
              <p class="text-gray-500 text-[10px] uppercase font-extrabold">Cliente</p>
              <p class="text-gray-800 font-bold text-sm">{{ cliente.nombre }}</p>
              <p class="text-xs text-gray-400 font-bold">DUI: {{ cliente.dui }}</p>
            </div>
          </div>

          <div class="bg-white border border-red-200 border-l-[4px] border-l-red-500 rounded-lg p-3 shadow-sm">
            <p class="text-[10px] uppercase tracking-wider font-extrabold text-red-400 mb-1">Saldo pendiente</p>
            <h2 class="text-xl font-extrabold text-red-500">${{ cliente.kpi.saldoPendiente.toFixed(2) }}</h2>
          </div>

          <div class="bg-white border border-green-200 border-l-[4px] border-l-green-600 rounded-lg p-3 shadow-sm">
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
              <tr v-for="credito in cliente.creditos" :key="credito.id">
                <td class="py-3 px-3 font-bold text-gray-600">{{ credito.fecha }}</td>
                <td class="py-3 px-3 font-extrabold text-gray-800">${{ Number(credito.montoOriginal).toFixed(2) }}</td>
                <td class="py-3 px-3 font-bold text-green-700">${{ Number(credito.abonado).toFixed(2) }}</td>
                <td class="py-3 px-3 font-extrabold text-red-600">${{ Number(credito.saldoPendiente).toFixed(2) }}</td>
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
import { ref } from 'vue';
import Button from 'primevue/button';
import CreditoEstadoBadge from './CreditoEstadoBadge.vue';
import AbonoHistorialModal from './AbonoHistorialModal.vue';

const props = defineProps({
  visible: Boolean,
  cliente: { type: Object, default: null }
});

defineEmits(['update:visible', 'registrar-abono', 'anular-abono']);

const mostrarHistorial = ref(false);
const abonosSeleccionados = ref([]);

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
</style>
