<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] backdrop-blur-sm p-4 font-dm-sans text-left">
      <div class="bg-white rounded-[24px] w-[95vw] max-w-2xl shadow-2xl relative overflow-hidden border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
        <button @click="cerrar" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
          <i class="pi pi-times text-xl"></i>
        </button>
        <div class="p-8 md:p-10">

          <!-- PASO 1 -->
          <div v-if="wizardPaso === 1">
            <div class="flex items-center gap-2 mb-4">
              <span class="w-7 h-7 rounded-full bg-[#0a3622] text-white text-xs font-black flex items-center justify-center">1</span>
              <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">¿Qué te devolvió el proveedor?</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <button type="button" class="text-left p-4 rounded-2xl border-2 transition-all"
                :class="wizard.tipo === 'mismo' ? 'border-[#0a3622] bg-[#f0f7f3]' : 'border-gray-200 hover:border-[#0a3622]'"
                @click="wizard.tipo = 'mismo'">
                <strong class="block text-sm text-gray-800">El mismo producto</strong>
                <span class="text-xs text-gray-400">Te repusieron el mismo artículo</span>
              </button>
              <button type="button" class="text-left p-4 rounded-2xl border-2 transition-all"
                :class="wizard.tipo === 'diferente' ? 'border-[#0a3622] bg-[#f0f7f3]' : 'border-gray-200 hover:border-[#0a3622]'"
                @click="wizard.tipo = 'diferente'">
                <strong class="block text-sm text-gray-800">Un producto diferente</strong>
                <span class="text-xs text-gray-400">Te dieron otro producto del mismo valor</span>
              </button>
            </div>

            <!-- PANEL: MISMO PRODUCTO -->
            <div v-if="wizard.tipo === 'mismo'" class="space-y-4">
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
                <strong class="text-gray-800">Producto:</strong> <span class="font-bold text-[#0a3622]">{{ itemAceptar?.producto?.nombre }}</span><br>
                <strong class="text-gray-800">Cantidad a reponer:</strong> <span class="font-bold text-[#0a3622]">{{ itemAceptar?.cantidad }} unidades</span>
                <span class="text-xs text-gray-400 block mt-1">(cantidad fija = la devolución registrada)</span>
              </div>

              <div v-if="itemAceptar?.producto?.perecedero === 'PERECEDERO'" class="space-y-3">
                <div class="flex gap-2">
                  <button type="button" class="flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all"
                    :class="wizard.loteOpcion === 'mismo-lote' ? 'border-[#0a3622] bg-[#f0f7f3] text-[#0a3622]' : 'border-gray-200 text-gray-500'"
                    @click="wizard.loteOpcion = 'mismo-lote'">Mismo lote</button>
                  <button type="button" class="flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all"
                    :class="wizard.loteOpcion === 'nuevo-lote' ? 'border-[#0a3622] bg-[#f0f7f3] text-[#0a3622]' : 'border-gray-200 text-gray-500'"
                    @click="wizard.loteOpcion = 'nuevo-lote'">Un lote nuevo</button>
                </div>

                <div v-if="wizard.loteOpcion === 'mismo-lote'" class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                  Se repondrá el stock en el lote original <b>{{ itemAceptar?.lote?.codigo_lote || '—' }}</b>
                </div>

                <div v-else class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Código del lote nuevo *</label>
                    <InputText v-model="wizard.codigo" class="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold" placeholder="Ej. LT-XX-03" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Fecha de vencimiento *</label>
                    <Calendar v-model="wizard.vencimiento" :minDate="fechaMinima" dateFormat="yy-mm-dd" showIcon iconDisplay="input" class="w-full custom-prime-calendar custom-calendar-input" />
                  </div>
                </div>
              </div>
            </div>

            <!-- PANEL: PRODUCTO DIFERENTE -->
            <div v-else class="space-y-4">
              <div>
                <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Buscar producto en el inventario</label>
                <span class="relative block">
                  <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10"></i>
                  <InputText v-model="buscarProducto" placeholder="Escriba para buscar..." class="w-full border border-gray-200 rounded-xl !pl-10 p-3 text-sm font-bold" @input="filtrarProductos" />
                </span>
                <div v-if="buscarProducto && productosFiltrados.length" class="mt-2 border border-gray-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                  <div v-for="p in productosFiltrados" :key="p.id"
                    class="px-4 py-3 hover:bg-[#f0f7f3] cursor-pointer flex items-center justify-between text-sm"
                    @click="seleccionarProductoReemplazo(p)">
                    <div>
                      <div class="font-bold text-gray-800">{{ p.nombre }}</div>
                      <div class="text-xs text-gray-400">{{ p.marca?.nombre }} · {{ p.perecedero === 'PERECEDERO' ? 'Perecedero' : 'Normal' }}</div>
                    </div>
                    <span class="text-xs font-bold text-gray-500">Stock: {{ p.stock }}</span>
                  </div>
                </div>
              </div>

              <div v-if="productoReemplazoSeleccionado" class="flex items-center justify-between gap-3 bg-[#f0f7f3] border border-[#c6e5d3] rounded-xl p-4">
                <div>
                  <div class="font-bold text-sm text-gray-800">{{ productoReemplazoSeleccionado.nombre }}</div>
                  <div class="text-xs text-gray-500">{{ productoReemplazoSeleccionado.marca?.nombre }} · Stock: {{ productoReemplazoSeleccionado.stock }}</div>
                </div>
                <button type="button" class="text-gray-400 hover:text-red-600 text-lg" @click="quitarProductoReemplazo">×</button>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400">¿No está registrado?</span>
                <button type="button" class="text-xs font-bold text-[#0a3622] hover:underline" @click="abrirCrearProducto">+ Crear producto nuevo</button>
              </div>

              <div v-if="productoRecibido?.perecedero === 'PERECEDERO'" class="space-y-3">
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  El producto recibido es <b>perecedero</b>, necesitamos los datos del lote:
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Código del lote *</label>
                    <InputText v-model="wizard.codigo" class="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold" placeholder="Ej. LT-XX-01" />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Fecha de vencimiento *</label>
                    <Calendar v-model="wizard.vencimiento" :minDate="fechaMinima" dateFormat="yy-mm-dd" showIcon iconDisplay="input" class="w-full custom-prime-calendar custom-calendar-input" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PASO 2: Confirmación y Resumen -->
          <div v-else>
            <div class="flex items-center gap-2 mb-4">
              <span class="w-7 h-7 rounded-full bg-[#0a3622] text-white text-xs font-black flex items-center justify-center">✓</span>
              <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">Revisa y confirma el reemplazo</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div class="border border-gray-200 rounded-xl p-4">
                <h4 class="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">Devolviste al proveedor</h4>
                <div class="flex justify-between text-sm py-1"><span class="text-gray-500">Producto</span><b>{{ itemAceptar?.producto?.nombre }}</b></div>
                <div class="flex justify-between text-sm py-1"><span class="text-gray-500">Cantidad</span><b>{{ itemAceptar?.cantidad }} unidades</b></div>
                <div class="flex justify-between text-sm py-1"><span class="text-gray-500">Valor</span><b>${{ parseFloat(itemAceptar?.total_perdida).toFixed(2) }}</b></div>
              </div>
              <div class="border border-[#c6e5d3] bg-[#f0f7f3] rounded-xl p-4">
                <h4 class="text-xs font-extrabold text-[#0a3622] uppercase tracking-wider mb-3">Recibiste de reemplazo</h4>
                <div class="flex justify-between text-sm py-1"><span class="text-gray-500">Producto</span><b>{{ productoRecibido?.nombre }}</b></div>
                <div class="flex justify-between text-sm py-1"><span class="text-gray-500">Cantidad</span><b>{{ itemAceptar?.cantidad }} unidades</b></div>
                <div class="flex justify-between text-sm py-1"><span class="text-gray-500">Lote</span><b class="text-right">{{ textoLoteResumen }}</b></div>
              </div>
            </div>
          </div>

        </div>

        <div class="p-6 md:p-8 pt-4 border-t border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <button v-if="wizardPaso === 2" type="button" class="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition hover:bg-gray-300" @click="wizardPaso = 1">← Atrás</button>
          <button v-if="wizardPaso === 1" type="button" class="flex-1 py-3 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl text-sm transition" @click="siguientePaso">Siguiente →</button>
          <button v-else type="button" class="flex-1 py-3 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl text-sm transition" :disabled="confirmando" @click="confirmarReemplazo">
            {{ confirmando ? 'Confirmando...' : 'Confirmar reemplazo' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sub-modal: Crear Producto Nuevo -->
    <div v-if="mostrarModalCrearProducto" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[120] backdrop-blur-sm p-4 font-dm-sans text-left">
      <div class="bg-white rounded-[24px] w-[95vw] max-w-xl shadow-2xl relative overflow-hidden border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
        <button @click="mostrarModalCrearProducto = false" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
          <i class="pi pi-times text-xl"></i>
        </button>
        <div class="p-8 md:p-10">
          <div class="mb-6">
            <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">Crear producto nuevo</h2>
            <p class="text-[14px] text-gray-400 font-medium">Se creará y se le sumará la cantidad del reemplazo</p>
          </div>
          <form @submit.prevent="guardarProductoNuevo" class="space-y-5">
            <div class="grid grid-cols-2 gap-x-6 gap-y-5">
              <div class="col-span-2 space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Nombre del producto *</label>
                <InputText v-model="productoNuevo.nombre" class="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold" placeholder="Ej. Jugo Hit Naranja 400ml" />
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Sección *</label>
                <Dropdown v-model="productoNuevo.seccion" :options="secciones" optionLabel="label" optionValue="value" placeholder="Seleccionar" class="w-full border border-gray-200 rounded-xl" />
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Categoría *</label>
                <Dropdown v-model="productoNuevo.categoria_id" :options="categoriasFiltradas" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full border border-gray-200 rounded-xl" />
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Marca *</label>
                <Dropdown v-model="productoNuevo.marca_id" :options="marcasFiltradas" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full border border-gray-200 rounded-xl" />
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Tipo de producto *</label>
                <Dropdown v-model="productoNuevo.perecedero" :options="tiposProducto" optionLabel="label" optionValue="value" placeholder="Seleccionar" class="w-full border border-gray-200 rounded-xl" />
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Precio detalle ($) *</label>
                <InputNumber v-model="productoNuevo.precio_detalle" mode="decimal" :minFractionDigits="2" inputClass="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold" />
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Precio mayor ($) *</label>
                <InputNumber v-model="productoNuevo.precio_mayor" mode="decimal" :minFractionDigits="2" inputClass="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold" />
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Stock mínimo *</label>
                <InputNumber v-model="productoNuevo.stock_minimo" :min="1" inputClass="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold" />
              </div>
            </div>
            <div class="flex gap-4 mt-8">
              <button type="button" @click="mostrarModalCrearProducto = false" class="px-6 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm flex-1">Cancelar</button>
              <button type="submit" class="flex-[2] py-3 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest">
                Guardar producto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Swal from 'sweetalert2';
import { useCambioProductoStore } from '@/stores/cambioProductoStore';
import productoService from '@/services/productoService';
import marcaService from '@/services/marcaService';
import categoriaService from '@/services/categoriaService';

const props = defineProps({
  visible: { type: Boolean, required: true },
  itemAceptar: { type: Object, default: null }
});

const emit = defineEmits(['update:visible', 'procesado']);

const store = useCambioProductoStore();
const toast = useToast();

const mostrarToast = (mensaje, tipo = 'success') => {
  toast.add({ severity: tipo, summary: tipo === 'success' ? 'Éxito' : (tipo === 'warn' ? 'Advertencia' : 'Error'), detail: mensaje, life: 3000 });
};

// Estado del wizard
const wizardPaso = ref(1);
const confirmando = ref(false);
const wizard = ref({ tipo: 'mismo', loteOpcion: 'nuevo-lote', codigo: '', vencimiento: null, productoReemplazoId: null, creado: false });
const buscarProducto = ref('');
const productosFiltrados = ref([]);
const productoReemplazoSeleccionado = ref(null);
const productoNuevoCreado = ref(null);
const textoLoteResumen = ref('');
let debounceBuscar = null;

// Estado del sub-modal de creación de producto
const mostrarModalCrearProducto = ref(false);
const marcas = ref([]);
const categorias = ref([]);
const productoNuevo = ref({ nombre: '', seccion: null, categoria_id: null, marca_id: null, perecedero: 'NORMAL', precio_detalle: 0, precio_mayor: 0, stock_minimo: 5 });

const secciones = [
  { label: 'Tienda', value: 'TIENDA' },
  { label: 'Librería', value: 'LIBRERIA' },
  { label: 'Medicamentos', value: 'MEDICAMENTO' }
];
const tiposProducto = [
  { label: 'Normal', value: 'NORMAL' },
  { label: 'Perecedero', value: 'PERECEDERO' }
];

const fechaMinima = computed(() => {
  const mañana = new Date();
  mañana.setDate(mañana.getDate() + 1);
  return mañana;
});

const categoriasFiltradas = computed(() => {
  if (!productoNuevo.value.seccion) return categorias.value;
  return categorias.value.filter(c => c.seccion === productoNuevo.value.seccion);
});

const marcasFiltradas = computed(() => {
  if (!productoNuevo.value.seccion) return marcas.value;
  return marcas.value.filter(m => m.seccion === productoNuevo.value.seccion);
});

const productoRecibido = computed(() => {
  if (wizard.value.tipo === 'mismo') return props.itemAceptar?.producto || null;
  if (wizard.value.creado) return productoNuevoCreado.value;
  return productoReemplazoSeleccionado.value;
});

// Reiniciar el wizard cuando se abre el modal
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    wizard.value = { tipo: 'mismo', loteOpcion: props.itemAceptar?.producto?.perecedero === 'PERECEDERO' ? 'nuevo-lote' : 'mismo-lote', codigo: '', vencimiento: null, productoReemplazoId: null, creado: false };
    wizardPaso.value = 1;
    buscarProducto.value = '';
    productosFiltrados.value = [];
    productoReemplazoSeleccionado.value = null;
    productoNuevoCreado.value = null;
    textoLoteResumen.value = '';
    // Cargar marcas y categorías para el sub-modal de creación de producto
    const [mRes, cRes] = await Promise.all([
      marcaService.getMarcas({ per_page: 9999 }),
      categoriaService.getCategorias({ per_page: 9999 })
    ]);
    marcas.value = mRes.data.data || [];
    categorias.value = cRes.data.data || [];
  }
});

