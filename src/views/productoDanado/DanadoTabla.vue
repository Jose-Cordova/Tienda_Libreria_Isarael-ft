<template>
  <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 text-left">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
            <th class="py-3 px-5">Producto</th>
            <th class="py-3 px-5 text-center">Origen</th>
            <th class="py-3 px-5 text-center">Cantidad</th>
            <th class="py-3 px-5 text-center">Costo Unit.</th>
            <th class="py-3 px-5 text-center">Total P.</th>
            <th class="py-3 px-5 text-center">Efecto Stock</th>
            <th class="py-3 px-5">Fecha</th>
            <th class="py-3 px-5">Descripción</th>
            <th class="py-3 px-5 text-center">Estado</th>
            <th class="py-3 px-5 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="text-gray-800 divide-y divide-gray-100">
          <tr v-for="item in registros" :key="item.id" class="hover:bg-gray-50 transition text-sm">
            <td class="py-4 px-5 font-bold">
              <div class="flex flex-col">
                <span>{{ item.producto?.nombre }}</span>
                <span v-if="item.lote" class="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase mt-1 w-fit shadow-sm">
                  LOTE: {{ item.lote?.codigo_lote }}
                </span>
              </div>
            </td>
            <td class="py-4 px-5 text-center">
              <span :class="obtenerBadgeOrigen(item.origen)" class="text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                {{ formatOrigen(item.origen) }}
              </span>
            </td>
            <td class="py-4 px-5 text-center font-bold">{{ item.cantidad }}</td>
            <td class="py-4 px-5 text-center font-bold">${{ parseFloat(item.costo_unitario).toFixed(2) }}</td>
            <td class="py-4 px-5 text-center font-bold">${{ parseFloat(item.total_perdida).toFixed(2) }}</td>
            <td class="py-4 px-5 text-center">
              <span :class="efectoStockClase(item)" class="text-[13px] font-black">
                {{ efectoStockTexto(item) }}
              </span>
            </td>
            <td class="py-4 px-5 font-bold text-gray-700">{{ formatearFecha(item.fecha) }}</td>
            <td class="py-4 px-5 font-bold text-gray-800 max-w-xs truncate" :title="item.descripcion">{{ item.descripcion }}</td>
            <td class="py-4 px-5 text-center">
              <span :class="obtenerBadgeClase(item.estado)" class="text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                {{ item.estado }}
              </span>
            </td>
            <td class="py-4 px-5">
              <div class="flex items-center justify-center gap-1">
                <template v-if="item.estado === 'REGISTRADO' && item.origen === 'DIRECTO'">
                  <Button
                    icon="pi pi-ban"
                    v-tooltip.top="'Anular registro (Revertir)'"
                    class="p-button-rounded p-button-text p-button-sm p-button-warning !text-amber-600"
                    @click="emit('anular', item)"
                  />
                </template>
                <span v-else class="text-xs text-gray-400 italic">Sin acciones</span>
              </div>
            </td>
          </tr>
          <tr v-if="registros.length === 0">
            <td colspan="10" class="py-10 text-center italic text-gray-400">No hay registros de productos dañados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import Button from 'primevue/button';

defineProps({
  registros: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['anular']);

const obtenerBadgeClase = (estado) => {
  switch (estado) {
    case 'REGISTRADO':  return 'bg-green-100 text-green-800';
    case 'RECHAZADO':   return 'bg-red-100 text-red-800';
    case 'DEVOLUCION':  return 'bg-blue-100 text-blue-800';
    case 'ANULADO':     return 'bg-gray-100 text-gray-800';
    default:            return 'bg-gray-100 text-gray-800';
  }
};

const obtenerBadgeOrigen = (origen) => {
  switch (origen) {
    case 'DIRECTO': return 'bg-orange-100 text-orange-800';
    case 'VENCIMIENTO': return 'bg-purple-100 text-purple-800';
    case 'VENTA': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatOrigen = (origen) => {
  switch (origen) {
    case 'DIRECTO': return 'Daño Directo';
    case 'VENCIMIENTO': return 'Vencimiento';
    case 'VENTA': return 'Devolución Venta';
    default: return origen;
  }
};

const efectoStockTexto = (item) => {
  if (item.estado === 'ANULADO') return `+${item.cantidad}`;
  return `-${item.cantidad}`;
};

const efectoStockClase = (item) => {
  if (item.estado === 'ANULADO') return 'text-green-600';
  return 'text-red-600';
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const date = new Date(fechaStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
</script>
