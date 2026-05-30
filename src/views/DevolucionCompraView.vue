<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">
    <!-- Encabezado-->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3 text-left">
        <i class="pi pi-replay text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Devoluciones de Compras</h1>
      </div>
      <div class="flex items-center gap-3">
        <!-- Buscador -->
        <span class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
          <InputText
            v-model="busqueda"
            placeholder="Buscar..."
            class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-48 focus:border-green-600 transition-all"
          />
        </span>
        <!-- Filtros de fecha -->
        <div class="flex items-center gap-2">
          <Calendar
            v-model="fechaInicio"
            placeholder="Desde"
            dateFormat="dd/mm/yy"
            showIcon
            :maxDate="fechaFin || null"
            class="p-calendar-sm w-32 custom-prime-calendar"
          />
          <Calendar
            v-model="fechaFin"
            dateFormat="dd/mm/yy"
            placeholder="Hasta"
            showIcon
            :minDate="fechaInicio || null"
            class="p-calendar-sm w-32 custom-prime-calendar"
          />
          <Button v-if="fechaInicio || fechaFin" icon="pi pi-filter-slash" class="p-button-rounded p-button-text p-button-sm !text-red-900 !w-9 !h-9" @click="limpiarFechas" />
        </div>
        <!-- Botón Nueva Devolución -->
        <Button
          label="Nueva Devolución"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all"
          @click="abrirNuevo"
        />
      </div>
    </section>
    <!-- Grid de total de devoluciones compras -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-left">
      <div class="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group transition-all border-[1px] border-[#0a3622] border-l-[10px] overflow-hidden">
        <div>
          <p class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] mb-1">Sumatoria Devoluciones</p>
          <p class="text-2xl font-black text-[#0a3622] tracking-tighter">${{ totalDevoluciones }}</p>
        </div>
      </div>
    </div>
    <!-- Tabla de devoluciones -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 text-left">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Factura</th>
              <th class="py-3 px-5">Proveedor</th>
              <th class="py-3 px-5 text-center">Cantidad</th>
              <th class="py-3 px-5 text-center">Total Devuelto</th>
              <th class="py-3 px-5">Fecha</th>
              <th class="py-3 px-5">Motivo</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-800 divide-y divide-gray-100">
            <tr v-for="dev in filteredDevoluciones" :key="dev.id" class="hover:bg-gray-50 transition text-sm">
              <td class="py-4 px-5 font-bold">{{ dev.factura_codigo }}</td>
              <td class="py-4 px-5 font-bold">{{ dev.proveedor_nombre }}</td>
              <td class="py-4 px-5 text-center font-bold">{{ dev.cantidad_total }}</td>
              <td class="py-4 px-5 text-center font-bold text-red-600">${{ dev.monto_total.toFixed(2) }}</td>
              <td class="py-4 px-5 font-bold text-gray-800">{{ dev.fecha }}</td>
              <td class="py-4 px-5 font-bold text-gray-800 max-w-xs truncate" :title="dev.motivo">{{ dev.motivo }}</td>
              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-1">
                  <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm text-blue-600 hover:bg-blue-50" @click="verDetalle(dev)" />
                </div>
              </td>
            </tr>
            <tr v-if="filteredDevoluciones.length === 0">
              <td colspan="7" class="py-10 text-center italic text-gray-400">No hay registros de devoluciones.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-3 border-t border-gray-400 bg-gray-50/50">
        <Paginator :rows="10" :totalRecords="devoluciones.length" template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink" class="custom-paginator text-[10px]" />
      </div>
    </section>
    <!-- Modal para registar nueva devolucion -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4 font-dm-sans text-left">
        <div class="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
          <button @click="mostrarModal = false" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition"><i class="pi pi-times text-xl"></i></button>
          <div class="p-10">
            <div class="mb-6">
              <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">Nueva Devolución</h2>
              <p class="text-[14px] text-gray-400 font-medium">Revertir ingreso de productos por compra</p>
            </div>
            <form @submit.prevent="guardar" class="space-y-6">
              <div class="grid grid-cols-2 gap-x-8 gap-y-6">
                <!-- Buscar Compra -->
                <div class="col-span-1 space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Factura *</label>
                  <Dropdown v-model="nuevaDev.compra_id" :options="comprasMock" optionLabel="factura" optionValue="id" placeholder="Buscar compra..." class="w-full border border-gray-200 rounded-xl text-sm h-[54px] flex items-center font-bold" filter @change="onCompraChange" />
                </div>
                <!-- Buscar Producto dentro de esa compra -->
                <div class="col-span-1 space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Producto *</label>
                  <Dropdown
                    v-model="productoSeleccionadoId"
                    :options="productosFiltrados"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Buscar producto..."
                    class="w-full border border-gray-200 rounded-xl text-sm h-[54px] flex items-center font-bold"
                    filter
                    :disabled="!nuevaDev.compra_id"
                    @change="agregarItemADevolver"
                  />
                </div>
                <!-- Productos a Devolver -->
                <div class="col-span-2 space-y-4">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Productos a devolver</label>

                  <div class="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-500 min-h-[100px]">
                    <div v-for="(item, idx) in productosADevolver" :key="idx" class="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-300 shadow-sm">
                      <div class="flex flex-col flex-1">
                        <span class="text-sm font-black text-gray-800">{{ item.nombre }}</span>
                        <!-- Selector de Lote si el producto es perecedero -->
                        <div v-if="item.lotes" class="mt-2">
                           <Dropdown
                             v-model="item.lote_id"
                             :options="item.lotes"
                             optionLabel="codigo"
                             optionValue="id"
                             placeholder="Elegir lote..."
                             class="w-48 h-7 border border-blue-200 rounded-lg text-[6px] font-black bg-blue-50/50 flex items-center"
                           />
                        </div>
                      </div>
                      <div class="flex items-center gap-4">
                         <div class="flex flex-col items-end">
                           <InputNumber v-model="item.cantidad" :min="1" :max="item.lotes ? item.lotes.find(l => l.id === item.lote_id)?.max_lote : item.max" inputClass="w-20 border border-gray-300 rounded-lg p-2 text-center text-sm font-black outline-none focus:border-[#0a3622]" />
                         </div>
                         <button @click="quitarItem(idx)" type="button" class="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-100"><i class="pi pi-trash text-xs"></i></button>
                      </div>
                    </div>
                    <p v-if="productosADevolver.length === 0" class="text-center py-4 text-xs font-bold text-gray-400 uppercase">Seleccione una compra para ver productos</p>
                  </div>
                </div>
                <!-- Motivo -->
                <div class="col-span-2 space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Motivo de la Devolución *</label>
                  <Textarea v-model="nuevaDev.motivo" rows="2" class="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" placeholder="Explique por qué se devuelve la mercancía..." />
                </div>
              </div>
              <div class="flex items-center gap-4 mt-10">
                <button type="button" @click="mostrarModal = false" class="px-8 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm flex-1">Cancelar</button>
                <button type="submit" class="flex-[2] py-4 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest">Registrar Devolución</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Modal del detalle de la devolucion -->
    <Teleport to="body">
      <div v-if="mostrarDetalle" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] backdrop-blur-sm p-4 font-dm-sans text-left">
        <div class="bg-white rounded-[24px] w-full max-w-4xl shadow-2xl relative overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
          <!-- Encabezado del Modal -->
          <div class="p-8 pb-4 flex justify-between items-start">
            <div class="flex items-center gap-4">
              <i class="pi pi-file-pdf text-2xl text-green-600"></i>
              <h2 class="text-xl font-extrabold text-[#003d00]">Detalle de la Devolución</h2>
            </div>
            <button @click="mostrarDetalle = false" class="text-gray-400 hover:text-gray-700 transition">
              <i class="pi pi-times text-xl"></i>
            </button>
          </div>
          <!-- Contenido Scrolleable -->
          <div class="p-8 pt-4 overflow-y-auto custom-scrollbar flex-1">
            <p class="text-[11px] font-black text-[#0a3622] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <i class="pi pi-list"></i> Productos Devueltos
            </p>
            <div class="border border-gray-300 rounded-xl overflow-hidden shadow-sm">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-[#99bba7] text-[#000000] text-[10px] font-black uppercase tracking-wider">
                    <th class="py-3 px-5">Producto</th>
                    <th class="py-3 px-5 text-center">Cantidad</th>
                    <th class="py-3 px-5 text-center">Precio Unitario</th>
                    <th class="py-3 px-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="text-sm text-gray-700 divide-y divide-gray-300">
                  <tr v-for="(item, i) in detalleActual" :key="i" class="hover:bg-gray-50/50 transition font-bold text-gray-800">
                    <td class="py-3 px-5">
                      <div class="flex flex-col">
                        <span>{{ item.nombre }}</span>
                        <span v-if="item.lote" class="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase mt-1 w-fit flex items-center gap-1">
                          <i class="pi pi-tag text-[8px]"></i> Lote: {{ item.lote }}
                        </span>
                      </div>
                    </td>
                    <td class="py-3 px-5 text-center">{{ item.cantidad }}</td>
                    <td class="py-3 px-5 text-center">${{ item.precio.toFixed(2) }}</td>
                    <td class="py-3 px-5 text-right text-gray-800">${{ (item.cantidad * item.precio).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Botón de Cierre -->
          <div class="p-8 bg-gray-50/80 border-t border-gray-400 flex justify-end items-center">
            <button @click="mostrarDetalle = false" class="px-10 py-3 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-md transition-all text-sm uppercase tracking-widest">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import Swal from 'sweetalert2';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Dropdown from 'primevue/dropdown';
  import Button from 'primevue/button';
  import Calendar from 'primevue/calendar';
  import Textarea from 'primevue/textarea';
  import Paginator from 'primevue/paginator';

  // --- DATOS ESTÁTICOS ---
  const devoluciones = ref([
    { id: 1, factura_codigo: 'F-100234', proveedor_nombre: 'Distribuidora San José', cantidad_total: 10, monto_total: 45.50, fecha: '28/05/2026', motivo: 'Producto llegó con empaque dañado y vencimiento corto.' },
    { id: 2, factura_codigo: 'F-99201', proveedor_nombre: 'Librería El Centro', cantidad_total: 5, monto_total: 12.00, fecha: '30/05/2026', motivo: 'Mercancía no solicitada en la orden original.' }
  ]);

  const comprasMock = [
    { id: 501, factura: 'F-12345 (García Dist.)', proveedor: 'Distribuidora García' },
    { id: 502, factura: 'F-88221 (Papelería Int.)', proveedor: 'Papelería Internacional' }
  ];

  // Simulación de productos por compra con soporte de lotes
  const productosPorCompra = {
    501: [
      { id: 1, nombre: 'Cuaderno Espiral 100 Hojas', precio: 1.25, lotes: null, max: 10 },
      { id: 2, nombre: 'Aceite Oliva 1L', precio: 4.50, lotes: [
          { id: 10, codigo: 'L-OCT-24', max_lote: 5 },
          { id: 11, codigo: 'L-NOV-24', max_lote: 3 }
        ], max: 8 }
    ],
    502: [
      { id: 3, nombre: 'Lápiz Mongol #2', precio: 0.25, lotes: null, max: 100 },
      { id: 4, nombre: 'Borrador Pelikan', precio: 0.50, lotes: null, max: 50 }
    ]
  };

  const productosADevolver = ref([]);
  const productoSeleccionadoId = ref(null);

  const busqueda = ref('');
  const fechaInicio = ref(null);
  const fechaFin = ref(null);
  const mostrarModal = ref(false);
  const mostrarDetalle = ref(false);
  const nuevaDev = ref({ compra_id: null, motivo: '' });
  const detalleActual = ref([]);

  // --- LÓGICA ---
  const productosFiltrados = computed(() => {
    if(!nuevaDev.value.compra_id) return [];
    return productosPorCompra[nuevaDev.value.compra_id] || [];
  });

  const onCompraChange = () => {
    productosADevolver.value = [];
    productoSeleccionadoId.value = null;
  };

  const agregarItemADevolver = () => {
    if(!productoSeleccionadoId.value) return;

    const item = productosFiltrados.value.find(p => p.id === productoSeleccionadoId.value);
    if(item && !productosADevolver.value.some(p => p.id === item.id)){
      // Si tiene lotes, seleccionamos el primero por defecto
      const loteInicial = item.lotes ? item.lotes[0].id : null;
      productosADevolver.value.push({ ...item, cantidad: 1, lote_id: loteInicial });
    }

    // Limpiamos el selector para la próxima búsqueda
    productoSeleccionadoId.value = null;
  };
  const filteredDevoluciones = computed(() => {
    if(!busqueda.value) return devoluciones.value;
    const term = busqueda.value.toLowerCase();
    return devoluciones.value.filter(d => d.factura_codigo.toLowerCase().includes(term) || d.proveedor_nombre.toLowerCase().includes(term));
  });

  const totalDevoluciones = computed(() => {
    return devoluciones.value.reduce((sum, d) => sum + d.monto_total, 0).toFixed(2);
  });

  const abrirNuevo = () => {
    nuevaDev.value = { compra_id: null, motivo: '' };
    mostrarModal.value = true;
  };

  const quitarItem = (idx) => {
    productosADevolver.value.splice(idx, 1);
  };

  const guardar = () => {
    if(!nuevaDev.value.compra_id || !nuevaDev.value.motivo){
      return Swal.fire('Incompleto', 'Complete los campos obligatorios', 'warning');
    }
    Swal.fire({ icon: 'success', title: '¡Registrado!', text: 'Devolución de compra procesada con éxito.', showConfirmButton: false, timer: 1500 });
    mostrarModal.value = false;
  };

  const verDetalle = () => {
    // Simulando carga de detalle
    detalleActual.value = [
       { nombre: 'Producto Ejemplo A', cantidad: 6, precio: 10.00, lote: 'L-PRUEBA' },
       { nombre: 'Producto Ejemplo B', cantidad: 2, precio: 5.50, lote: null }
    ];
    mostrarDetalle.value = true;
  };

  const limpiarFechas = () => {
    fechaInicio.value = null;
    fechaFin.value = null;
  };
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar{
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb{
    background-color: #c6e5d3;
    border-radius: 10px;
  }
  :deep(.p-paginator){
    background: transparent;
    border: none;
    padding: 0;
  }
  :deep(.p-paginator-page.p-highlight){
    background: #0b580b !important;
    color: white !important;
    font-weight: bold;
  }
</style>
