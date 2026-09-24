<template>
  <Dialog
    :visible="props.visible"
    @update:visible="$emit('update:visible', $event)"
    header="Registrar Devolución"
    :modal="true"
    :closable="false"
    :style="{ width: '90%', maxWidth: '750px' }"
    class="rounded-xl"
  >
    <div class="flex flex-col gap-5">
      <!-- 1. Buscar Venta por Correlativo -->
      <div class="flex items-end gap-3">
        <div class="flex flex-col gap-1 flex-1">
          <label class="text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-wider">
            <i class="pi pi-search mr-1"></i> Correlativo de Venta
          </label>
          <InputText
            v-model="correlativo"
            placeholder="Ej: 2026070004"
            class="w-full border border-gray-300 rounded-lg text-sm font-bold"
            :disabled="ventaEncontrada !== null"
            @keyup.enter="buscarVenta"
          />
        </div>
        <Button
          label="Buscar"
          icon="pi pi-search"
          class="p-button-sm bg-[#0a3622] border-none"
          @click="buscarVenta"
          :disabled="cargandoBusqueda || !correlativo.trim()"
        />
        <Button
          v-if="ventaEncontrada"
          label="Nueva búsqueda"
          icon="pi pi-refresh"
          class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]"
          @click="limpiarBusqueda"
        />
      </div>

      <!-- Spinner mientras busca -->
      <div v-if="cargandoBusqueda" class="text-center py-4">
        <ProgressSpinner style="width: 40px; height: 40px;" />
        <p class="text-xs text-gray-500 mt-2">Buscando venta...</p>
      </div>

      <!-- Mensaje si no se encontró -->
      <div
        v-if="!cargandoBusqueda && busquedaRealizada && !ventaEncontrada"
        class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-bold"
      >
        No se encontró una venta con ese correlativo o no está disponible para devolución.
      </div>

      <!-- 2. Datos de la venta encontrada -->
      <div v-if="ventaEncontrada" class="bg-[#f8fbf8] border border-[#dbe9dc] rounded-lg p-4">
        <h3 class="text-sm font-extrabold text-[#0a3622] uppercase tracking-wide mb-2">
          Venta #{{ ventaEncontrada.correlativo }}
        </h3>
        <div class="grid grid-cols-2 gap-2 text-xs text-gray-700 font-bold">
          <div>Fecha: {{ formatearFecha(ventaEncontrada.fecha) }}</div>
          <div>Total: ${{ Number(ventaEncontrada.total).toFixed(2) }}</div>
          <div>Estado:
            <Tag
              :value="ventaEncontrada.estado"
              :severity="ventaEncontrada.estado === 'PAGADA' ? 'success' : ventaEncontrada.estado === 'CREDITO' ? 'warning' : 'danger'"
            />
          </div>
          <div>Método: {{ ventaEncontrada.metodo_pago?.nombre || 'Sin método' }}</div>
        </div>

        <div
          v-if="!ventaValida"
          class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-bold mt-3"
        >
          Esta venta no permite devoluciones porque su estado es {{ ventaEncontrada.estado }}.
          Solo se pueden devolver ventas en estado PAGADA o CREDITO.
        </div>
      </div>

      <!-- 3. Productos de la venta -->
      <div v-if="ventaEncontrada && ventaEncontrada.detalle_ventas">
        <h3 class="text-sm font-extrabold text-[#0a3622] uppercase tracking-wide mb-3">
          Productos de la venta
        </h3>

        <div class="space-y-4">
          <div
            v-for="(detalleVenta, index) in ventaEncontrada.detalle_ventas"
            :key="detalleVenta.id"
            class="border border-gray-200 rounded-lg p-3"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-sm text-gray-800">
                {{ detalleVenta.producto?.nombre || `Producto #${detalleVenta.producto_id}` }}
              </span>
              <span class="text-xs text-gray-500">
                Vendido: {{ detalleVenta.cantidad }} | Máx. a devolver: {{ detalleVenta.cantidad }}
              </span>
            </div>

            <div
              v-for="(sub, subIndex) in selecciones[index]"
              :key="subIndex"
              class="border-t border-gray-100 pt-3 mt-2"
              :class="{ 'bg-red-50 border-red-200 -mx-3 px-3 rounded': sub.activo && sub.condicion === 'DANIADO' }"
            >
              <div class="flex items-start gap-3">
                <Checkbox
                  v-model="sub.activo"
                  :binary="true"
                  class="mt-1"
                  :disabled="!ventaValida"
                />

                <div class="flex-1 space-y-3">
                  <div class="flex items-center gap-2">
                    <label class="text-xs font-bold text-gray-600">Cantidad:</label>
                    <InputNumber
                      v-model="sub.cantidad"
                      :min="1"
                      :max="detalleVenta.cantidad"
                      class="w-24"
                      inputClass="text-center font-bold text-sm"
                      :disabled="!ventaValida"
                    />
                  </div>

                  <div class="flex items-center gap-4">
                    <span class="text-xs font-bold text-gray-600">Condición:</span>
                    <div class="flex items-center gap-1">
                      <RadioButton
                        v-model="sub.condicion"
                        value="PERFECTO"
                        :inputId="`perfecto-${index}-${subIndex}`"
                        :disabled="!ventaValida"
                      />
                      <label :for="`perfecto-${index}-${subIndex}`" class="text-xs cursor-pointer">Perfecto</label>
                    </div>
                    <div class="flex items-center gap-1">
                      <RadioButton
                        v-model="sub.condicion"
                        value="DANIADO"
                        :inputId="`daniado-${index}-${subIndex}`"
                        :disabled="!ventaValida"
                      />
                      <label :for="`daniado-${index}-${subIndex}`" class="text-xs cursor-pointer">Dañado</label>
                    </div>
                  </div>

                  <div v-if="sub.condicion === 'DANIADO'" class="flex flex-col gap-1">
                    <label class="text-xs font-bold text-gray-600">
                      Descripción del daño: <span class="text-red-500">*</span>
                    </label>
                    <Textarea
                      v-model="sub.descripcion"
                      rows="2"
                      class="w-full border border-gray-300 rounded-lg text-xs"
                      placeholder="Describa el daño..."
                      :disabled="!ventaValida"
                      :class="{ 'p-invalid': sub.errorDescripcion }"
                    />
                    <small v-if="sub.errorDescripcion" class="text-red-500 text-xs">
                      {{ sub.errorDescripcion }}
                    </small>
                  </div>

                  <div v-if="selecciones[index].length > 1" class="text-right">
                    <Button
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-text p-button-sm p-button-danger"
                      @click="eliminarSubDetalle(index, subIndex)"
                      v-tooltip.left="'Quitar este detalle'"
                      :disabled="!ventaValida"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Botón para agregar otra condición (máximo 2 sub-detalles por producto) -->
            <div
              v-if="puedeAgregarSubDetalle(index, detalleVenta)"
              class="mt-2 text-right"
            >
              <Button
                label="Agregar otra condición"
                icon="pi pi-plus-circle"
                class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]"
                @click="agregarSubDetalle(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Resumen y Motivo -->
      <div v-if="ventaEncontrada && ventaValida && totalSeleccionado > 0" class="border-t pt-4">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-extrabold text-[#0a3622]">Total a devolver:</span>
          <span class="text-lg font-extrabold text-[#0a3622]">${{ totalSeleccionado.toFixed(2) }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-wider">
            Motivo de la devolución <span class="text-red-500">*</span>
          </label>
          <Textarea
            v-model="motivo"
            rows="2"
            class="w-full border border-gray-300 rounded-lg text-sm font-bold"
            placeholder="Ej: Producto en mal estado, cliente no deseado..."
            :disabled="!ventaValida"
            :class="{ 'p-invalid': errorMotivo }"
          />
          <small v-if="errorMotivo" class="text-red-500 text-xs">{{ errorMotivo }}</small>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-text"
        @click="$emit('update:visible', false)"
      />
      <Button
        label="Registrar Devolución"
        icon="pi pi-check"
        class="p-button-sm bg-[#0a3622] border-none"
        :disabled="!ventaEncontrada || !ventaValida || totalSeleccionado === 0 || registrando"
        @click="registrarDevolucion"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import api from '@/services/api';
import { useToast } from 'primevue/usetoast';
import {
  Dialog,
  Button,
  InputText,
  InputNumber,
  Textarea,
  Checkbox,
  RadioButton,
  Tag,
  ProgressSpinner
} from '@/utils/primevue';

const toast = useToast();

const props = defineProps({
  visible: Boolean
});

const emit = defineEmits(['update:visible', 'devolucionRegistrada']);

const correlativo = ref('');
const cargandoBusqueda = ref(false);
const busquedaRealizada = ref(false);
const ventaEncontrada = ref(null);
const motivo = ref('');
const errorMotivo = ref('');
const registrando = ref(false);

const selecciones = reactive([]);

// Total de cantidad asignada en sub-detalles de un producto
const cantidadAsignada = (index) => {
  if (!selecciones[index]) return 0;
  return selecciones[index].reduce((total, sub) => total + (sub.cantidad || 0), 0);
};

// Determina si se puede agregar otro sub-detalle
const puedeAgregarSubDetalle = (index, detalleVenta) => {
  if (!ventaValida.value) return false;
  if (selecciones[index].length >= 2) return false;
  if (cantidadAsignada(index) >= detalleVenta.cantidad) return false;

  // Evitar condiciones duplicadas (ya hay un PERFECTO y un DANIADO)
  const tienePerfecto = selecciones[index].some(s => s.condicion === 'PERFECTO');
  const tieneDaniado  = selecciones[index].some(s => s.condicion === 'DANIADO');
  if (tienePerfecto && tieneDaniado) return false;

  return true;
};

const ventaValida = computed(() => {
  if (!ventaEncontrada.value) return false;
  return ['PAGADA', 'CREDITO'].includes(ventaEncontrada.value.estado);
});

const totalSeleccionado = computed(() => {
  if (!ventaEncontrada.value) return 0;
  let total = 0;
  ventaEncontrada.value.detalle_ventas.forEach((detalle, index) => {
    if (selecciones[index]) {
      selecciones[index].forEach(sub => {
        if (sub.activo) {
          total += (sub.cantidad || 1) * parseFloat(detalle.precio_unitario);
        }
      });
    }
  });
  return total;
});

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const agregarSubDetalle = (index) => {
  const existePerfecto = selecciones[index].some(s => s.condicion === 'PERFECTO');
  const existeDaniado  = selecciones[index].some(s => s.condicion === 'DANIADO');

  // Determinar la condición del nuevo sub-detalle
  let condicion = 'PERFECTO';
  if (existePerfecto && !existeDaniado) condicion = 'DANIADO';
  else if (existeDaniado && !existePerfecto) condicion = 'PERFECTO';
  else if (existePerfecto && existeDaniado) return; // no debería llegar aquí

  selecciones[index].push({
    activo: false,
    cantidad: 1,
    condicion,
    descripcion: '',
    errorDescripcion: ''
  });
};

const eliminarSubDetalle = (index, subIndex) => {
  selecciones[index].splice(subIndex, 1);
};

const buscarVenta = async () => {
  if (!correlativo.value.trim()) return;

  cargandoBusqueda.value = true;
  busquedaRealizada.value = false;
  ventaEncontrada.value = null;
  selecciones.length = 0;

  try {
    const response = await api.get('/ventas', {
      params: {
        correlativo: correlativo.value.trim(),
        per_page: 1
      }
    });

    if (response.data.data && response.data.data.length === 1) {
      ventaEncontrada.value = response.data.data[0];
      ventaEncontrada.value.detalle_ventas.forEach(() => {
        selecciones.push([{
          activo: false,
          cantidad: 1,
          condicion: 'PERFECTO',
          descripcion: '',
          errorDescripcion: ''
        }]);
      });
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo buscar la venta.', life: 3000 });
  } finally {
    cargandoBusqueda.value = false;
    busquedaRealizada.value = true;
  }
};

const limpiarBusqueda = () => {
  correlativo.value = '';
  ventaEncontrada.value = null;
  busquedaRealizada.value = false;
  motivo.value = '';
  errorMotivo.value = '';
  selecciones.length = 0;
};

const registrarDevolucion = async () => {
  if (!ventaEncontrada.value || !ventaValida.value) return;

  // Validar motivo (mínimo 5 caracteres)
  errorMotivo.value = '';
  if (!motivo.value.trim()) {
    errorMotivo.value = 'El motivo es obligatorio.';
    return;
  }
  if (motivo.value.trim().length < 5) {
    errorMotivo.value = 'El motivo debe tener al menos 5 caracteres.';
    return;
  }

  // Limpiar errores previos de descripción
  selecciones.forEach(grupo => grupo.forEach(sub => { sub.errorDescripcion = ''; }));

  const detalle = [];
  let hayErrores = false;

  ventaEncontrada.value.detalle_ventas.forEach((detalleVenta, index) => {
    if (selecciones[index]) {
      selecciones[index].forEach(sub => {
        if (sub.activo) {
          // Validar descripción obligatoria cuando es DANIADO
          if (sub.condicion === 'DANIADO' && !sub.descripcion.trim()) {
            sub.errorDescripcion = 'La descripción es obligatoria para productos dañados.';
            hayErrores = true;
            return;
          }
          if (sub.condicion === 'DANIADO' && sub.descripcion.trim().length < 3) {
            sub.errorDescripcion = 'La descripción debe tener al menos 3 caracteres.';
            hayErrores = true;
            return;
          }

          const item = {
            detalle_venta_id: detalleVenta.id,
            cantidad: sub.cantidad || 1,
            condicion: sub.condicion,
          };
          if (sub.condicion === 'DANIADO') {
            item.descripcion = sub.descripcion.trim();
          }
          detalle.push(item);
        }
      });
    }
  });

  if (hayErrores) return;

  if (detalle.length === 0) {
    toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Selecciona al menos un producto.', life: 3000 });
    return;
  }

  registrando.value = true;
  try {
    const response = await api.post('/devoluciones-ventas', {
      venta_id: ventaEncontrada.value.id,
      motivo: motivo.value.trim(),
      detalle
    });

    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Devolución registrada correctamente.', life: 4000 });
    emit('devolucionRegistrada', response.data);
    emit('update:visible', false);
    limpiarBusqueda();
  } catch (error) {
    const errores = error.response?.data?.errors;
    const mensaje = (errores && Object.values(errores)[0]?.[0])
      || error.response?.data?.message
      || 'Error al registrar la devolución.';
    toast.add({ severity: 'error', summary: 'Error', detail: mensaje, life: 5000 });
  } finally {
    registrando.value = false;
  }
};

watch(() => props.visible, (nuevo) => {
  if (!nuevo) {
    limpiarBusqueda();
  }
});
</script>
