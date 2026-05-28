<template>
  <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
    <div class="flex items-center gap-3">
      <i class="pi pi-credit-card text-xl text-blue-500"></i>
      <h1 class="text-lg font-extrabold text-[#0a3622]">Crédito/Fiados</h1>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <Dropdown
        :modelValue="filtroCredito"
        @update:modelValue="$emit('update:filtroCredito', $event)"
        :options="opcionesEstadoCredito"
        optionLabel="label"
        placeholder="Todos los créditos"
        class="p-dropdown-sm border-gray-200 text-xs w-48"
      />

      <span class="p-input-icon-left text-xs">
        <i class="pi pi-search text-gray-400" />
        <InputText
          :modelValue="buscarCliente"
          @update:modelValue="$emit('update:buscarCliente', $event)"
          placeholder="Buscar cliente..."
          class="p-inputtext-sm border-gray-200 focus:border-green-600 w-48 text-xs"
        />
      </span>
    </div>
  </section>
</template>

<script setup>
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

defineProps({
  filtroCredito: null,
  buscarCliente: String,
  opcionesEstadoCredito: Array
});

defineEmits(['update:filtroCredito', 'update:buscarCliente']);
</script>
