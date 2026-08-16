<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar">
    <!-- Cabecera -->
    <div class="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <i class="pi pi-chart-bar text-2xl text-green-600"></i>
      <h1 class="text-lg font-extrabold text-[#0a3622]">Reportes del Sistema</h1>
    </div>

    <!-- Overlay de carga -->
    <div v-if="generandoReporte" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div class="bg-white p-6 rounded-xl shadow-2xl text-center">
        <ProgressSpinner style="width: 50px; height: 50px;" />
        <p class="mt-3 font-bold text-[#0a3622]">Generando reporte...</p>
      </div>
    </div>

    <!-- Acordeón de reportes -->
    <Accordion multiple :activeIndex="[]" class="space-y-3">
      <!-- ==================== REPORTE GENERAL ==================== -->
      <AccordionTab>
        <template #header>
          <div class="flex items-center gap-4 text-[#0a3622] font-extrabold">
            <i class="pi pi-book text-xl"></i>
            <span>REPORTE GENERAL</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Inicio</label>
            <Calendar v-model="general.fecha_inicio" dateFormat="yy-mm-dd" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Fin</label>
            <Calendar v-model="general.fecha_fin" dateFormat="yy-mm-dd" />
          </div>
        </div>
        <div class="flex justify-between p-4 pt-0">
          <Button label="Limpiar" icon="pi pi-filter-slash" class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]" @click="limpiarFiltros('general')" />
          <Button label="Generar" icon="pi pi-file-pdf" class="p-button-sm bg-[#0a3622] border-none" @click="generar('general', general)" :disabled="generandoReporte || !general.fecha_inicio || !general.fecha_fin" />
        </div>
      </AccordionTab>

      <!-- ==================== REPORTE DE VENTAS ==================== -->
      <AccordionTab>
        <template #header>
          <div class="flex items-center gap-4 text-[#0a3622] font-extrabold">
            <i class="pi pi-shopping-cart text-xl"></i>
            <span>REPORTE DE VENTAS</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Inicio</label>
            <Calendar v-model="ventas.fecha_inicio" dateFormat="yy-mm-dd" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Fin</label>
            <Calendar v-model="ventas.fecha_fin" dateFormat="yy-mm-dd" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Tipo de Cliente</label>
            <Dropdown v-model="ventas.tipo_cliente" :options="tiposCliente" placeholder="Todos" class="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Método de Pago</label>
            <Dropdown v-model="ventas.metodo_pago_id" :options="metodosPago" optionLabel="nombre" optionValue="id" placeholder="Todos" class="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Estado</label>
            <Dropdown v-model="ventas.estado" :options="estadosVenta" placeholder="Todos" class="w-full" />
          </div>
        </div>
        <div class="flex justify-between p-4 pt-0">
          <Button label="Limpiar" icon="pi pi-filter-slash" class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]" @click="limpiarFiltros('ventas')" />
          <Button label="Generar" icon="pi pi-file-pdf" class="p-button-sm bg-[#0a3622] border-none" @click="generar('ventas', ventas)" :disabled="generandoReporte || !ventas.fecha_inicio || !ventas.fecha_fin" />
        </div>
      </AccordionTab>

      <!-- ==================== REPORTE DE COMPRAS ==================== -->
      <AccordionTab>
        <template #header>
          <div class="flex items-center gap-4 text-[#0a3622] font-extrabold">
            <i class="pi pi-truck text-xl"></i>
            <span>REPORTE DE COMPRAS</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Inicio</label>
            <Calendar v-model="compras.fecha_inicio" dateFormat="yy-mm-dd" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Fin</label>
            <Calendar v-model="compras.fecha_fin" dateFormat="yy-mm-dd" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Proveedor</label>
            <Dropdown
              v-model="compras.proveedor_id"
              :options="proveedores"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Seleccione un proveedor"
              class="w-full"
              filter
              @filter="buscarProveedores"
              :loading="cargandoProveedores"
              resetFilterOnHide
              emptyFilterMessage="No se encontraron proveedores"
            >
              <template #option="slotProps">
                <div class="flex flex-col py-1">
                  <span class="font-bold text-shop-text">{{ slotProps.option.nombre }}</span>
                  <span class="text-xs text-shop-text-3">{{ slotProps.option.telefono }}</span>
                </div>
              </template>
            </Dropdown>
          </div>
        </div>
        <div class="flex justify-between p-4 pt-0">
          <Button label="Limpiar" icon="pi pi-filter-slash" class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]" @click="limpiarFiltros('compras')" />
          <Button label="Generar" icon="pi pi-file-pdf" class="p-button-sm bg-[#0a3622] border-none" @click="generar('compras', compras)" :disabled="generandoReporte || !compras.fecha_inicio || !compras.fecha_fin" />
        </div>
      </AccordionTab>

      <!-- ==================== REPORTE DE CRÉDITOS ==================== -->
      <AccordionTab>
        <template #header>
          <div class="flex items-center gap-4 text-[#0a3622] font-extrabold">
            <i class="pi pi-credit-card text-xl"></i>
            <span>REPORTE DE CRÉDITOS</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Inicio</label>
            <Calendar v-model="creditos.fecha_inicio" dateFormat="yy-mm-dd" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Fin</label>
            <Calendar v-model="creditos.fecha_fin" dateFormat="yy-mm-dd" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Cliente Crédito</label>
            <Dropdown
              v-model="creditos.cliente_credito_id"
              :options="clientesCredito"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Seleccione un cliente"
              class="w-full"
              filter
              emptyFilterMessage="No se encontraron clientes"
            >
              <template #option="slotProps">
                <div class="flex flex-col py-1">
                  <span class="font-bold">{{ slotProps.option.nombre }}</span>
                  <span class="text-xs text-gray-500">DUI: {{ slotProps.option.dui }}</span>
                </div>
              </template>
            </Dropdown>
          </div>
        </div>
        <div class="flex justify-between p-4 pt-0">
          <Button label="Limpiar" icon="pi pi-filter-slash" class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]" @click="limpiarFiltros('creditos')" />
          <Button label="Generar" icon="pi pi-file-pdf" class="p-button-sm bg-[#0a3622] border-none" @click="generar('creditos', creditos)" :disabled="generandoReporte || !creditos.fecha_inicio || !creditos.fecha_fin" />
        </div>
      </AccordionTab>

      <!-- ==================== REPORTE DE PRODUCTOS DAÑADOS ==================== -->
      <AccordionTab>
        <template #header>
          <div class="flex items-center gap-4 text-[#0a3622] font-extrabold">
            <i class="pi pi-exclamation-triangle text-xl"></i>
            <span>PRODUCTOS DAÑADOS</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Inicio</label>
            <Calendar v-model="productosDaniados.fecha_inicio" dateFormat="yy-mm-dd" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha Fin</label>
            <Calendar v-model="productosDaniados.fecha_fin" dateFormat="yy-mm-dd" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Origen</label>
            <Dropdown v-model="productosDaniados.estado" :options="estadosDanio" optionLabel="label" optionValue="value" placeholder="Todos" class="w-full" />
          </div>
        </div>
        <div class="flex justify-between p-4 pt-0">
          <Button label="Limpiar" icon="pi pi-filter-slash" class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]" @click="limpiarFiltros('productosDaniados')" />
          <Button label="Generar" icon="pi pi-file-pdf" class="p-button-sm bg-[#0a3622] border-none" @click="generar('productos-daniados', productosDaniados)" :disabled="generandoReporte || !productosDaniados.fecha_inicio || !productosDaniados.fecha_fin" />
        </div>
      </AccordionTab>

      <!-- ==================== REPORTE DE INVENTARIO ==================== -->
      <AccordionTab>
        <template #header>
          <div class="flex items-center gap-4 text-[#0a3622] font-extrabold">
            <i class="pi pi-box text-xl"></i>
            <span>REPORTE DE INVENTARIO</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Sección</label>
            <Dropdown v-model="inventario.seccion" :options="secciones" placeholder="Todas" class="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Marca</label>
            <Dropdown
              v-model="inventario.marca_id"
              :options="marcas"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Todas"
              class="w-full"
              filter
              @filter="buscarMarcas"
              :loading="cargandoMarcas"
              resetFilterOnHide
              emptyFilterMessage="No se encontraron marcas"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Categoría</label>
            <Dropdown
              v-model="inventario.categoria_id"
              :options="categorias"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Todas"
              class="w-full"
              filter
              @filter="buscarCategorias"
              :loading="cargandoCategorias"
              resetFilterOnHide
              emptyFilterMessage="No se encontraron categorías"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Estado</label>
            <Dropdown v-model="inventario.estado" :options="estadosProducto" placeholder="Todos" class="w-full" />
          </div>
        </div>
        <div class="flex justify-between p-4 pt-0">
          <Button label="Limpiar" icon="pi pi-filter-slash" class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]" @click="limpiarFiltros('inventario')" />
          <Button label="Generar" icon="pi pi-file-pdf" class="p-button-sm bg-[#0a3622] border-none" @click="generar('inventario', inventario)" :disabled="generandoReporte" />
        </div>
      </AccordionTab>

      <!-- ==================== CIERRE DIARIO ==================== -->
      <AccordionTab>
        <template #header>
          <div class="flex items-center gap-4 text-[#0a3622] font-extrabold">
            <i class="pi pi-calendar text-xl"></i>
            <span>CIERRE DIARIO</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-600">Fecha</label>
            <Calendar v-model="cierreDiario.fecha" dateFormat="yy-mm-dd" />
          </div>
        </div>
        <div class="flex justify-between p-4 pt-0">
          <Button label="Limpiar" icon="pi pi-filter-slash" class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]" @click="limpiarFiltros('cierreDiario')" />
          <Button label="Generar" icon="pi pi-file-pdf" class="p-button-sm bg-[#0a3622] border-none" @click="generar('cierre-diario', cierreDiario)" :disabled="generandoReporte || !cierreDiario.fecha" />
        </div>
      </AccordionTab>
    </Accordion>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import api from '@/services/api';
