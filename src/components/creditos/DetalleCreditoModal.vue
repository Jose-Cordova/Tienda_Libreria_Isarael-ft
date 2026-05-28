<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :modal="true"
    :style="{ width: '90%', maxWidth: '900px' }"
    class="rounded-2xl overflow-hidden"
    :header="null"
  >
    <template v-if="cliente">
      <div class="absolute top-0 left-0 w-full h-2 bg-[#0a3622]"></div>

      <div class="p-6 pt-8">
        <!-- Cabecera compacta -->
        <div class="flex justify-between items-start mb-5">
          <div class="flex items-center gap-2">
            <i class="pi pi-wallet text-xl text-[#0a3622]"></i>
            <h2 class="text-2xl font-extrabold text-[#0a3622]">Detalle de crédito</h2>
          </div>
          <Button
            icon="pi pi-times"
            class="p-button-rounded p-button-text p-button-sm text-gray-400 hover:text-gray-700"
            @click="$emit('update:visible', false)"
          />
        </div>

        <!-- Información del cliente (compacta) -->
        <section class="bg-[#f8fbf8] border border-[#dbe9dc] rounded-xl p-4 mb-5">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-xl font-extrabold text-red-500">
              {{ cliente.iniciales }}
            </div>
            <div>
              <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">{{ cliente.nombre }}</h2>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 font-semibold">
                <div class="flex items-center gap-1">
                  <i class="pi pi-phone text-[#0a3622] text-xs"></i>
                  <span>{{ cliente.telefono }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <i class="pi pi-id-card text-[#0a3622] text-xs"></i>
                  <span>DUI: {{ cliente.dui }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- KPIs en cards pequeñas -->
        <section class="grid grid-cols-3 gap-3 mb-5">
          <div class="bg-white border border-red-200 border-l-[4px] border-l-red-500 rounded-lg p-3 shadow-sm">
            <p class="text-[10px] uppercase tracking-wider font-extrabold text-red-400 mb-1">Saldo pendiente</p>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-extrabold text-red-500">${{ cliente.kpi.saldoPendiente }}</h2>
              <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <i class="pi pi-hourglass text-red-400 text-lg"></i>
              </div>
            </div>
          </div>
          <div class="bg-white border border-green-200 border-l-[4px] border-l-green-600 rounded-lg p-3 shadow-sm">
            <p class="text-[10px] uppercase tracking-wider font-extrabold text-green-500 mb-1">Total abonado</p>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-extrabold text-[#0a3622]">${{ cliente.kpi.totalAbonado }}</h2>
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <i class="pi pi-wallet text-green-500 text-lg"></i>
              </div>
            </div>
          </div>
          <div class="bg-white border border-[#cfe7d1] border-l-[4px] border-l-[#0a3622] rounded-lg p-3 shadow-sm">
            <p class="text-[10px] uppercase tracking-wider font-extrabold text-[#0a3622] mb-1">Créditos totales</p>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-extrabold text-[#0a3622]">{{ cliente.kpi.creditosTotales }}</h2>
              <div class="w-10 h-10 rounded-full bg-[#dff4e4] flex items-center justify-center">
                <i class="pi pi-file text-[#0a3622] text-lg"></i>
              </div>
            </div>
          </div>
        </section>

        <!-- Tabla de créditos (protagonista) -->
        <section class="bg-white border border-[#dcebdd] rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-[#e9f2ea]">
            <h3 class="font-extrabold text-[#0a3622] uppercase tracking-wider text-xs">Créditos del cliente</h3>
          </div>
          <table class="w-full text-xs">
            <thead class="bg-[#edf6ef] text-[#0a3622] uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-3 px-4 text-left">Fecha</th>
                <th class="py-3 px-4 text-left">Monto original</th>
                <th class="py-3 px-4 text-left">Abonado</th>
                <th class="py-3 px-4 text-left">Saldo pendiente</th>
                <th class="py-3 px-4 text-left">Estado</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="credito in cliente.creditos" :key="credito.id" class="border-t border-[#eef4ef]">
                <td class="py-3 px-4 font-medium text-gray-600">{{ credito.fecha }}</td>
                <td class="py-3 px-4 font-extrabold text-[#0a3622]">${{ credito.montoOriginal }}</td>
                <td class="py-3 px-4 font-bold text-green-600">${{ credito.abonado }}</td>
                <td class="py-3 px-4 font-extrabold text-red-500">${{ credito.saldoPendiente }}</td>
                <td class="py-3 px-4">
                  <CreditoEstadoBadge :estado="credito.estado" />
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center justify-center gap-1">
                    <Button
                      icon="pi pi-eye"
                      class="p-button-rounded p-button-sm bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                      @click="abrirHistorial(credito)"
                    />
                    <Button
                      icon="pi pi-plus"
                      class="p-button-rounded p-button-sm bg-[#0a3622] border-none"
                      @click="$emit('registrar-abono', credito)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </template>
  </Dialog>

  <AbonoHistorialModal
    v-model:visible="mostrarHistorial"
    :abonos="abonosSeleccionados"
    @anular-abono="$emit('anular-abono', $event)"
  />
</template>

<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
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
