<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative">

    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">

      <div class="flex items-center gap-3">
        <i class="pi pi-credit-card text-xl text-blue-500"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Crédito/Fiados</h1>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span class="p-input-icon-left text-xs">
          <i class="pi pi-search text-gray-400" />
          <InputText
            v-model="buscarCliente"
            placeholder="Buscar cliente..."
            class="p-inputtext-sm border-gray-200 focus:border-green-600 w-48 text-xs"
          />
        </span>

        <Dropdown
          v-model="filtroCliente"
          :options="clientesOptions"
          optionLabel="label"
          placeholder="Todos los clientes"
          class="p-dropdown-sm border-gray-200 text-xs w-48"
        />

        <Button
          label="Nuevo cliente"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-xs bg-[#0a3622] hover:bg-[#115033] text-white border-none shadow-sm"
          @click="mostrarModal = true"
        />
      </div>
    </section>

    <section class="grid grid-cols-4 gap-4 mb-6">

      <div class="bg-white border border-red-600 border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
        <p class="text-[12px] font-bold text-red-700 uppercase tracking-wider mb-0.5">SALDO PENDIENTE TOTAL</p>
        <p class="text-3xl font-extrabold text-red-600 leading-none my-1">$14.50</p>
        <p class="text-[12px] text-gray-400 font-medium">en todos los créditos</p>
      </div>

      <div class="bg-white border border-orange-400 border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
        <p class="text-[12px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">CLIENTES CON DEUDAS</p>
        <p class="text-3xl font-extrabold text-orange-400 leading-none my-1">2</p>
        <p class="text-[12px] text-gray-400 font-medium">pendiente</p>
      </div>

      <div class="bg-white border border-[#0a3622] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
        <p class="text-[12px] font-bold text-[#145a32] uppercase tracking-wider mb-0.5">TOTAL ABONADO</p>
        <p class="text-3xl font-extrabold text-[#0a3622] leading-none my-1">$17.50</p>
        <p class="text-[12px] text-gray-400 font-medium">recuperado</p>
      </div>

      <div class="bg-white border border-gray-800 border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
        <p class="text-[12px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">TOTAL CLIENTE</p>
        <p class="text-3xl font-extrabold text-gray-800 leading-none my-1">3</p>
        <p class="text-[12px] text-gray-400 font-medium">Registrado</p>
      </div>

    </section>

    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#c6e5d3] text-[#0a3622] text-[11px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Cliente</th>
              <th class="py-3 px-5">Teléfono</th>
              <th class="py-3 px-5 text-center">Créditos activos</th>
              <th class="py-3 px-5 text-center">Total deuda</th>
              <th class="py-3 px-5 text-center">Total abono</th>
              <th class="py-3 px-5 text-center">Estado</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-xs text-gray-700 divide-y divide-gray-100">

            <tr class="hover:bg-gray-50 transition">
              <td class="py-3 px-5 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center font-bold text-xs border border-pink-300">
                  ML
                </div>
                <span class="font-bold text-[#0a3622]">María López</span>
              </td>
              <td class="py-3 px-5 font-medium text-gray-500">7890-1234</td>
              <td class="py-3 px-5 text-center">
                <span class="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide">2 activos</span>
              </td>
              <td class="py-3 px-5 text-center font-bold text-red-600">$8.25</td>
              <td class="py-3 px-5 text-center font-bold text-green-700">$5.00</td>
              <td class="py-3 px-5 text-center">
                <span class="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center justify-center gap-1 w-24 mx-auto">
                  <i class="pi pi-hourglass text-[8px]"></i> CON DEUDA
                </span>
              </td>
              <td class="py-3 px-5">
                <div class="flex items-center justify-center gap-2">
                  <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm p-button-info" />
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" />
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger" />
                </div>
              </td>
            </tr>

            <tr class="hover:bg-gray-50 transition">
              <td class="py-3 px-5 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-xs border border-green-300">
                  CR
                </div>
                <span class="font-bold text-[#0a3622]">Carlos Rivas</span>
              </td>
              <td class="py-3 px-5 font-medium text-gray-500">7654-3210</td>
              <td class="py-3 px-5 text-center font-medium text-gray-500">0 activos</td>
              <td class="py-3 px-5 text-center font-bold text-gray-400">-</td>
              <td class="py-3 px-5 text-center font-bold text-[#0a3622]">$12.50</td>
              <td class="py-3 px-5 text-center">
                <span class="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center justify-center gap-1 w-24 mx-auto">
                  <i class="pi pi-check text-[8px]"></i> AL DÍA
                </span>
              </td>
              <td class="py-3 px-5">
                <div class="flex items-center justify-center gap-2">
                  <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm p-button-info" />
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" />
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger" />
                </div>
              </td>
            </tr>

            <tr class="hover:bg-gray-50 transition">
              <td class="py-3 px-5 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-xs border border-red-300">
                  AG
                </div>
                <span class="font-bold text-[#0a3622]">Ana González</span>
              </td>
              <td class="py-3 px-5 font-medium text-gray-500">7890-1234</td>
              <td class="py-3 px-5 text-center">
                <span class="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide">1 activos</span>
              </td>
              <td class="py-3 px-5 text-center font-bold text-red-600">$6.25</td>
              <td class="py-3 px-5 text-center font-bold text-gray-400">-</td>
              <td class="py-3 px-5 text-center">
                <span class="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center justify-center gap-1 w-24 mx-auto">
                  <i class="pi pi-hourglass text-[8px]"></i> CON DEUDA
                </span>
              </td>
              <td class="py-3 px-5">
                <div class="flex items-center justify-center gap-2">
                  <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm p-button-info" />
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
          <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">Nuevo cliente de crédito</h2>
          <p class="text-[11px] text-gray-400 font-medium mb-6">Registra los datos del cliente al que se le fiará</p>

          <div class="text-left space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej: Ana Martínez"
                class="w-full bg-[#e8f5e9] border-none rounded-lg px-4 py-2.5 text-sm font-semibold text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-400"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Teléfono</label>
              <input
                type="text"
                placeholder="Ej: 7018-5432"
                class="w-full bg-[#e8f5e9] border-none rounded-lg px-4 py-2.5 text-sm font-semibold text-[#0a3622] focus:outline-none focus:ring-2 focus:ring-green-300 placeholder-gray-400"
              />
            </div>
          </div>

          <div class="flex items-center gap-3 mt-8">
            <button
              @click="mostrarModal = false"
              class="flex-1 py-2.5 border-2 border-[#0a3622] text-[#0a3622] rounded-full text-sm font-extrabold hover:bg-green-50 transition"
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
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

const mostrarModal = ref(false);

// Filtros reactivos para PrimeVue
const buscarCliente = ref('');
const filtroCliente = ref(null);

const clientesOptions = ref([
  { label: 'Todos los clientes', value: 'todos' },
  { label: 'Con deuda pendiente', value: 'con-deuda' },
  { label: 'Sin deuda', value: 'sin-deuda' }
]);
</script>

<style scoped>
/* Ajustes para integrar inputs y dropdowns de PrimeVue con Tailwind */
.p-inputtext, .p-dropdown {
  font-size: 0.75rem !important; /* text-xs */
  border-radius: 0.375rem !important; /* rounded-md */
}

.p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  font-size: 0.75rem !important;
  padding: 0.5rem 1rem !important;
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
