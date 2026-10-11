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
            <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">Nuevo Registro de Daño</h2>
            <p class="text-[14px] text-gray-400 font-medium">Salida de mercancía por daño o avería directa en tienda</p>
          </div>
          <form @submit.prevent="guardar" class="space-y-6">
            <div class="grid grid-cols-2 gap-x-8 gap-y-6">
              <!-- Selección de Producto -->
              <div class="col-span-2 space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Producto Dañado *</label>
                <Dropdown
                  v-model="formulario.producto_id"
                  :options="productosDisponibles"
                  optionLabel="nombre"
                  optionValue="id"
                  placeholder="Seleccione el producto..."
                  class="w-full border rounded-xl text-sm h-[54px] flex items-center font-bold"
                  :class="errors.producto_id ? 'border-red-500' : 'border-gray-200'"
                  filter
                  @change="onProductoChange"
                  :loading="cargandoProductos"
                />
                <small v-if="errors.producto_id" class="text-red-500 text-xs block font-bold">{{ errors.producto_id }}</small>
              </div>

              <!-- Lote (si perecedero) -->
              <div v-if="esPerecederoSeleccionado" class="col-span-1 space-y-2 text-left">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Lote *</label>
                <Dropdown
                  v-model="formulario.lote_id"
                  :options="lotesDisponibles"
                  optionLabel="codigo_lote"
                  optionValue="id"
                  placeholder="Elegir lote..."
                  class="w-full border rounded-xl text-sm h-[54px] flex items-center font-bold"
                  :class="errors.lote_id ? 'border-red-500' : 'border-gray-200'"
                  filter
                />
                <small v-if="errors.lote_id" class="text-red-500 text-xs block font-bold">{{ errors.lote_id }}</small>
              </div>

              <!-- Cantidad -->
              <div :class="esPerecederoSeleccionado ? 'col-span-1' : 'col-span-2'" class="space-y-2 text-left">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Cantidad Dañada *</label>
                <InputNumber v-model="formulario.cantidad" :min="1" inputClass="w-full border rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" :class="errors.cantidad ? 'border-red-500' : 'border-gray-200'" placeholder="1" />
                <small v-if="errors.cantidad" class="text-red-500 text-xs block font-bold">{{ errors.cantidad }}</small>
              </div>

              <!-- Motivo / Descripción -->
              <div class="col-span-2 space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Motivo del Daño *</label>
                <Textarea v-model="formulario.descripcion" rows="3" class="w-full border rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" :class="errors.descripcion ? 'border-red-500' : 'border-gray-200'" placeholder="Explique brevemente qué ocurrió con el producto..." />
                <small v-if="errors.descripcion" class="text-red-500 text-xs block font-bold">{{ errors.descripcion }}</small>
              </div>
            </div>

            <!-- Acciones -->
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
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import { useProductoDaniadoStore } from '@/stores/productoDaniadoStore';
import productoService from '@/services/productoService';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'guardado']);

const store = useProductoDaniadoStore();
const toast = useToast();

const productosDisponibles = ref([]);
const lotesDisponibles = ref([]);
const guardando = ref(false);
const cargandoProductos = ref(false);
const errors = ref({});

const formulario = ref({
  origen: 'DIRECTO',
  producto_id: null,
  lote_id: null,
  cantidad: 1,
  costo_unitario: 0,
  descripcion: ''
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    errors.value = {};
    formulario.value = {
      origen: 'DIRECTO',
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
    severity: tipo === 'warn' ? 'warn' : tipo,
    summary: tipo === 'success' ? 'Éxito' : (tipo === 'warn' ? 'Advertencia' : 'Error'),
    detail: mensaje,
    life: 3500
  });
};

const cerrar = () => {
  emit('update:visible', false);
};

const cargarProductos = async () => {
  try {
    cargandoProductos.value = true;
    const response = await productoService.getProductos({ estado: 'ACTIVO', sin_paginar: true });
    const lista = response.data || [];
    productosDisponibles.value = lista.filter(p => Number(p.stock || 0) > 0);
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
      const lotesValidos = (prod.lotes || []).filter(l => l.estado === 'ACTIVO' && Number(l.cantidad_actual || 0) > 0);
      const grupos = {};
      lotesValidos.forEach(l => {
        const codigo = (l.codigo_lote || '').trim().toUpperCase();
        const fechaSolo = l.fecha_vencimiento ? String(l.fecha_vencimiento).split('T')[0] : '';
        const clave = `${codigo}|${fechaSolo}`;
        if (!grupos[clave]) {
          const fechaFormat = fechaSolo ? fechaSolo.split('-').reverse().join('/') : 'Sin fecha';
          grupos[clave] = {
            id: l.id,
            codigo_lote: `${codigo} (vence ${fechaFormat}) · ${l.cantidad_actual} u.`
          };
        }
      });
      lotesDisponibles.value = Object.values(grupos);
      formulario.value.lote_id = null;
    } else {
      lotesDisponibles.value = [];
      formulario.value.lote_id = null;
    }
  }
};

const guardar = async () => {
  errors.value = {};

  if (!formulario.value.producto_id) {
    errors.value.producto_id = 'El producto dañado es obligatorio.';
  }
  if (esPerecederoSeleccionado.value && !formulario.value.lote_id) {
    errors.value.lote_id = 'El lote del producto perecedero es obligatorio.';
  }
  if (!formulario.value.cantidad || formulario.value.cantidad < 1) {
    errors.value.cantidad = 'La cantidad debe ser al menos 1.';
  }
  const descTrim = (formulario.value.descripcion || '').trim();
  if (!descTrim) {
    errors.value.descripcion = 'El motivo del daño es obligatorio.';
  } else if (descTrim.length < 3) {
    errors.value.descripcion = 'El motivo del daño debe tener al menos 3 caracteres.';
  } else if (descTrim.length > 255) {
    errors.value.descripcion = 'El motivo del daño no debe superar los 255 caracteres.';
  } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.\,\(\)\:\#\!\¡\?\¿\/]+$/.test(descTrim)) {
    errors.value.descripcion = 'Solo se permiten letras, números y signos de puntuación básicos (. , - () : # ! ¡ ? ¿ /).';
  }

  if (Object.keys(errors.value).length > 0) {
    return;
  }

  try {
    guardando.value = true;
    const data = {
      origen: 'DIRECTO',
      producto_id: formulario.value.producto_id,
      cantidad: formulario.value.cantidad,
      descripcion: formulario.value.descripcion,
      lote_id: formulario.value.lote_id
    };
    const response = await store.createRegistro(data);
    mostrarToast(response.data.message);
    cerrar();
    emit('guardado');
  } catch (error) {
    console.error(error);
    if (error.response?.status === 422) {
      const resData = error.response?.data || {};
      if (resData.errors) {
        for (const key in resData.errors) {
          errors.value[key] = Array.isArray(resData.errors[key]) ? resData.errors[key][0] : resData.errors[key];
        }
      }
    } else {
      const msg = error.response?.data?.message || 'Error al guardar el registro.';
      mostrarToast(msg, 'error');
    }
  } finally {
    guardando.value = false;
  }
};
</script>
