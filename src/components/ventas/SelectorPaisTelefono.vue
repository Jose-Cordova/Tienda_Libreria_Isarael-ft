<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Contenedor unificado del input de teléfono -->
    <div
      class="relative flex items-center w-full bg-white border border-gray-200 rounded-xl transition-all duration-200 focus-within:border-[#003d00] focus-within:ring-2 focus-within:ring-[#003d00]/10 min-h-[52px]"
      :class="{ '!border-red-500 !ring-red-500/10': error }"
    >
      <!-- Selector de país con bandera y código -->
      <Dropdown
        v-model="isoSeleccionado"
        :options="listaPaises"
        optionValue="iso"
        optionLabel="nombre"
        placeholder="País"
        class="w-[125px] sm:w-[135px] shrink-0 border-none shadow-none bg-transparent"
        :panelClass="'selector-pais-panel'"
        filter
        filterPlaceholder="Buscar país o código..."
        :filterFields="['nombre', 'codigo']"
        @change="onPaisChange"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center gap-2 select-none overflow-hidden">
            <span :class="['fi', `fi-${paisActual.iso}`, 'flag-icon shrink-0']"></span>
            <span class="font-bold text-sm text-[#0a3622] shrink-0">{{ paisActual.codigo }}</span>
          </div>
          <span v-else class="text-gray-400 text-sm">País</span>
        </template>
        <template #option="slotProps">
          <div class="flex items-center justify-between gap-3 py-1 w-full text-xs sm:text-sm">
            <div class="flex items-center gap-2.5 min-w-0">
              <span :class="['fi', `fi-${slotProps.option.iso}`, 'flag-icon shrink-0']"></span>
              <span class="font-medium text-gray-700 truncate">{{ slotProps.option.nombre }}</span>
            </div>
            <span class="font-bold text-xs text-[#0a3622] shrink-0 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              {{ slotProps.option.codigo }}
            </span>
          </div>
        </template>
      </Dropdown>

      <!-- Línea divisoria elegante -->
      <div class="h-6 w-[1px] bg-gray-200 shrink-0"></div>

      <!-- Campo de número local -->
      <InputText
        v-model="numeroLocal"
        :placeholder="placeholder"
        class="flex-1 w-full border-none shadow-none rounded-r-xl rounded-l-none p-3.5 sm:p-4 text-sm font-bold text-[#0a3622] placeholder:text-gray-400 placeholder:font-normal outline-none focus:outline-none focus:ring-0 bg-transparent"
        :maxlength="maxLength"
        inputmode="numeric"
        @keydown="soloNumeros"
        @input="formatearNumero"
        @paste="onPaste"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Dropdown, InputText } from '@/utils/primevue';
import { paises } from '@/data/paises';

const props = defineProps({
  modelValue: { type: String, default: '' },
  error: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const listaPaises = paises;
const isoSeleccionado = ref('sv');
const numeroLocal = ref('');

// País seleccionado actualmente
const paisActual = computed(() => {
  return paises.find(p => p.iso === isoSeleccionado.value) || paises.find(p => p.iso === 'sv');
});

const mascara = computed(() => paisActual.value?.mask || '');
const placeholder = computed(() => paisActual.value?.placeholder || '');
const cantidadDigitos = computed(() => (mascara.value.match(/9/g) || []).length || 15);
const maxLength = computed(() => mascara.value.length || 15);

// Aplicar máscara según formato del país
const aplicarMascara = (valor, mask) => {
  if (!mask || !valor) return valor || '';
  const digitos = valor.replace(/\D/g, '').slice(0, cantidadDigitos.value).split('');
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
  return resultado;
};

// 1. Restringir teclado a SOLO NÚMEROS y teclas de control
const soloNumeros = (event) => {
  const permitidas = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Tab',
    'Home',
    'End',
    'Enter'
  ];

  if (permitidas.includes(event.key)) return;

  // Permitir atajos Ctrl/Cmd (A, C, V, X, Z)
  if (event.ctrlKey || event.metaKey) return;

  // Si no es un número del 0 al 9, bloquear inmediatamente
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    return;
  }

  // Si ya se alcanzó la cantidad máxima de dígitos y no hay selección
  const input = event.target;
  const tieneSeleccion = input && input.selectionStart !== input.selectionEnd;
  const digitosActuales = numeroLocal.value.replace(/\D/g, '').length;

  if (!tieneSeleccion && digitosActuales >= cantidadDigitos.value) {
    event.preventDefault();
  }
};

