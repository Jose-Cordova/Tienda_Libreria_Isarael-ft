<template>
  <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
    <div class="flex items-center gap-2 text-[#0a3622]">
      <i class="pi pi-replay text-2xl text-green-600"></i>
      <h1 class="text-base font-extrabold">Devoluciones de Ventas</h1>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <!-- Estado de devolución -->
      <Dropdown
        :modelValue="filtros.estado"
        @update:modelValue="$emit('update:filtros', { ...filtros, estado: $event })"
        :options="estadosDevolucion"
        placeholder="Todos los estados"
        class="p-dropdown-sm border-gray-500 rounded-lg text-sm text-[#0a3622] w-36 focus:border-green-600"
      />

      <!-- Rango de fechas -->
      <div class="flex items-center gap-2">
        <Calendar
          :modelValue="filtros.fecha_inicio"
          @update:modelValue="$emit('update:filtros', { ...filtros, fecha_inicio: $event })"
          dateFormat="dd/mm/yy"
          placeholder="Desde"
          showIcon
          class="p-calendar-sm w-32 border-gray-500 rounded-lg focus:border-green-600"
        />
        <Calendar
          :modelValue="filtros.fecha_fin"
          @update:modelValue="$emit('update:filtros', { ...filtros, fecha_fin: $event })"
          dateFormat="dd/mm/yy"
          placeholder="Hasta"
          showIcon
          class="p-calendar-sm w-32 border-gray-500 rounded-lg focus:border-green-600"
        />
      </div>

      <!-- Botón Limpiar -->
      <button
        @click="$emit('limpiar')"
        class="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg border border-[#b0c4b0] bg-[#f0f5f0] text-[#2e4a2e] hover:bg-[#e0ebe0] transition-colors"
      >
        <i class="pi pi-filter-slash text-xs"></i>
        Limpiar
      </button>
    </div>
  </section>
</template>

<script setup>
import { Dropdown, Calendar } from '@/utils/primevue';

defineProps({
  filtros: {
    type: Object,
    required: true
  }
});

defineEmits(['update:filtros', 'limpiar']);

const estadosDevolucion = ['DEVUELTA', 'ANULADA'];
</script>

<style scoped>
:deep(.p-inputtext), :deep(.p-dropdown), :deep(.p-calendar) {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
}
</style>
