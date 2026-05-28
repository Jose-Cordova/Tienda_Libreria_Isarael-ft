<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative">
    <CreditoHeader
      v-model:filtro-credito="filtroCredito"
      v-model:buscar-cliente="buscarCliente"
      :opciones-estado-credito="opcionesEstadoCredito"
    />

    <CreditoCards
      :total-deuda="kpiResumen.totalDeuda"
      :clientes-con-deuda="kpiResumen.clientesConDeuda"
      :creditos-pagados="kpiResumen.creditosPagados"
      :total-abonado="kpiResumen.totalAbonado"
    />

    <CreditoTable
      :clientes="clientesFiltrados"
      @ver-detalle="abrirDetalleCliente"
    />

    <DetalleCreditoModal
      :visible="detalleVisible"
      :cliente="clienteSeleccionado"
      @update:visible="detalleVisible = false"
      @registrar-abono="prepararAbono"
      @anular-abono="anularAbono"
    />

    <AbonoModal
      :visible="abonoVisible"
      :saldo-pendiente="abonoActual?.saldoPendiente || 0"
      :metodos="metodosPago"
      @update:visible="abonoVisible = false"
      @confirmar="confirmarAbono"
    />
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import CreditoHeader from '../components/creditos/CreditoHeader.vue';
import CreditoCards from '../components/creditos/CreditoCards.vue';
import CreditoTable from '../components/creditos/CreditoTable.vue';
import DetalleCreditoModal from '../components/creditos/DetalleCreditoModal.vue';
import AbonoModal from '../components/creditos/AbonoModal.vue';

// --- Filtros ---
const buscarCliente = ref('');
const filtroCredito = ref(null);

const opcionesEstadoCredito = [
  { label: 'Todos los créditos', value: 'todos' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Pagados', value: 'PAGADO' }
];

// --- KPIs de resumen (simulados) ---
const kpiResumen = ref({
  totalDeuda: 14.50,
  clientesConDeuda: 2,
  creditosPagados: 3,
  totalAbonado: 17.50
});

// --- Datos de prueba (clientes con créditos) ---
const clientes = ref([
  {
    id: 1,
    nombre: 'Ana González',
    dui: '12345678-9',
    creditosActivos: 1,
    totalDeuda: 6.25,
    totalAbonado: 0.00,
    estado: 'CON DEUDA',
    telefono: '7123-4567',
    iniciales: 'AG',
    fechaRegistro: '2026-05-20',
    creditos: [
      {
        id: 101,
        fecha: '2026-05-20',
        montoOriginal: 6.25,
        abonado: 0,
        saldoPendiente: 6.25,
        estado: 'PENDIENTE',
        abonos: []
      }
    ]
  },
  {
    id: 2,
    nombre: 'Carlos Pérez',
    dui: '98765432-1',
    creditosActivos: 2,
    totalDeuda: 12.00,
    totalAbonado: 3.50,
    estado: 'CON DEUDA',
    telefono: '7654-1234',
    iniciales: 'CP',
    fechaRegistro: '2026-04-10',
    creditos: [
      {
        id: 102,
        fecha: '2026-04-10',
        montoOriginal: 10.00,
        abonado: 3.50,
        saldoPendiente: 6.50,
        estado: 'PENDIENTE',
        abonos: [
          { id: 1001, fecha: '2026-04-15', monto: 3.50, metodo: 'Efectivo', estado: 'PAGADO' }
        ]
      },
      {
        id: 103,
        fecha: '2026-05-22',
        montoOriginal: 5.50,
        abonado: 0,
        saldoPendiente: 5.50,
        estado: 'PENDIENTE',
        abonos: []
      }
    ]
  }
]);

// --- Filtrado de clientes ---
const clientesFiltrados = computed(() => {
  return clientes.value.filter(cliente => {
    const coincideBusqueda =
      cliente.nombre.toLowerCase().includes(buscarCliente.value.toLowerCase()) ||
      cliente.dui.includes(buscarCliente.value);

    if (!filtroCredito.value || filtroCredito.value === 'todos') {
      return coincideBusqueda;
    }
    const tieneCreditoConEstado = cliente.creditos.some(c => c.estado === filtroCredito.value);
    return coincideBusqueda && tieneCreditoConEstado;
  });
});

// --- Lógica de modales ---
const detalleVisible = ref(false);
const clienteSeleccionado = ref(null);
const abonoVisible = ref(false);
const abonoActual = ref(null);

const metodosPago = ref([
  { id: 1, nombre: 'Efectivo' },
  { id: 2, nombre: 'Transferencia' }
]);

const abrirDetalleCliente = (cliente) => {
  const kpi = calcularKpiCliente(cliente);
  clienteSeleccionado.value = { ...cliente, kpi };
  detalleVisible.value = true;
};

const calcularKpiCliente = (cliente) => {
  let pendiente = 0;
  let abonado = 0;
  cliente.creditos.forEach(c => {
    pendiente += c.saldoPendiente;
    abonado += c.abonado;
  });
  return {
    saldoPendiente: pendiente,
    totalAbonado: abonado,
    creditosTotales: cliente.creditos.length
  };
};

const prepararAbono = (credito) => {
  abonoActual.value = credito;
  abonoVisible.value = true;
};

const confirmarAbono = (datos) => {
  console.log('Abono registrado:', datos);
  abonoVisible.value = false;
  if (abonoActual.value) {
    abonoActual.value.abonado += datos.monto;
    abonoActual.value.saldoPendiente -= datos.monto;
    if (abonoActual.value.saldoPendiente <= 0) {
      abonoActual.value.estado = 'PAGADO';
    }
    abonoActual.value.abonos.push({
      id: Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      monto: datos.monto,
      metodo: metodosPago.value.find(m => m.id === datos.metodo_pago_id)?.nombre,
      estado: 'PAGADO'
    });
  }
};

const anularAbono = (abono) => {
  console.log('Anular abono:', abono);
  abono.estado = 'ANULADO';
};
</script>
