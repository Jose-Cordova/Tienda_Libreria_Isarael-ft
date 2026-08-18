<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative">
    <!-- Encabezado con filtros -->
    <CreditoHeader
      v-model:filtro-credito="filtroCredito"
      v-model:buscar-cliente="buscarCliente"
      :opciones-estado-credito="opcionesEstadoCredito"
    />

    <!-- KPIs resumen -->
    <CreditoCards
      :total-deuda="kpiResumen.totalDeuda"
      :clientes-con-deuda="kpiResumen.clientesConDeuda"
      :creditos-pagados="kpiResumen.creditosPagados"
      :total-abonado="kpiResumen.totalAbonado"
    />

    <!-- Tabla principal de créditos -->
    <CreditoTable
      :clientes="clientesFiltrados"
      @ver-detalle="abrirDetalleCliente"
    />

    <!-- Paginación -->
    <div v-if="store.total > 0" class="p-3 border-t border-gray-400 bg-gray-50/50">
      <Paginator
        :rows="store.perPage"
        :totalRecords="store.total"
        :rowsPerPageOptions="[5, 10, 20, 30]"
        :first="(store.currentPage - 1) * store.perPage"
        @page="onPageChange"
        @update:rows="store.setPerPage"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        class="custom-paginator text-[10px]"
      />
    </div>

    <!-- Modal de detalle de crédito -->
    <DetalleCreditoModal
      :visible="detalleVisible"
      :cliente="clienteCompleto"
      @update:visible="detalleVisible = false"
      @registrar-abono="prepararAbono"
      @anular-abono="anularAbono"
      @editar-cliente="abrirEdicionCliente"
    />

    <!-- Modal para registrar abono -->
    <AbonoModal
      :key="abonoActual?.id"
      :visible="abonoVisible"
      :saldo-pendiente="abonoActual?.saldoPendiente || 0"
      :metodos="store.metodosPago"
      @update:visible="abonoVisible = false"
      @confirmar="confirmarAbono"
    />

    <!-- Modal para editar cliente crédito -->
    <ClienteCreditoModal
      v-if="editarVisible"
      :visible="true"
      :cliente="clienteEditando"
      @update:visible="editarVisible = false"
      @clienteGuardado="guardarEdicionCliente"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCreditoStore } from '@/stores/credito/creditoStore';
import CreditoHeader from '../components/creditos/CreditoHeader.vue';
import CreditoCards from '../components/creditos/CreditoCards.vue';
import CreditoTable from '../components/creditos/CreditoTable.vue';
import DetalleCreditoModal from '../components/creditos/DetalleCreditoModal.vue';
import AbonoModal from '../components/creditos/AbonoModal.vue';
import ClienteCreditoModal from '../components/creditos/ClienteCreditoModal.vue';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import api from '@/services/api';

const toast = useToast();
const store = useCreditoStore();

// Filtros: iniciar en PENDIENTE por defecto
const filtroCredito = ref('PENDIENTE');
const buscarCliente = ref('');

const opcionesEstadoCredito = [
  { label: 'Todos los créditos', value: null },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Pagados', value: 'PAGADO' }
];

watch([filtroCredito, buscarCliente], ([estado, search]) => {
  store.setFiltroEstado(estado);
  store.setSearch(search);
  store.fetchClientes(1);
});

// KPIs calculados desde los datos reales
const kpiResumen = computed(() => {
  const clientes = Array.isArray(store.clientes) ? store.clientes : [];

  let totalDeudaPendiente = 0;
  let clientesConDeuda = 0;
  let totalAbonado = 0;
  let creditosPagados = 0;

  clientes.forEach(c => {
    const deudaOriginal = parseFloat(c.total_deuda || c.totalDeuda || 0);
    const abonado = parseFloat(c.total_abonado || c.totalAbonado || 0);
    const pendiente = deudaOriginal - abonado;

    totalDeudaPendiente += pendiente;
    totalAbonado += abonado;

    if (pendiente > 0) {
      clientesConDeuda++;
    } else {
      creditosPagados++;
    }
  });

  return {
    totalDeuda: parseFloat(totalDeudaPendiente.toFixed(2)),
    clientesConDeuda,
    creditosPagados,
    totalAbonado: parseFloat(totalAbonado.toFixed(2)),
  };
});

