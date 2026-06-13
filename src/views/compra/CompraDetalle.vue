<template>
  <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4 text-left">
    <div class="bg-white rounded-[24px] w-[95vw] max-w-4xl shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100 flex flex-col max-h-[90vh]">
      <!-- Barra superior verde -->
      <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
      <!-- Encabezado del Modal -->
      <div class="p-4 sm:p-8 pb-4 flex justify-between items-start text-left">
        <div class="flex items-center gap-4 text-left">
            <i class="pi pi-file-pdf text-2xl text-red-600"></i>
          <div>
            <h2 class="text-xl font-extrabold text-[#003d00]">Detalle de Compra</h2>
          </div>
        </div>
        <button @click="$emit('cerrar')" class="text-gray-400 hover:text-gray-700 transition">
          <i class="pi pi-times text-xl"></i>
        </button>
      </div>
      <!-- Contenido Scrolleable -->
      <div class="px-3 sm:px-8 pt-4 overflow-y-auto custom-scrollbar flex-1 text-left">
        <!-- Tabla de Productos -->
        <div class="mb-4 text-left">
          <p class="text-[11px] font-black text-[#0a3622] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <i class="pi pi-list"></i> Productos Adquiridos
          </p>
          <div class="border border-gray-300 rounded-xl overflow-hidden shadow-sm">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#99bba7] text-[#000000] text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                  <th class="py-3 px-2 sm:px-5">Producto</th>
                  <th class="py-3 px-2 sm:px-5 text-center"><span class="hidden sm:inline">Cantidad</span><span class="sm:hidden">Cant.</span></th>
                  <th class="py-3 px-2 sm:px-5 text-center"><span class="hidden sm:inline">Precio Unitario</span><span class="sm:hidden">P. Unit.</span></th>
                  <th class="py-3 px-2 sm:px-5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="text-[11px] sm:text-sm text-gray-700 divide-y divide-gray-400">
                <tr v-for="item in compra?.detalle_compras" :key="item.id" class="hover:bg-gray-50/50 transition">
                  <td class="py-3 px-2 sm:px-5">
                    <p class="font-bold text-gray-800 leading-tight">{{ item.producto?.nombre }}</p>
                    <!-- Mostrar Lotes si existen -->
                    <div v-if="item.producto?.perecedero === 'PERECEDERO'" class="mt-1 flex flex-wrap gap-1">
                       <span
                        v-for="lote in obtenerLotesDelProducto(item.producto_id)"
                        :key="lote.id"
                        class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold border border-blue-100 uppercase flex items-center gap-1"
                       >
                        <i class="pi pi-tag text-[7px] sm:text-[8px]"></i>
                        L: {{ lote.codigo_lote }} | V: {{ formatearFechaSimple(lote.fecha_vencimiento) }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 px-2 sm:px-5 text-center font-bold text-gray-800">{{ item.cantidad }}</td>
                  <td class="py-3 px-2 sm:px-5 text-center font-bold text-gray-800">${{ item.precio_unitario }}</td>
                  <td class="py-3 px-2 sm:px-5 text-right font-bold text-gray-800">${{ item.subtotal }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- Pie del Modal: Info y Botón -->
      <div class="p-4 sm:p-8 bg-gray-50/80 border-t border-gray-400 flex justify-between items-center text-left">
        <div>
           <p class="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-1">Registrado/a por</p>
           <p class="text-sm font-bold text-gray-700">{{ compra?.user?.name || 'Sistema' }}</p>
        </div>
        <button
          @click="$emit('cerrar')"
          class="px-10 py-3 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-md transition-all text-sm uppercase tracking-widest"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: Boolean,
  compra: Object
});

defineEmits(['cerrar']);

// Filtramos los lotes que pertenecen a este producto específico dentro de esta compra
const obtenerLotesDelProducto = (productoId) => {
  if (!props.compra?.lotes) return [];
  return props.compra.lotes.filter(lote => lote.producto_id === productoId);
};

const formatearFechaSimple = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #c6e5d3;
  border-radius: 10px;
}
.animate-fade-up {
  animation: fadeUp 0.3s ease-out forwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
