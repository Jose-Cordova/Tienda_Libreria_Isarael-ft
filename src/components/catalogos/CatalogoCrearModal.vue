<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] backdrop-blur-sm p-4">
      <form @submit.prevent="$emit('guardar')" class="bg-white rounded-[24px] w-[90vw] max-w-lg shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
        <fieldset :disabled="loading" class="min-w-0 p-8">
          <h3 class="text-xl font-extrabold text-[#003d00] mb-4">{{ titulo }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre *</label>
              <InputText v-model="nombre" :placeholder="placeholder" class="w-full border border-gray-200 rounded-xl p-3" />
            </div>
            <div>
              <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Sección *</label>
              <Dropdown v-model="seccion" :options="SECCIONES_PRODUCTO" optionLabel="label" optionValue="value" placeholder="Seleccionar sección" class="w-full border border-gray-200 rounded-xl" :class="{ 'bg-gray-100': bloquearSeccion }" :disabled="bloquearSeccion" />
            </div>
          </div>
          <p v-if="error" role="alert" class="mt-3 text-sm text-red-600">{{ error }}</p>
          <div class="flex gap-3 mt-8">
            <button type="button" @click="$emit('cerrar')" class="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all duration-200">Cancelar</button>
            <button type="submit" class="flex-1 py-3 bg-[#003d00] text-white font-bold rounded-xl shadow-md hover:bg-[#002800] transition disabled:opacity-50">{{ loading ? 'GUARDANDO...' : 'Guardar' }}</button>
          </div>
        </fieldset>
      </form>
    </div>
  </Teleport>
</template>

<script setup>
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { SECCIONES_PRODUCTO } from '@/utils/productos/formularioProducto'
const nombre = defineModel('nombre', { type: String, required: true })
const seccion = defineModel('seccion', { type: String, required: true })
defineProps({
  visible: Boolean,
  titulo: { type: String, required: true },
  placeholder: { type: String, required: true },
  bloquearSeccion: Boolean,
  loading: Boolean,
  error: { type: String, default: '' }
})
defineEmits(['guardar', 'cerrar'])
</script>

<style scoped>
:deep(.p-inputtext) { font-size: 0.875rem !important; font-weight: 600 !important; }
</style>
