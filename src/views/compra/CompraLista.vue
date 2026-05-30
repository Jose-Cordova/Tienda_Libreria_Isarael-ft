<template>
  <div>
    <!-- SECCIÓN: Encabezado -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3">
          <i class="pi pi-shopping-bag text-xl text-[#068a4e]"></i>
        <div>
          <h1 class="text-lg font-extrabold text-[#0a3622]">Historial de Compras</h1>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <!-- Buscador -->
        <span class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10"></i>
          <InputText
            v-model="store.textoBusqueda"
            placeholder="Buscar factura..."
            class="p-inputtext-sm !pl-10 border-gray-200 rounded-xl text-sm text-[#0a3622] w-56 focus:border-green-600 shadow-sm"
            @input="alBuscar"
          />
        </span>

        <!-- Filtro por Estado -->
        <div class="relative bg-white border border-gray-200 rounded-xl px-2 h-[38px] flex items-center shadow-sm focus-within:border-green-600 transition-all">
          <select
            v-model="store.filtros.estado"
            @change="store.obtenerCompras(1)"
            class="bg-transparent border-none pr-6 text-[12px] font-black text-[#0a3622] focus:ring-0 cursor-pointer uppercase appearance-none"
          >
            <option value="">TODOS LOS ESTADOS</option>
            <option value="REGISTRADA">REGISTRADAS</option>
            <option value="ANULADA">ANULADAS</option>
          </select>
          <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[9px]"></i>
        </div>
        <!-- Filtros de fecha -->
          <div class="flex items-center gap-2">
            <Calendar
              v-model="store.filtros.fecha_inicio"
              placeholder="Desde"
              dateFormat="dd/mm/yy"
              showIcon
              :maxDate="store.filtros.fecha_fin || null"
              class="p-calendar-sm w-32 custom-prime-calendar"
              @date-select="store.obtenerCompras(1)"
            />
            <Calendar
              v-model="store.filtros.fecha_fin"
              dateFormat="dd/mm/yy"
              placeholder="Hasta"
              showIcon
              :minDate="store.filtros.fecha_inicio || null"
              class="p-calendar-sm w-32 custom-prime-calendar"
              @date-select="store.obtenerCompras(1)"
            />
            <Button
              v-if="store.filtros.fecha_inicio || store.filtros.fecha_fin"
              icon="pi pi-filter-slash"
              v-tooltip.top="'Limpiar fechas'"
              class="p-button-rounded p-button-text p-button-sm !text-red-900 !w-9 !h-9"
              @click="limpiarFechas"
            />
         </div>
        <Button
          label="Nueva Compra"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#0a3622] hover:!bg-[#115033] text-white border-none shadow-sm transition-all duration-300 px-5 h-[38px] rounded-xl"
          @click="$emit('nueva-compra')"
        />
      </div>
    </section>

    <!-- SECCIÓN: Tabla -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Fecha</th>
              <th class="py-3 px-5">Proveedor</th>
              <th class="py-3 px-5">N° de Control</th>
              <th class="py-3 px-5">Código de Generación</th>
              <th class="py-3 px-5 text-right">Total</th>
              <th class="py-3 px-5 text-center">Estado</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 divide-y divide-gray-100">
            <tr v-for="compra in store.compras" :key="compra.id" class="hover:bg-gray-50 transition text-sm">
              <td class="py-4 px-5 font-bold text-gray-800">{{ formateraFecha(compra.fecha_registro) }}</td>
              <td class="py-4 px-5 font-bold text-gray-800">{{ compra.proveedor?.nombre || '—' }}</td>
              <td class="py-4 px-5 font-bold text-gray-800">{{ compra.numero_factura }}</td>
              <td class="py-4 px-5 font-bold text-gray-800">{{ compra.codigo_factura }}</td>
              <td class="py-4 px-5 text-right font-bold text-gray-800">${{ compra.total }}</td>
              <td class="py-4 px-5 text-center">
                <span :class="compra.estado === 'REGISTRADA' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'" class="px-3 py-1 rounded-full text-[10px] font-black border uppercase">
                  {{ compra.estado }}
                </span>
              </td>
              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-1">
                  <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm text-blue-600 hover:bg-blue-50" @click="verDetalle(compra)" />
                  <Button
                    v-if="compra.estado === 'REGISTRADA'"
                    icon="pi pi-ban"
                    class="p-button-rounded p-button-text p-button-sm btn-anular"
                    @click="abrirModalAnular(compra)"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="store.compras.length === 0">
              <td colspan="6" class="py-12 text-center italic text-gray-400">No se encontraron registros de compra.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-3 border-t border-gray-200 bg-gray-50/50">
        <Paginator
          :rows="store.paginacion.filas_por_pagina"
          :totalRecords="store.paginacion.total"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          :first="(store.paginacion.pagina_actual - 1) * store.paginacion.filas_por_pagina"
          @page="alCambiarPagina"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          class="custom-paginator text-[10px]"
        />
      </div>
    </section>

    <!-- MODAL: Anulación -->
    <div v-if="mostrarAnular" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4 text-center">
      <div class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#044e04]"></div>
        <div class="p-10">
          <div class="flex justify-center mb-6 text-red-500"><i class="pi pi-ban text-9xl"></i></div>
          <h2 class="text-xl font-extrabold text-gray-800 mb-2">¿Anular esta compra?</h2>
          <p class="text-1xl text-gray-500 mb-8 font-medium">Se anulará la factura "{{ compraAnular?.numero_factura }}".</p>
          <div class="flex items-center gap-3">
            <button @click="mostrarAnular = false" class="flex-1 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#e2eee2] hover:bg-white text-sm">Cancelar</button>
            <button @click="confirmarAnular" class="flex-1 py-3 bg-[#d1333e] hover:bg-[#a82430] text-white font-bold rounded-xl shadow-md text-sm">Confirmar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Detalle de Compra -->
    <CompraDetalle
      :visible="mostrarDetalle"
      :compra="store.compraDetalle"
      @cerrar="mostrarDetalle = false"
    />
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useCompraStore } from '@/stores/compraStore';
  import Swal from 'sweetalert2';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';
  import Paginator from 'primevue/paginator';
  import Calendar from 'primevue/calendar';
  import CompraDetalle from './CompraDetalle.vue';

  const store = useCompraStore()
  const mostrarAnular = ref(false)
  const compraAnular = ref(null)
  const mostrarDetalle = ref(false)

  onMounted(() => {
    store.obtenerCompras(1)
  })

  //Funcion para resetear las fechas
  const limpiarFechas = () => {
    store.filtros.fecha_inicio = null
    store.filtros.fecha_fin = null
    store.obtenerCompras(1)
  }
  //Listado de las compras
  const alCambiarPagina = (e) => store.obtenerCompras(e.page + 1, e.rows)

  let timer = null
  const alBuscar = () => {
    clearTimeout(timer)
    timer = setTimeout(() => store.obtenerCompras(1, store.paginacion.filas_por_pagina))
  }

  const formateraFecha = (fecha) => {
    if(!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const verDetalle = async (compra) => {
    try {
      await store.obtenerDetalleCompra(compra.id)
      mostrarDetalle.value = true
    } catch (error) {
      Swal.fire('Error', 'No se pudo cargar el detalle de la compra', error)
    }
  }

  const abrirModalAnular = (compra) => {
    compraAnular.value = compra
    mostrarAnular.value = true
  }

  const confirmarAnular = async() => {
    try{
      await store.anularCompra(compraAnular.value.id)
      Swal.fire({
        icon: 'success',
        title: '¡Hecho!',
        text: 'La compra ha sido anulada.',
        showConfirmButton: false,
        timer: 2500
        })
      mostrarAnular.value = false
    }catch(err){
      mostrarAnular.value = false
      const mgs = err.response?.data?.message || 'Error al anular la compra.'
      Swal.fire({
        title: 'Error',
        text: mgs,
        icon: 'error',
        confirmButtonColor: '#0a3622'
      })
    }
  }
</script>

<style scoped>
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
  .btn-anular {
    color: #dc2626 !important;
  }
  .btn-anular:hover {
    background-color: #fef2f2 !important;
    border-color: transparent !important;
  }
  .btn-anular:focus,
  .btn-anular:focus-visible {
    outline: none !important;
    box-shadow: 0 0 0 2px #fecaca !important;
  }

</style>
