<template>
  <main class="flex-1 bg-[#f4f7f6] p-3 sm:p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">
    <!-- Encabezado -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3 text-left w-full sm:w-auto">
        <i class="pi pi-box text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Registro de Productos Dañados</h1>
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <!-- Buscador -->
        <span class="relative flex-1 sm:flex-none">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
          <InputText
            v-model="busqueda"
            placeholder="Buscar..."
            class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-full sm:w-48 focus:border-green-600 transition-all"
            @input="buscarRegistros"
          />
        </span>
        <!-- Filtro por Estado -->
        <Dropdown
          v-model="filtroEstado"
          :options="opcionesEstado"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          class="p-dropdown-sm border-gray-500 rounded-lg text-sm text-[#0a3622] w-full sm:w-36 flex items-center font-bold"
          @change="cargarRegistros"
        />
        <!-- Filtros de fecha -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <Calendar
            v-model="fechaInicio"
            placeholder="Desde"
            dateFormat="yy-mm-dd"
            showIcon
            :maxDate="fechaFin || null"
            class="p-calendar-sm flex-1 sm:w-32 custom-prime-calendar"
            @date-select="cargarRegistros"
          />
          <Calendar
            v-model="fechaFin"
            dateFormat="yy-mm-dd"
            placeholder="Hasta"
            showIcon
            :minDate="fechaInicio || null"
            class="p-calendar-sm flex-1 sm:w-32 custom-prime-calendar"
            @date-select="cargarRegistros"
          />
          <Button
            v-if="fechaInicio || fechaFin || filtroEstado || busqueda"
            icon="pi pi-filter-slash"
            class="p-button-rounded p-button-text p-button-sm !text-red-900 !w-9 !h-9 shrink-0"
            @click="limpiarFiltros"
          />
        </div>
        <!-- Botón Registrar -->
        <Button
          label="Registrar"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all w-full sm:w-auto"
          @click="abrirNuevo"
        />
      </div>
    </section>

    <!-- Sumatorias -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group transition-all text-left border-[1px] border-[#d1333e] border-l-[10px] overflow-hidden">
        <div>
          <p class="text-[10px] font-black text-[#d1333e] uppercase tracking-[0.2em] mb-1">Sumatoria Pérdidas</p>
          <p class="text-2xl font-black text-[#d1333e] tracking-tighter">${{ totalPerdidas }}</p>
        </div>
      </div>
    </div>

    <!-- Tabla de los registros -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 text-left">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Producto</th>
              <th class="py-3 px-5 text-center">Cantidad</th>
              <th class="py-3 px-5 text-center">Costo Unit.</th>
              <th class="py-3 px-5 text-center">Total P.</th>
              <th class="py-3 px-5">Fecha</th>
              <th class="py-3 px-5">Descripción</th>
              <th class="py-3 px-5 text-center">Estado Reclamación</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-800 divide-y divide-gray-100">
            <tr v-for="item in registros" :key="item.id" class="hover:bg-gray-50 transition text-sm">
              <td class="py-4 px-5 font-bold">
                <div class="flex flex-col">
                  <span>{{ item.producto?.nombre }}</span>
                  <span v-if="item.lote" class="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase mt-1 w-fit shadow-sm">
                    LOTE: {{ item.lote?.codigo_lote }}
                  </span>
                </div>
              </td>
              <td class="py-4 px-5 text-center font-bold">{{ item.cantidad }}</td>
              <td class="py-4 px-5 text-center font-bold">${{ parseFloat(item.costo_unitario).toFixed(2) }}</td>
              <td class="py-4 px-5 text-center font-bold">${{ parseFloat(item.total_perdida).toFixed(2) }}</td>
              <td class="py-4 px-5 font-bold text-gray-700">{{ formatearFecha(item.fecha) }}</td>
              <td class="py-4 px-5 font-bold text-gray-800 max-w-xs truncate" :title="item.descripcion">{{ item.descripcion }}</td>
              <td class="py-4 px-5 text-center">
                <span :class="obtenerBadgeClase(item.estado_reclamacion)" class="text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  {{ item.estado_reclamacion }}
                </span>
              </td>
              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-1">
                  <!-- Acciones solo si está PENDIENTE -->
                  <template v-if="item.estado_reclamacion === 'PENDIENTE'">
                    <Button
                      icon="pi pi-check"
                      v-tooltip.top="'Aceptar reemplazo'"
                      class="p-button-rounded p-button-text p-button-sm p-button-success !text-green-600"
                      @click="procesarAceptar(item)"
                    />
                    <Button
                      icon="pi pi-times"
                      v-tooltip.top="'Rechazar reclamación'"
                      class="p-button-rounded p-button-text p-button-sm p-button-danger !text-red-600"
                      @click="procesarRechazar(item)"
                    />
                    <Button
                      icon="pi pi-ban"
                      v-tooltip.top="'Anular registro (Revertir)'"
                      class="p-button-rounded p-button-text p-button-sm p-button-warning !text-amber-600"
                      @click="procesarAnular(item)"
                    />
                  </template>
                  <span v-else class="text-xs text-gray-400 italic">Sin acciones</span>
                </div>
              </td>
            </tr>
            <tr v-if="registros.length === 0">
              <td colspan="8" class="py-10 text-center italic text-gray-400">No hay registros de productos dañados.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Paginación -->
      <div class="p-3 border-t border-gray-400 bg-gray-50/50">
        <Paginator
          :rows="paginacion.filas_por_pagina"
          :totalRecords="paginacion.total"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          :first="(paginacion.pagina_actual - 1) * paginacion.filas_por_pagina"
          @page="cambiarPagina"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          class="custom-paginator text-[10px]"
        />
      </div>
    </section>

    <!-- MODAL: NUEVO REGISTRO -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4 font-dm-sans text-left">
        <div class="bg-white rounded-[24px] w-[95vw] max-w-xl shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
          <button @click="mostrarModal = false" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
            <i class="pi pi-times text-xl"></i>
          </button>
          <div class="p-10">
            <div class="mb-6">
              <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">Nuevo Registro</h2>
              <p class="text-[14px] text-gray-400 font-medium">Salida de mercancía por daño o pérdida</p>
            </div>
            <form @submit.prevent="guardar" class="space-y-6">
              <div class="grid grid-cols-2 gap-x-8 gap-y-6">
                <!-- Producto Dañado -->
                <div class="col-span-2 space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Producto Dañado *</label>
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
                <!-- Lote (Solo si es perecedero) -->
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
                <!-- Cantidad -->
                <div :class="esPerecederoSeleccionado ? 'col-span-1' : 'col-span-1'" class="space-y-2 text-left">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Cantidad *</label>
                  <InputNumber v-model="formulario.cantidad" :min="1" inputClass="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" placeholder="0" />
                </div>
                <!-- Costo Unitario -->
                <div class="space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Costo Unitario ($)</label>
                  <InputNumber v-model="formulario.costo_unitario" mode="decimal" :minFractionDigits="2" inputClass="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold bg-gray-50/50" disabled />
                </div>
                <!-- Motivo/Descripción -->
                <div class="col-span-2 space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Motivo *</label>
                  <Textarea v-model="formulario.descripcion" rows="3" class="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" placeholder="Explique brevemente qué ocurrió..." />
                </div>
              </div>
              <div class="flex items-center gap-4 mt-10">
                <button type="button" @click="mostrarModal = false" class="px-8 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm flex-1">Cancelar</button>
                <button type="submit" class="flex-[2] py-4 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest" :disabled="guardando">
                  {{ guardando ? 'Guardando...' : 'Guardar Registro' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: ACEPTAR REEMPLAZO PERECEDERO -->
    <Teleport to="body">
      <div v-if="mostrarModalAceptarPerecedero" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] backdrop-blur-sm p-4 font-dm-sans text-left">
        <div class="bg-white rounded-[24px] w-[95vw] max-w-md shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#008a00]"></div>
          <button @click="mostrarModalAceptarPerecedero = false" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
            <i class="pi pi-times text-xl"></i>
          </button>
          <div class="p-8">
            <div class="mb-6">
              <h2 class="text-lg font-extrabold text-[#008a00] mb-1">Reemplazo de Producto Perecedero</h2>
              <p class="text-sm text-gray-400 font-medium">Por favor ingrese los datos del nuevo lote reemplazado.</p>
            </div>
            <form @submit.prevent="aceptarReemplazoPerecederoConfirmado" class="space-y-4">
              <div class="space-y-2">
                <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Código de Lote *</label>
                <InputText v-model="formAceptarPerecedero.codigo_lote" class="w-full border border-gray-200 rounded-xl p-3 text-sm font-bold focus:border-[#008a00] outline-none" placeholder="Ej. LOTE-123" />
              </div>
              <div class="space-y-2">
                <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Fecha de Vencimiento *</label>
                <Calendar v-model="formAceptarPerecedero.fecha_vencimiento" dateFormat="yy-mm-dd" showIcon class="w-full custom-prime-calendar" />
              </div>
              <div class="flex gap-3 mt-6">
                <button type="button" @click="mostrarModalAceptarPerecedero = false" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition">Cancelar</button>
                <button type="submit" class="flex-1 py-3 bg-[#008a00] hover:bg-[#007000] text-white font-bold rounded-xl text-sm transition">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import Swal from 'sweetalert2';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Dropdown from 'primevue/dropdown';
  import Button from 'primevue/button';
  import Calendar from 'primevue/calendar';
  import Textarea from 'primevue/textarea';
  import Paginator from 'primevue/paginator';

  // Servicios
  import productoDaniadoService from '@/services/productoDaniadoService';
  import productoService from '@/services/productoService';

  // --- VARIABLES DE ESTADO ---
  const registros = ref([]);
  const productosDisponibles = ref([]);
  const lotesDisponibles = ref([]);

  const paginacion = ref({
    pagina_actual: 1,
    filas_por_pagina: 10,
    total: 0
  });

  const busqueda = ref('');
  const filtroEstado = ref(null);
  const fechaInicio = ref(null);
  const fechaFin = ref(null);

  const optionsStateRaw = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Aceptado', value: 'ACEPTADO' },
    { label: 'Rechazado', value: 'RECHAZADO' },
    { label: 'Anulado', value: 'ANULADO' }
  ];
  const opcionesEstado = ref(optionsStateRaw);

  const mostrarModal = ref(false);
  const guardando = ref(false);
  const cargandoProductos = ref(false);

  const formulario = ref({
    producto_id: null,
    lote_id: null,
    cantidad: 1,
    costo_unitario: 0,
    descripcion: ''
  });

  // Modal para reemplazo perecedero
  const mostrarModalAceptarPerecedero = ref(false);
  const itemSeleccionadoAceptar = ref(null);
  const formAceptarPerecedero = ref({
    codigo_lote: '',
    fecha_vencimiento: null
  });

  // --- MÉTODOS DE SERVICIO ---
  const cargarRegistros = async () => {
    try {
      const params = {
        buscar: busqueda.value || undefined,
        estado_reclamacion: filtroEstado.value || undefined,
        fecha_inicio: fechaInicio.value ? formatearFechaParaEnvio(fechaInicio.value) : undefined,
        fecha_fin: fechaFin.value ? formatearFechaParaEnvio(fechaFin.value) : undefined,
        pagina: paginacion.value.pagina_actual,
        per_page: paginacion.value.filas_por_pagina
      };

      const response = await productoDaniadoService.getRegistros(params);
      registros.value = response.data.data;
      paginacion.value.total = response.data.total;
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los registros de productos dañados.', 'error');
    }
  };

  const cargarProductos = async () => {
    try {
      cargandoProductos.value = true;
      const response = await productoService.getProductos({ estado: 'ACTIVO', per_page: 1000 });
      productosDisponibles.value = response.data.data;
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
    } finally {
      cargandoProductos.value = false;
    }
  };

  // --- EVENTOS ---
  const buscarRegistros = () => {
    paginacion.value.pagina_actual = 1;
    cargarRegistros();
  };

  const cambiarPagina = (e) => {
    paginacion.value.pagina_actual = e.page + 1;
    paginacion.value.filas_por_pagina = e.rows;
    cargarRegistros();
  };

  const limpiarFiltros = () => {
    busqueda.value = '';
    filtroEstado.value = null;
    fechaInicio.value = null;
    fechaFin.value = null;
    paginacion.value.pagina_actual = 1;
    cargarRegistros();
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
        // Filtrar y asignar lotes activos del producto
        lotesDisponibles.value = prod.lotes || [];
        formulario.value.lote_id = null;
      } else {
        lotesDisponibles.value = [];
        formulario.value.lote_id = null;
      }
    }
  };

  const totalPerdidas = computed(() => {
    return registros.value.reduce((sum, r) => sum + (parseFloat(r.cantidad) * parseFloat(r.costo_unitario)), 0).toFixed(2);
  });

  const abrirNuevo = () => {
    formulario.value = {
      producto_id: null,
      lote_id: null,
      cantidad: 1,
      costo_unitario: 0,
      descripcion: ''
    };
    lotesDisponibles.value = [];
    mostrarModal.value = true;
    cargarProductos();
  };

  const guardar = async () => {
    if (!formulario.value.producto_id || !formulario.value.descripcion) {
      return Swal.fire('Incompleto', 'Por favor complete los campos obligatorios', 'warning');
    }

    try {
      guardando.value = true;
      const data = {
        producto_id: formulario.value.producto_id,
        cantidad: formulario.value.cantidad,
        descripcion: formulario.value.descripcion,
        lote_id: esPerecederoSeleccionado.value ? formulario.value.lote_id : null
      };

      await productoDaniadoService.createRegistro(data);
      Swal.fire({ icon: 'success', title: '¡Guardado!', showConfirmButton: false, timer: 1500 });
      mostrarModal.value = false;
      cargarRegistros();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error al guardar el registro.';
      Swal.fire('Error', msg, 'error');
    } finally {
      guardando.value = false;
    }
  };

  // --- PROCESAMIENTO DE ACCIONES ---

  // ANULAR
  const procesarAnular = (item) => {
    Swal.fire({
      title: '¿Anular Registro?',
      text: `Se cancelará este registro de daño y se devolverán ${item.cantidad} unidades de "${item.producto?.nombre}" al stock.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff9900',
      cancelButtonColor: '#708090',
      confirmButtonText: 'Sí, anular registro',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await productoDaniadoService.anular(item.id);
          Swal.fire('Anulado', 'El registro se ha anulado y el stock se ha restaurado.', 'success');
          cargarRegistros();
        } catch (error) {
          console.error(error);
          Swal.fire('Error', error.response?.data?.message || 'Error al anular el registro.', 'error');
        }
      }
    });
  };

  // RECHAZAR
  const procesarRechazar = (item) => {
    Swal.fire({
      title: '¿Rechazar Reclamación?',
      text: `Se marcará este registro de daño como reclamación rechazada. Los productos se declararán como pérdida total definitiva.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#708090',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await productoDaniadoService.rechazar(item.id);
          Swal.fire('Rechazado', 'La reclamación ha sido marcada como rechazada.', 'success');
          cargarRegistros();
        } catch (error) {
          console.error(error);
          Swal.fire('Error', error.response?.data?.message || 'Error al rechazar la reclamación.', 'error');
        }
      }
    });
  };

  // ACEPTAR
  const procesarAceptar = (item) => {
    if (item.producto?.perecedero === 'PERECEDERO') {
      // Si es perecedero, abrir modal para registrar nueva fecha de vencimiento y lote
      itemSeleccionadoAceptar.value = item;
      formAceptarPerecedero.value = {
        codigo_lote: '',
        fecha_vencimiento: null
      };
      mostrarModalAceptarPerecedero.value = true;
    } else {
      // Si no es perecedero, aceptar directamente
      Swal.fire({
        title: '¿Aceptar Reemplazo?',
        text: `El proveedor reemplazó los productos. Se añadirán ${item.cantidad} unidades de "${item.producto?.nombre}" al stock activo.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#008a00',
        cancelButtonColor: '#708090',
        confirmButtonText: 'Sí, aceptar reemplazo',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await productoDaniadoService.aceptar(item.id, {});
            Swal.fire('Aceptado', 'El stock ha sido actualizado.', 'success');
            cargarRegistros();
          } catch (error) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'Error al procesar el reemplazo.', 'error');
          }
        }
      });
    }
  };

  const aceptarReemplazoPerecederoConfirmado = async () => {
    if (!formAceptarPerecedero.value.codigo_lote || !formAceptarPerecedero.value.fecha_vencimiento) {
      return Swal.fire('Incompleto', 'Por favor complete todos los datos del lote reemplazado.', 'warning');
    }

    try {
      const data = {
        codigo_lote: formAceptarPerecedero.value.codigo_lote,
        fecha_vencimiento: formatearFechaParaEnvio(formAceptarPerecedero.value.fecha_vencimiento)
      };

      await productoDaniadoService.aceptar(itemSeleccionadoAceptar.value.id, data);
      Swal.fire('Aceptado', 'El nuevo lote y stock han sido registrados correctamente.', 'success');
      mostrarModalAceptarPerecedero.value = false;
      cargarRegistros();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Error al procesar el reemplazo del producto perecedero.', 'error');
    }
  };

  // --- AUXILIARES ---
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatearFechaParaEnvio = (dateObj) => {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    return d.toISOString().split('T')[0];
  };

  const obtenerBadgeClase = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'ACEPTADO':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'ANULADO':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

  onMounted(() => {
    cargarRegistros();
  });
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #c6e5d3;
    border-radius: 10px;
  }
  :deep(.p-paginator) {
    background: transparent;
    border: none;
    padding: 0;
  }
  :deep(.p-paginator-page.p-highlight) {
    background: #0b580b !important;
    color: white !important;
    font-weight: bold;
  }
  :deep(.custom-calendar .p-inputtext) {
    border-radius: 8px;
    font-size: 0.75rem;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
  }
  :deep(.custom-prime-calendar) {
    width: 100%;
  }
  :deep(.custom-prime-calendar .p-inputtext) {
    border-radius: 12px;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    font-weight: bold;
    font-size: 0.875rem;
  }
</style>
