<template>
  <Dialog
    :header="esEdicion ? 'Editar Cliente Crédito' : 'Nuevo Cliente Crédito'"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :modal="true"
    :closable="false"
    class="w-full max-w-md"
    appendTo="body"
  >
    <div class="flex flex-col gap-4">
      <!-- Nombre -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Nombre <span class="text-red-500">*</span></label>
        <InputText
          v-model="form.nombre"
          placeholder="Nombre completo"
          maxlength="50"
          :class="{ 'p-invalid': errores.nombre }"
        />
        <small v-if="errores.nombre" class="text-red-500">{{ errores.nombre }}</small>
      </div>

      <!-- DUI -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">DUI <span class="text-gray-400">(opcional)</span></label>
        <InputText
          v-model="form.dui"
          @keypress="bloquearCaracteresDui"
          @paste="bloquearPegadoDui"
          placeholder="12345678-9"
          maxlength="10"
          :class="{ 'p-invalid': errores.dui }"
        />
        <small v-if="errores.dui" class="text-red-500">{{ errores.dui }}</small>
      </div>

      <!-- Teléfono -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Teléfono <span class="text-gray-400">(opcional)</span></label>
        <SelectorPaisTelefono ref="selectorTelefono" v-model="form.telefono" />
        <small v-if="errores.telefono" class="text-red-500">{{ errores.telefono }}</small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" @click="cerrarModal" />
        <Button :label="esEdicion ? 'Actualizar Cliente' : 'Guardar Cliente'" @click="guardarCliente" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { Dialog, Button, InputText } from '@/utils/primevue';
import SelectorPaisTelefono from '../ventas/SelectorPaisTelefono.vue';

const props = defineProps({
  visible: Boolean,
  cliente: { type: Object, default: null }
});

const emit = defineEmits(['update:visible', 'clienteGuardado']);

const form = ref({
  id: null,
  nombre: '',
  dui: '',
  telefono: ''
});

const errores = ref({
  nombre: '',
  dui: '',
  telefono: ''
});

const selectorTelefono = ref(null);

const esEdicion = computed(() => !!form.value.id);

// ✅ Función que carga los datos del cliente al formulario
const cargarDatosCliente = () => {
  if (props.cliente) {
    form.value = {
      id: props.cliente.id || null,
      nombre: props.cliente.nombre || '',
      dui: props.cliente.dui || '',
      telefono: props.cliente.telefono || ''
    };
  } else {
    form.value = { id: null, nombre: '', dui: '', telefono: '' };
  }
  errores.value = { nombre: '', dui: '', telefono: '' };

  nextTick(() => {
    if (selectorTelefono.value) {
      selectorTelefono.value.$forceUpdate?.();
    }
  });
};

onMounted(() => {
  cargarDatosCliente();
});

watch(() => props.cliente, (nuevo) => {
  if (props.visible && nuevo) {
    cargarDatosCliente();
  }
}, { deep: true, immediate: true });

// --- Watcher para filtrar el nombre (solo letras y espacios) ---
watch(() => form.value.nombre, (val) => {
  if (!val) return;
  const limpio = val.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  if (limpio !== val) {
    form.value.nombre = limpio;
  }
});

// --- Watcher DUI: guion automático ---
watch(() => form.value.dui, (val) => {
  if (!val) return;
  let soloDigitos = val.replace(/\D/g, '');
  if (soloDigitos.length > 9) {
    soloDigitos = soloDigitos.slice(0, 9);
  }
  let formateado = soloDigitos;
  if (soloDigitos.length >= 9) {
    formateado = soloDigitos.slice(0, 8) + '-' + soloDigitos.slice(8, 9);
  } else if (soloDigitos.length > 8) {
    formateado = soloDigitos.slice(0, 8) + '-' + soloDigitos.slice(8);
  }
  if (val !== formateado) {
    form.value.dui = formateado;
  }
});

// --- Validaciones ---
const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const validarFormatoDUI = (dui) => /^\d{8}-\d{1}$/.test(dui);

const validarDuiLocal = (dui) => {
  if (!validarFormatoDUI(dui)) return false;

  const soloDigitos = dui.replace('-', '');
  if (/^0+$/.test(soloDigitos)) return false;

  const digitos = dui.replace('-', '').split('').map(Number);
  const factores = [9, 8, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 8; i++) {
    suma += digitos[i] * factores[i];
  }

  const residuo = suma % 10;
  const digitoCalculado = (10 - residuo) % 10;

  return digitos[8] === digitoCalculado;
};

// ✅ Bloquear caracteres no numéricos al presionar la tecla
const bloquearCaracteresDui = (event) => {
  // Permitir teclas especiales (Backspace, Delete, Tab, flechas, etc.)
  const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'];
  if (teclasPermitidas.includes(event.key)) return;

  // Permitir Ctrl+C, Ctrl+V, Ctrl+A, etc.
  if (event.ctrlKey || event.metaKey) return;

  // Solo permitir dígitos del 0 al 9
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
  }
};

// ✅ Bloquear pegado de caracteres no numéricos
const bloquearPegadoDui = (event) => {
  event.preventDefault();
  const textoPegado = (event.clipboardData || window.clipboardData).getData('text');
  // Limpiar todo lo que no sea dígito
  const soloDigitos = textoPegado.replace(/\D/g, '');
  // insertar solo los dígitos en el input
  if (soloDigitos) {
    const actual = form.value.dui.replace(/\D/g, '');
    const combinado = (actual + soloDigitos).slice(0, 9);
    form.value.dui = combinado;
  }
};

const validarFormulario = () => {
  errores.value.nombre = '';
  errores.value.dui = '';
  errores.value.telefono = '';

  if (!form.value.nombre.trim()) {
    errores.value.nombre = 'El nombre es obligatorio.';
  } else if (!regexNombre.test(form.value.nombre.trim())) {
    errores.value.nombre = 'Solo letras, espacios y acentos.';
  } else if (form.value.nombre.trim().length > 50) {
    errores.value.nombre = 'Máximo 50 caracteres.';
  }

  if (form.value.dui.trim() !== '') {
    if (!validarFormatoDUI(form.value.dui)) {
      errores.value.dui = 'Formato inválido. Ejemplo correcto: 12345678-9.';
    } else if (!validarDuiLocal(form.value.dui)) {
      errores.value.dui = 'DUI inválido. El dígito verificador no coincide. Ejemplo válido: 00016297-5.';
    }
  }

  if (form.value.telefono.trim() !== '') {
    const telefonoEsValido = selectorTelefono.value?.validar() ?? false;
    if (!telefonoEsValido) {
      const errorSelector = selectorTelefono.value?.getError();
      errores.value.telefono = errorSelector || 'Teléfono inválido. Formato correcto: +503 7123 4567 (móvil) o +503 2234 5678 (fijo).';
    }
  }

  return !errores.value.nombre && !errores.value.dui && !errores.value.telefono;
};

const guardarCliente = () => {
  if (!validarFormulario()) return;

  const payload = {
    nombre: form.value.nombre.trim(),
    dui: form.value.dui.trim() || null,
    telefono: form.value.telefono.trim() || null
  };

  if (props.cliente?.id) {
    payload.id = props.cliente.id;
  }

  emit('clienteGuardado', payload);
};

const cerrarModal = () => {
  emit('update:visible', false);
};
</script>
