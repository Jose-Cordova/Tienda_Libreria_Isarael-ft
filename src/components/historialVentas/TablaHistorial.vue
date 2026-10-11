<template>
  <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap tabla-responsiva">
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
          <tr v-for="venta in ventas" :key="venta.correlativo" class="hover:bg-gray-50 transition">
            <!-- Correlativo -->
            <td class="celda-titulo py-4 px-5 font-mono font-bold text-gray-800">
              {{ venta.correlativo }}
            </td>

            <!-- Fecha y hora -->
            <td class="celda-subtitulo py-4 px-5">
              <div class="font-bold text-gray-800">{{ venta.fecha }}</div>
              <div class="text-[10px] text-gray-400 font-bold">{{ venta.hora }}</div>
            </td>

            <!-- Productos -->
            <td data-label="Productos" class="py-4 px-5">
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
            <td data-label="Pago" class="py-4 px-5 font-bold text-gray-800">
              <div class="flex items-center gap-1.5">
                <i
                  :class="venta.metodo === 'Efectivo' ? 'pi pi-money-bill text-green-600' : 'pi pi-credit-card text-blue-600'"></i>
                {{ venta.metodo }}
              </div>
            </td>

            <!-- Tipo de cliente -->
            <td class="celda-chip py-4 px-5">
              <span :class="venta.tipo === 'Mayorista'
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-blue-50 text-blue-600 border border-blue-100'"
                class="px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-max">
                <i :class="venta.tipo === 'Mayorista' ? 'pi pi-box' : 'pi pi-tag'" class="text-[10px]"></i>
                {{ venta.tipo }}
              </span>
            </td>

            <!-- Estado -->
            <td class="celda-chip py-4 px-5">
              <span
                :class="colorEstado(venta.estado).bg + ' ' + colorEstado(venta.estado).text + ' ' + colorEstado(venta.estado).border"
                class="px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 w-max border">
                <i :class="colorEstado(venta.estado).icon + ' text-[10px]'"></i>
                {{ venta.estado }}
              </span>
            </td>

            <!-- Total -->
            <td class="celda-destacada py-4 px-5 font-bold text-gray-800 text-sm">
              ${{ venta.total.toFixed(2) }}
            </td>

            <!-- Acciones -->
            <td class="celda-acciones py-4 px-5">
              <div class="flex items-center justify-center gap-2">
                <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm p-button-info"
                  v-tooltip="'Ver detalle'" @click="$emit('ver-detalle', venta)" />
                <Button v-if="venta.estado === 'Pagada'" icon="pi pi-credit-card"
                  class="p-button-rounded p-button-text p-button-sm p-button-warning"
                  v-tooltip="'Cambiar método de pago'" @click="abrirConfirmacionMetodo(venta)" />
                <Button icon="pi pi-ban" class="p-button-rounded p-button-text p-button-sm"
                  :class="(venta.estado === 'Anulada' || venta.estado === 'Devolucion') ? 'opacity-30 cursor-not-allowed' : 'p-button-danger'"
                  :disabled="venta.estado === 'Anulada' || venta.estado === 'Devolucion'"
                  v-tooltip="(venta.estado === 'Anulada' || venta.estado === 'Devolucion') ? 'Venta no anulable' : 'Anular'"
                  @click="abrirConfirmacionAnular(venta)" />
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
    <div v-if="mostrarConfirmarAnular"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] backdrop-blur-sm p-4 text-center">
      <div
        class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100">
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
            <button @click="mostrarConfirmarAnular = false"
              class="flex-1 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#e2eee2] hover:bg-white transition-colors text-sm">
              Cancelar
            </button>
            <button @click="confirmarAnulacion"
              class="flex-1 py-3 bg-[#d1333e] hover:bg-[#a82430] text-white font-bold rounded-xl shadow-md transition-colors text-sm">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de cambio de método de pago -->
    <div v-if="mostrarConfirmarMetodo"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] backdrop-blur-sm p-4 text-center">
      <div
        class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
        <div class="p-8">
          <div class="flex justify-center mb-4 text-amber-500">
            <i class="pi pi-credit-card text-5xl"></i>
          </div>
          <h2 class="text-lg font-extrabold text-gray-800 mb-2">Cambiar método de pago</h2>
          <p class="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
            Venta <span class="text-gray-800 font-bold">"{{ ventaMetodo?.correlativo }}"</span>
            del día <span class="text-gray-800 font-bold">"{{ ventaMetodo?.fecha }}"</span>.
          </p>

          <div class="flex flex-col gap-2 text-left mb-6">
            <label class="text-[11px] font-extrabold text-[#3a5a3a] uppercase tracking-wider">Nuevo método de
              pago</label>
            <Dropdown v-model="metodoSeleccionado" :options="metodos" optionLabel="nombre" optionValue="id"
              placeholder="Seleccione un método" class="w-full" />
          </div>

          <div class="flex items-center gap-3">
            <button @click="cerrarModalMetodo"
              class="flex-1 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#e2eee2] hover:bg-white transition-colors text-sm">
              Cancelar
            </button>
            <button @click="confirmarCambioMetodo" :disabled="!metodoSeleccionado"
              class="flex-1 py-3 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
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
import Dropdown from 'primevue/dropdown';

defineProps({
  ventas: {
    type: Array,
    required: true
  },
  metodos: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['ver-detalle', 'anular', 'cambiar-metodo']);

// Confirmación de anulación
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

// Confirmación de cambio de método de pago
const mostrarConfirmarMetodo = ref(false);
const ventaMetodo = ref(null);
const metodoSeleccionado = ref(null);

const abrirConfirmacionMetodo = (venta) => {
  ventaMetodo.value = venta;
  metodoSeleccionado.value = null;
  mostrarConfirmarMetodo.value = true;
};

const cerrarModalMetodo = () => {
  mostrarConfirmarMetodo.value = false;
  ventaMetodo.value = null;
  metodoSeleccionado.value = null;
};

const confirmarCambioMetodo = () => {
  if (!metodoSeleccionado.value) return;

  emit('cambiar-metodo', {
    venta: ventaMetodo.value,
    metodo_pago_id: metodoSeleccionado.value
  });

  cerrarModalMetodo();
};

// Mapeo de colores por estado de venta
const colorEstado = (estado) => {
  switch (estado) {
    case 'Pagada':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-100',
        icon: 'pi pi-check-circle'
      };
    case 'Credito':
    case 'Devolucion':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: 'pi pi-exclamation-circle'
      };
    case 'Anulada':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: 'pi pi-ban'
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: 'pi pi-info-circle'
      };
  }
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
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
