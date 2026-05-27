<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4"
  >
    <div class="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-up border border-gray-100">
      <!-- Cabecera -->
      <div class="bg-[#0a3622] text-white px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold">
          Detalle de Venta #{{ venta?.correlativo }}
        </h2>
        <button @click="$emit('cerrar')" class="text-white/80 hover:text-white">
          <i class="pi pi-times text-xl"></i>
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6" v-if="venta">
        <!-- Datos generales -->
        <div class="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p class="text-gray-800 font-bold">Fecha y hora</p>
            <p class="font-bold text-gray-600">{{ fechaFormateada }}</p>
          </div>
          <div>
            <p class="text-gray-800 font-bold">Estado</p>
            <span
              :class="venta.estado === 'PAGADA' ? 'bg-green-200 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'"
              class="px-2 py-0.5 rounded text-xs font-extrabold border"
            >
              {{ venta.estado.charAt(0) + venta.estado.slice(1).toLowerCase() }}
            </span>
          </div>
          <div>
            <p class="text-gray-800 font-bold">Método de pago</p>
            <p class="font-bold text-gray-600">{{ venta.metodo_pago?.nombre || '-' }}</p>
          </div>
          <div>
            <p class="text-gray-800 font-bold">Tipo de cliente</p>
            <p class="font-bold text-gray-600">{{ venta.tipo_cliente }}</p>
          </div>
          <div>
            <p class="text-gray-800 font-bold">Total</p>
            <p class="font-extrabold text-lg text-[#0a3622]">${{ Number(venta.total).toFixed(2) }}</p>
          </div>
          <div v-if="venta.credito">
            <p class="text-gray-800 font-bold">Cliente crédito</p>
            <p class="font-bold text-gray-600">
              {{ venta.credito.cliente_credito?.nombre || '-' }} <br>
              <span class="text-xs text-gray-400">DUI: {{ venta.credito.cliente_credito?.dui }}</span>
            </p>
          </div>
        </div>

        <!-- Tabla de productos -->
        <h3 class="font-extrabold !text-gray-800 mb-2 text-sm">Productos</h3>
        <div class="overflow-x-auto border border-black rounded-lg">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#99bba7]">
              <tr>
                <th class="py-2 px-3">Producto</th>
                <th class="py-2 px-3 text-center">Cant.</th>
                <th class="py-2 px-3 text-right">P. Unit.</th>
                <th class="py-2 px-3 text-right">Subtotal</th>
                <th class="py-2 px-3">Lote</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="detalle in venta.detalle_ventas" :key="detalle.id">
                <td class="py-2 px-3 font-bold">{{ detalle.producto?.nombre }}</td>
                <td class="py-2 px-3 text-center font-bold">{{ detalle.cantidad }}</td>
                <td class="py-2 px-3 text-right font-bold">${{ Number(detalle.precio_unitario).toFixed(2) }}</td>
                <td class="py-2 px-3 text-right font-bold">${{ Number(detalle.subtotal).toFixed(2) }}</td>
                <td class="py-2 px-3 text-gray-800 font-bold">{{ detalle.lote?.codigo_lote || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cargando -->
      <div v-else class="p-6 text-center text-gray-500">
        <i class="pi pi-spin pi-spinner text-3xl"></i>
        <p class="mt-2 text-sm">Cargando detalles...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visible: { type: Boolean, required: true },
  venta: { type: Object, default: null }
});

defineEmits(['cerrar']);

const fechaFormateada = computed(() => {
  if (!props.venta) return '';
  const fecha = new Date(props.venta.fecha);
  return fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
});
</script>
