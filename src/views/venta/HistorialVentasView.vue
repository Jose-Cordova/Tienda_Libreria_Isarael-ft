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

    <!-- MODAL: Anulación (ya existente) -->
    <div v-if="mostrarAnular" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4 text-center">
      <div class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#044e04]"></div>
        <div class="p-10">
          <div class="flex justify-center mb-6 text-red-500"><i class="pi pi-ban text-6xl"></i></div>
          <h2 class="text-xl font-extrabold text-gray-800 mb-2">¿Anular esta venta?</h2>
          <p class="text-1xl text-gray-500 mb-8 font-medium">Se anulará la venta con correlativo "{{ ventaAnular?.correlativo }}".</p>
          <div class="flex items-center gap-3">
            <button @click="mostrarAnular = false" class="flex-1 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#e2eee2] hover:bg-white text-sm">Cancelar</button>
            <button @click="ejecutarAnulacion" class="flex-1 py-3 bg-[#d1333e] hover:bg-[#a82430] text-white font-bold rounded-xl shadow-md text-sm">Confirmar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE DETALLE DE VENTA (colocado al final, fuera del flujo) -->
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
import api from '@/services/api';
import Swal from 'sweetalert2';

// -----------------------------------------------
// Store y estado local
// -----------------------------------------------
const store = useHistorialStore();

const mostrarDetalle = ref(false);
const ventaDetalle = ref(null);
const mostrarAnular = ref(false);
const ventaAnular = ref(null);

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
    console.log('Iniciando carga para venta ID:', ventaResumen.id);

    const response = await api.get(`/ventas/${ventaResumen.id}`);

    console.log('Respuesta completa de la API:', response.data);
    console.log('Objeto venta:', response.data.venta);
    console.log('detalle_ventas:', response.data.venta?.detalle_ventas);
    console.log('Cantidad de detalles:', response.data.venta?.detalle_ventas?.length);

    ventaDetalle.value = response.data.venta;
    mostrarDetalle.value = true;

    console.log('ventaDetalle asignado:', ventaDetalle.value);
    console.log('mostrarDetalle:', mostrarDetalle.value);
  } catch (error) {
    console.error('Error al cargar detalle:', error);
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

const confirmarAnulacion = (venta) => {
  ventaAnular.value = venta;
  mostrarAnular.value = true;
};

const ejecutarAnulacion = async () => {
  try {
    // TODO: llamar al endpoint de anulación cuando esté implementado
    // await store.anularVenta(ventaAnular.value.id);

    Swal.fire({
      icon: 'success',
      title: '¡Hecho!',
      text: `La venta #${ventaAnular.value.correlativo} ha sido anulada.`,
      showConfirmButton: false,
      timer: 2500
    });

    mostrarAnular.value = false;
    store.fetchVentas(store.currentPage);
  } catch (error) {
    mostrarAnular.value = false;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo anular la venta.'
    });
  }
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
