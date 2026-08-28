<template>
  <main class="flex-1 bg-[#f4f7f6] p-3 sm:p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">
    <!-- Encabezado -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3 text-left w-full sm:w-auto">
        <i class="pi pi-cog text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Configuración de la Tienda</h1>
      </div>
    </section>

    <!-- Tabla de configuración (una sola fila) -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Nombre de la Tienda</th>
              <th class="py-3 px-5">Teléfono</th>
              <th class="py-3 px-5">Correo Electrónico</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 divide-y divide-gray-100">
            <tr v-if="!cargando" class="hover:bg-gray-50 transition">
              <td class="py-4 px-5 font-bold text-gray-800 text-sm">{{ form.nombre_tienda }}</td>
              <td class="py-4 px-5 font-bold text-gray-800 text-sm">{{ form.telefono }}</td>
              <td class="py-4 px-5 font-bold text-gray-800 text-sm">{{ form.email }}</td>
              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-2">
                  <Button
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-text p-button-sm p-button-warning"
                    @click="activarEdicion"
                  />
                </div>
              </td>
            </tr>
            <tr v-else>
              <td colspan="4" class="py-10 text-center text-gray-400">
                <i class="pi pi-spin pi-spinner text-3xl text-[#0a3622]"></i>
                <p class="mt-2 text-sm">Cargando configuración...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- MODAL: EDITAR CONFIGURACIÓN -->
    <Teleport to="body">
      <div v-if="editando" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4 font-dm-sans">
        <div class="bg-white rounded-[24px] w-[95vw] max-w-2xl shadow-2xl relative overflow-hidden border border-gray-100 overflow-y-auto max-h-[90vh]">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
          <button @click="cancelarEdicion" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
            <i class="pi pi-times text-xl"></i>
          </button>
          <div class="p-8 sm:p-12">
            <div class="mb-4 text-left">
              <h2 class="text-xl font-extrabold text-[#003d00] mb-1">Editar Configuración</h2>
              <p class="text-[15px] text-gray-400 font-medium">Modifique los datos de la tienda</p>
            </div>
            <form @submit.prevent="guardar" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
                <div class="space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Nombre de la Tienda</label>
                  <InputText
                    v-model="form.nombre_tienda"
                    class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-[#003d00] outline-none"
                    placeholder="Ej: Tienda y Librería Israel"
                    :class="{ 'border-red-500': errores.nombre_tienda }"
                  />
                  <small v-if="errores.nombre_tienda" class="text-red-500 text-xs">{{ errores.nombre_tienda }}</small>
                </div>
                <div class="space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Teléfono</label>
                  <InputMask
                    v-model="form.telefono"
                    mask="9999-9999"
                    placeholder="####-####"
                    class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-[#003d00] outline-none"
                    :class="{ 'border-red-500': errores.telefono }"
                  />
                  <small v-if="errores.telefono" class="text-red-500 text-xs">{{ errores.telefono }}</small>
                </div>
                <div class="space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Correo Electrónico</label>
                  <InputText
                    v-model="form.email"
                    class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-[#003d00] outline-none"
                    placeholder="Ej: tienda@israel.com"
                    :class="{ 'border-red-500': errores.email }"
                  />
                  <small v-if="errores.email" class="text-red-500 text-xs">{{ errores.email }}</small>
                </div>
              </div>

              <div class="flex items-center gap-4 mt-10">
                <button
                  type="button"
                  @click="cancelarEdicion"
                  class="px-10 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="guardando"
                  class="flex-1 py-4 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/api';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';

const toast = useToast();

const cargando = ref(true);
const guardando = ref(false);
const editando = ref(false);

const form = reactive({
  nombre_tienda: '',
  telefono: '',
  email: ''
});
const original = reactive({ ...form });
const errores = reactive({
  nombre_tienda: '',
  telefono: '',
  email: ''
});

const cargarConfiguracion = async () => {
  try {
    const { data } = await api.get('/configuracion');
    form.nombre_tienda = data.nombre_tienda || '';
    form.telefono = data.telefono || '';
    form.email = data.email || '';
    Object.assign(original, { ...form });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la configuración.', life: 5000 });
  } finally {
    cargando.value = false;
  }
};

const limpiarErrores = () => {
  errores.nombre_tienda = '';
  errores.telefono = '';
  errores.email = '';
};

const activarEdicion = () => {
  Object.assign(original, { ...form });
  limpiarErrores();
  editando.value = true;
};

const cancelarEdicion = () => {
  Object.assign(form, { ...original });
  limpiarErrores();
  editando.value = false;
};

const guardar = async () => {
  limpiarErrores();
  guardando.value = true;
  try {
    await api.put('/configuracion/1', form);
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración actualizada correctamente.', life: 3500 });
    editando.value = false;
    Object.assign(original, { ...form });
  } catch (error) {
    if (error.response?.status === 422) {
      const { errors } = error.response.data;
      if (errors) {
        for (const key in errors) {
          if (errores.hasOwnProperty(key)) {
            errores[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
          }
        }
      }
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la configuración.', life: 5000 });
    }
  } finally {
    guardando.value = false;
  }
};

onMounted(cargarConfiguracion);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #c6e5d3;
  border-radius: 10px;
}
</style>
