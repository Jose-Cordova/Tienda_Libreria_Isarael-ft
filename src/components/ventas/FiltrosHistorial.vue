<template>
  <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
    <div class="flex items-center gap-2 text-[#0a3622]">
      <i class="pi pi-receipt text-2xl"></i>
      <h1 class="text-base font-extrabold">Historial de Ventas</h1>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <!-- Búsqueda -->
      <span class="p-input-icon-left text-xs">
        <i class="pi pi-search text-gray-400" />
        <InputText
          :modelValue="filtros.search"
          @update:modelValue="$emit('update:filtros', { ...filtros, search: $event })"
          placeholder="Buscar #correlativo, producto..."
          class="p-inputtext-sm border-gray-200 focus:border-green-600 w-52 text-xs"
        />
      </span>

      <!-- Método de pago -->
      <Dropdown
        :modelValue="filtros.method"
        @update:modelValue="$emit('update:filtros', { ...filtros, method: $event })"
        :options="metodosPago"
        optionLabel="name"
        placeholder="Todos los métodos"
        class="p-dropdown-sm border-gray-200 text-xs w-44"
      >
        <template #option="slotProps">
          <div class="flex items-center gap-2 text-xs">
            <i :class="slotProps.option.icon" class="text-gray-500"></i>
            <span>{{ slotProps.option.name }}</span>
          </div>
        </template>
      </Dropdown>

      <!-- Tipo de cliente -->
      <Dropdown
        :modelValue="filtros.type"
        @update:modelValue="$emit('update:filtros', { ...filtros, type: $event })"
        :options="tiposCliente"
        optionLabel="name"
        placeholder="Todos los tipos"
        class="p-dropdown-sm border-gray-200 text-xs w-40"
      >
        <template #option="slotProps">
          <div class="flex items-center gap-2 text-xs">
            <i :class="slotProps.option.icon" class="text-gray-500"></i>
            <span>{{ slotProps.option.name }}</span>
          </div>
        </template>
      </Dropdown>

      <!-- Rango de fechas -->
      <div class="flex items-center gap-2">
        <Calendar
          :modelValue="filtros.dateFrom"
          @update:modelValue="$emit('update:filtros', { ...filtros, dateFrom: $event })"
          dateFormat="dd/mm/yy"
          placeholder="Desde"
          showIcon
          class="p-calendar-sm w-32 custom-prime-calendar"
        />
        <Calendar
          :modelValue="filtros.dateTo"
          @update:modelValue="$emit('update:filtros', { ...filtros, dateTo: $event })"
          dateFormat="dd/mm/yy"
          placeholder="Hasta"
          showIcon
          class="p-calendar-sm w-32 custom-prime-calendar"
        />
      </div>

      <!-- Botón Limpiar (mejorado) -->
      <button
        @click="$emit('limpiar')"
        class="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-[#b0c4b0] bg-[#f0f5f0] text-[#2e4a2e] hover:bg-[#e0ebe0] transition-colors"
      >
        <i class="pi pi-filter-slash text-xs"></i>
        Limpiar
      </button>

      <!-- Botón Imprimir (sin función aún) -->
      <button
        disabled
        class="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
        title="Disponible próximamente"
      >
        <i class="pi pi-print text-xs"></i>
        Imprimir
      </button>
    </div>
  </section>
</template>

<script setup>
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';

defineProps({
  filtros: {
    type: Object,
    required: true
  }
});

defineEmits(['update:filtros', 'limpiar']);

const metodosPago = [
  { name: 'Efectivo', value: 1, icon: 'pi pi-money-bill' },
  { name: 'Transferencia', value: 2, icon: 'pi pi-credit-card' }
];

const tiposCliente = [
  { name: 'Detalle', value: 'DETALLES', icon: 'pi pi-tag' },
  { name: 'Mayorista', value: 'MAYORISTA', icon: 'pi pi-box' }
];
</script>

<style scoped>
/* Ajustes para mantener consistencia con el diseño general */
.p-inputtext, .p-dropdown, .p-calendar {
  font-size: 0.75rem !important;
  border-radius: 0.375rem !important;
}

.custom-prime-calendar .p-inputtext {
  background: #f9fafb !important;
}

.p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  font-size: 0.75rem !important;
  padding: 0.5rem 1rem !important;
}
</style>
