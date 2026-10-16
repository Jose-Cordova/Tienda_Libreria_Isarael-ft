<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[115] backdrop-blur-sm p-4 animate-fade-in">
      <form @submit.prevent="confirmar" class="bg-white rounded-[24px] w-[90vw] max-w-lg shadow-2xl relative overflow-hidden border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#003d00]"></div>
        <div class="p-6 md:p-8 text-left">
          <h3 class="text-xl font-extrabold text-[#003d00] mb-1 flex items-center gap-2"><i class="pi pi-sliders-h text-lg"></i> Modificar Stock</h3>
          <p class="text-xs text-gray-400 font-medium mb-6">Ajuste la cantidad del producto y especifique el motivo.</p>
          <div class="space-y-4">
            <div v-if="formulario.perecedero">
              <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">1. Seleccionar Lote a Afectar *</label>
              <Dropdown :modelValue="borrador.lote_id" @update:modelValue="seleccionarLote" :options="lotesDisponibles" optionLabel="label" optionValue="id" placeholder="Seleccionar Lote" class="w-full border border-gray-200 rounded-xl" :class="{ 'border-red-500': errors.lote_id }" />
              <small class="text-red-500 text-xs block mt-1">{{ errors.lote_id }}</small>
            </div>
            <div>
              <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">{{ formulario.perecedero ? '2. Nuevo Stock del Lote *' : '1. Nuevo Stock Total *' }}</label>
              <InputNumber v-model="borrador.nuevo_stock" :min="0" :max="999999999" class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.nuevo_stock }" />
              <small class="text-red-500 text-xs block mt-1">{{ errors.nuevo_stock }}</small>
            </div>
            <div>
              <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">{{ formulario.perecedero ? '3. Motivo del Ajuste *' : '2. Motivo del Ajuste *' }}</label>
              <InputText v-model="borrador.motivo_ajuste" placeholder="Ej. Conteo físico de inventario, merma, etc." class="w-full border border-gray-200 rounded-xl p-3" :class="{ 'border-red-500': errors.motivo_ajuste }" />
              <small class="text-red-500 text-xs block mt-1">{{ errors.motivo_ajuste }}</small>
            </div>
          </div>
          <div class="flex gap-3 mt-8">
            <button type="button" @click="emit('update:visible', false)" class="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition border border-gray-200">Cancelar</button>
            <button type="submit" class="flex-1 py-3 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-md transition">Aplicar Ajuste</button>
          </div>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { useProductoAjusteStock } from '@/composables/productos/useProductoAjusteStock'

const props = defineProps({
  visible: Boolean,
  formulario: { type: Object, required: true },
  ajuste: { type: Object, default: null },
  erroresServidor: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['update:visible', 'aplicar'])
const { borrador, errors, lotesDisponibles, seleccionarLote, confirmar } = useProductoAjusteStock(props, emit)
</script>

<style scoped>
:deep(.p-inputtext) { font-size: 0.875rem !important; font-weight: 600 !important; }
</style>
