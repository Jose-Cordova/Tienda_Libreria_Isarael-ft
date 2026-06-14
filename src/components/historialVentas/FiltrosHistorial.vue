<template>
  <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
    <div class="flex items-center gap-2 text-[#0a3622]">
      <i class="pi pi-receipt text-2xl text-green-600"></i>
      <h1 class="text-base font-extrabold">Historial de Ventas</h1>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <!-- Estado de venta -->
      <Dropdown
        :modelValue="filtros.estado"
        @update:modelValue="$emit('update:filtros', { ...filtros, estado: $event })"
        :options="estadosVenta"
        placeholder="Todos los estados"
        class="p-dropdown-sm border-gray-500 rounded-lg text-sm text-[#0a3622] w-36 focus:border-green-600"
      />

      <!-- Método de pago -->
      <Dropdown
        :modelValue="filtros.metodo_pago_id"
        @update:modelValue="$emit('update:filtros', { ...filtros, metodo_pago_id: $event })"
        :options="metodosPago"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Todos los métodos"
        class="p-dropdown-sm border-gray-500 rounded-lg text-sm text-[#0a3622] w-40 focus:border-green-600"
      >
        <template #option="slotProps">
          <div class="flex items-center gap-2 text-sm">
            <i :class="slotProps.option.icon || 'pi pi-wallet'" class="text-gray-500"></i>
            <span>{{ slotProps.option.nombre }}</span>
          </div>
        </template>
      </Dropdown>

      <!-- Tipo de cliente -->
      <Dropdown
        :modelValue="filtros.tipoCliente"
        @update:modelValue="$emit('update:filtros', { ...filtros, tipoCliente: $event })"
        :options="tiposCliente"
        placeholder="Todos los tipos"
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

      <!-- Botón Imprimir -->
      <button
        @click="$emit('imprimir')"
        :disabled="generandoReporte"
        class="flex items-center gap-1 px-4 py-2 text-sm font-bold rounded-lg border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Imprimir historial"
      >
        <i :class="generandoReporte ? 'pi pi-spin pi-spinner' : 'pi pi-print'" class="text-xs"></i>
        {{ generandoReporte ? 'Generando...' : 'Imprimir' }}
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
  },
  metodosPago: {
    type: Array,
    default: () => []
  },
  generandoReporte: {
    type: Boolean,
    default: false
  },
});

defineEmits(['update:filtros', 'limpiar']);

const estadosVenta = ['PAGADA', 'CREDITO', 'ANULADA'];
const tiposCliente = ['DETALLES', 'MAYORISTA'];
</script>

<style scoped>
:deep(.p-inputtext), :deep(.p-dropdown), :deep(.p-calendar) {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
}
.p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  font-size: 0.875rem !important;
  padding: 0.5rem 1rem !important;
}
</style>
