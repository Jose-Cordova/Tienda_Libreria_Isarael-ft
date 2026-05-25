<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar">
    <!-- Filtros y cabecera -->
    <FiltrosHistorial
      :filtros="filtros"
      @update:filtros="actualizarFiltros"
      @limpiar="limpiarFiltros"
    />

    <!-- Cards de resumen (4 cards) -->
    <CardsResumen
      :cantidadPagadas="cantidadPagadas"
      :totalPagadas="totalPagadas"
      :cantidadCredito="cantidadCredito"
      :totalCredito="totalCredito"
    />

    <!-- Indicador de carga -->
    <div v-if="loading" class="text-center py-10 text-gray-500">
      <i class="pi pi-spin pi-spinner text-3xl"></i>
      <p class="mt-2 text-sm">Cargando historial...</p>
    </div>

    <!-- Tabla de historial -->
    <TablaHistorial
      v-else
      :ventas="ventasFiltradas"
      @ver-detalle="abrirDetalle"
      @eliminar="confirmarEliminacion"
    />

    <!-- Modal de detalle -->
    <DetalleVentaModal
      :visible="mostrarDetalle"
      :venta="ventaDetalle"
      @cerrar="cerrarDetalle"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import FiltrosHistorial from '@/components/ventas/FiltrosHistorial.vue';
import CardsResumen from '@/components/ventas/CardsResumen.vue';
import TablaHistorial from '@/components/ventas/TablaHistorial.vue';
import DetalleVentaModal from '@/components/ventas/DetalleVentaModal.vue';
import { ventaService } from '@/services/ventaService';
import Swal from 'sweetalert2';

// -----------------------------------------------
// Estado reactivo
// -----------------------------------------------
const filtros = ref({
  search: '',
  method: null,
  type: null,
  dateFrom: null,
  dateTo: null
});

const ventasOriginal = ref([]);
const loading = ref(false);
const mostrarDetalle = ref(false);
const ventaDetalle = ref(null);

// -----------------------------------------------
// Computadas
// -----------------------------------------------
const ventasFiltradas = computed(() => {
  let resultado = ventasOriginal.value;

  // Filtro local por texto (correlativo)
  if (filtros.value.search) {
    const termino = filtros.value.search.toLowerCase();
    resultado = resultado.filter(v =>
      String(v.correlativo).includes(termino)
    );
  }

  return resultado;
});

const cantidadPagadas = computed(() => {
  return ventasFiltradas.value.filter(v => v.estado === 'Pagada').length;
});

const totalPagadas = computed(() => {
  const suma = ventasFiltradas.value
    .filter(v => v.estado === 'Pagada')
    .reduce((acc, v) => acc + v.total, 0);
  return `$${suma.toFixed(2)}`;
});

const cantidadCredito = computed(() => {
  return ventasFiltradas.value.filter(v => v.estado === 'Credito').length;
});

const totalCredito = computed(() => {
  const suma = ventasFiltradas.value
    .filter(v => v.estado === 'Credito')
    .reduce((acc, v) => acc + v.total, 0);
  return `$${suma.toFixed(2)}`;
});

// -----------------------------------------------
// Métodos
// -----------------------------------------------
const cargarVentas = async () => {
  loading.value = true;
  try {
    const params = {};

    if (filtros.value.type?.value) {
      params.tipoCliente = filtros.value.type.value;
    }
    if (filtros.value.method?.value) {
      params.metodo_pago_id = filtros.value.method.value;
    }
    if (filtros.value.dateFrom) {
      params.fecha_inicio = filtros.value.dateFrom;
    }
    if (filtros.value.dateTo) {
      params.fecha_fin = filtros.value.dateTo;
    }

    const ventas = await ventaService.obtenerVentas(params);

    ventasOriginal.value = ventas.map(v => ({
      id: v.id,
      correlativo: v.correlativo,
      fecha: new Date(v.fecha).toLocaleDateString('es-ES'),
      hora: new Date(v.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      productos: v.detalle_ventas
        .map(d => `${d.producto.nombre} x${d.cantidad}`)
        .join(', '),
      itemsCount: v.detalle_ventas.length,
      metodo: v.metodo_pago?.nombre || 'Sin método',
      tipo: v.tipo_cliente === 'MAYORISTA' ? 'Mayorista' : 'Detalle',
      estado: v.estado.charAt(0) + v.estado.slice(1).toLowerCase(),
      total: parseFloat(v.total)
    }));
  } catch (error) {
    console.error('Error al cargar ventas:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar el historial de ventas.'
    });
  } finally {
    loading.value = false;
  }
};

const actualizarFiltros = (nuevosFiltros) => {
  filtros.value = { ...nuevosFiltros };
  cargarVentas();
};

const limpiarFiltros = () => {
  filtros.value = {
    search: '',
    method: null,
    type: null,
    dateFrom: null,
    dateTo: null
  };
  cargarVentas();
};

const abrirDetalle = async (ventaResumen) => {
  try {
    const ventaCompleta = await ventaService.obtenerVentaPorId(ventaResumen.id);
    ventaDetalle.value = ventaCompleta;
    mostrarDetalle.value = true;
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar el detalle de la venta.'
    });
  }
};

const cerrarDetalle = () => {
  mostrarDetalle.value = false;
  ventaDetalle.value = null;
};

const confirmarEliminacion = (venta) => {
  Swal.fire({
    title: `¿Anular venta #${venta.correlativo}?`,
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, anular',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Anulada', `La venta #${venta.correlativo} ha sido anulada.`, 'success');
    }
  });
};

onMounted(cargarVentas);
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #c6e5d3;
  border-radius: 4px;
}
</style>
