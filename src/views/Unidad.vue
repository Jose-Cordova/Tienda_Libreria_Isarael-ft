<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative">

    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div class="flex items-center gap-3">
        <span class="text-xl">📏</span>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Unidades de Medida</h1>
      </div>

      <button
        @click="mostrarModal = true"
        class="bg-[#0a3622] hover:bg-[#115033] text-white px-5 py-2 rounded-md font-bold transition shadow-sm flex items-center gap-2 text-sm"
      >
        <span class="text-lg">+</span> Nueva
      </button>
    </section>

    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#c6e5d3] text-[#0a3622] text-[11px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5 w-1/2">Nombre</th>
              <th class="py-3 px-5 text-center w-1/4">Equivalencia (base)</th>
              <th class="py-3 px-5 text-center w-1/4">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-xs text-gray-700 divide-y divide-gray-100">

            <tr v-for="unidad in unidades" :key="unidad.id" class="hover:bg-gray-50 transition">
              <td class="py-4 px-5 font-bold text-[#0a3622] text-sm">{{ unidad.nombre }}</td>

              <td class="py-4 px-5 text-center">
                <span class="bg-green-50 text-green-700 px-3 py-1 rounded-md text-[11px] font-extrabold tracking-wide border border-green-100">
                  {{ unidad.equivalencia }} u.
                </span>
              </td>

              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-2">
                  <button class="w-8 h-8 bg-orange-50 rounded flex items-center justify-center hover:bg-orange-100 transition border border-orange-100 shadow-sm text-sm">
                    ✏️
                  </button>
                  <button class="w-8 h-8 bg-red-50 rounded flex items-center justify-center hover:bg-red-100 transition border border-red-100 shadow-sm text-sm">
                    🗑️
                  </button>
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
          <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">Nueva Unidad</h2>
          <p class="text-[11px] text-gray-400 font-medium mb-6">Define nombre y equivalencia a la unidad base</p>

          <div class="text-left space-y-4">

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Ej: Docena"
                class="w-full bg-[#e8f5e9] border-none rounded-lg px-4 py-2.5 text-sm font-semibold text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-500"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Equivalencia (Unidades)</label>
              <input
                type="number"
                placeholder="Ej: 12"
                class="w-full bg-[#e8f5e9] border-none rounded-lg px-4 py-2.5 text-sm font-semibold text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-500"
              />
            </div>

          </div>

          <div class="flex items-center gap-3 mt-8">
            <button
              @click="mostrarModal = false"
              class="flex-1 py-2.5 border-2 border-[#c6e5d3] bg-[#e8f5e9] text-[#0a3622] rounded-full text-sm font-extrabold hover:bg-[#c6e5d3] transition"
            >
              Cancelar
            </button>
            <button
              @click="mostrarModal = false"
              class="flex-1 py-2.5 bg-[#0a3622] text-white rounded-full text-sm font-extrabold hover:bg-[#115033] shadow-md transition"
            >
              Guardar
            </button>
          </div>
        </div>

      </div>
    </div>

  </main>
</template>

<script setup>
import { ref } from 'vue';

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
