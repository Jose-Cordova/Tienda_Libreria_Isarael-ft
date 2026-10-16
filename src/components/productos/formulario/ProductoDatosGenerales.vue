<template>
  <div>
    <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">Nombre *</label>
    <InputText v-model="nombre" class="w-full border border-gray-200 rounded-xl p-3 focus:border-[#003d00]" :class="{ 'border-red-500': errors.nombre }" />
    <small class="text-red-500">{{ errors.nombre }}</small>
  </div>
  <div>
    <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1">
      <i class="pi pi-tags mr-1 text-[#034e03]"></i> Sección *
    </label>
    <Dropdown v-model="seccion" :options="SECCIONES_PRODUCTO" optionLabel="label" optionValue="value" placeholder="Seleccionar sección" class="w-full border border-gray-200 rounded-xl" :class="{ 'border-red-500': errors.seccion }" />
    <small class="text-red-500">{{ errors.seccion }}</small>
  </div>
  <div>
    <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1" :class="{ 'text-gray-400': catalogosDeshabilitados }">
      <i class="pi pi-tags mr-1" :class="catalogosDeshabilitados ? 'text-gray-400' : 'text-[#034e03]'"></i> Categoría *
    </label>
    <div class="flex gap-2">
      <Dropdown v-model="categoriaId" :options="categorias" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="flex-1 border border-gray-200 rounded-xl" :class="{ 'border-red-500': errors.categoria_id }" :disabled="catalogosDeshabilitados" />
      <Button type="button" icon="pi pi-plus" aria-label="Nueva categoría" class="!bg-[#003d00] !text-white !rounded-full !w-8 !h-8" :disabled="catalogosDeshabilitados" @click="$emit('nueva-categoria')" />
    </div>
    <small class="text-red-500">{{ errors.categoria_id }}</small>
  </div>
  <div>
    <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em] mb-1" :class="{ 'text-gray-400': catalogosDeshabilitados }">
      <i class="pi pi-bookmark mr-1" :class="catalogosDeshabilitados ? 'text-gray-400' : 'text-[#034e03]'"></i> Marca *
    </label>
    <div class="flex gap-2">
      <Dropdown v-model="marcaId" :options="marcas" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="flex-1 border border-gray-200 rounded-xl" :class="{ 'border-red-500': errors.marca_id }" :disabled="catalogosDeshabilitados" />
      <Button type="button" icon="pi pi-plus" aria-label="Nueva marca" class="!bg-[#003d00] !text-white !rounded-full !w-8 !h-8" :disabled="catalogosDeshabilitados" @click="$emit('nueva-marca')" />
    </div>
    <small class="text-red-500">{{ errors.marca_id }}</small>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { SECCIONES_PRODUCTO } from '@/utils/productos/formularioProducto'

const nombre = defineModel('nombre', { type: String, required: true })
const seccion = defineModel('seccion', { type: String, required: true })
const categoriaId = defineModel('categoriaId', { type: [Number, String], default: null })
const marcaId = defineModel('marcaId', { type: [Number, String], default: null })
const props = defineProps({
  esEdicion: Boolean,
  categorias: { type: Array, required: true },
  marcas: { type: Array, required: true },
  errors: { type: Object, required: true }
})
defineEmits(['nueva-categoria', 'nueva-marca'])
const catalogosDeshabilitados = computed(() => !seccion.value && !props.esEdicion)
</script>

<style scoped src="./camposProducto.css"></style>