import { useToast } from 'primevue/usetoast';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

const toast = useToast();

// --- Estado global de generación ---
const generandoReporte = ref(false);
let controller = null;

// --- Datos para dropdowns ---
const metodosPago = ref([]);
const proveedores = ref([]);
const clientesCredito = ref([]);
const marcas = ref([]);
const categorias = ref([]);
const cargandoProveedores = ref(false);
const cargandoMarcas = ref(false);
const cargandoCategorias = ref(false);

// --- Opciones fijas ---
const tiposCliente = ['DETALLES', 'MAYORISTA'];
const estadosVenta = ['PAGADA', 'CREDITO', 'ANULADA', 'DEVOLUCION'];
const estadosDanio = [
  { label: 'Devolución', value: 'DEVOLUCION' },
  { label: 'Manual', value: 'DANIADO' }
];
const secciones = ['TIENDA', 'LIBRERIA', 'MEDICAMENTO'];
const estadosProducto = ['ACTIVO', 'INACTIVO'];

// --- Modelos reactivos para cada reporte ---
const general = reactive({ fecha_inicio: null, fecha_fin: null });
const ventas = reactive({ fecha_inicio: null, fecha_fin: null, tipo_cliente: null, metodo_pago_id: null, estado: null });
const compras = reactive({ fecha_inicio: null, fecha_fin: null, proveedor_id: null });
const creditos = reactive({ fecha_inicio: null, fecha_fin: null, cliente_credito_id: null });
const productosDaniados = reactive({ fecha_inicio: null, fecha_fin: null, estado: null });
const inventario = reactive({ seccion: null, marca_id: null, categoria_id: null, estado: null });
const cierreDiario = reactive({ fecha: null });

