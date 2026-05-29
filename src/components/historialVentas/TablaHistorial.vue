<template>
  <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
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
        <tbody class="text-sm text-gray-700 divide-y divide-gray-100">
          <tr
            v-for="venta in ventas"
            :key="venta.correlativo"
            class="hover:bg-gray-50 transition"
          >
            <!-- Correlativo -->
            <td class="py-4 px-5 font-mono font-bold text-gray-800">
              {{ venta.correlativo }}
            </td>

            <!-- Fecha y hora -->
            <td class="py-4 px-5">
              <div class="font-bold text-gray-800">{{ venta.fecha }}</div>
              <div class="text-[10px] text-gray-400 font-bold">{{ venta.hora }}</div>
            </td>

            <!-- Productos -->
            <td class="py-4 px-5">
              <div class="font-bold text-gray-800">{{ venta.productos }}</div>
              <div class="text-[10px] text-gray-400 font-bold">
                {{ venta.itemsCount }} items
              </div>
            </td>

            <!-- Método de pago -->
            <td class="py-4 px-5 font-bold text-gray-800">
              <div class="flex items-center gap-1.5">
                <i
                  :class="venta.metodo === 'Efectivo' ? 'pi pi-money-bill text-green-600' : 'pi pi-credit-card text-blue-600'"
                ></i>
                {{ venta.metodo }}
              </div>
            </td>

            <!-- Tipo de cliente -->
            <td class="py-4 px-5">
              <span
                :class="venta.tipo === 'Mayorista'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'"
                class="px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-max"
              >
                <i
                  :class="venta.tipo === 'Mayorista' ? 'pi pi-box' : 'pi pi-tag'"
                  class="text-[10px]"
                ></i>
                {{ venta.tipo }}
              </span>
            </td>

            <!-- Estado -->
            <td class="py-4 px-5">
              <span class="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-max">
                <i class="pi pi-check-circle text-[10px]"></i>
                {{ venta.estado }}
              </span>
            </td>

            <!-- Total -->
            <td class="py-4 px-5 font-bold text-gray-800 text-sm">
              ${{ venta.total.toFixed(2) }}
            </td>

            <!-- Acciones -->
            <td class="py-4 px-5">
              <div class="flex items-center justify-center gap-2">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-sm p-button-info"
                  v-tooltip="'Ver detalle'"
                  @click="$emit('ver-detalle', venta)"
                />
                <Button
                  icon="pi pi-ban"
                  class="p-button-rounded p-button-text p-button-sm p-button-danger"
                  v-tooltip="'Anular'"
                  @click="$emit('anular', venta)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="ventas.length === 0">
            <td colspan="8" class="py-10 text-center italic text-gray-400">No se encontraron resultados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import Button from 'primevue/button';

defineProps({
  ventas: {
    type: Array,
    required: true
  }
});

defineEmits(['ver-detalle', 'eliminar']);
</script>

<style scoped>
/* Scroll suave si hay muchas columnas en pantallas pequeñas */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #c6e5d3;
  border-radius: 4px;
}
</style>
