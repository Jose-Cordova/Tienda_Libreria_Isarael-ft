<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative">

    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div class="flex items-center gap-3">
        <i class="pi pi-bookmark text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Marcas</h1>
      </div>

      <Button
        label="Nueva"
        icon="pi pi-plus"
        class="p-button-sm font-bold text-sm bg-[#0a3622] hover:bg-[#115033] text-white border-none shadow-sm"
        @click="mostrarModal = true"
      />
    </section>

    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#c6e5d3] text-[#0a3622] text-[11px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5 w-4/5">Nombre</th>
              <th class="py-3 px-5 text-center w-1/5">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-xs text-gray-700 divide-y divide-gray-100">

            <tr v-for="marca in marcas" :key="marca.id" class="hover:bg-gray-50 transition">
              <td class="py-4 px-5 font-bold text-[#0a3622] text-sm">{{ marca.nombre }}</td>

              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-1">
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" />
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger" />
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </section>

    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm p-4"
    >
      <div class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden">

        <div class="absolute top-0 left-0 w-full h-3 bg-[#0a3622]"></div>

        <button
          @click="mostrarModal = false"
          class="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
        >
          <i class="pi pi-times text-lg"></i>
        </button>

        <div class="p-8 pt-10 text-center">
          <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">Nueva Marca</h2>
          <p class="text-[11px] text-gray-400 font-medium mb-6">Define el nombre de la marca</p>

          <div class="text-left space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre</label>
              <InputText
                type="text"
                placeholder="Ej: Coca-Cola"
                class="w-full border border-gray-200 rounded-lg text-sm text-[#0a3622]"
              />
            </div>
          </div>

          <div class="flex items-center gap-3 mt-8">
            <Button
              label="Cancelar"
              class="p-button-outlined p-button-secondary flex-1 py-2.5 rounded-full text-sm font-extrabold"
              @click="mostrarModal = false"
            />
            <Button
              label="Guardar"
              class="flex-1 py-2.5 bg-[#0a3622] hover:bg-[#115033] text-white border-none rounded-full text-sm font-extrabold shadow-md"
              @click="mostrarModal = false"
            />
          </div>
        </div>

      </div>
    </div>

  </main>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

// Controla la visibilidad del modal
const mostrarModal = ref(false);

// Datos limpios de la tabla (sin categoría)
const marcas = ref([
  { id: 1, nombre: 'Coca-Cola' },
  { id: 2, nombre: 'Diana' },
  { id: 3, nombre: 'Colgate' },
  { id: 4, nombre: 'Bic' },
  { id: 5, nombre: 'Sin marca' }
]);
</script>

<style scoped>
/* Integración de fuentes para componentes PrimeVue */
.p-inputtext {
  font-size: 0.875rem !important; /* text-sm */
  font-weight: 600 !important;
}

/* Scrollbar estético para la tabla principal */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #c6e5d3;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
