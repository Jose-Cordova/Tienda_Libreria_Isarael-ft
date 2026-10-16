<template>
  <div>
    <label class="text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
      <i class="pi pi-exclamation-triangle text-amber-600 text-sm"></i>
      <span class="text-amber-700">Stock Mínimo *</span>
    </label>
    <InputNumber v-model="stockMinimo" :min="1" :max="999999" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.stock_minimo }" />
    <small class="text-red-500">{{ errors.stock_minimo }}</small>
  </div>
  <div v-if="!esEdicion && !perecedero">
    <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Cantidad Inicial *</label>
    <InputNumber v-model="cantidadInicial" :min="1" :max="999999999" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.cantidad_inicial }" />
    <small class="text-red-500">{{ errors.cantidad_inicial }}</small>
  </div>
  <div v-if="!esEdicion && perecedero">
    <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Stock Total Inicial (Sumatoria de Lotes)</label>
    <div class="w-full border border-green-200 rounded-xl p-3 bg-green-50/50 text-[#003d00] font-black text-base flex items-center justify-between">
      <span>{{ totalStock }} uds.</span>
    </div>
  </div>
  <div v-if="esEdicion">
    <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Stock Actual</label>
    <div class="flex items-center gap-3">
      <div class="flex-1 border border-gray-200 rounded-xl p-3 bg-gray-50 font-bold text-gray-700 text-sm">{{ stockProyectado }}</div>
      <button type="button" @click="$emit('ajustar-stock')" class="px-3 py-2 rounded-xl border text-xs font-extrabold uppercase tracking-wide transition flex items-center gap-1.5 shrink-0 bg-[#003d00]/10 text-[#003d00] border-[#003d00]/20 hover:bg-[#003d00]/20">
        <i class="pi pi-pencil text-xs"></i> Modificar Stock
      </button>
    </div>
    <small v-if="errors.nuevo_stock || errors.lote_id || errors.motivo_ajuste" class="block text-red-500">
      {{ errors.nuevo_stock || errors.lote_id || errors.motivo_ajuste }}
    </small>
  </div>
</template>

<script setup>
import InputNumber from 'primevue/inputnumber'
const stockMinimo = defineModel('stockMinimo', { type: Number, default: null })
const cantidadInicial = defineModel('cantidadInicial', { type: Number, default: null })
defineProps({
  esEdicion: Boolean,
  perecedero: Boolean,
  totalStock: { type: Number, required: true },
  stockProyectado: { type: Number, required: true },
  errors: { type: Object, required: true }
})
defineEmits(['ajustar-stock'])
</script>

<style scoped src="./camposProducto.css"></style>
