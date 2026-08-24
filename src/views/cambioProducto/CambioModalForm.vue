<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4 font-dm-sans text-left">
      <div class="bg-white rounded-[24px] w-[95vw] max-w-xl shadow-2xl relative overflow-hidden border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
        <button @click="cerrar" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
          <i class="pi pi-times text-xl"></i>
        </button>
        <div class="p-10">
          <div class="mb-6">
            <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">Nuevo Cambio</h2>
            <p class="text-[14px] text-gray-400 font-medium">Devolución de mercancía al proveedor para reemplazo</p>
          </div>
          <form @submit.prevent="guardar" class="space-y-6">
            <div class="grid grid-cols-2 gap-x-8 gap-y-6">
              <div class="col-span-2 space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Producto *</label>
                <Dropdown
                  v-model="formulario.producto_id"
                  :options="productosDisponibles"
                  optionLabel="nombre"
                  optionValue="id"
                  placeholder="Seleccione el producto..."
                  class="w-full border border-gray-200 rounded-xl text-sm h-[54px] flex items-center font-bold"
                  filter
                  @change="onProductoChange"
                  :loading="cargandoProductos"
                />
              </div>
              <div v-if="esPerecederoSeleccionado" class="col-span-1 space-y-2 text-left">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Lote *</label>
                <Dropdown
                  v-model="formulario.lote_id"
                  :options="lotesDisponibles"
                  optionLabel="codigo_lote"
                  optionValue="id"
                  placeholder="Elegir..."
                  class="w-full border border-gray-200 rounded-xl text-sm h-[43px] flex items-center font-bold"
                  filter
                />
              </div>
              <div class="col-span-1 space-y-2 text-left">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Cantidad *</label>
                <InputNumber v-model="formulario.cantidad" :min="1" inputClass="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" placeholder="0" />
              </div>
              <div class="space-y-2 text-left">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Costo Unitario ($)</label>
                <InputNumber v-model="formulario.costo_unitario" mode="decimal" :minFractionDigits="2" inputClass="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold bg-gray-50/50" disabled />
              </div>
              <div class="col-span-2 space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Motivo *</label>
                <Textarea v-model="formulario.descripcion" rows="3" class="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" placeholder="Explique brevemente qué ocurrió..." />
              </div>
            </div>
            <div class="flex items-center gap-4 mt-10">
              <button type="button" @click="cerrar" class="px-8 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm flex-1">Cancelar</button>
              <button type="submit" class="flex-[2] py-4 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest" :disabled="guardando">
                {{ guardando ? 'Guardando...' : 'Guardar Registro' }}
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
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import productoService from '@/services/productoService';
import { useCambioProductoStore } from '@/stores/cambioProductoStore';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'guardado']);

const store = useCambioProductoStore();
const toast = useToast();

const productosDisponibles = ref([]);
const lotesDisponibles = ref([]);
const guardando = ref(false);
const cargandoProductos = ref(false);

const formulario = ref({
  producto_id: null,
  lote_id: null,
  cantidad: 1,
  costo_unitario: 0,
  descripcion: ''
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    formulario.value = {
      producto_id: null,
      lote_id: null,
      cantidad: 1,
      costo_unitario: 0,
      descripcion: ''
    };
    lotesDisponibles.value = [];
    cargarProductos();
  }
});

const mostrarToast = (mensaje, tipo = 'success') => {
  toast.add({
    severity: tipo,
    summary: tipo === 'success' ? 'Éxito' : (tipo === 'warn' ? 'Advertencia' : 'Error'),
    detail: mensaje,
    life: 3000
  });
};

const cerrar = () => {
  emit('update:visible', false);
};

const cargarProductos = async () => {
  try {
    cargandoProductos.value = true;
    const response = await productoService.getProductos({ estado: 'ACTIVO', sin_paginar: true });
    productosDisponibles.value = response.data;
  } catch (error) {
    console.error(error);
    mostrarToast('No se pudieron cargar los productos.', 'error');
  } finally {
    cargandoProductos.value = false;
  }
};

const esPerecederoSeleccionado = computed(() => {
  const prod = productosDisponibles.value.find(p => p.id === formulario.value.producto_id);
  return prod?.perecedero === 'PERECEDERO';
});

const onProductoChange = () => {
  const prod = productosDisponibles.value.find(p => p.id === formulario.value.producto_id);
  if (prod) {
    formulario.value.costo_unitario = parseFloat(prod.costo_promedio || 0.00);
    if (prod.perecedero === 'PERECEDERO') {
      lotesDisponibles.value = prod.lotes || [];
      formulario.value.lote_id = null;
    } else {
      lotesDisponibles.value = [];
      formulario.value.lote_id = null;
    }
  }
};

const guardar = async () => {
  if (!formulario.value.producto_id || !formulario.value.descripcion) {
    mostrarToast('Por favor complete los campos obligatorios', 'warn');
    return;
  }

  try {
    guardando.value = true;
    const data = {
      producto_id: formulario.value.producto_id,
      cantidad: formulario.value.cantidad,
      descripcion: formulario.value.descripcion,
      lote_id: esPerecederoSeleccionado.value ? formulario.value.lote_id : null
    };
    const response = await store.createCambio(data);
    mostrarToast(response.data.message);
    cerrar();
    emit('guardado');
  } catch (error) {
    console.error(error);
    const msg = error.response?.data?.message || 'Error al guardar el registro.';
    mostrarToast(msg, 'error');
  } finally {
    guardando.value = false;
  }
};
</script>
