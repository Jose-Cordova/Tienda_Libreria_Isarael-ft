<template>
  <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
    <div class="flex items-center gap-3">
      <i class="pi pi-credit-card text-xl text-green-600"></i>
      <h1 class="text-lg font-extrabold text-[#0a3622]">Crédito/Fiados</h1>
    </div>

    <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      <Dropdown
        :modelValue="filtroCredito"
        @update:modelValue="$emit('update:filtroCredito', $event)"
        :options="opcionesEstadoCredito"
        optionLabel="label"
        placeholder="Todos los créditos"
        class="p-dropdown-sm border-gray-500 rounded-lg text-sm text-[#0a3622] w-full sm:w-48 focus:border-green-600"
      />

      <span class="relative w-full sm:w-56">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
        <InputText
          :modelValue="buscarCliente"
          @update:modelValue="$emit('update:buscarCliente', $event)"
          placeholder="Buscar cliente..."
          class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-full focus:border-green-600"
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
