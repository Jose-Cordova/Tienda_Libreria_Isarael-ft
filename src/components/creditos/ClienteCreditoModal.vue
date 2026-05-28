<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Nuevo cliente de crédito"
    :modal="true"
    :style="{ width: '450px' }"
    class="rounded-xl"
  >
    <div class="flex flex-col gap-4 mt-2">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[#0a3622]">Nombre completo</label>
        <InputText v-model="form.nombre" class="p-inputtext-sm border-gray-200 w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[#0a3622]">DUI</label>
        <InputText v-model="form.dui" class="p-inputtext-sm border-gray-200 w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-[#0a3622]">Teléfono</label>
        <InputText v-model="form.telefono" class="p-inputtext-sm border-gray-200 w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" class="p-button-text p-button-sm" @click="$emit('update:visible', false)" />
      <Button label="Guardar" class="p-button-sm bg-[#0a3622] border-none" @click="$emit('guardar', { ...form })" />
    </template>
  </Dialog>
</template>

<script setup>
import { reactive } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

defineProps({ visible: Boolean });
defineEmits(['update:visible', 'guardar']);

const form = reactive({ nombre: '', dui: '', telefono: '' });
</script>
