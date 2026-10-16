<template>
  <div>
    <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Precio Detalle ($) *</label>
    <InputNumber v-model="precioDetalle" mode="currency" currency="USD" locale="en-US" :max="999999.99" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.precio_detalle }" />
    <small class="text-red-500">{{ errors.precio_detalle }}</small>
  </div>
  <div>
    <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Precio Mayorista ($) *</label>
    <InputNumber v-model="precioMayor" mode="currency" currency="USD" locale="en-US" :max="999999.99" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.precio_mayor }" />
    <small class="text-red-500">{{ errors.precio_mayor }}</small>
  </div>
</template>

<script setup>
import InputNumber from 'primevue/inputnumber'
const precioDetalle = defineModel('precioDetalle', { type: Number, default: null })
const precioMayor = defineModel('precioMayor', { type: Number, default: null })
defineProps({ errors: { type: Object, required: true } })
</script>

<style scoped src="./camposProducto.css"></style>
