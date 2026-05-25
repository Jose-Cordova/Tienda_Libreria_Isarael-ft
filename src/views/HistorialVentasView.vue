<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar">
    <!-- Filtros y cabecera -->
    <FiltrosHistorial
      :filtros="store.filters"
      :metodosPago="metodosPago"
      @update:filtros="actualizarFiltros"
      @limpiar="limpiarFiltros"
    />

    <!-- Cards de resumen (totales globales) -->
    <CardsResumen
      :cantidadPagadas="store.totales.pagadas.cantidad"
      :totalPagadas="formatearMoneda(store.totales.pagadas.total)"
      :cantidadCredito="store.totales.credito.cantidad"
      :totalCredito="formatearMoneda(store.totales.credito.total)"
    />

    <!-- Indicador de carga -->
    <div v-if="store.loading" class="text-center py-10 text-gray-500">
      <i class="pi pi-spin pi-spinner text-3xl"></i>
      <p class="mt-2 text-sm">Cargando historial...</p>
    </div>

    <!-- Tabla de historial -->
    <TablaHistorial
      v-else
      :ventas="ventasFormateadas"
      @ver-detalle="abrirDetalle"
      @eliminar="confirmarEliminacion"
    />

    <!-- Paginador -->
    <div
      v-if="store.total > store.perPage"
      class="p-3 border-t border-gray-400 bg-gray-50/50"
    >
      <Paginator
        :rows="store.perPage"
        :totalRecords="store.total"
        :rowsPerPageOptions="[5, 10, 20, 30]"
        :first="(store.currentPage - 1) * store.perPage"
        @page="store.setPage"
        @update:rows="store.setPerPage"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        class="custom-paginator text-[10px]"
      />
    </div>

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
import { useHistorialStore } from '@/stores/historialStore';
import FiltrosHistorial from '@/components/ventas/FiltrosHistorial.vue';
import CardsResumen from '@/components/ventas/CardsResumen.vue';
import TablaHistorial from '@/components/ventas/TablaHistorial.vue';
import DetalleVentaModal from '@/components/ventas/DetalleVentaModal.vue';
import { ventaService } from '@/services/ventaService';
import { Paginator } from '@/utils/primevue';
import api from '@/services/api';
import Swal from 'sweetalert2';

// -----------------------------------------------
// Store y estado local
// -----------------------------------------------
const store = useHistorialStore();

const mostrarDetalle = ref(false);
const ventaDetalle = ref(null);

// Métodos de pago (carga única desde API)
const metodosPago = ref([]);
const cargarMetodosPago = async () => {
  try {
    const response = await api.get('/metodos-pagos');
    metodosPago.value = response.data;
  } catch (error) {
    console.error('Error al cargar métodos de pago:', error);
  }
};

// -----------------------------------------------
// Formateo de moneda para las cards
// -----------------------------------------------
const formatearMoneda = (valor) => `$${Number(valor).toFixed(2)}`;

// -----------------------------------------------
// Datos formateados para la tabla
// -----------------------------------------------
const ventasFormateadas = computed(() =>
  store.ventas.map(v => ({
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
  }))
);

// -----------------------------------------------
// Métodos para filtros
// -----------------------------------------------
const actualizarFiltros = (nuevosFiltros) => {
  store.setFilters(nuevosFiltros);
  store.fetchVentas(1);
};

const limpiarFiltros = () => {
  store.resetFilters();
  store.fetchVentas(1);
};

// -----------------------------------------------
// Métodos para detalle y eliminación
// -----------------------------------------------
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
      // Aquí iría la llamada al backend para anular
      Swal.fire('Anulada', `La venta #${venta.correlativo} ha sido anulada.`, 'success');
    }
  });
};

// -----------------------------------------------
// Carga inicial
// -----------------------------------------------
onMounted(() => {
  cargarMetodosPago();
  store.fetchVentas();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #c6e5d3;
  border-radius: 4px;
}
</style>