watch(productoNuevo, () => {
  if (!productoNuevo.value.seccion) {
    productoNuevo.value.categoria_id = null;
    productoNuevo.value.marca_id = null;
  }
}, { deep: true });

const cerrar = () => emit('update:visible', false);

const filtrarProductos = () => {
  clearTimeout(debounceBuscar);
  debounceBuscar = setTimeout(async () => {
    const q = buscarProducto.value.trim();
    if (!q) { productosFiltrados.value = []; return; }
    try {
      const response = await productoService.getProductos({ search: q, estado: 'ACTIVO', per_page: 10 });
      productosFiltrados.value = response.data.data || [];
    } catch { productosFiltrados.value = []; }
  }, 350);
};

const seleccionarProductoReemplazo = (p) => {
  productoReemplazoSeleccionado.value = p;
  productoNuevoCreado.value = null;
  wizard.value.productoReemplazoId = p.id;
  wizard.value.creado = false;
  buscarProducto.value = '';
  productosFiltrados.value = [];
  if (p.perecedero === 'PERECEDERO') { wizard.value.codigo = ''; wizard.value.vencimiento = null; }
};

const quitarProductoReemplazo = () => {
  productoReemplazoSeleccionado.value = null;
  wizard.value.productoReemplazoId = null;
};

const abrirCrearProducto = () => {
  productoNuevo.value = {
    nombre: '', seccion: props.itemAceptar?.producto?.seccion || null,
    categoria_id: null, marca_id: null,
    perecedero: props.itemAceptar?.producto?.perecedero || 'NORMAL',
    precio_detalle: 0, precio_mayor: 0, stock_minimo: 5
  };
  mostrarModalCrearProducto.value = true;
};

