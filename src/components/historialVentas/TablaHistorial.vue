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

            <!-- Productos (primeros 2 + resto) -->
            <td class="py-4 px-5">
              <template v-if="venta.productos">
                <div class="font-bold text-gray-800 text-xs leading-tight">
                  {{ venta.productos.split(', ').slice(0, 2).join(', ') }}
                </div>
                <div v-if="venta.itemsCount > 2" class="text-[10px] text-gray-400 font-bold mt-0.5">
                  + {{ venta.itemsCount - 2 }} producto(s) más
                </div>
                <div v-else class="text-[10px] text-gray-400 font-bold">
                  {{ venta.itemsCount }} item(s)
                </div>
              </template>
              <template v-else>
                <div class="text-gray-400 text-xs">Sin productos</div>
              </template>
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
                  class="p-button-rounded p-button-text p-button-sm"
                  :class="(venta.estado === 'Anulada' || venta.estado === 'Devolucion') ? 'opacity-30 cursor-not-allowed' : 'p-button-danger'"
                  :disabled="venta.estado === 'Anulada' || venta.estado === 'Devolucion'"
                  v-tooltip="(venta.estado === 'Anulada' || venta.estado === 'Devolucion') ? 'Venta no anulable' : 'Anular'"
                  @click="abrirConfirmacionAnular(venta)"
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

    <!-- Modal de confirmación de anulación -->
    <div
      v-if="mostrarConfirmarAnular"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] backdrop-blur-sm p-4 text-center"
    >
      <div class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
        <div class="p-10">
          <div class="flex justify-center mb-6 text-red-500">
            <i class="pi pi-ban text-6xl"></i>
          </div>
          <h2 class="text-xl font-extrabold text-gray-800 mb-2">¿Anular esta venta?</h2>
          <p class="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
            Se anulará la venta con correlativo
            <span class="text-gray-800 font-bold">"{{ ventaAAnular?.correlativo }}"</span>
            del día <span class="text-gray-800 font-bold">"{{ ventaAAnular?.fecha }}"</span>
            por un total de
            <span class="text-green-700 font-bold">${{ Number(ventaAAnular?.total).toFixed(2) }}</span>.
          </p>
          <div class="flex items-center gap-3">
            <button
              @click="mostrarConfirmarAnular = false"
              class="flex-1 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#e2eee2] hover:bg-white transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              @click="confirmarAnulacion"
              class="flex-1 py-3 bg-[#d1333e] hover:bg-[#a82430] text-white font-bold rounded-xl shadow-md transition-colors text-sm"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';

defineProps({
  ventas: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['ver-detalle', 'anular']);

// Lógica de confirmación
const mostrarConfirmarAnular = ref(false);
const ventaAAnular = ref(null);

const abrirConfirmacionAnular = (venta) => {
  ventaAAnular.value = venta;
  mostrarConfirmarAnular.value = true;
};

const confirmarAnulacion = () => {
  emit('anular', ventaAAnular.value);
  mostrarConfirmarAnular.value = false;
  ventaAAnular.value = null;
};
</script>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #c6e5d3;
  border-radius: 4px;
}

.animate-fade-up {
  animation: fadeUp 0.3s ease-out forwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
