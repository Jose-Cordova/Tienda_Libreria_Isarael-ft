<template>
  <div :class="['w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border', colorClass]">
    {{ initials }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  nombre: { type: String, required: true }
});

const initials = computed(() => {
  return props.nombre
    .split(' ')
    .map(w => w.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
});

const colorPalette = [
  'bg-pink-200 text-pink-700 border-pink-300',
  'bg-blue-200 text-blue-700 border-blue-300',
  'bg-orange-200 text-orange-700 border-orange-300',
  'bg-purple-200 text-purple-700 border-purple-300',
  'bg-teal-200 text-teal-700 border-teal-300',
  'bg-indigo-200 text-indigo-700 border-indigo-300'
];

const colorClass = computed(() => {
  let hash = 0;
  for (let i = 0; i < props.nombre.length; i++) {
    hash = props.nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
});
</script>