// Mapear para la tabla
const clientesFiltrados = computed(() => {
  return store.clientes.map(c => ({
    id: c.id,
    nombre: c.nombre,
    dui: c.dui,
    creditosActivos: c.creditos_activos,
    totalDeuda: parseFloat(c.total_deuda || c.totalDeuda || 0).toFixed(2),
    totalAbonado: parseFloat(c.total_abonado || c.totalAbonado || 0).toFixed(2),
    estado: c.estado === 'CON DEUDA' ? 'CON DEUDA' : 'SIN DEUDA'
  }));
});

// Detalle
const detalleVisible = ref(false);
const abonoVisible = ref(false);
const abonoActual = ref(null);

// Edición de cliente
const editarVisible = ref(false);
const clienteEditando = ref(null);

const clienteCompleto = computed(() => {
  if (!store.clienteSeleccionado) return null;
  const creditos = store.creditosCliente.map(c => ({
    id: c.id,
    fecha: c.fecha,
    montoOriginal: c.monto_original,
    abonado: c.abonado,
    saldoPendiente: c.saldo_pendiente,
    estado: c.estado,
    abonos: c.abonos || []
  }));
  let saldoPendienteTotal = 0, abonadoTotal = 0;
  creditos.forEach(c => {
    saldoPendienteTotal += parseFloat(c.saldoPendiente);
    abonadoTotal += parseFloat(c.abonado);
  });
  return {
    ...store.clienteSeleccionado,
    creditos,
    kpi: {
      saldoPendiente: parseFloat(saldoPendienteTotal.toFixed(2)),
      totalAbonado: parseFloat(abonadoTotal.toFixed(2)),
      creditosTotales: creditos.length
    }
  };
});

// Acciones
const abrirDetalleCliente = async (cliente) => {
  try {
    await store.fetchDetalleCliente(cliente.id);
    detalleVisible.value = true;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle del cliente', life: 3000 });
  }
};

const prepararAbono = (credito) => {
  abonoActual.value = {
    ...credito,
    saldoPendiente: credito.saldoPendiente ?? credito.saldo_pendiente ?? 0,
  };
  abonoVisible.value = true;
};

const confirmarAbono = async (datos) => {
  try {
    const response = await store.storeAbono(abonoActual.value.id, datos);
    abonoVisible.value = false;
    await store.fetchDetalleCliente(store.clienteSeleccionado.id);
    await store.fetchClientes(store.currentPage);

    // ✅ Generar ticket usando axios con responseType blob (envía el token JWT)
    if (response.ticket_url) {
      try {
        const pdfResponse = await api.get(response.ticket_url, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([pdfResponse.data], { type: 'application/pdf' }));
        window.open(url, '_blank');
        // Liberar memoria después de un tiempo
        setTimeout(() => window.URL.revokeObjectURL(url), 30000);
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el ticket.', life: 3000 });
      }
    }

    toast.add({ severity: 'success', summary: 'Abono registrado', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'No se pudo registrar el abono', life: 4000 });
  }
};

const anularAbono = async (abono) => {
  try {
    await store.anularAbono(abono.id);
    await store.fetchDetalleCliente(store.clienteSeleccionado.id);
    await store.fetchClientes(store.currentPage);
    toast.add({ severity: 'success', summary: 'Abono anulado', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'No se pudo anular el abono', life: 4000 });
  }
};

// Editar cliente
const abrirEdicionCliente = (cliente) => {
  clienteEditando.value = {
    id: cliente.id,
    nombre: cliente.nombre,
    dui: cliente.dui || '',
    telefono: cliente.telefono || ''
  };
  editarVisible.value = true;
};

const guardarEdicionCliente = async (datos) => {
  try {
    // Usar el id del cliente que se está editando
    const idCliente = clienteEditando.value?.id;
    if (!idCliente) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo identificar el cliente a editar', life: 3000 });
      return;
    }

    await api.put(`/clientes-creditos/${idCliente}`, datos);
    editarVisible.value = false; // Cerrar solo si la petición fue exitosa
    await store.fetchClientes(store.currentPage);
    if (store.clienteSeleccionado) {
      await store.fetchDetalleCliente(store.clienteSeleccionado.id);
    }
    toast.add({ severity: 'success', summary: 'Cliente actualizado', life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'No se pudo actualizar el cliente', life: 4000 });
  }
};

// Manejador de paginación local
const onPageChange = (event) => {
  const page = event.page + 1;
  store.fetchClientes(page);
};

onMounted(() => {
  store.cargarMetodosPago();
  store.setFiltroEstado(filtroCredito.value);
  store.fetchClientes(1);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #c6e5d3; border-radius: 4px; }
:deep(.custom-paginator .p-paginator-page.p-highlight) {
  background: #0b580b !important;
  color: white !important;
  font-weight: bold;
}
</style>
