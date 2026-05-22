<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar">

    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
      <div class="flex items-center gap-2 text-[#0a3622]">
        <i class="pi pi-receipt text-2xl"></i>
        <h1 class="text-base font-extrabold">Historial de Ventas</h1>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span class="p-input-icon-left text-xs">
          <i class="pi pi-search text-gray-400" />
          <InputText
            v-model="filters.search"
            placeholder="Buscar #correlativos, produ..."
            class="p-inputtext-sm border-gray-200 focus:border-green-600 w-52 text-xs"
          />
        </span>

        <Dropdown
          v-model="filters.method"
          :options="methodOptions"
          optionLabel="name"
          placeholder="Todos los métodos"
          class="p-dropdown-sm border-gray-200 text-xs w-44"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2 text-xs">
              <i :class="slotProps.option.icon" class="text-gray-500"></i>
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Dropdown>

        <Dropdown
          v-model="filters.type"
          :options="typeOptions"
          optionLabel="name"
          placeholder="Todos los tipos"
          class="p-dropdown-sm border-gray-200 text-xs w-40"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2 text-xs">
              <i :class="slotProps.option.icon" class="text-gray-500"></i>
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Dropdown>

        <div class="flex items-center gap-2">
          <Calendar
            v-model="filters.dateFrom"
            dateFormat="dd/mm/yy"
            placeholder="Desde"
            showIcon
            class="p-calendar-sm w-32 custom-prime-calendar"
          />
          <Calendar
            v-model="filters.dateTo"
            dateFormat="dd/mm/yy"
            placeholder="Hasta"
            showIcon
            class="p-calendar-sm w-32 custom-prime-calendar"
          />
        </div>

        <Button
          label="Limpiar"
          class="p-button-sm p-button-outlined p-button-secondary font-bold text-xs"
          @click="clearFilters"
        />
      </div>
    </section>

    <section class="grid grid-cols-4 gap-4 mb-6">

      <div class="bg-white border border-[#0a3622] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
        <p class="text-[12px] font-bold text-[#145a32] uppercase tracking-wider mb-0.5">VENTAS ENCONTRADAS</p>
        <p class="text-3xl font-extrabold text-[#0a3622] leading-none my-1">3</p>
        <p class="text-[10px] text-gray-400 font-medium">de 3 encontradas</p>
      </div>

      <div class="bg-white border border-[#0a3622] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
        <p class="text-[12px] font-bold text-[#145a32] uppercase tracking-wider mb-0.5">TOTAL RECAUDADO</p>
        <p class="text-3xl font-extrabold text-[#0a3622] leading-none my-1">$5.50</p>
        <p class="text-[10px] text-gray-400 font-medium">sin filtro</p>
      </div>

      <div class="bg-white border border-[#0a3622] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
        <p class="text-[12px] font-bold text-[#145a32] uppercase tracking-wider mb-0.5">CONTADO</p>
        <p class="text-3xl font-extrabold text-[#0a3622] leading-none my-1">$5.50</p>
        <p class="text-[10px] text-gray-400 font-medium">3 ventas</p>
      </div>

      <div class="bg-white border border-[#ff8c00] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
        <p class="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">VENTAS ENCONTRADAS</p>
        <p class="text-3xl font-extrabold text-[#b8860b] leading-none my-1">$0.00</p>
        <p class="text-[10px] text-gray-400 font-medium">0 ventas</p>
      </div>

    </section>

    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#c6e5d3] text-[#0a3622] text-[11px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Correlativo</th>
              <th class="py-3 px-5">Fecha y hora</th>
              <th class="py-3 px-5">Productos</th>
              <th class="py-3 px-5">Método de pago</th>
              <th class="py-3 px-5">Tipo</th>
              <th class="py-3 px-5">Estado</th>
              <th class="py-3 px-5">Total</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-xs text-gray-700 divide-y divide-gray-100">
            <tr v-for="venta in salesHistory" :key="venta.correlativo" class="hover:bg-gray-50 transition">
              <td class="py-3 px-5 font-mono font-bold text-gray-500">{{ venta.correlativo }}</td>
              <td class="py-3 px-5">
                <div class="font-medium text-gray-600">{{ venta.fecha }}</div>
                <div class="text-[10px] text-gray-400">{{ venta.hora }}</div>
              </td>
              <td class="py-3 px-5">
                <div class="font-semibold text-gray-800">{{ venta.productos }}</div>
                <div class="text-[10px] text-gray-400 font-medium">{{ venta.itemsCount }} items</div>
              </td>
              <td class="py-3 px-5 font-medium text-gray-600">
                <div class="flex items-center gap-1.5">
                  <i :class="venta.metodo === 'Efectivo' ? 'pi pi-money-bill text-green-600' : 'pi pi-credit-card text-blue-600'"></i>
                  {{ venta.metodo }}
                </div>
              </td>
              <td class="py-3 px-5">
                <span :class="venta.tipo === 'Mayorista' ? 'bg-[#1e1510] text-[#f59e0b]' : 'bg-blue-50 text-blue-600 border border-blue-100'" class="px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-max">
                  <i :class="venta.tipo === 'Mayorista' ? 'pi pi-star-fill' : 'pi pi-tag'" class="text-[10px]"></i>
                  {{ venta.tipo }}
                </span>
              </td>
              <td class="py-3 px-5">
                <span class="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-max">
                  <i class="pi pi-check-circle text-[10px]"></i>
                  {{ venta.estado }}
                </span>
              </td>
              <td class="py-3 px-5 font-bold text-gray-800 text-sm">{{ venta.total }}</td>
              <td class="py-3 px-5">
                <div class="flex items-center justify-center gap-2">
                  <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm p-button-info" v-tooltip="'Ver detalle'" />
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger" v-tooltip="'Eliminar'" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';

