<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4"
  >
    <div class="bg-white rounded-xl w-[90vw] max-w-3xl shadow-2xl overflow-hidden animate-fade-up border border-gray-100 flex flex-col max-h-[90vh]">
      <!-- Cabecera -->
      <div class="bg-[#0a3622] text-white px-6 py-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold flex items-center gap-2">
          <i class="pi pi-replay"></i>
          Detalle de Devolución
        </h2>
        <button @click="$emit('update:visible', false)" class="text-white/80 hover:text-white">
          <i class="pi pi-times text-xl"></i>
        </button>
      </div>

      <!-- Cuerpo -->
      <div class="p-6" v-if="devolucion">
        <!-- Datos generales -->
        <div class="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p class="text-gray-800 font-bold">Fecha</p>
            <p class="font-bold text-gray-600">{{ new Date(devolucion.fecha).toLocaleDateString('es-ES') }}</p>
          </div>
          <div>
            <p class="text-gray-800 font-bold">Estado</p>
            <span
              :class="devolucion.estado === 'DEVUELTA' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-red-50 text-red-700 border-red-100'"
              class="px-2 py-0.5 rounded text-xs font-extrabold border"
            >
              {{ devolucion.estado === 'DEVUELTA' ? 'Devuelta' : 'Anulada' }}
            </span>
          </div>
          <div>
            <p class="text-gray-800 font-bold">Venta</p>
            <p class="font-bold text-gray-600">{{ devolucion.venta?.correlativo || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-gray-800 font-bold">Total</p>
            <p class="font-extrabold text-lg text-[#0a3622]">${{ Number(devolucion.total).toFixed(2) }}</p>
          </div>
        </div>

        <!-- Motivo -->
        <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
          <p class="text-gray-800 font-bold text-sm">Motivo</p>
          <p class="text-gray-600 text-sm">{{ devolucion.motivo }}</p>
        </div>

        <!-- Tabla de productos devueltos -->
        <h3 class="font-extrabold !text-gray-800 mb-2 text-sm">Productos Devueltos</h3>
        <div class="overflow-x-auto border border-black rounded-lg">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#99bba7]">
              <tr>
                <th class="py-2 px-3">Producto</th>
                <th class="py-2 px-3 text-center">Cant.</th>
                <th class="py-2 px-3">Condición</th>
                <th class="py-2 px-3">Dañado</th> <!-- Cambiado a "Dañado" -->
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="detalle in devolucion.detalle_devolucion_ventas" :key="detalle.id">
                <td class="py-2 px-3 font-bold">{{ detalle.producto?.nombre || 'Producto #' + detalle.producto_id }}</td>
                <td class="py-2 px-3 text-center font-bold">{{ detalle.cantidad }}</td>
                <td class="py-2 px-3 font-bold">
                  <span
                    :class="detalle.condicion === 'PERFECTO' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'"
                    class="px-2 py-0.5 rounded text-xs font-extrabold border"
                  >
                    {{ detalle.condicion === 'PERFECTO' ? 'Perfecto' : 'Dañado' }}
                  </span>
                </td>
                <td class="py-2 px-3 text-gray-800 font-bold">
                  {{ detalle.producto_daniado?.descripcion || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cargando -->
      <div v-else class="p-10 text-center text-gray-500">
        <i class="pi pi-spin pi-spinner text-3xl"></i>
        <p class="mt-2 text-sm font-bold">Cargando detalles...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  devolucion: { type: Object, default: null }
});

defineEmits(['update:visible']);
</script>

<style scoped>
.animate-fade-up {
  animation: fadeUp 0.3s ease-out forwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
