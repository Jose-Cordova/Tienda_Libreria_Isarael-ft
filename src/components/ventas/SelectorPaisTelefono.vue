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
        @change="onCodigoChange"
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

      <!-- Campo de número -->
      <InputText
        v-model="numeroLocal"
        :placeholder="placeholder"
        class="w-2/3 border-l-0 rounded-l-none"
        :maxlength="maxLength"
        @input="formatearNumero"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Dropdown, InputText } from '@/utils/primevue';
import { paises } from '@/data/paises';

const props = defineProps({
  modelValue: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);

const listaPaises = paises;
const codigoSeleccionado = ref(paises.find(p => p.iso === 'sv').codigo);
const numeroLocal = ref('');

const obtenerPais = (codigo) => paises.find(p => p.codigo === codigo) || paises.find(p => p.iso === 'sv');
const paisActual = computed(() => obtenerPais(codigoSeleccionado.value));
const mascara = computed(() => paisActual.value?.mask || '');
const placeholder = computed(() => paisActual.value?.placeholder || '');

const cantidadDigitos = computed(() => (mascara.value.match(/9/g) || []).length);
const maxLength = computed(() => mascara.value.length);

const formatearNumero = (event) => {
  const mask = mascara.value;
  if (!mask) {
    numeroLocal.value = event.target.value.replace(/\D/g, '').slice(0, cantidadDigitos.value);
    return;
  }

  const digitos = event.target.value.replace(/\D/g, '').slice(0, cantidadDigitos.value).split('');
  let resultado = '';
  let indiceDigito = 0;

  for (let i = 0; i < mask.length; i++) {
    if (indiceDigito >= digitos.length) break;
    const char = mask[i];
    if (char === '9') {
      resultado += digitos[indiceDigito];
      indiceDigito++;
    } else {
      resultado += char;
    }
  }

  numeroLocal.value = resultado;
};

const calcularError = () => {
  const soloDigitos = numeroLocal.value.replace(/\D/g, '');
  if (!soloDigitos) return '';

  if (!paisActual.value.regex.test(soloDigitos)) {
    return `Formato incorrecto. Ej: ${paisActual.value.ejemplo}`;
  }
  return '';
};

// ✅ Cargar el valor existente al montar o cuando cambie modelValue
watch(() => props.modelValue, (nuevoValor) => {
  if (nuevoValor) {
    const partes = nuevoValor.trim().split(/\s+/);
    if (partes.length >= 2) {
      const codigo = partes[0];
      const numero = partes.slice(1).join(' ');
      const paisEncontrado = paises.find(p => p.codigo === codigo);
      if (paisEncontrado) {
        codigoSeleccionado.value = codigo;
        numeroLocal.value = numero;
      } else {
        numeroLocal.value = '';
      }
    } else {
      numeroLocal.value = nuevoValor.trim();
    }
  } else {
    numeroLocal.value = '';
  }
}, { immediate: true });

// Emitir código + espacio + dígitos limpios
watch([codigoSeleccionado, numeroLocal], ([codigo, numero]) => {
  const soloDigitos = numero.replace(/\D/g, '');
  const completo = soloDigitos ? `${codigo} ${soloDigitos}` : '';
  emit('update:modelValue', completo);
});

const onCodigoChange = () => {
  numeroLocal.value = '';
};

defineExpose({
  validar: () => calcularError() === '' && numeroLocal.value.replace(/\D/g, '').length > 0,
  esElSalvador: () => codigoSeleccionado.value === '+503',
  getError: () => calcularError(),
});
</script>
