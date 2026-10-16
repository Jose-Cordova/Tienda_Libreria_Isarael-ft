<template>
  <section class="border-t border-gray-200 pt-4 md:pt-6 mt-4 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-md font-extrabold text-[#003d00] uppercase tracking-wide">Lotes del Producto*</h3>
      <button type="button" @click="emit('update:modelValue', [...modelValue, crearLoteVacio()])" class="px-3 py-2 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm shrink-0">
        <i class="pi pi-plus text-xs"></i> Agregar Lote
      </button>
    </div>
    <small v-if="errors.lotes" class="block text-red-500">{{ errors.lotes }}</small>
    <div class="space-y-3">
      <div v-for="(lote, index) in modelValue" :key="index" class="p-4 bg-gray-50 rounded-2xl border border-gray-200 relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <ProductoLoteCampos :modelValue="lote" @update:modelValue="actualizarLote(index, $event)" :numero="index + 1" :prefijo="`lotes.${index}`" :errors="errors" :fecha-minima="fechaMinima" />
        <div class="md:col-span-1 flex justify-center pt-5">
          <button type="button" @click="quitarLote(index)" :disabled="modelValue.length <= 1" class="w-10 h-10 rounded-xl flex items-center justify-center transition border shrink-0" :class="modelValue.length > 1 ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'" title="Eliminar este lote">
            <i class="pi pi-trash text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import ProductoLoteCampos from './ProductoLoteCampos.vue'
import { crearLoteVacio } from '@/utils/productos/formularioProducto'
const props = defineProps({
  modelValue: { type: Array, required: true },
  errors: { type: Object, required: true },
  fechaMinima: { type: Date, required: true }
})
const emit = defineEmits(['update:modelValue'])
const actualizarLote = (index, lote) => emit('update:modelValue', props.modelValue.map((item, i) => i === index ? lote : item))
const quitarLote = index => {
  if (props.modelValue.length > 1) emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}
</script>
