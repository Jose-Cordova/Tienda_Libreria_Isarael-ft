<template>
  <section class="border-t border-gray-200 pt-4 mt-4 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xs font-black text-[#003d00] uppercase tracking-wider flex items-center gap-2"><i class="pi pi-box text-[#034e03]"></i> ¿Desea agregar un nuevo lote?</h3>
        <p class="text-xs text-gray-400">Si olvidó incluir un lote en la recepción, puede añadirlo aquí.</p>
      </div>
      <button type="button" @click="emit('update:modelValue', modelValue ? null : crearLoteVacio())" :class="modelValue ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' : 'bg-[#003d00] text-white hover:bg-[#002800]'" class="px-3 py-2 rounded-xl border text-xs font-extrabold uppercase tracking-wide transition flex items-center gap-1.5 shrink-0 shadow-sm">
        <i :class="modelValue ? 'pi pi-times' : 'pi pi-plus'" class="text-xs"></i>
        {{ modelValue ? 'Cancelar Nuevo Lote' : 'Agregar Nuevo Lote' }}
      </button>
    </div>
    <div v-if="modelValue" class="p-4 bg-green-50/60 rounded-2xl border border-green-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      <ProductoLoteCampos :modelValue="modelValue" @update:modelValue="emit('update:modelValue', $event)" nuevo prefijo="nuevo_lote" :errors="errors" :fecha-minima="fechaMinima" />
    </div>
  </section>
</template>

<script setup>
import ProductoLoteCampos from './ProductoLoteCampos.vue'
import { crearLoteVacio } from '@/utils/productos/formularioProducto'
defineProps({
  modelValue: { type: Object, default: null },
  errors: { type: Object, required: true },
  fechaMinima: { type: Date, required: true }
})
const emit = defineEmits(['update:modelValue'])
</script>
