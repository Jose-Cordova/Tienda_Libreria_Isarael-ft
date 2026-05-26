<template>
  <div class="flex flex-col gap-1">
    <div class="flex items-stretch">
      <!-- Selector de país -->
      <Dropdown
        v-model="codigoSeleccionado"
        :options="listaPaises"
        optionValue="codigo"
        placeholder="Código"
        class="w-1/3"
        :class="{ 'p-invalid': error }"
      >
        <template #value="slotProps">
          <span v-if="slotProps.value" class="flex items-center gap-2">
            <span :class="`fi fi-${obtenerPais(slotProps.value).iso}`"></span>
            {{ slotProps.value }}
          </span>
          <span v-else class="text-gray-400">Código</span>
        </template>
        <template #option="slotProps">
          <div class="flex items-center gap-2">
            <span :class="`fi fi-${slotProps.option.iso}`"></span>
            <span>{{ slotProps.option.nombre }}</span>
            <span class="text-gray-500">{{ slotProps.option.codigo }}</span>
          </div>
        </template>
      </Dropdown>

      <!-- Campo de número con máscara -->
      <InputMask
        v-model="numeroLocal"
        :mask="mascara"
        :placeholder="placeholder"
        class="w-2/3 border-l-0 rounded-l-none"
        :class="{ 'p-invalid': error }"
      />
    </div>
    <small v-if="error" class="text-red-500 mt-1">{{ error }}</small>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Dropdown, InputMask } from '@/utils/primevue';
import { paises } from '@/data/paises';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const listaPaises = paises;
// País por defecto: El Salvador (+503)
const codigoSeleccionado = ref(paises.find(p => p.iso === 'sv').codigo);
const numeroLocal = ref('');

const obtenerPais = (codigo) => paises.find(p => p.codigo === codigo) || paises.find(p => p.iso === 'sv');

const paisActual = computed(() => obtenerPais(codigoSeleccionado.value));

const mascara = computed(() => paisActual.value?.mask || '');
const placeholder = computed(() => paisActual.value?.placeholder || '');

// Validación: comparar dígitos limpios con el regex del país
const error = computed(() => {
  const soloDigitos = numeroLocal.value.replace(/\D/g, '');
  if (!soloDigitos) return '';
  if (!paisActual.value.regex.test(soloDigitos))
    return `Formato incorrecto. Ej: ${paisActual.value.ejemplo}`;
  return '';
});

// Emitir código + dígitos limpios (sin formato)
watch([codigoSeleccionado, numeroLocal], ([codigo, numero]) => {
  const soloDigitos = numero.replace(/\D/g, '');
  const completo = soloDigitos ? codigo + soloDigitos : '';
  emit('update:modelValue', completo);
});

defineExpose({ validar: () => error.value === '' && numeroLocal.value.replace(/\D/g, '').length > 0 });
</script>
