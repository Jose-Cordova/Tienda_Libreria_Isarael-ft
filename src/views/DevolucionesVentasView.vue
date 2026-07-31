<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative">
    <!-- Filtros -->
    <FiltrosDevoluciones
      :filtros="filtros"
      @update:filtros="actualizarFiltros"
      @limpiar="limpiarFiltros"
    />

    <!-- Botón nueva devolución -->
    <div class="flex justify-end mb-4">
      <Button
        label="Nueva Devolución"
        icon="pi pi-plus"
        class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm"
        @click="mostrarModal = true"
      />
    </div>

    <!-- Tabla -->
    <TablaHistorialDevoluciones
      :devoluciones="devoluciones"
      @ver-detalle="abrirDetalle"
      @anular="confirmarAnulacion"
    />

    <!-- Paginador -->
    <div v-if="totalRegistros > perPage" class="p-3 border-t border-gray-400 bg-gray-50/50">
      <Paginator
        :rows="perPage"
        :totalRecords="totalRegistros"
        :first="(paginaActual - 1) * perPage"
        @page="onPageChange"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        class="custom-paginator text-[10px]"
      />
    </div>

    <!-- Modal nueva devolución -->
    <DevolucionVentaModal
      v-model:visible="mostrarModal"
      @devolucionRegistrada="onDevolucionRegistrada"
    />

    <!-- Modal detalle -->
    <DetalleDevolucionModal
      :visible="mostrarDetalle"
      :devolucion="devolucionSeleccionada"
      @update:visible="mostrarDetalle = false"
    />

    <!-- MODAL: Anulación personalizada -->
    <div v-if="mostrarAnular" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4 text-center">
      <div class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#044e04]"></div>
        <div class="p-10">
          <div class="flex justify-center mb-6 text-red-500"><i class="pi pi-ban text-6xl"></i></div>
          <h2 class="text-xl font-extrabold text-gray-800 mb-2">¿Anular esta devolución?</h2>
          <p class="text-1xl text-gray-500 mb-8 font-medium">
            Se anulará la devolución de la venta "{{ devolucionAnular?.venta?.correlativo }}".
          </p>
          <div class="flex items-center gap-3">
            <button @click="mostrarAnular = false" class="flex-1 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#e2eee2] hover:bg-white text-sm">Cancelar</button>
            <button @click="ejecutarAnulacion" class="flex-1 py-3 bg-[#d1333e] hover:bg-[#a82430] text-white font-bold rounded-xl shadow-md text-sm">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, onMounted, reactive } from 'vue';
import api from '@/services/api';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import FiltrosDevoluciones from '@/components/devolucionVentas/FiltrosDevoluciones.vue';
import DevolucionVentaModal from '@/components/devolucionVentas/DevolucionVentaModal.vue';
import TablaHistorialDevoluciones from '@/components/devolucionVentas/TablaHistorialDevoluciones.vue';
import DetalleDevolucionModal from '@/components/devolucionVentas/DetalleDevolucionModal.vue';

const toast = useToast();

// Filtros
const filtros = reactive({
  estado: null,
  fecha_inicio: null,
  fecha_fin: null
});

// Paginación
const paginaActual = ref(1);
const totalRegistros = ref(0);
const perPage = ref(15);

// Datos
const devoluciones = ref([]);

// Modales
const mostrarModal = ref(false);
const mostrarDetalle = ref(false);
const devolucionSeleccionada = ref(null);
const mostrarAnular = ref(false);
const devolucionAnular = ref(null);

const cargarDevoluciones = async (page = 1) => {
  try {
    const params = { page, per_page: perPage.value };
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
    if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;

    const response = await api.get('/devoluciones-ventas', { params });
    const data = response.data;

    devoluciones.value = data.data;
    paginaActual.value = data.current_page;
    totalRegistros.value = data.total;
    perPage.value = data.per_page;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las devoluciones.', life: 4000 });
  }
};

const actualizarFiltros = (nuevosFiltros) => {
  filtros.estado = nuevosFiltros.estado;
  filtros.fecha_inicio = nuevosFiltros.fecha_inicio;
  filtros.fecha_fin = nuevosFiltros.fecha_fin;
  cargarDevoluciones(1);
};

const limpiarFiltros = () => {
  filtros.estado = null;
  filtros.fecha_inicio = null;
  filtros.fecha_fin = null;
  cargarDevoluciones(1);
};

const onPageChange = (event) => {
  const nuevaPagina = event.page + 1;
  cargarDevoluciones(nuevaPagina);
};

const onDevolucionRegistrada = () => {
  cargarDevoluciones(1);
};

const abrirDetalle = (devolucion) => {
  devolucionSeleccionada.value = devolucion;
  mostrarDetalle.value = true;
};

const confirmarAnulacion = (devolucion) => {
  devolucionAnular.value = devolucion;
  mostrarAnular.value = true;
};

const ejecutarAnulacion = async () => {
  try {
    await api.delete(`/devoluciones-ventas/${devolucionAnular.value.id}`);
    toast.add({ severity: 'success', summary: 'Anulada', detail: 'Devolución anulada correctamente.', life: 3000 });
    mostrarAnular.value = false;
    cargarDevoluciones(paginaActual.value);
  } catch (error) {
    mostrarAnular.value = false;
    const mensaje = error.response?.data?.message || 'No se pudo anular la devolución.';
    toast.add({ severity: 'error', summary: 'Error', detail: mensaje, life: 5000 });
  }
};

onMounted(() => {
  cargarDevoluciones(1);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #c6e5d3; border-radius: 4px; }
.animate-fade-up {
  animation: fadeUp 0.3s ease-out forwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
:deep(.custom-paginator .p-paginator-page.p-highlight) {
  background: #0b580b !important;
  color: white !important;
  font-weight: bold;
}
</style>
