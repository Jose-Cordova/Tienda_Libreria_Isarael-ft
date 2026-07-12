<template>
  <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
            <th class="py-3 px-5">Venta</th>
            <th class="py-3 px-5">Fecha</th>
            <th class="py-3 px-5">Motivo</th>
            <th class="py-3 px-5">Total</th>
            <th class="py-3 px-5">Estado</th>
            <th class="py-3 px-5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="text-sm text-gray-700 divide-y divide-gray-100">
          <tr v-for="dev in devoluciones" :key="dev.id" class="hover:bg-gray-50 transition">
            <!-- Venta (correlativo) -->
            <td class="py-4 px-5 font-mono font-bold text-gray-800">
              {{ dev.venta?.correlativo || 'N/A' }}
            </td>

            <!-- Fecha -->
            <td class="py-4 px-5">
              {{ new Date(dev.fecha).toLocaleDateString('es-ES') }}
            </td>

            <!-- Motivo -->
            <td class="py-4 px-5 max-w-[200px] truncate" :title="dev.motivo">
              {{ dev.motivo }}
            </td>

            <!-- Total -->
            <td class="py-4 px-5 font-bold text-red-600">
              ${{ Number(dev.total).toFixed(2) }}
            </td>

            <!-- Estado (DEVUELTA o ANULADA) -->
            <td class="py-4 px-5">
              <Tag
                :value="dev.estado"
                :severity="dev.estado === 'DEVUELTA' ? 'warning' : 'danger'"
              />
            </td>

            <!-- Acciones -->
            <td class="py-4 px-5">
              <div class="flex items-center justify-center gap-2">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-sm p-button-info"
                  @click="$emit('ver-detalle', dev)"
                />
                <Button
                icon="pi pi-ban"
                class="p-button-rounded p-button-text p-button-sm"
                :class="dev.estado === 'ANULADA' ? 'opacity-30 cursor-not-allowed' : 'p-button-danger'"
                :disabled="dev.estado === 'ANULADA'"
                v-tooltip="dev.estado === 'ANULADA' ? 'Dev. anulada' : 'Anular'"
                @click="$emit('anular', dev)"
              />
              </div>
            </td>
          </tr>
          <tr v-if="devoluciones.length === 0">
            <td colspan="6" class="py-10 text-center italic text-gray-400">
              No se encontraron devoluciones.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import Button from 'primevue/button';
import Tag from 'primevue/tag';

defineProps({
  devoluciones: { type: Array, required: true }
});

defineEmits(['ver-detalle', 'anular']);
</script>
