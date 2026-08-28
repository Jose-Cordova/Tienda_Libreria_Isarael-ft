<template>
  <main class="flex-1 bg-[#f4f7f6] p-3 sm:p-6 overflow-y-auto custom-scrollbar">
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
      :cantidadDevueltas="store.totales.devueltas.cantidad"
      :totalDevueltas="formatearMoneda(store.totales.devueltas.total)"
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
      @anular="confirmarAnulacion"
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

    <!-- MODAL DE DETALLE DE VENTA -->
    <DetalleVentaModal
      :visible="mostrarDetalle"
      :venta="ventaDetalle"
      @cerrar="cerrarDetalle"
    />
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useHistorialStore } from '@/stores/venta/historialStore';
import FiltrosHistorial from '@/components/historialVentas/FiltrosHistorial.vue';
import CardsResumen from '@/components/historialVentas/CardsResumen.vue';
import TablaHistorial from '@/components/historialVentas/TablaHistorial.vue';
import DetalleVentaModal from '@/components/historialVentas/DetalleVentaModal.vue';
import { Paginator } from '@/utils/primevue';
import { useToast } from 'primevue/usetoast';
import api from '@/services/api';
import Swal from 'sweetalert2';

// -----------------------------------------------
// Store y estado local
// -----------------------------------------------
const store = useHistorialStore();
const toast = useToast();

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
      ?.map(d => `${d.producto?.nombre || 'Producto'} x${d.cantidad}`)
      .join(', ') || '',
    itemsCount: v.detalle_ventas?.length || 0,
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
// Métodos para detalle y anulación
// -----------------------------------------------
const abrirDetalle = async (ventaResumen) => {
  try {
    const response = await api.get(`/ventas/${ventaResumen.id}`);
    ventaDetalle.value = response.data.venta;
    mostrarDetalle.value = true;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el detalle de la venta.',
      life: 5000
    });
  }
};

const cerrarDetalle = () => {
  mostrarDetalle.value = false;
  ventaDetalle.value = null;
};

// Confirmación destructiva de anulación con SweetAlert2 y resultado en Toast
const confirmarAnulacion = async (venta) => {
  const result = await Swal.fire({
    title: '¿Anular esta venta?',
    text: `Se anulará la venta #${venta.correlativo}. Los productos regresarán al inventario.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d1333e',
    cancelButtonColor: '#d6dfd6',
    confirmButtonText: 'Sí, anular',
    cancelButtonText: 'Cancelar',
    customClass: { cancelButton: '!text-[#3a5a3a] !font-bold' },
    reverseButtons: true,
    allowOutsideClick: false
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/ventas/${venta.id}`);
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `La venta #${venta.correlativo} ha sido anulada con éxito.`,
        life: 3500
      });
      store.fetchVentas(store.currentPage);
    } catch (error) {
      const mensaje = error.response?.data?.message || 'No se pudo anular la venta.';
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: mensaje,
        life: 5000
      });
    }
  }
};

// -----------------------------------------------
// Carga Inicial
// -----------------------------------------------
onMounted(() => {
  cargarMetodosPago();
  store.fetchVentas();
});
</script>

<style scoped>
.p-inputtext {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #c6e5d3;
  border-radius: 4px;
}
:deep(.custom-paginator) {
  background: transparent;
  border: none;
  padding: 0;
}
:deep(.p-paginator-page.p-highlight) {
  background: #0b580b !important;
  color: white !important;
  font-weight: bold;
}
.animate-fade-up {
  animation: fadeUp 0.3s ease-out forwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
