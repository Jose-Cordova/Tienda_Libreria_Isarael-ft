<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] backdrop-blur-sm p-4"
  >
    <div class="bg-white rounded-xl w-[90vw] max-w-md shadow-2xl overflow-hidden animate-fade-up border border-gray-100">
      <!-- Cabecera -->
      <div class="bg-[#0a3622] text-white px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold flex items-center gap-2">
          <i class="pi pi-plus-circle"></i>
          Registrar abono
        </h2>
        <button @click="$emit('update:visible', false)" class="text-white/80 hover:text-white">
          <i class="pi pi-times text-xl"></i>
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6 flex flex-col gap-5">
        <div class="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
          <div>
            <p class="text-[10px] uppercase font-extrabold text-red-400">Saldo pendiente actual</p>
            <p class="text-2xl font-extrabold text-red-600">${{ Number(saldoPendiente).toFixed(2) }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <i class="pi pi-info-circle text-red-500 text-xl"></i>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <label class="text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-wider">Monto a abonar</label>
            <InputNumber 
              v-model="monto" 
              mode="currency" 
              currency="USD" 
              locale="en-US"
              :min="0" 
              :max="saldoPendiente" 
              :minFractionDigits="2"
              class="w-full custom-input-number" 
              placeholder="0.00"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-wider">Método de pago</label>
            <Dropdown 
              v-model="metodoPago" 
              :options="metodos" 
              optionLabel="nombre" 
              placeholder="Seleccione un método" 
              class="w-full p-dropdown-sm border-gray-300 rounded-lg text-sm" 
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 flex items-center gap-3">
        <button 
          @click="$emit('update:visible', false)" 
          class="flex-1 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm uppercase tracking-widest"
        >
          Cancelar
        </button>
        <button 
          @click="confirmar" 
          :disabled="!monto || monto <= 0 || !metodoPago"
          class="flex-1 py-3 bg-[#0a3622] hover:bg-[#062417] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest disabled:opacity-50"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';

const props = defineProps({
  visible: Boolean,
  saldoPendiente: { type: Number, default: 0 },
  metodos: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:visible', 'confirmar']);

const monto = ref(0);
const metodoPago = ref(null);

// Resetear campos al abrir
watch(() => props.visible, (newVal) => {
  if (newVal) {
    monto.value = 0;
    metodoPago.value = null;
  }
});

const confirmar = () => {
  if (monto.value > 0 && metodoPago.value) {
    emit('confirmar', { 
      monto: monto.value, 
      metodo_pago_id: metodoPago.value.id 
    });
  }
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

:deep(.p-inputnumber-input) {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  font-weight: 700;
  color: #0a3622;
}
:deep(.p-inputnumber-input:focus) {
  border-color: #0a3622;
  outline: none;
  box-shadow: 0 0 0 2px rgba(10, 54, 34, 0.1);
}
:deep(.p-dropdown) {
  border-radius: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
