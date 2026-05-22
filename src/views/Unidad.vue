<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">

    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-shop shadow-shop mb-6 border border-shop-border">
      <div class="flex items-center gap-3">
        <i class="pi pi-sliders-h text-xl text-shop-accent"></i>
        <h1 class="text-lg font-extrabold text-shop-green-deep">Unidades de Medida</h1>
      </div>

      <Button
        label="Nueva"
        icon="pi pi-plus"
        class="p-button-sm font-bold text-sm bg-shop-green-deep hover:bg-shop-green-dark text-white border-none shadow-shop"
        @click="mostrarModal = true"
      />
    </section>

    <section class="bg-white rounded-shop shadow-shop overflow-hidden border border-shop-border">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-shop-green-pale text-shop-green-deep text-[11px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5 w-1/2">Nombre</th>
              <th class="py-3 px-5 text-center w-1/4">Equivalencia (base)</th>
              <th class="py-3 px-5 text-center w-1/4">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-xs text-gray-700 divide-y divide-gray-100">

            <tr v-for="unidad in unidades" :key="unidad.id" class="hover:bg-shop-surface-2 transition">
              <td class="py-4 px-5 font-bold text-shop-green-deep text-sm">{{ unidad.nombre }}</td>

              <td class="py-4 px-5 text-center">
                <span class="bg-shop-green-pale text-shop-green px-3 py-1 rounded-shop-sm text-[11px] font-extrabold tracking-wide border border-shop-border">
                  {{ unidad.equivalencia }} u.
                </span>
              </td>

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

    <!-- Modal para Nueva Unidad -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm p-4"
    >
      <div class="bg-white rounded-shop w-full max-w-sm shadow-shop-lg relative overflow-hidden">

        <div class="absolute top-0 left-0 w-full h-2 bg-shop-green-deep"></div>

        <button
          @click="mostrarModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-shop-green-deep transition"
        >
          <i class="pi pi-times text-lg"></i>
        </button>

        <div class="p-8 pt-10 text-center">
          <h2 class="text-xl font-extrabold text-shop-green-deep mb-1">Nueva Unidad</h2>
          <p class="text-[11px] text-gray-400 font-medium mb-6">Define nombre y equivalencia a la unidad base</p>

          <div class="text-left space-y-4">

            <div>
              <label class="block text-[10px] font-bold text-shop-text-2 uppercase tracking-widest mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Ej: Docena"
                class="w-full bg-shop-bg border-none rounded-shop-sm px-4 py-2.5 text-sm font-semibold text-shop-green-deep focus:outline-none focus:ring-2 focus:ring-shop-accent placeholder-gray-400"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-shop-text-2 uppercase tracking-widest mb-1">Equivalencia (Unidades)</label>
              <input
                type="number"
                placeholder="Ej: 12"
                class="w-full bg-shop-bg border-none rounded-shop-sm px-4 py-2.5 text-sm font-semibold text-shop-green-deep focus:outline-none focus:ring-2 focus:ring-shop-accent placeholder-gray-400"
              />
            </div>

          </div>

          <div class="flex items-center gap-3 mt-8">
            <Button
              label="Cancelar"
              class="p-button-outlined p-button-secondary flex-1 py-2.5 rounded-full text-xs font-extrabold"
              @click="mostrarModal = false"
            />
            <Button
              label="Guardar"
              class="flex-1 py-2.5 bg-shop-green-deep hover:bg-shop-green-dark text-white border-none rounded-full text-xs font-extrabold shadow-md"
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

// Controla la visibilidad del modal
const mostrarModal = ref(false);

// Datos quemados para simular la tabla
const unidades = ref([
  { id: 1, nombre: 'Unidad', equivalencia: 1 },
  { id: 2, nombre: 'Docena', equivalencia: 12 },
  { id: 3, nombre: 'Resma', equivalencia: 500 },
  { id: 4, nombre: 'Caja x24', equivalencia: 24 },
  { id: 5, nombre: 'Tira x12', equivalencia: 12 },
  { id: 6, nombre: 'Pack x6', equivalencia: 6 }
]);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: theme('colors.shop.border');
  border-radius: 10px;
}
</style>
