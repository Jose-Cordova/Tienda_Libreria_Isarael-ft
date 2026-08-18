<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4"
  >
    <div class="bg-white rounded-xl w-[90vw] max-w-3xl shadow-2xl overflow-hidden animate-fade-up border border-gray-100 flex flex-col max-h-[90vh]">
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

        <!-- Total (abajo) -->
        <div class="mt-6 text-right border-t pt-3">
          <p class="text-lg font-extrabold text-[#0a3622]">
            Total: ${{ Number(venta.total).toFixed(2) }}
          </p>
        </div>

        <!-- Cliente crédito (solo si existe) -->
        <div v-if="venta.credito" class="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p class="text-gray-900 font-bold text-sm">Cliente crédito</p>
          <p class="font-bold text-gray-600 text-sm">
            {{ venta.credito.cliente_credito?.nombre || '-' }}<br>
            <span class="text-xs text-gray-600">
              DUI: {{ venta.credito.cliente_credito?.dui || '-' }}
            </span><br>
            <span class="text-xs text-gray-600">
              Teléfono: {{ venta.credito.cliente_credito?.telefono || '-' }}
            </span>
          </p>
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
const props = defineProps({
  visible: { type: Boolean, required: true },
  venta: { type: Object, default: null }
});

defineEmits(['cerrar']);
</script>