// Valores por defecto para limpiar
const valoresIniciales = {
  general: { fecha_inicio: null, fecha_fin: null },
  ventas: { fecha_inicio: null, fecha_fin: null, tipo_cliente: null, metodo_pago_id: null, estado: null },
  compras: { fecha_inicio: null, fecha_fin: null, proveedor_id: null },
  creditos: { fecha_inicio: null, fecha_fin: null, cliente_credito_id: null },
  productosDaniados: { fecha_inicio: null, fecha_fin: null, estado: null },
  inventario: { seccion: null, marca_id: null, categoria_id: null, estado: null },
  cierreDiario: { fecha: null }
};

const reportesMap = { general, ventas, compras, creditos, productosDaniados, inventario, cierreDiario };

const limpiarFiltros = (nombre) => {
  const estado = reportesMap[nombre];
  if (estado) {
    Object.assign(estado, valoresIniciales[nombre]);
  }
};

// --- Búsquedas remotas ---
const buscarProveedores = async (event) => {
  const termino = event.value?.trim();
  try {
    cargandoProveedores.value = true;
    const params = termino ? { buscar: termino } : {};
    const response = await api.get('/proveedores', { params });
    proveedores.value = response.data?.data || response.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proveedores.', life: 4000 });
  } finally {
    cargandoProveedores.value = false;
  }
};

