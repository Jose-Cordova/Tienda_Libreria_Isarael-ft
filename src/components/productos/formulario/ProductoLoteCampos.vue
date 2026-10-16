<template>
  <div :class="nuevo ? 'md:col-span-5' : 'md:col-span-4'">
    <label class="block text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider mb-1">{{ nuevo ? 'Código de Nuevo Lote' : `Código de Lote #${numero}` }} *</label>
    <InputText :modelValue="modelValue.codigo_lote" @update:modelValue="actualizar('codigo_lote', ($event || '').toUpperCase())" placeholder="Ej. LOT-2026-001" class="w-full border border-gray-200 rounded-xl p-2.5 uppercase" :class="{ 'border-red-500': errors[`${prefijo}.codigo_lote`] }" />
    <small class="text-red-500 text-[11px] block mt-0.5">{{ errors[`${prefijo}.codigo_lote`] }}</small>
  </div>
  <div class="md:col-span-4">
    <label class="block text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider mb-1">Fecha Vencimiento *</label>
    <Calendar :modelValue="modelValue.fecha_vencimiento" @update:modelValue="actualizar('fecha_vencimiento', $event)" :minDate="fechaMinima" dateFormat="yy-mm-dd" placeholder="YYYY-MM-DD" class="w-full" :class="{ 'border-red-500': errors[`${prefijo}.fecha_vencimiento`] }" />
    <small class="text-red-500 text-[11px] block mt-0.5">{{ errors[`${prefijo}.fecha_vencimiento`] }}</small>
  </div>
  <div class="md:col-span-3">
    <label class="block text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider mb-1">Cantidad Inicial *</label>
    <InputNumber :modelValue="modelValue.cantidad" @update:modelValue="actualizar('cantidad', $event)" :min="1" :max="999999999" class="w-full border border-gray-200 rounded-xl p-2.5" :class="{ 'border-red-500': errors[`${prefijo}.cantidad`] }" />
    <small class="text-red-500 text-[11px] block mt-0.5">{{ errors[`${prefijo}.cantidad`] }}</small>
  </div>
</template>

<script setup>
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'

const props = defineProps({
  modelValue: { type: Object, required: true },
  prefijo: { type: String, required: true },
  errors: { type: Object, required: true },
  fechaMinima: { type: Date, required: true },
  numero: { type: Number, default: 1 },
  nuevo: Boolean
})
const emit = defineEmits(['update:modelValue'])
const actualizar = (campo, valor) => emit('update:modelValue', { ...props.modelValue, [campo]: valor })
</script>

<style scoped src="./camposProducto.css"></style>
