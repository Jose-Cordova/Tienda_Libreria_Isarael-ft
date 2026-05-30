<template>
  <div class="flex flex-col h-full gap-4 font-dm-sans">
    <!-- Total de la venta -->
    <div class="flex flex-col gap-1">
      <div class="flex justify-between items-center text-sm text-shop-text-2 font-bold">
        <span>Subtotal:</span>
        <span>${{ ventaStore.total.toFixed(2) }}</span>
      </div>
      <div class="flex justify-between items-center mt-1">
        <span class="font-black text-2xl text-shop-text tracking-tight">TOTAL:</span>
        <span class="font-black text-4xl text-shop-green tracking-tighter">${{ ventaStore.total.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Indicador de venta al crédito -->
    <div v-if="ventaStore.estado === 'CREDITO'" class="flex flex-col gap-1 bg-shop-yellow-pale text-shop-yellow font-bold text-sm px-3 py-2 rounded-shop-sm">
      <div class="flex items-center gap-2">
        <i class="pi pi-book"></i> VENTA AL CRÉDITO (Fiado)
      </div>
      <button @click="cancelarCredito" class="text-xs underline hover:text-shop-red transition-colors self-start">
        Cancelar crédito
      </button>
    </div>

    <hr class="border-shop-border border-dashed" />

    <!-- Selectores de tipo de cliente y método de pago -->
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-bold text-shop-text-2 uppercase flex items-center gap-1">
          <i class="pi pi-users text-[10px]"></i> Tipo de Precio
        </label>
        <Dropdown
          v-model="ventaStore.tipo_cliente"
          :options="['DETALLES', 'MAYORISTA']"
          class="w-full font-bold"
          @change="ventaStore.cambiarTipoCliente($event.value)"
        >
          <template #value="slotProps">
            <div class="flex items-center gap-2">
              <i :class="slotProps.value === 'MAYORISTA' ? 'pi pi-box' : 'pi pi-tag'" class="text-shop-green"></i>
              <span>Precio por {{ slotProps.value === 'MAYORISTA' ? 'Mayor' : 'Detalle' }}</span>
            </div>
          </template>
        </Dropdown>
      </div>

      <!-- Método de pago: solo si no es crédito -->
      <div v-if="ventaStore.estado !== 'CREDITO'" class="flex flex-col gap-1">
        <label class="text-[11px] font-bold text-shop-text-2 uppercase flex items-center gap-1">
          <i class="pi pi-credit-card text-[10px]"></i> Método de Pago
        </label>
        <Dropdown
          v-model="ventaStore.metodo_pago_id"
          :options="ventaStore.metodosPago"
          optionLabel="nombre"
          optionValue="id"
          class="w-full font-bold"
          placeholder="Seleccione..."
        >
          <template #value="slotProps">
            <div v-if="slotProps.value" class="flex items-center gap-2">
              <i class="pi pi-wallet text-shop-green"></i>
              <span>{{ ventaStore.metodosPago.find(m => m.id === slotProps.value)?.nombre }}</span>
            </div>
          </template>
        </Dropdown>
      </div>
    </div>

    <!-- Monto recibido y vuelto (solo PAGADA y NO transferencia) -->
    <div v-if="ventaStore.estado !== 'CREDITO' && !ventaStore.isTransferencia" class="bg-shop-surface-2 p-3 rounded-shop border border-shop-border mt-1">
      <label class="text-[11px] font-bold text-shop-text-2 uppercase mb-1 block">El cliente pagó con:</label>
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon bg-white font-bold text-shop-green">$</span>
        <InputNumber
          v-model="montoRecibido"
          mode="decimal"
          :minFractionDigits="2"
          :maxFractionDigits="2"
          placeholder="0.00"
          class="font-bold"
          :locale="'es-SV'"
          :decimalSeparator="','"
          :thousandSeparator="'.'"
        />
      </div>

      <div class="flex justify-between items-center mt-3 text-sm"
        :class="{'text-shop-red font-bold': cambio < 0, 'text-shop-green font-bold': cambio >= 0}">
        <span>{{ cambio < 0 ? 'Falta dinero:' : 'Vuelto a entregar:' }}</span>
        <span class="text-lg">${{ Math.abs(cambio).toFixed(2) }}</span>
      </div>
    </div>

    <!-- Mensaje cuando es transferencia -->
    <div v-else-if="ventaStore.estado !== 'CREDITO' && ventaStore.isTransferencia" class="text-center text-shop-text-3 text-sm py-2">
      <i class="pi pi-building-columns text-lg mb-1 block"></i>
      Pago por transferencia bancaria. No requiere vuelto.
    </div>

    <!-- Mensaje cuando es crédito -->
    <div v-else class="text-center text-shop-text-3 text-sm py-2">
      La venta se registrará como venta al CRÉDITO.
    </div>

    <!-- Acciones finales -->
    <div class="mt-auto flex flex-col gap-2 pt-4">
      <!-- Toggle imprimir ticket -->
      <div
        class="flex items-center justify-between bg-white border p-2 rounded-shop px-3 cursor-pointer transition-all duration-200"
        :class="opcionImprimirTicket
          ? 'border-shop-green bg-shop-green-pale shadow-[0_0_12px_rgba(34,197,94,0.5)]'
          : 'border-shop-border hover:bg-shop-bg'"
        @click="opcionImprimirTicket = !opcionImprimirTicket"
      >
        <label class="text-xs font-bold text-shop-text-2 uppercase flex items-center gap-2 cursor-pointer">
          <i class="pi pi-print text-shop-text-3 text-sm"></i> Imprimir Ticket
        </label>
        <i
          class="pi text-xl transition-colors duration-200"
          :class="opcionImprimirTicket ? 'pi-check-circle text-shop-green' : 'pi-circle text-shop-text-3'"
        ></i>
      </div>

      <!-- Botón Crédito -->
      <button @click="abrirDialogoCredito"
        class="w-full py-2 border-2 border-shop-green text-shop-green font-bold rounded-shop-sm hover:bg-shop-green-pale transition-colors flex items-center justify-center gap-2 mt-1"
        :class="{ 'bg-shop-green text-white hover:bg-shop-green-dark': ventaStore.estado === 'CREDITO' }">
        <i class="pi pi-book"></i>
        {{ ventaStore.estado === 'CREDITO' ? 'Cambiar Cliente Crédito' : 'Asignar a Crédito (Fiado)' }}
      </button>

      <!-- Botón Finalizar Venta -->
      <button @click="abrirConfirmacionVenta"
        class="w-full py-3 bg-shop-green text-white font-black text-lg rounded-shop-sm hover:bg-shop-green-dark transition-colors shadow-shop flex items-center justify-center gap-2"
        :disabled="ventaStore.detalle.length === 0 || loading">
        <i class="pi pi-check-circle text-xl"></i> FINALIZAR VENTA
      </button>

      <!-- Botón Limpiar -->
      <button @click="limpiarTodo"
        class="w-full py-2 text-shop-text-3 font-bold hover:text-shop-red hover:bg-shop-red-pale rounded-shop-sm transition-all flex items-center justify-center gap-2 text-sm mt-1">
        <i class="pi pi-trash"></i> Limpiar Venta
      </button>
    </div>

    <!-- Diálogo de Crédito (buscar existente + nuevo) -->
    <Dialog
      v-model:visible="mostrarDialogoCredito"
      modal
      header="Cliente Crédito"
      :style="{ width: '450px' }"
      :pt="{ root: { class: 'rounded-shop overflow-hidden' }, header: { class: 'bg-white pb-0' } }"
      appendTo="body"
    >
      <div class="pt-2 flex flex-col gap-4">
        <div class="flex border-b border-shop-border">
          <button
            @click="modoDialogo = 'buscar'"
            class="flex-1 pb-2 text-sm font-bold transition-colors border-b-2"
            :class="modoDialogo === 'buscar' ? 'border-shop-green text-shop-green' : 'border-transparent text-shop-text-3 hover:text-shop-text'"
          >Buscar Existente</button>
          <button
            @click="modoDialogo = 'nuevo'"
            class="flex-1 pb-2 text-sm font-bold transition-colors border-b-2"
            :class="modoDialogo === 'nuevo' ? 'border-shop-green text-shop-green' : 'border-transparent text-shop-text-3 hover:text-shop-text'"
          >Registrar Nuevo</button>
        </div>

        <div v-if="modoDialogo === 'buscar'" class="flex flex-col gap-1 py-2">
          <label class="text-xs font-bold text-shop-text-2 uppercase">Seleccionar de la base de datos</label>
          <Dropdown
            v-model="clienteExistenteSeleccionado"
            :options="clientesCredito"
            optionLabel="nombre"
            optionValue="id"
            filter
            placeholder="Escribe el nombre o DUI..."
            class="w-full rounded-shop-sm"
            emptyFilterMessage="No se encontraron clientes"
          >
            <template #option="slotProps">
              <div class="flex flex-col py-1">
                <span class="font-bold text-shop-text">{{ slotProps.option.nombre }}</span>
                <span class="text-xs text-shop-text-3"><i class="pi pi-id-card text-[10px]"></i> DUI: {{ slotProps.option.dui }}</span>
              </div>
            </template>
          </Dropdown>
          <div class="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" icon="pi pi-times" text severity="secondary" @click="mostrarDialogoCredito = false" class="rounded-shop-sm" />
            <Button label="Asignar Existente" icon="pi pi-check" severity="success" @click="asignarClienteExistente" :disabled="!clienteExistenteSeleccionado" class="rounded-shop-sm" />
          </div>
        </div>

        <div v-if="modoDialogo === 'nuevo'" class="flex flex-col items-center py-4">
          <p class="text-sm text-shop-text-2 mb-4">Registre un nuevo cliente crédito</p>
          <Button label="Abrir formulario nuevo cliente" icon="pi pi-user-plus" severity="info" @click="abrirModalNuevoCliente" class="rounded-shop-sm" />
          <Button label="Volver" icon="pi pi-arrow-left" text severity="secondary" @click="modoDialogo = 'buscar'" class="mt-2 rounded-shop-sm" />
        </div>
      </div>
    </Dialog>

    <!-- Modal de registro de cliente crédito (componente independiente) -->
    <ClienteCreditoModal
      v-model:visible="mostrarModalNuevoCliente"
      @clienteGuardado="onClienteNuevoGuardado"
    />

    <!-- Modal de confirmación personalizado -->
    <div v-if="mostrarConfirmarVenta" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4 text-center">
      <div class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#044e04]"></div>
        <div class="p-10">
          <div class="flex justify-center mb-6 text-green-600"><i class="pi pi-check-circle text-6xl"></i></div>
          <h2 class="text-xl font-extrabold text-gray-800 mb-2">¿Finalizar Venta?</h2>
          <div class="space-y-1 mb-8">
             <p class="text-1xl text-gray-800 font-bold">Total: <span class="font-black text-green-700">${{ ventaStore.total.toFixed(2) }}</span></p>
             <p class="text-xs text-gray-800 font-medium uppercase tracking-wider">
               {{ ventaStore.estado === 'CREDITO' ? 'Crédito' : metodoPagoNombre }} • {{ ventaStore.tipo_cliente }}
             </p>
          </div>
          <div class="flex items-center gap-3">
            <button @click="mostrarConfirmarVenta = false" class="flex-1 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#e2eee2] hover:bg-white text-sm transition-colors">Cancelar</button>
            <button @click="ejecutarFinalizarVenta" class="flex-1 py-3 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-md text-sm transition-colors">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useVentaStore } from '@/stores/venta/ventaStore';
import { useToast } from 'primevue/usetoast';
import api from '@/services/api';
import { Dropdown, InputNumber, Dialog, Button } from '@/utils/primevue';
import ClienteCreditoModal from './ClienteCreditoModal.vue';

const ventaStore = useVentaStore();
const toast = useToast();

const montoRecibido = ref(null);
const opcionImprimirTicket = ref(false);
const loading = ref(false);

const mostrarDialogoCredito = ref(false);
const modoDialogo = ref('buscar');
const clienteExistenteSeleccionado = ref(null);
const mostrarModalNuevoCliente = ref(false);
const mostrarConfirmarVenta = ref(false);

const clientesCredito = ref([]);

onMounted(async () => {
  try {
    await ventaStore.cargarMetodosPago();
    const { data } = await api.get('/clientes-creditos');
    clientesCredito.value = data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar datos de configuración', life: 4000 });
  }
});

const cambio = computed(() => {
  if (!montoRecibido.value) return 0;
  return montoRecibido.value - ventaStore.total;
});

const metodoPagoNombre = computed(() => {
  const metodo = ventaStore.metodosPago.find(m => m.id === ventaStore.metodo_pago_id);
  return metodo ? metodo.nombre : 'No seleccionado';
});

const abrirDialogoCredito = () => {
  clienteExistenteSeleccionado.value = ventaStore.cliente_credito_id || null;
  modoDialogo.value = 'buscar';
  mostrarDialogoCredito.value = true;
};

const asignarClienteExistente = () => {
  if (clienteExistenteSeleccionado.value) {
    ventaStore.setClienteExistente(clienteExistenteSeleccionado.value);
    mostrarDialogoCredito.value = false;
    toast.add({ severity: 'info', summary: 'Venta al crédito', detail: 'Cliente existente asignado.', life: 3000 });
  }
};

const abrirModalNuevoCliente = () => {
  mostrarModalNuevoCliente.value = true;
};

const onClienteNuevoGuardado = (datosCliente) => {
  ventaStore.setClienteNuevo(datosCliente);
  mostrarDialogoCredito.value = false;
  toast.add({ severity: 'success', summary: 'Cliente registrado', detail: 'Venta al crédito con nuevo cliente.', life: 3000 });
};

const cancelarCredito = () => {
  ventaStore.cancelarCredito();
  toast.add({ severity: 'info', summary: 'Crédito cancelado', detail: 'La venta volvió a ser de contado.', life: 3000 });
};

const abrirConfirmacionVenta = () => {
  if (ventaStore.estado !== 'CREDITO' && !ventaStore.metodo_pago_id) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Seleccione un método de pago', life: 3000 });
    return;
  }
  if (ventaStore.estado === 'PAGADA' && !ventaStore.isTransferencia) {
    if (montoRecibido.value === null || cambio.value < 0) {
      toast.add({ severity: 'error', summary: 'Error de cobro', detail: 'El monto recibido es menor al total.', life: 3000 });
      return;
    }
  }
  mostrarConfirmarVenta.value = true;
};

const ejecutarFinalizarVenta = () => {
  mostrarConfirmarVenta.value = false;
  procesarVenta();
};

const procesarVenta = async () => {
  loading.value = true;
  const eraCredito = ventaStore.estado === 'CREDITO';
  try {
    const response = await ventaStore.confirmarVenta();
    toast.add({ severity: 'success', summary: 'Venta Exitosa', detail: `Correlativo: ${response.venta.correlativo}`, life: 5000 });
    if (eraCredito) {
      try {
        const { data } = await api.get('/clientes-creditos');
        clientesCredito.value = data;
      } catch (e) {
        console.warn('No se pudo refrescar la lista de clientes crédito.');
      }
    }
    if (opcionImprimirTicket.value) {
      console.log("Ticket pendiente para venta ID:", response.venta.id);
    }
    limpiarTodo();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'No se pudo registrar la venta', life: 5000 });
  } finally {
    loading.value = false;
  }
};

const limpiarTodo = () => {
  ventaStore.resetCarrito();
  montoRecibido.value = null;
};
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
