<template>
  <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 text-left">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr class="bg-gray-50 text-gray-500 text-[11px] font-extrabold uppercase tracking-widest border-b border-gray-200">
            <th class="py-4 px-5">Fecha</th>
            <th class="py-4 px-5">Producto devuelto</th>
            <th class="py-4 px-5">Lote</th>
            <th class="py-4 px-5 text-center">Cant.</th>
            <th class="py-4 px-5 text-center">Valor</th>
            <th class="py-4 px-5">Efecto en stock</th>
            <th class="py-4 px-5 text-center">Estado</th>
            <th class="py-4 px-5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="text-gray-800 divide-y divide-gray-100">
          <tr v-for="item in cambios" :key="item.id" class="hover:bg-gray-50/80 transition text-sm">
            <td class="py-4 px-5 font-bold text-gray-600">{{ formatearFecha(item.fecha) }}</td>
            <td class="py-4 px-5 font-bold">
              <div class="flex flex-col">
                <span class="text-gray-800">{{ item.producto?.nombre }}</span>
                <span class="text-[11px] text-gray-400">{{ item.producto?.marca?.nombre || 'Sin marca' }}</span>
              </div>
            </td>
            <td class="py-4 px-5">
              <span v-if="item.producto?.perecedero === 'PERECEDERO'" class="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-1 rounded border border-blue-100 shadow-sm">
                {{ item.lote?.codigo_lote || 'Sin Lote' }}
              </span>
              <span v-else class="text-[11px] text-gray-400 italic">No aplica</span>
            </td>
            <td class="py-4 px-5 text-center font-bold text-gray-800">{{ item.cantidad }}</td>
            <td class="py-4 px-5 text-center font-bold text-gray-800">${{ parseFloat(item.total_perdida).toFixed(2) }}</td>
            <td class="py-4 px-5">
              <div v-html="efectoStockHtml(item)" class="text-xs"></div>
            </td>
            <td class="py-4 px-5 text-center">
              <span :class="obtenerBadgeClase(item.estado)" class="text-[10px] font-bold px-2 py-1 rounded-full uppercase inline-flex items-center gap-1 shadow-sm border border-gray-100">
                <span class="w-1.5 h-1.5 rounded-full" :class="obtenerPuntoClase(item.estado)"></span>
                {{ item.estado }}
              </span>
            </td>
            <td class="py-4 px-5">
              <div class="flex items-center justify-center gap-1">
                <template v-if="item.estado === 'PENDIENTE'">
                  <Button
                    icon="pi pi-check"
                    v-tooltip.top="'Aceptar reemplazo'"
                    class="p-button-rounded p-button-text p-button-sm p-button-success !text-green-600 hover:!bg-green-50"
                    @click="emit('aceptar', item)"
                  />
                  <Button
                    icon="pi pi-times"
                    v-tooltip.top="'Rechazar reclamación'"
                    class="p-button-rounded p-button-text p-button-sm p-button-danger !text-red-600 hover:!bg-red-50"
                    @click="emit('rechazar', item)"
                  />
                  <Button
                    icon="pi pi-ban"
                    v-tooltip.top="'Anular registro (Revertir)'"
                    class="p-button-rounded p-button-text p-button-sm p-button-warning !text-amber-600 hover:!bg-amber-50"
                    @click="emit('anular', item)"
                  />
                </template>
                <span v-else class="text-xs text-gray-400 italic font-medium">Completado</span>
              </div>
            </td>
          </tr>
          <tr v-if="cambios.length === 0">
            <td colspan="8" class="py-12 text-center text-gray-400">
              <span class="italic text-sm">No hay registros de devoluciones al proveedor.</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import Button from 'primevue/button';

defineProps({
  cambios: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['aceptar', 'rechazar', 'anular']);

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const date = new Date(fechaStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const obtenerBadgeClase = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'ACEPTADO': return 'bg-green-50 text-green-700 border-green-100';
    case 'RECHAZADO': return 'bg-red-50 text-red-700 border-red-100';
    case 'ANULADO': return 'bg-gray-50 text-gray-500 border-gray-100';
    default: return 'bg-gray-50 text-gray-500 border-gray-100';
  }
};

const obtenerPuntoClase = (estado) => {
  switch (estado) {
    case 'PENDIENTE': return 'bg-amber-500';
    case 'ACEPTADO': return 'bg-green-500';
    case 'RECHAZADO': return 'bg-red-500';
    case 'ANULADO': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
};

const efectoStockHtml = (item) => {
  if (item.estado === 'ANULADO') return `<span class="text-green-600 font-black">+${item.cantidad}</span>`;
  if (item.estado === 'ACEPTADO') return `<span class="text-red-600 font-black">-${item.cantidad}</span> <span class="text-gray-400">→</span> <span class="text-green-600 font-black">+${item.cantidad}</span>`;
  return `<span class="text-red-600 font-black">-${item.cantidad}</span>`;
};
</script>