const guardarProductoNuevo = () => {
  if (!productoNuevo.value.nombre.trim()) {
    return Swal.fire('Incompleto', 'El nombre del producto es obligatorio.', 'warning');
  }
  if (!productoNuevo.value.seccion || !productoNuevo.value.categoria_id || !productoNuevo.value.marca_id) {
    return Swal.fire('Incompleto', 'Debe seleccionar sección, categoría y marca.', 'warning');
  }
  if (!productoNuevo.value.precio_detalle || !productoNuevo.value.precio_mayor) {
    return Swal.fire('Incompleto', 'Debe indicar los precios del producto.', 'warning');
  }
  productoNuevoCreado.value = { ...productoNuevo.value, id: null };
  productoReemplazoSeleccionado.value = null;
  wizard.value.productoReemplazoId = null;
  wizard.value.creado = true;
  mostrarModalCrearProducto.value = false;
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  return new Date(fechaStr).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatearFechaParaEnvio = (dateObj) => {
  if (!dateObj) return '';
  return new Date(dateObj).toISOString().split('T')[0];
};

const siguientePaso = () => {
  const productoRec = productoRecibido.value;
  if (wizard.value.tipo === 'diferente' && !productoRec) {
    return Swal.fire('Incompleto', 'Busque y seleccione el producto que le entregó el proveedor, o créelo.', 'warning');
  }
  if (productoRec?.perecedero === 'PERECEDERO') {
    const esMismoLote = wizard.value.tipo === 'mismo' && wizard.value.loteOpcion === 'mismo-lote';
    if (!esMismoLote) {
      if (!wizard.value.codigo.trim()) return Swal.fire('Incompleto', 'Escriba el código del lote.', 'warning');
      if (!wizard.value.vencimiento) return Swal.fire('Incompleto', 'Seleccione la fecha de vencimiento del lote.', 'warning');
      if (new Date(wizard.value.vencimiento) <= new Date()) return Swal.fire('Incompleto', 'La fecha de vencimiento debe ser futura.', 'warning');
    }
  }
  if (productoRec?.perecedero === 'PERECEDERO' && wizard.value.tipo === 'mismo' && wizard.value.loteOpcion === 'mismo-lote') {
    textoLoteResumen.value = `Se repone en el lote original ${props.itemAceptar?.lote?.codigo_lote || '—'}`;
  } else if (productoRec?.perecedero === 'PERECEDERO') {
    textoLoteResumen.value = `Nuevo lote ${wizard.value.codigo} · vence ${formatearFecha(wizard.value.vencimiento)}`;
  } else {
    textoLoteResumen.value = 'No aplica (producto normal)';
  }
  wizardPaso.value = 2;
};

const confirmarReemplazo = async () => {
  try {
    confirmando.value = true;
    const data = {
      tipo: wizard.value.tipo,
      reemplazo: wizard.value.tipo === 'mismo' ? 'MISMO_PRODUCTO' : 'DIFERENTE_PRODUCTO',
      lote_opcion: wizard.value.loteOpcion === 'mismo-lote' ? 'mismo' : 'nuevo'
    };
    if (wizard.value.tipo === 'diferente') {
      if (wizard.value.creado) {
        data.crear_producto = true;
        data.nombre = productoNuevoCreado.value.nombre;
        data.marca_id = productoNuevoCreado.value.marca_id;
        data.categoria_id = productoNuevoCreado.value.categoria_id;
        data.seccion = productoNuevoCreado.value.seccion;
        data.perecedero = productoNuevoCreado.value.perecedero;
        data.precio_detalle = productoNuevoCreado.value.precio_detalle;
        data.precio_mayor = productoNuevoCreado.value.precio_mayor;
        data.costo_promedio = parseFloat(props.itemAceptar?.costo_unitario || 0);
        data.stock_minimo = productoNuevoCreado.value.stock_minimo;
      } else {
        data.producto_reemplazo_id = wizard.value.productoReemplazoId;
      }
    }
    const productoRec = productoRecibido.value;
    if (productoRec?.perecedero === 'PERECEDERO' && !(wizard.value.tipo === 'mismo' && wizard.value.loteOpcion === 'mismo-lote')) {
      data.codigo_lote = wizard.value.codigo;
      data.fecha_vencimiento = wizard.value.vencimiento ? formatearFechaParaEnvio(wizard.value.vencimiento) : undefined;
    }
    const response = await store.aceptarCambio(props.itemAceptar.id, data);
    mostrarToast(response.data.message);
    cerrar();
    emit('procesado');
  } catch (error) {
    console.error(error);
    mostrarToast(error.response?.data?.message || 'Error al procesar el reemplazo.', 'error');
  } finally {
    confirmando.value = false;
  }
};
</script>

<style scoped>
:deep(.custom-prime-calendar) { width: 100%; }
:deep(.custom-prime-calendar .p-inputtext) { border-radius: 12px; padding: 0.75rem; border: 1px solid #e2e8f0; font-weight: bold; font-size: 0.875rem; }
:deep(.custom-calendar-input .p-datepicker-trigger) { background: transparent; border: none; color: #64748b; position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); width: auto; height: auto; box-shadow: none; padding: 0; }
:deep(.custom-calendar-input .p-inputtext) { padding-right: 2.5rem; }
</style>
