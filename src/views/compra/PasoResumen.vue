<template>
  <div class="pb-32 max-w-5xl mx-auto space-y-8 font-dm-sans">
    <!-- MENSAJE DE ADVERTENCIA -->
    <div class="bg-amber-100 border-l-4 border-amber-600 p-4 rounded-xl flex items-center gap-4 shadow-sm">
      <i class="pi pi-exclamation-triangle text-amber-500 text-xl"></i>
      <div>
        <p class="text-xs font-black text-amber-800 uppercase tracking-widest">Verificación Requerida: Revise todo los campos esten bien antes de registrar la compra</p>
      </div>
    </div>
    <!-- RESUMEN DE ENCABEZADO -->
    <section class="bg-white rounded-3xl border border-gray-300 shadow-xl overflow-hidden text-left">
      <div class="bg-[#0a3622] px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <i class="pi pi-file-check text-white text-lg"></i>
          <h3 class="text-white font-black text-sm uppercase tracking-widest">Resumen de Facturación</h3>
        </div>
      </div>
      <div class="p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-1">
          <p class="text-[12px] font-black text-gray-800 uppercase tracking-widest">Nº Factura</p>
          <p class="text-1xl font-bold text-[#000000]">{{ datos.numero_factura }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-[12px] font-black text-gray-800 uppercase tracking-widest">Código Interno</p>
          <p class="text-1xl font-bold text-[#000000]">{{ datos.codigo_factura }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-[12px] font-black text-gray-800 uppercase tracking-widest">Proveedor</p>
          <p class="text-1xl font-bold text-[#000000]">{{ nombreProveedor }}</p>
        </div>
        <div class="space-y-1">
          <p class="text-[12px] font-black text-gray-800 uppercase tracking-widest">Fecha de Emisión</p>
          <p class="text-1xl font-bold text-[#000000]">{{ formatearFecha(datos.fecha_emision) }}</p>
        </div>
      </div>
    </section>
    <!-- TABLA DE PRODUCTOS -->
    <section class="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl overflow-hidden text-left">
      <div class="bg-gray-50 px-4 sm:px-8 py-3 sm:py-4 border-b border-gray-200 sm:border-gray-600 flex items-center gap-2 sm:gap-3">
        <i class="pi pi-list text-[#0a3622] text-base sm:text-lg"></i>
        <h3 class="text-[#0a3622] font-black text-xs sm:text-sm uppercase tracking-widest">Detalle de Productos y Lotes</h3>
      </div>

      <!-- VERSIÓN DESKTOP: Tabla -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#a1bba7] text-[#032b19] text-[10px] sm:text-[11px] font-black uppercase tracking-widest border-b border-gray-600">
              <th class="py-3 sm:py-4 px-4 sm:px-8">Producto</th>
              <th class="py-3 sm:py-4 px-3 sm:px-6 text-center">Cantidad Total</th>
              <th class="py-3 sm:py-4 px-3 sm:px-6 text-center">Costo Unitario</th>
              <th class="py-3 sm:py-4 px-4 sm:px-8 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 sm:divide-gray-400">
            <tr v-for="(item, index) in datos.detalles" :key="index" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-3 sm:py-5 px-4 sm:px-8">
                <div class="flex flex-col gap-1">
                  <span class="font-black text-gray-900 text-xs sm:text-sm tracking-tight">{{ item.nombre }}</span>
                  <div v-if="item.perecedero === 'PERECEDERO'" class="flex flex-wrap gap-1 sm:gap-2 mt-1">
                    <span v-for="lote in item.lotes" :key="lote.codigo_lote" class="bg-blue-50 text-blue-700 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md border border-blue-100 uppercase">
                      {{ lote.codigo_lote }} | {{ lote.fecha_vencimiento }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="py-3 sm:py-5 px-3 sm:px-6 text-center font-black text-gray-900 text-xs sm:text-sm">
                {{ calcularCantidad(item) }}
              </td>
              <td class="py-3 sm:py-5 px-3 sm:px-6 text-center font-black text-gray-900 text-xs sm:text-sm">
                ${{ item.precio_unitario }}
              </td>
              <td class="py-3 sm:py-5 px-4 sm:px-8 text-right font-black text-gray-900 text-sm sm:text-base">
                ${{ (item.precio_unitario * calcularCantidad(item)).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VERSIÓN MÓVIL: Tarjetas -->
      <div class="sm:hidden divide-y divide-gray-200">
        <div v-for="(item, index) in datos.detalles" :key="index" class="p-4 space-y-2">
          <div class="flex justify-between items-start">
            <span class="font-black text-gray-900 text-sm">{{ item.nombre }}</span>
            <span class="font-black text-gray-900 text-sm">${{ (item.precio_unitario * calcularCantidad(item)).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-800 font-bold">Cantidad:</span>
            <span class="font-bold">{{ calcularCantidad(item) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-800 font-bold">Costo unitario:</span>
            <span class="font-bold">${{ item.precio_unitario }}</span>
          </div>
          <!-- Mostrar lotes si es perecedero -->
          <div v-if="item.perecedero === 'PERECEDERO'" class="flex flex-wrap gap-1 pt-1">
            <span v-for="lote in item.lotes" :key="lote.codigo_lote" class="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md">
              {{ lote.codigo_lote }}<br>vence: {{ lote.fecha_vencimiento }}
            </span>
          </div>
        </div>
      </div>

      <!-- TOTAL -->
      <div class="bg-[#0a3622] p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center text-white relative overflow-hidden gap-2">
        <div class="z-10 text-center sm:text-left">
          <p class="text-[11px] font-black text-green-300 uppercase tracking-[0.4em]">Total de la Compra</p>
        </div>
        <p class="text-2xl sm:text-3xl font-black text-gray-200 tracking-tighter z-10">$ {{ totalFactura }}</p>
        <div class="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </section>

    <!-- NAVEGACIÓN -->
    <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 px-2 sm:px-4 mt-6">
      <button
        @click="$emit('atras')"
        class="w-full sm:w-auto py-3 sm:py-4 px-4 sm:px-10 bg-white border border-gray-300 text-[#0a3622] font-black rounded-2xl hover:bg-gray-50 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md"
      >
        <i class="pi pi-arrow-left text-[10px]"></i> Regresar a productos
      </button>

      <button
        @click="confirmarYGuardar"
        :disabled="cargando"
        class="w-full sm:w-auto py-3 sm:py-5 px-4 sm:px-16 bg-[#0a3622] text-white font-black rounded-2xl hover:bg-[#115033] transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-4 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <i v-if="cargando" class="pi pi-spin pi-spinner text-sm"></i>
        <span v-else>Confirmar y Registrar Compra</span>
        <i v-if="!cargando" class="pi pi-check-circle text-sm group-hover:scale-110 transition-transform"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, onMounted } from 'vue';
  import { useProveedorStore } from '@/stores/proveedorStore';
  import { useCompraStore } from '@/stores/compraStore';
  import Swal from 'sweetalert2';

  const props = defineProps({
    datos: Object
  });

  const emit = defineEmits(['atras', 'finalizar']);

  const proveedorStore = useProveedorStore();
  const compraStore = useCompraStore();
  const cargando = ref(false);

  // Obtenemos el nombre del proveedor para mostrarlo en el resumen
  const nombreProveedor = computed(() => {
    const prov = proveedorStore.proveedores.find(p => p.id === props.datos.proveedor_id);
    return prov ? prov.nombre : 'Cargando...';
  });

  // Aseguramos que los proveedores estén cargados
  onMounted(async () => {
    if (proveedorStore.proveedores.length === 0) {
      await proveedorStore.fetchProveedores(1, 100);
    }
  });

  const calcularCantidad = (item) => {
    if (item.perecedero === 'PERECEDERO') {
      return item.lotes.reduce((sum, l) => sum + (parseInt(l.cantidad) || 0), 0);
    }
    return parseInt(item.cantidad) || 0;
  };

  const totalFactura = computed(() => {
    return props.datos.detalles.reduce((sum, item) => {
      return sum + (parseFloat(item.precio_unitario) * calcularCantidad(item));
    }, 0).toFixed(2);
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const confirmarYGuardar = async () => {
    const result = await Swal.fire({
      title: '¿Confirmar Registro?',
      text: "Se actualizará el inventario y se guardará la factura permanentemente.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0a3622',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, registrar ahora',
      cancelButtonText: 'Revisar de nuevo',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      cargando.value = true;
      try {
        // Preparamos los datos exactos para el backend
        const datosParaBackend = {
          proveedor_id: props.datos.proveedor_id,
          numero_factura: props.datos.numero_factura,
          codigo_factura: props.datos.codigo_factura,
          fecha_emision: props.datos.fecha_emision instanceof Date
            ? props.datos.fecha_emision.toISOString ().split('T')[0]
            : props.datos.fecha_emision,
          total: totalFactura.value,
          detalles: props.datos.detalles.map(d => {
            const detalle = {
              producto_id: d.producto_id || null,
              precio_unitario: d.precio_unitario,
              factor_conversion: d.factor_conversion || 1,
              margen_detalle: d.margen_detalle,
              margen_mayor: d.margen_mayor
            }
            //Solo para producto nuevo
            if(!d.producto_id){
              detalle.nombre = d.nombre
              detalle.categoria_id = d.categoria_id
              detalle.marca_id = d.marca_id
              detalle.unidad_medida_id = d.unidad_medida_id
              detalle.stock_minimo = d.stock_minimo
              detalle.perecedero = d.perecedero
            }
            //PERECEDERO → lotes, NORMAL → cantidad
            if(d.perecedero === 'PERECEDERO'){
              detalle.lotes = d.lotes
            }else{
              detalle.cantidad = calcularCantidad(d)
            }
            return detalle
          })
        };

        await compraStore.registrarCompra(datosParaBackend);

        Swal.fire({
          icon: 'success',
          title: '¡Compra Registrada!',
          text: 'El abastecimiento se ha procesado con éxito.',
          showConfirmButton: false,
          timer: 2500
        });

        // Notificamos al Wizard que hemos terminado
        emit('finalizar');

      }catch(error){
        console.error("Error al registrar:", error);

        let errorMsg = "No se pudo registrar la compra.";

        if (error.response?.data?.errors) {
          // Si hay errores de validación, los aplanamos
          const validationErrors = error.response.data.errors;
          errorMsg = Object.values(validationErrors).flat().join('<br>');
        } else if (error.response?.data?.message) {
          // Si hay un mensaje directo del servidor
          errorMsg = error.response.data.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error de Registro',
          html: errorMsg,
          confirmButtonColor: '#0a3622'
        });
      } finally {
        cargando.value = false;
      }
    }
  };
</script>

<style scoped>
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
