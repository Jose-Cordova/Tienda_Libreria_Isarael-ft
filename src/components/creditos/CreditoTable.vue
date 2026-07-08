<template>
  <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr class="bg-[#c6e5d3] text-[#0a3622] text-[11px] font-bold uppercase tracking-wider">
            <th class="py-3 px-5">Cliente</th>
            <th class="py-3 px-5">DUI</th>
            <th class="py-3 px-5 text-center">Créditos activos</th>
            <th class="py-3 px-5 text-center">Total deuda</th>
            <th class="py-3 px-5 text-center">Total abono</th>
            <th class="py-3 px-5 text-center">Estado</th>
            <th class="py-3 px-5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="text-xs text-gray-700 divide-y divide-gray-100">
          <tr v-for="cliente in clientes" :key="cliente.id" class="hover:bg-gray-50 transition">
            <td class="py-3 px-5 flex items-center gap-3">
              <CreditoClienteAvatar :nombre="cliente.nombre" />
              <span class="font-bold text-[#0a3622]">{{ cliente.nombre }}</span>
            </td>
            <td class="py-3 px-5 font-medium text-gray-500">{{ cliente.dui }}</td>

            <!-- Créditos activos: condicional según cantidad y si es 0 -->
            <td class="py-3 px-5 text-center">
              <span
                v-if="cliente.creditosActivos > 0"
                class="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide"
              >
                {{ cliente.creditosActivos }} activo{{ cliente.creditosActivos !== 1 ? 's' : '' }}
              </span>
              <span v-else class="text-[10px] font-extrabold text-gray-500 tracking-wide">
                0 activos
              </span>
            </td>

            <!-- Total deuda: rojo si hay diferencia con abonado, sino gris -->
            <td
              class="py-3 px-5 text-center font-bold"
              :class="{
                'text-red-600': parseFloat(cliente.totalDeuda) !== parseFloat(cliente.totalAbonado),
                'text-gray-800': parseFloat(cliente.totalDeuda) === parseFloat(cliente.totalAbonado)
              }"
            >
              ${{ cliente.totalDeuda }}
            </td>

            <!-- Total abono: verde si hay diferencia con deuda, sino gris -->
            <td
              class="py-3 px-5 text-center font-bold"
              :class="{
                'text-green-700': parseFloat(cliente.totalAbonado) !== parseFloat(cliente.totalDeuda),
                'text-gray-800': parseFloat(cliente.totalAbonado) === parseFloat(cliente.totalDeuda)
              }"
            >
              ${{ cliente.totalAbonado }}
            </td>

            <td class="py-3 px-5 text-center">
              <CreditoEstadoBadge :estado="cliente.estado" />
            </td>

            <td class="py-3 px-5">
              <div class="flex items-center justify-center gap-2">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-sm p-button-info"
                  @click="$emit('ver-detalle', cliente)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import Button from 'primevue/button';
import CreditoClienteAvatar from './CreditoClienteAvatar.vue';
import CreditoEstadoBadge from './CreditoEstadoBadge.vue';

defineProps({
  clientes: {
    type: Array,
    required: true
  }
});

defineEmits(['ver-detalle']);
</script>
