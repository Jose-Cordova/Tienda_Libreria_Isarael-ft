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
          />
        </span>
        <!-- Filtros de fecha (Igual a Compras) -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <Calendar
            v-model="fechaInicio"
            placeholder="Desde"
            dateFormat="dd/mm/yy"
            showIcon
            :maxDate="fechaFin || null"
            class="p-calendar-sm flex-1 sm:w-32 custom-prime-calendar"
          />
          <Calendar
            v-model="fechaFin"
            dateFormat="dd/mm/yy"
            placeholder="Hasta"
            showIcon
            :minDate="fechaInicio || null"
            class="p-calendar-sm flex-1 sm:w-32 custom-prime-calendar"
          />
          <Button
            v-if="fechaInicio || fechaFin"
            icon="pi pi-filter-slash"
            class="p-button-rounded p-button-text p-button-sm !text-red-900 !w-9 !h-9 shrink-0"
            @click="limpiarFechas"
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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <!-- Sumatoria Perdidas -->
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
              <th class="py-3 px-5 text-center">Acción</th>
            </tr>
          </thead>
          <tbody class="text-gray-800 divide-y divide-gray-100">
            <tr v-for="item in filteredRegistros" :key="item.id" class="hover:bg-gray-50 transition text-sm">
              <td class="py-4 px-5 font-bold">
                <div class="flex flex-col">
                  <span>{{ item.producto_nombre }}</span>
                  <!-- Etiqueta de Lote Estilo Detalle Compra -->
                  <span v-if="item.lote_codigo" class="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase mt-1 w-fit shadow-sm">
                    LOTE: {{ item.lote_codigo }}
                  </span>
                </div>
              </td>
              <td class="py-4 px-5 text-center font-bold">{{ item.cantidad }}</td>
              <td class="py-4 px-5 text-center font-bold">${{ item.costo_unitario.toFixed(2) }}</td>
              <td class="py-4 px-5 text-center font-bold">${{ (item.cantidad * item.costo_unitario).toFixed(2) }}</td>
              <td class="py-4 px-5 font-bold text-gray-700">{{ item.fecha }}</td>
              <td class="py-4 px-5 font-bold text-gray-800 max-w-xs truncate" :title="item.descripcion">{{ item.descripcion }}</td>
              <td class="py-4 px-5">
                <div class="flex items-center justify-center">
                  <!-- Botón Devolver al Stock -->
                  <Button
                    icon="pi pi-undo"
                    v-tooltip.top="'Devolver al Stock'"
                    class="p-button-rounded p-button-text p-button-sm p-button-info"
                    @click="restaurarStock(item)"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="filteredRegistros.length === 0">
              <td colspan="7" class="py-10 text-center italic text-gray-400">No hay registros en este periodo.</td>
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
    <!-- MODAL: NUEVO / EDITAR -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4 font-dm-sans text-left">
        <div class="bg-white rounded-[24px] w-[95vw] max-w-xl shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
          <button @click="mostrarModal = false" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
            <i class="pi pi-times text-xl"></i>
          </button>
          <div class="p-10">
            <div class="mb-6">
              <h2 class="text-xl font-extrabold text-[#0a3622] mb-1">{{ esEdicion ? 'Editar Registro' : 'Nuevo Registro' }}</h2>
              <p class="text-[14px] text-gray-400 font-medium">Salida de mercancía por daño o pérdida</p>
            </div>
            <form @submit.prevent="guardar" class="space-y-6">
              <div class="grid grid-cols-2 gap-x-8 gap-y-6">
                <!-- Producto Dañado -->
                <div class="col-span-2 space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Producto Dañado *</label>
                  <Dropdown
                    v-model="formulario.producto_id"
                    :options="productosMock"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccione el producto..."
                    class="w-full border border-gray-200 rounded-xl text-sm h-[54px] flex items-center font-bold"
                    filter
                    @change="onProductoChange"
                  />
                </div>
                <!-- Lote (Solo si es perecedero) -->
                <div v-if="esPerecederoSeleccionado" class="col-span-1 space-y-2 text-left">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Lote *</label>
                  <Dropdown
                    v-model="formulario.lote_id"
                    :options="lotesDisponibles"
                    optionLabel="display"
                    optionValue="id"
                    placeholder="Elegir..."
                    class="w-full border border-gray-200 rounded-xl text-sm h-[43px] flex items-center font-bold"
                    filter
                  />
                </div>
                <div :class="esPerecederoSeleccionado ? 'col-span-1' : 'col-span-1'" class="space-y-2 text-left">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Cantidad *</label>
                  <InputNumber v-model="formulario.cantidad" :min="1" inputClass="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" placeholder="0" />
                </div>
                <div class="space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Costo Unitario ($)</label>
                  <InputNumber v-model="formulario.costo_unitario" mode="decimal" :minFractionDigits="2" inputClass="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold bg-gray-50/50" disabled />
                </div>
                <div class="col-span-2 space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Motivo *</label>
                  <Textarea v-model="formulario.descripcion" rows="3" class="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold focus:border-[#0a3622] outline-none" placeholder="Explique brevemente qué ocurrió..." />
                </div>
              </div>
              <div class="flex items-center gap-4 mt-10">
                <button type="button" @click="mostrarModal = false" class="px-8 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm flex-1">Cancelar</button>
                <button type="submit" class="flex-[2] py-4 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest">Guardar Registro</button>
              </div>
            </form>
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
  const registros = ref([
    { id: 1, producto_nombre: 'Cuaderno Espiral 100 Hojas', cantidad: 12, costo_unitario: 1.25, fecha: '28/05/2026', descripcion: 'Por caída durante abastecimiento', lote_codigo: null },
    { id: 2, producto_nombre: 'Aceite Oliva 1L', cantidad: 2, costo_unitario: 4.50, fecha: '29/05/2026', descripcion: 'Envase golpeado', lote_codigo: 'L-200-OCT' }
  ]);

  const productosMock = [
    { id: 101, nombre: 'Cuaderno Espiral 100 Hojas', costo: 1.25, perecedero: 'NORMAL' },
    { id: 102, nombre: 'Aceite Oliva 1L', costo: 4.50, perecedero: 'PERECEDERO' },
    { id: 103, nombre: 'Arroz San Pedro 1lb', costo: 0.85, perecedero: 'NORMAL' }
  ];

  const lotesDisponibles = [
    { id: 1, display: 'L-200-OCT', codigo: 'L-200-OCT' },
    { id: 2, display: 'L-300-NOV', codigo: 'L-300-NOV' }
  ];

  const paginacion = ref({
    pagina_actual: 1,
    filas_por_pagina: 10,
    total: 2
  });

  const busqueda = ref('');
  const fechaInicio = ref(null);
  const fechaFin = ref(null);
  const mostrarModal = ref(false);
  const esEdicion = ref(false);
  const formulario = ref({ id: null, producto_id: null, lote_id: null, cantidad: 1, costo_unitario: 0, descripcion: '' });

  // --- LÓGICA ---
  const cambiarPagina = (e) => {
    paginacion.value.pagina_actual = e.page + 1;
    paginacion.value.filas_por_pagina = e.rows;
  };

  const limpiarFechas = () => {
    fechaInicio.value = null;
    fechaFin.value = null;
  };

  const esPerecederoSeleccionado = computed(() => {
    const prod = productosMock.find(p => p.id === formulario.value.producto_id);
    return prod?.perecedero === 'PERECEDERO';
  });

  const onProductoChange = () => {
    const prod = productosMock.find(p => p.id === formulario.value.producto_id);
    if (prod) {
      formulario.value.costo_unitario = prod.costo;
      if (prod.perecedero !== 'PERECEDERO') formulario.value.lote_id = null;
    }
  };

  const filteredRegistros = computed(() => {
    if (!busqueda.value) return registros.value;
    const term = busqueda.value.toLowerCase();
    return registros.value.filter(r => r.producto_nombre.toLowerCase().includes(term));
  });

  const totalPerdidas = computed(() => {
    return registros.value.reduce((sum, r) => sum + (r.cantidad * r.costo_unitario), 0).toFixed(2);
  });

  const abrirNuevo = () => {
    esEdicion.value = false;
    formulario.value = { id: null, producto_id: null, lote_id: null, cantidad: 1, costo_unitario: 0, descripcion: '' };
    mostrarModal.value = true;
  };

  const guardar = () => {
    if (!formulario.value.producto_id || !formulario.value.descripcion) {
      return Swal.fire('Incompleto', 'Por favor complete los campos obligatorios', 'warning');
    }
    Swal.fire({ icon: 'success', title: '¡Guardado!', showConfirmButton: false, timer: 1500 });
    mostrarModal.value = false;
  };

  const restaurarStock = (item) => {
    Swal.fire({
      title: '¿Devolver al Stock?',
      text: `Se restaurarán ${item.cantidad} unidades de "${item.producto_nombre}" al inventario activo.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#008a00',
      cancelButtonColor: '#708090',
      confirmButtonText: 'Sí, restaurar stock',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Stock Restaurado',
          text: 'El inventario se ha actualizado correctamente.',
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  };
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
</style>