const buscarMarcas = async (event) => {
  const termino = event.value?.trim();
  const params = {};
  if (termino) params.search = termino;
  if (inventario.seccion) params.seccion = inventario.seccion;

  try {
    cargandoMarcas.value = true;
    const response = await api.get('/marcas', { params });
    marcas.value = response.data?.data || response.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las marcas.', life: 4000 });
  } finally {
    cargandoMarcas.value = false;
  }
};

const buscarCategorias = async (event) => {
  const termino = event.value?.trim();
  const params = {};
  if (termino) params.search = termino;
  if (inventario.seccion) params.seccion = inventario.seccion;

  try {
    cargandoCategorias.value = true;
    const response = await api.get('/categorias', { params });
    categorias.value = response.data?.data || response.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las categorías.', life: 4000 });
  } finally {
    cargandoCategorias.value = false;
  }
};

// --- Cargar datos iniciales ---
onMounted(async () => {
  try {
    const [mp, prov, cc, mar, cat] = await Promise.all([
      api.get('/metodos-pagos'),
      api.get('/proveedores'),
      api.get('/clientes-creditos'),
      api.get('/marcas'),
      api.get('/categorias')
    ]);
    metodosPago.value = mp.data;
    proveedores.value = prov.data?.data || prov.data;
    clientesCredito.value = cc.data;
    marcas.value = mar.data?.data || mar.data;
    categorias.value = cat.data?.data || cat.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos para los filtros.', life: 4000 });
  }
});

// --- Cambio de sección del inventario ---
watch(() => inventario.seccion, async (nuevaSeccion) => {
  inventario.marca_id = null;
  inventario.categoria_id = null;

  const params = {};
  if (nuevaSeccion) params.seccion = nuevaSeccion;

  try {
    const [mar, cat] = await Promise.all([
      api.get('/marcas', { params }),
      api.get('/categorias', { params })
    ]);
    marcas.value = mar.data?.data || mar.data;
    categorias.value = cat.data?.data || cat.data;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar marcas/categorías.', life: 4000 });
  }
});

// --- Función genérica para generar reporte (descarga directa) ---
const generar = async (tipo, filtros) => {
  if (generandoReporte.value) return;

  generandoReporte.value = true;

  if (controller) {
    controller.abort();
  }
  controller = new AbortController();

  const params = new URLSearchParams();
  for (const key in filtros) {
    let value = filtros[key];
    if (value === null || value === undefined || value === '') continue;
    if (value instanceof Date) {
      value = value.toISOString().split('T')[0];
    }
    params.append(key, value);
  }

  try {
    const response = await api.get(`/reportes/${tipo}`, {
      params,
      responseType: 'blob',
      signal: controller.signal
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // Crear enlace temporal para descarga directa
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${tipo}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  } catch (error) {
    if (error.name === 'AbortError') return;

    let mensaje = 'Error al generar el reporte.';
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        mensaje = json.message || json.error || mensaje;
      } catch (e) {
        // no se pudo parsear
      }
    } else if (error.response?.data?.message) {
      mensaje = error.response.data.message;
    }
    toast.add({ severity: 'error', summary: 'Error', detail: mensaje, life: 5000 });
  } finally {
    generandoReporte.value = false;
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #c6e5d3; border-radius: 4px; }
</style>
