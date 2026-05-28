<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Registrar abono"
    :modal="true"
    :style="{ width: '400px' }"
    class="rounded-xl"
  >
    <div class="flex flex-col gap-4 mt-2">
      <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p class="text-sm text-gray-500">Saldo pendiente actual</p>
        <p class="text-2xl font-extrabold text-red-500">${{ saldoPendiente }}</p>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[#0a3622]">Monto a abonar</label>
        <InputNumber v-model="monto" :min="0" :max="saldoPendiente" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[#0a3622]">Método de pago</label>
        <Dropdown v-model="metodoPago" :options="metodos" optionLabel="nombre" placeholder="Seleccione" class="w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" class="p-button-text p-button-sm" @click="$emit('update:visible', false)" />
      <Button label="Confirmar abono" class="p-button-sm bg-[#0a3622] border-none" @click="$emit('confirmar', { monto: monto, metodo_pago_id: metodoPago.id })" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

defineProps({
  visible: Boolean,
  saldoPendiente: { type: Number, default: 0 },
  metodos: { type: Array, default: () => [] } // [{ id: 1, nombre: 'Efectivo' }, ...]
});

defineEmits(['update:visible', 'confirmar']);

const monto = ref(0);
const metodoPago = ref(null);
</script>
