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

        <!-- Aviso si la venta no es válida para devolución -->
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
                    <label class="text-xs font-bold text-gray-600">Descripción del daño:</label>
                    <Textarea
                      v-model="sub.descripcion"
                      rows="2"
                      class="w-full border border-gray-300 rounded-lg text-xs"
                      placeholder="Describa el daño..."
                      :disabled="!ventaValida"
                    />
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
            <div v-if="detalleVenta.cantidad > 1" class="mt-2 text-right">
            <Button
              label="Agregar otra condición"
              icon="pi pi-plus-circle"
              class="p-button-sm p-button-outlined border-[#0a3622] text-[#0a3622]"
              @click="agregarSubDetalle(index)"
              :disabled="!ventaValida"
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
        :disabled="!ventaEncontrada || !ventaValida || totalSeleccionado === 0 || !motivo.trim() || registrando"
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

// Computed para validar si la venta encontrada permite devolución
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
  selecciones[index].push({
    activo: false,
    cantidad: 1,
    condicion: 'PERFECTO',
    descripcion: ''
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
        selecciones.push([{ activo: false, cantidad: 1, condicion: 'PERFECTO', descripcion: '' }]);
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
  if (!motivo.value.trim()) {
    errorMotivo.value = 'El motivo es obligatorio.';
    return;
  }
  errorMotivo.value = '';

  const detalle = [];
  ventaEncontrada.value.detalle_ventas.forEach((detalleVenta, index) => {
    if (selecciones[index]) {
      selecciones[index].forEach(sub => {
        if (sub.activo) {
          const item = {
            detalle_venta_id: detalleVenta.id,
            cantidad: sub.cantidad || 1,
            condicion: sub.condicion,
          };
          if (sub.condicion === 'DANIADO') {
            item.descripcion = sub.descripcion || 'Sin descripción';
          }
          detalle.push(item);
        }
      });
    }
  });

  if (detalle.length === 0) {
    toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Selecciona al menos un producto.', life: 3000 });
    return;
  }

  registrando.value = true;
  try {
    const response = await api.post('/devoluciones-ventas', {
      venta_id: ventaEncontrada.value.id,
      motivo: motivo.value.trim(),
      detalle: detalle
    });

    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Devolución registrada correctamente.', life: 4000 });
    emit('devolucionRegistrada', response.data);
    emit('update:visible', false);
    limpiarBusqueda();
  } catch (error) {
    const mensaje = error.response?.data?.message || 'Error al registrar la devolución.';
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
