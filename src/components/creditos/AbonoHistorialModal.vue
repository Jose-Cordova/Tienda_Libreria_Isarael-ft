<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Historial de abonos"
    :modal="true"
    :style="{ width: '650px' }"
    class="rounded-xl"
  >
    <div class="text-sm text-gray-500 mb-4" v-if="abonos.length === 0">
      No hay abonos registrados para este crédito.
    </div>
    <table v-else class="w-full text-xs">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="py-2 px-3 text-left font-semibold text-gray-500">Fecha</th>
          <th class="py-2 px-3 text-left font-semibold text-gray-500">Monto</th>
          <th class="py-2 px-3 text-left font-semibold text-gray-500">Método</th>
          <th class="py-2 px-3 text-left font-semibold text-gray-500">Estado</th>
          <th class="py-2 px-3 text-center font-semibold text-gray-500">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="abono in abonos" :key="abono.id" class="border-b border-gray-100">
          <td class="py-2 px-3">{{ abono.fecha }}</td>
          <td class="py-2 px-3 font-bold text-green-600">${{ abono.monto }}</td>
          <td class="py-2 px-3">{{ abono.metodo }}</td>
          <td class="py-2 px-3">
            <CreditoEstadoBadge :estado="abono.estado" />
          </td>
          <td class="py-2 px-3 text-center">
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
    <template #footer>
      <Button label="Cerrar" class="p-button-text p-button-sm" @click="$emit('update:visible', false)" />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import CreditoEstadoBadge from './CreditoEstadoBadge.vue';

defineProps({
  visible: Boolean,
  abonos: { type: Array, default: () => [] }
});

defineEmits(['update:visible', 'anular-abono']);
</script>
