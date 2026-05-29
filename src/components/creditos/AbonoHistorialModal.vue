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

      <!-- Cuerpo -->
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
                <th class="py-2 px-3 text-center">Acciones</th>
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
                    @click="$emit('anular-abono', abono)"
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
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import CreditoEstadoBadge from './CreditoEstadoBadge.vue';

defineProps({
  visible: Boolean,
  abonos: { type: Array, default: () => [] }
});

defineEmits(['update:visible', 'anular-abono']);
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
