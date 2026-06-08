<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] backdrop-blur-sm p-4"
  >
    <div class="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-up border border-gray-100">
      <!-- Cabecera -->
      <div class="bg-[#0a3622] text-white px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold flex items-center gap-2">
          <i class="pi pi-history"></i>
          Historial de abonos
        </h2>
        <button @click="$emit('update:visible', false)" class="text-white/80 hover:text-white">
          <i class="pi pi-times text-xl"></i>
        </button>
      </div>

      <!-- Cuerpo credito-->
      <div class="p-6">
        <div v-if="abonos.length === 0" class="py-10 text-center text-gray-500 italic font-bold">
          No hay abonos registrados para este crédito.
        </div>

        <div v-else class="overflow-x-auto border border-black rounded-lg">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#99bba7]">
              <tr class="text-black font-bold uppercase">
                <th class="py-2 px-3">Fecha</th>
                <th class="py-2 px-3">Monto</th>
                <th class="py-2 px-3">Método</th>
                <th class="py-2 px-3">Estado</th>
                <th class="py-2 px-3">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="abono in abonos" :key="abono.id">
                <td class="py-3 px-3 font-bold text-gray-600">{{ abono.fecha }}</td>
                <td class="py-3 px-3 font-extrabold text-green-700">${{ Number(abono.monto).toFixed(2) }}</td>
                <td class="py-3 px-3 font-bold text-gray-700">{{ abono.metodo }}</td>
                <td class="py-3 px-3">
                  <CreditoEstadoBadge :estado="abono.estado" />
                </td>
                <td class="py-3 px-3 text-center">
                  <Button
                    icon="pi pi-ban"
                    class="p-button-rounded p-button-text p-button-sm p-button-danger"
                    @click="abrirConfirmacion(abono)"
                    :disabled="abono.estado === 'ANULADO'"
                    v-tooltip.left="'Anular abono'"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE ANULACIÓN (Adaptado de HistorialVentasView) -->
    <div v-if="mostrarConfirmarAnular" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] backdrop-blur-sm p-4 text-center">
      <div class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
        <div class="p-10">
          <div class="flex justify-center mb-6 text-red-500">
            <i class="pi pi-ban text-6xl"></i>
          </div>
          <h2 class="text-xl font-extrabold text-gray-800 mb-2">¿Anular este abono?</h2>
          <p class="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
            Se anulará el abono del día <span class="text-gray-800 font-bold">"{{ abonoAAnular?.fecha }}"</span> por un monto de <span class="text-green-700 font-bold">${{ Number(abonoAAnular?.monto).toFixed(2) }}</span>.
          </p>
          <div class="flex items-center gap-3">
            <button
              @click="mostrarConfirmarAnular = false"
              class="flex-1 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#e2eee2] hover:bg-white transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              @click="confirmarAnulacion"
              class="flex-1 py-3 bg-[#d1333e] hover:bg-[#a82430] text-white font-bold rounded-xl shadow-md transition-colors text-sm"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import CreditoEstadoBadge from './CreditoEstadoBadge.vue';

defineProps({
  visible: Boolean,
  abonos: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:visible', 'anular-abono']);

const mostrarConfirmarAnular = ref(false);
const abonoAAnular = ref(null);

const abrirConfirmacion = (abono) => {
  abonoAAnular.value = abono;
  mostrarConfirmarAnular.value = true;
};

const confirmarAnulacion = () => {
  emit('anular-abono', abonoAAnular.value);
  mostrarConfirmarAnular.value = false;
  abonoAAnular.value = null;
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
