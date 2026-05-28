<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide border',
      badgeClass
    ]"
  >
    <i :class="icon" class="text-sm"></i>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  estado: { type: String, required: true }
});

const stateMap = {
  PAGADO: {
    class: 'bg-green-50 text-green-700 border-green-200',
    icon: 'pi pi-check-circle',
    label: 'PAGADO'
  },
  PENDIENTE: {
    class: 'bg-red-50 text-red-600 border-red-200',
    icon: 'pi pi-hourglass',
    label: 'PENDIENTE'
  },
  ANULADO: {
    class: 'bg-gray-50 text-gray-500 border-gray-200',
    icon: 'pi pi-ban',
    label: 'ANULADO'
  },
  'CON DEUDA': {
    class: 'bg-red-50 text-red-600 border-red-200',
    icon: 'pi pi-hourglass',
    label: 'CON DEUDA'
  },
  'SIN DEUDA': {
    class: 'bg-green-50 text-green-700 border-green-200',
    icon: 'pi pi-check-circle',
    label: 'SIN DEUDA'
  }
};

const badgeClass = computed(() => stateMap[props.estado]?.class || '');
const icon = computed(() => stateMap[props.estado]?.icon || '');
const label = computed(() => stateMap[props.estado]?.label || props.estado);
</script>
