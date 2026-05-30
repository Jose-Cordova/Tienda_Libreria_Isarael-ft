<template>
  <Dialog
    header="Datos del Cliente Crédito"
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
          :value="form.nombre"
          @input="filtrarNombre($event)"
          placeholder="Nombre completo"
          maxlength="50"
          :class="{ 'p-invalid': errores.nombre }"
        />
        <small v-if="errores.nombre" class="text-red-500">{{ errores.nombre }}</small>
      </div>

      <!-- DUI -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">DUI <span class="text-red-500">*</span></label>
        <InputText
          v-model="form.dui"
          placeholder="12345678-9"
          maxlength="10"
          :class="{ 'p-invalid': errores.dui }"
        />
        <small v-if="errores.dui" class="text-red-500">{{ errores.dui }}</small>
      </div>

      <!-- Teléfono -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">Teléfono <span class="text-red-500">*</span></label>
        <SelectorPaisTelefono v-model="form.telefono" />
        <small v-if="errores.telefono" class="text-red-500">{{ errores.telefono }}</small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancelar" severity="secondary" @click="cerrarModal" />
        <Button label="Guardar Cliente" @click="guardarCliente" :disabled="!formularioValido" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Dialog, Button, InputText } from '@/utils/primevue';
import SelectorPaisTelefono from './SelectorPaisTelefono.vue';

const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['update:visible', 'clienteGuardado']);

const form = ref({
  nombre: '',
  dui: '',
  telefono: ''
});

const errores = ref({
  nombre: '',
  dui: '',
  telefono: ''
});

// --- Filtro de nombre: solo letras (incluyendo acentos y ñ) y espacios ---
const filtrarNombre = (event) => {
  const valor = event.target.value;
  // Eliminar cualquier carácter que no sea letra (con acentos/ñ) o espacio
  const limpio = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
  // Actualizar el modelo reactivo
  form.value.nombre = limpio;
  // Actualizar el valor nativo del input para evitar que se muestre el carácter no deseado
  event.target.value = limpio;
};

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
const validarDUI = (dui) => /^\d{8}-\d{1}$/.test(dui);

const formularioValido = computed(() => {
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

  if (!validarDUI(form.value.dui)) {
    errores.value.dui = 'Formato inválido. Ej: 12345678-9';
  }

  if (!form.value.telefono) {
    errores.value.telefono = 'El teléfono es obligatorio.';
  }

  return !errores.value.nombre && !errores.value.dui && !errores.value.telefono;
});

const guardarCliente = () => {
  if (formularioValido.value) {
    emit('clienteGuardado', {
      nombre: form.value.nombre.trim(),
      dui: form.value.dui.trim(),
      telefono: form.value.telefono.trim()
    });
    cerrarModal();
  }
};

const cerrarModal = () => {
  form.value = { nombre: '', dui: '', telefono: '' };
  errores.value = { nombre: '', dui: '', telefono: '' };
  emit('update:visible', false);
};

watch(() => props.visible, (nuevoValor) => {
  if (nuevoValor) {
    form.value = { nombre: '', dui: '', telefono: '' };
    errores.value = { nombre: '', dui: '', telefono: '' };
  }
});
</script>