// Interceptar pegado para asegurar que solo ingresen dígitos
const onPaste = (event) => {
  event.preventDefault();
  const clipboardData = event.clipboardData || window.clipboardData;
  const textoPegado = clipboardData ? clipboardData.getData('text') : '';
  const soloDigitos = textoPegado.replace(/\D/g, '').slice(0, cantidadDigitos.value);
  if (soloDigitos) {
    numeroLocal.value = aplicarMascara(soloDigitos, mascara.value);
  }
};

// Formatear al escribir
const formatearNumero = (event) => {
  const mask = mascara.value;
  const rawValue = event.target.value;
  const soloDigitos = rawValue.replace(/\D/g, '').slice(0, cantidadDigitos.value);
  numeroLocal.value = aplicarMascara(soloDigitos, mask);
};

const calcularError = () => {
  const soloDigitos = numeroLocal.value.replace(/\D/g, '');
  if (!soloDigitos) return '';

  if (paisActual.value?.regex && !paisActual.value.regex.test(soloDigitos)) {
    return `Formato incorrecto. Ej: ${paisActual.value.ejemplo}`;
  }
  return '';
};

// Cargar valor entrante (soporta "+503 72802112" o números directos "72802112")
watch(() => props.modelValue, (nuevoValor) => {
  if (!nuevoValor) {
    numeroLocal.value = '';
    return;
  }

  const soloDigitosActual = numeroLocal.value.replace(/\D/g, '');
  const codigoActual = paisActual.value?.codigo || '';
  const completoActual = soloDigitosActual ? `${codigoActual} ${soloDigitosActual}` : '';

  // Evitar sobreescrituras innecesarias si coincide con el valor actual
  if (nuevoValor.trim() === completoActual.trim()) {
    return;
  }

  const partes = nuevoValor.trim().split(/\s+/);
  if (partes.length >= 2) {
    const codigo = partes[0];
    const numero = partes.slice(1).join(' ');
    const paisEncontrado = paises.find(p => p.codigo === codigo);
    if (paisEncontrado) {
      isoSeleccionado.value = paisEncontrado.iso;
      numeroLocal.value = aplicarMascara(numero, paisEncontrado.mask);
      return;
    }
  }

  // Valor sin prefijo de código
  isoSeleccionado.value = 'sv';
  numeroLocal.value = aplicarMascara(nuevoValor.trim(), mascara.value);
}, { immediate: true });

// Emitir código + espacio + dígitos limpios
watch([isoSeleccionado, numeroLocal], () => {
  const soloDigitos = numeroLocal.value.replace(/\D/g, '');
  const completo = soloDigitos ? `${paisActual.value.codigo} ${soloDigitos}` : '';
  emit('update:modelValue', completo);
});

const onPaisChange = () => {
  numeroLocal.value = '';
};

defineExpose({
  validar: () => calcularError() === '' && numeroLocal.value.replace(/\D/g, '').length > 0,
  esElSalvador: () => paisActual.value?.codigo === '+503',
  getError: () => calcularError(),
});
</script>

<style scoped>
:deep(.p-dropdown) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  min-height: 50px !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.p-dropdown:focus),
:deep(.p-dropdown.p-focus) {
  border: none !important;
  box-shadow: none !important;
}

:deep(.p-dropdown-label) {
  padding: 0 0.25rem 0 0.875rem !important;
  display: flex !important;
  align-items: center !important;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}

:deep(.p-dropdown-trigger) {
  width: 1.5rem !important;
  padding-right: 0.5rem !important;
  color: #4b5563 !important;
}

:deep(.p-inputtext) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

:deep(.p-inputtext:focus) {
  border: none !important;
  box-shadow: none !important;
}

.flag-icon {
  width: 1.35rem !important;
  height: 0.95rem !important;
  border-radius: 2px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15) !important;
  display: inline-block !important;
  vertical-align: middle !important;
  background-size: cover !important;
  background-position: center !important;
}
</style>

<style>
.selector-pais-panel {
  min-width: 280px !important;
  max-width: 340px !important;
  border-radius: 16px !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e5e7eb !important;
  overflow: hidden !important;
}

.selector-pais-panel .p-dropdown-filter-container {
  padding: 0.5rem !important;
}

.selector-pais-panel .p-dropdown-filter {
  border-radius: 8px !important;
  padding: 0.5rem 0.75rem !important;
  font-size: 0.8125rem !important;
  border: 1px solid #d1d5db !important;
}

.selector-pais-panel .p-dropdown-items {
  padding: 0.25rem !important;
}

.selector-pais-panel .p-dropdown-item {
  border-radius: 8px !important;
  padding: 0.5rem 0.75rem !important;
  transition: background-color 0.15s ease !important;
}

.selector-pais-panel .p-dropdown-item.p-highlight {
  background-color: #e8f5e9 !important;
  color: #003d00 !important;
}
</style>
