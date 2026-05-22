<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative">

    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-100">
      <div class="flex items-center gap-3">
        <i class="pi pi-box text-xl text-orange-500"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Productos</h1>
      </div>

      <div class="flex items-center gap-3">
        <span class="p-input-icon-left text-sm">
          <i class="pi pi-search text-gray-400" />
          <InputText
            v-model="buscar"
            placeholder="Buscar..."
            class="p-inputtext-sm border-gray-200 focus:border-green-600 w-64 text-sm"
          />
        </span>

        <Button
          label="Nuevo"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm bg-[#0a3622] hover:bg-[#115033] text-white border-none shadow-sm"
          @click="mostrarModal = true"
        />
      </div>
    </section>

    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#c6e5d3] text-[#0a3622] text-[11px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Producto</th>
              <th class="py-3 px-5">Categoría</th>
              <th class="py-3 px-5">Marca</th>
              <th class="py-3 px-5">P. Detalle</th>
              <th class="py-3 px-5">P. Mayorista</th>
              <th class="py-3 px-5">Stock</th>
              <th class="py-3 px-5 text-center">Perecedero</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-xs text-gray-700 divide-y divide-gray-100">
            <tr v-for="prod in productos" :key="prod.id" class="hover:bg-gray-50 transition">
              <td class="py-4 px-5 font-bold text-[#0a3622]">{{ prod.nombre }}</td>
              <td class="py-4 px-5">
                <span class="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold border border-green-100">
                  {{ prod.categoria }}
                </span>
              </td>
              <td class="py-4 px-5 text-gray-500 font-medium">{{ prod.marca }}</td>
              <td class="py-4 px-5 font-bold text-gray-700">${{ prod.detalle.toFixed(2) }}</td>
              <td class="py-4 px-5 font-bold text-gray-700">${{ prod.mayorista.toFixed(2) }}</td>

              <td class="py-4 px-5">
                <div
                  :class="prod.stock <= 5 ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-700 border-green-200'"
                  class="w-16 text-center py-1 rounded font-black border text-[10px]"
                >
                  {{ prod.stock }} u.
                </div>
              </td>

              <td class="py-4 px-5 text-center">
                <Checkbox :binary="true" :modelValue="prod.perecedero" disabled class="p-checkbox-sm" />
              </td>

              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-1">
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

    <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-xl w-full max-w-2xl shadow-2xl relative overflow-hidden border border-gray-200">

        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-extrabold text-[#0a3622]">Nuevo Producto</h2>
            <p class="text-xs text-gray-400 font-medium">Completa todos los datos del producto</p>
          </div>
          <button @click="mostrarModal = false" class="text-gray-400 hover:text-gray-700 transition">
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>

        <div class="p-8 space-y-5">
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre</label>
            <InputText type="text" placeholder="Ej: Coca Cola 500ml" class="w-full border border-gray-200 rounded-lg text-sm text-[#0a3622]" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Categoría</label>
              <Dropdown :options="categorias" placeholder="Seleccionar" class="w-full border border-gray-200 text-sm" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Marca</label>
              <Dropdown :options="marcas" placeholder="Seleccionar" class="w-full border border-gray-200 text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">P. Venta Detalle</label>
              <InputNumber mode="currency" currency="USD" locale="en-US" placeholder="0.00" class="w-full text-sm" inputClass="w-full border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">P. Venta Mayorista</label>
              <InputNumber mode="currency" currency="USD" locale="en-US" placeholder="0.00" class="w-full text-sm" inputClass="w-full border border-gray-200 rounded-lg" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stock Actual</label>
              <InputNumber placeholder="0" class="w-full text-sm" inputClass="w-full border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stock Mínimo</label>
              <InputNumber :modelValue="5" class="w-full text-sm" inputClass="w-full border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Unidad de medida</label>
              <Dropdown :options="unidades" placeholder="Seleccionar" class="w-full border border-gray-200 text-sm" />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <Checkbox id="perecedero" :binary="true" class="p-checkbox-sm" />
            <label for="perecedero" class="text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer">¿Es un producto perecedero?</label>
          </div>
        </div>

        <div class="p-6 bg-gray-50 flex gap-3">
          <Button label="Cancelar" class="p-button-secondary p-button-outlined flex-1 py-3 font-extrabold text-sm" @click="mostrarModal = false" />
          <Button label="Guardar" class="flex-1 py-3 bg-[#0a3622] hover:bg-[#115033] border-none text-white font-extrabold text-sm shadow-md" @click="mostrarModal = false" />
        </div>

      </div>
    </div>

  </main>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';

const mostrarModal = ref(false);
const buscar = ref('');

const categorias = ref(['Bebidas', 'Golosinas', 'Limpieza']);
const marcas = ref(['Coca-Cola', 'Diana', 'Sin marca', 'Bic', 'Colgate']);
const unidades = ref(['Unidad', 'Caja']);

const productos = ref([
  { id: 1, nombre: 'Coca Cola 500ml', categoria: 'Bebidas', marca: 'Coca-Cola', detalle: 1.25, mayorista: 1.10, stock: 48, perecedero: false },
  { id: 2, nombre: 'Coca Cola 250ml', categoria: 'Bebidas', marca: 'Coca-Cola', detalle: 0.75, mayorista: 0.65, stock: 60, perecedero: false },
  { id: 3, nombre: 'Agua Pura 500ml', categoria: 'Bebidas', marca: 'Sin marca', detalle: 0.50, mayorista: 0.40, stock: 80, perecedero: false },
  { id: 4, nombre: 'Churro Diana', categoria: 'Golosinas', marca: 'Diana', detalle: 0.25, mayorista: 0.20, stock: 120, perecedero: false },
  { id: 5, nombre: 'Chocolate Snickers', categoria: 'Golosinas', marca: 'Sin marca', detalle: 0.75, mayorista: 0.65, stock: 4, perecedero: true },
  { id: 6, nombre: 'Jabón de trastes', categoria: 'Limpieza', marca: 'Sin marca', detalle: 1.50, mayorista: 1.35, stock: 15, perecedero: false },
  { id: 7, nombre: 'Lapicero Bic', categoria: 'Librería', marca: 'Bic', detalle: 0.30, mayorista: 0.25, stock: 50, perecedero: false },
  { id: 8, nombre: 'Pasta dental Colgate', categoria: 'Aseo Personal', marca: 'Colgate', detalle: 1.75, mayorista: 1.50, stock: 2, perecedero: true }
]);
</script>

<style scoped>
/* Integración estética global de PrimeVue inputs */
.p-inputtext, .p-dropdown, .p-inputnumber {
  font-size: 0.875rem !important; /* text-sm */
  font-weight: 600 !important;
}

/* Scrollbar estético para la tabla principal */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #86e9af;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