// Filtros reactivos
const filters = ref({
  search: '',
  method: null,
  type: null,
  dateFrom: null,
  dateTo: null
});

// Opciones de los menús
const methodOptions = ref([
  { name: 'Efectivo', value: 'Efectivo', icon: 'pi pi-money-bill' },
  { name: 'Transferencia', value: 'Transferencia', icon: 'pi pi-credit-card' }
]);

const typeOptions = ref([
  { name: 'Detalle', value: 'Detalle', icon: 'pi pi-tag' },
  { name: 'Mayorista', value: 'Mayorista', icon: 'pi pi-star-fill' }
]);

const clearFilters = () => {
  filters.value = { search: '', method: null, type: null, dateFrom: null, dateTo: null };
};

// Datos estáticos
const salesHistory = ref([
  { correlativo: '0001', fecha: '07/05/2026', hora: '05:14 p. m.', productos: 'Coca Cola 500ml x2, Churro Diana x3', itemsCount: 2, metodo: 'Efectivo', tipo: 'Detalle', estado: 'Pagada', total: '$3.25' },
  { correlativo: '0002', fecha: '07/05/2026', hora: '03:14 p. m.', productos: 'Agua Pura 500ml x4', itemsCount: 1, metodo: 'Efectivo', tipo: 'Detalle', estado: 'Pagada', total: '$2.00' },
  { correlativo: '0003', fecha: '07/05/2026', hora: '03:14 p. m.', productos: 'Lapicero Bic x1', itemsCount: 1, metodo: 'Transferencia', tipo: 'Mayorista', estado: 'Pagada', total: '$8.25' }
]);
</script>

<style>
/* Ajustes para que PrimeVue combine con tu diseño Tailwind */
.p-inputtext, .p-dropdown, .p-calendar {
  font-size: 0.75rem !important; /* text-xs */
  border-radius: 0.375rem !important; /* rounded-md */
}

.custom-prime-calendar .p-inputtext {
  background: #f9fafb !important;
}

.p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  font-size: 0.75rem !important;
  padding: 0.5rem 1rem !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #c6e5d3;
  border-radius: 4px;
}
</style>
