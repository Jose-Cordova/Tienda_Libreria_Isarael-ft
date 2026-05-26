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
    <section class="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden text-left">
      <div class="bg-gray-50 px-8 py-4 border-b border-gray-600 flex items-center gap-3">
        <i class="pi pi-list text-[#0a3622] text-lg"></i>
        <h3 class="text-[#0a3622] font-black text-sm uppercase tracking-widest">Detalle de Productos y Lotes</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#a1bba7] text-[#032b19] text-[11px] font-black uppercase tracking-widest border-b border-gray-600">
              <th class="py-4 px-8">Producto</th>
              <th class="py-4 px-6 text-center">Cantidad Total</th>
              <th class="py-4 px-6 text-center">Costo Unitario</th>
              <th class="py-4 px-8 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-400">
            <tr v-for="(item, index) in datos.detalles" :key="index" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-5 px-8">
                <div class="flex flex-col gap-1">
                  <span class="font-black text-[#000000] text-sm tracking-tight">{{ item.nombre }}</span>
                  <!-- Desglose de Lotes si es Perecedero -->
                  <div v-if="item.perecedero === 'PERECEDERO'" class="flex flex-wrap gap-2 mt-2">
                    <span v-for="(lote, lIdx) in item.lotes" :key="lIdx" class="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-md border border-blue-100 uppercase flex items-center gap-1 shadow-sm">
                      <i class="pi pi-tag text-[8px]"></i> {{ lote.codigo_lote }} | <i class="pi pi-calendar text-[8px] ml-1"></i> {{ lote.fecha_vencimiento }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="py-5 px-6 text-center font-black text-[#000000] text-sm">
                {{ calcularCantidad(item) }} <span class="text-[9px] text-gray-400 font-bold ml-0.5 uppercase tracking-tighter"></span>
              </td>
              <td class="py-5 px-6 text-center font-black text-[#000000] text-sm">
                ${{ item.precio_unitario.toFixed(2) }}
              </td>
              <td class="py-5 px-8 text-right font-black text-[#000000] text-base tracking-tighter">
                $ {{ (parseFloat(item.precio_unitario) * calcularCantidad(item)).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total -->
      <div class="bg-[#0a3622] p-5 flex justify-between items-center text-white relative overflow-hidden">
        <div class="z-10">
          <p class="text-[11px] font-black text-green-300 uppercase tracking-[0.4em] mb-0.5">Total de la Compra</p>
        </div>
        <p class="text-2xl font-black text-gray-200 tracking-tighter z-10 shadow-sm leading-none">$ {{ totalFactura }}</p>
        <!-- Decoración abstracta escalada -->
        <div class="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </section>

    <!-- NAVEGACIÓN -->
    <div class="flex justify-between items-center px-4">
      <button
        @click="$emit('atras')"
        class="px-10 py-4 bg-white border border-gray-300 text-[#0a3622] font-black rounded-2xl hover:bg-gray-50 transition-all text-xs uppercase tracking-widest flex items-center gap-3 shadow-md"
      >
        <i class="pi pi-arrow-left text-[10px]"></i> Regresar a productos
      </button>

      <button
        @click="confirmarYGuardar"
        :disabled="cargando"
        class="px-16 py-5 bg-[#0a3622] text-white font-black rounded-2xl hover:bg-[#115033] transition-all text-xs uppercase tracking-[0.2em] flex items-center gap-4 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group"
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
          timer: 2000
        });

        // Notificamos al Wizard que hemos terminado
        emit('finalizar');

      } catch (error) {
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
