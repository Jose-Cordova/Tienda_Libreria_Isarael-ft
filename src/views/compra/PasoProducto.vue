<template>
  <div class="w-full font-dm-sans px-0 sm:px-4 pb-24 space-y-6">
    <!-- Buscar -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-2xl border-y sm:border border-gray-200 shadow-md relative overflow-visible text-left">
      <div class="flex-1 w-full sm:min-w-[250px] px-4 sm:px-0">
        <div class="relative group">
          <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-[#0a3622] z-10 text-xs font-bold"></i>
          <InputText
            ref="inputBusqueda"
            v-model="busqueda"
            @input="buscarProducto"
            placeholder="Buscar producto..."
            class="w-full !pl-10 border-gray-300 rounded-xl p-3 text-xs font-bold text-[#0a3622] focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/10 outline-none shadow-sm bg-white transition-all"
          />
          <!-- Dropdown de Resultados -->
          <div v-if="mostrarResultados && resultados.length > 0" class="absolute top-full left-0 w-full bg-white mt-2 border border-gray-100 rounded-xl shadow-2xl z-[100] overflow-hidden border-t-4 border-t-[#0a3622] animate-fade-up">
            <div
              v-for="prod in resultados"
              :key="prod.id"
              @click="agregarProducto(prod)"
              class="p-4 hover:bg-green-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 transition-all text-left"
            >
              <div>
                <p class="font-black text-[#0a3622] text-xs tracking-tight">{{ prod.nombre }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[12px] text-gray-800 font-bold bg-gray-100 px-1.5 py-0.5 rounded">Stock: {{ prod.stock }}</span>
                </div>
              </div>
              <i class="pi pi-plus-circle text-[#0a3622] text-sm opacity-50 group-hover:opacity-100 transition-opacity"></i>
            </div>
          </div>
        </div>
      </div>
      <Button
        label="Producto nuevo"
        icon="pi pi-plus"
        class="p-button-sm !bg-[#0a3622] hover:!bg-[#115033] border-none rounded-xl px-6 py-2.5 font-black shadow-lg transition-all text-white text-[10px] tracking-widest w-full sm:w-auto justify-center"
        @click="prepararNuevoProducto"
      />
    </section>
    <!-- Listados de productos agregador -->
    <section class="space-y-6">
      <div v-if="productosAgregados.length === 0" class="bg-white/50 border-2 border-dashed border-gray-300 rounded-[32px] p-20 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-inner">
           <i class="pi pi-shopping-cart text-3xl"></i>
        </div>
        <p class="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Lista de compra vacía</p>
      </div>

      <div v-for="(item, index) in productosAgregados" :key="item.producto_id" class="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden text-left relative transition-all hover:shadow-lg">
        <!-- Cabecera de la Tarjeta -->
        <div class="flex items-center justify-between bg-[#0a3622] px-3 sm:px-6 py-3 border-b border-[#0a3622] gap-2">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <span class="w-7 h-7 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-inner shrink-0">{{ index + 1 }}</span>
            <span class="font-black text-white text-[10px] sm:text-sm uppercase tracking-wide truncate">{{ item.nombre }}</span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span v-if="item.perecedero === 'PERECEDERO'" class="bg-green-400/20 text-green-500 text-[10px] sm:text-[10px] px-2 py-0.5 rounded font-black uppercase border border-green-400/30 shadow-sm">Perecedero</span>
            <button @click="quitarProducto(index)" class="w-8 h-8 flex items-center justify-center bg-white/10 text-white/70 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-white/10 group">
              <i class="pi pi-trash text-xs group-hover:scale-110 transition-transform"></i>
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-[#fcfdfc]">
          <!-- Barra informativa de contexto: stock y costo promedio anterior -->
          <div v-if="item.producto_id" class="flex flex-wrap gap-x-5 gap-y-2 text-[10px] sm:text-[11px] text-gray-800 font-bold ml-1">
            <span>STOCK ACTUAL EN TIENDA: <b class="text-gray-800 bg-gray-100 px-2 py-0.5 rounded shadow-sm">{{ item.stock_inventario_previo }} u.</b></span>
            <span>COSTO PROMEDIO ANTERIOR: <b class="text-gray-800 bg-gray-100 px-2 py-0.5 rounded shadow-sm">${{ (item.costo_promedio_previo || 0).toFixed(2) }}</b></span>
          </div>

          <!-- Grid de Inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Costo Unitario ($)</label>
              <div class="relative group">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0a3622] font-black text-xs z-10">$</span>
                <input
                  type="text"
                  v-model="item.precio_unitario"
                  @input="recalcular(index)"
                  @keydown="soloDecimalPositivo"
                  class="w-full border border-gray-400 rounded-xl p-3 pl-8 text-sm font-bold text-gray-800 outline-none focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/5 bg-white shadow-sm transition-all"
                />
              </div>
            </div>
            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Margen Detalle (%)</label>
              <div class="relative group">
                <input
                  type="number"
                  v-model="item.margen_detalle"
                  @input="recalcular(index)"
                  @keydown="soloEnteroPositivo"
                  class="w-full border border-gray-400 rounded-xl p-3 text-sm font-bold text-gray-800 outline-none focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/5 bg-white shadow-sm transition-all"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">%</span>
              </div>
            </div>
            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Margen Mayor (%)</label>
              <div class="relative group">
                <input
                  type="number"
                  v-model="item.margen_mayor"
                  @input="recalcular(index)"
                  @keydown="soloEnteroPositivo"
                  class="w-full border border-gray-400 rounded-xl p-3 text-sm font-bold text-gray-800 outline-none focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/5 bg-white shadow-sm transition-all"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">%</span>
              </div>
            </div>
            <!-- Columna 4: Factor con Checkbox integrado -->
            <div class="space-y-2 text-left">
              <div class="flex items-center gap-2 mb-1">
                <label class="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] ml-1">Factor Conversión</label>
                <Checkbox v-model="item.usar_factor" :binary="true" @change="recalcular(index)" :inputId="'chkFactor'+index" class="scale-90" />
              </div>
              <div v-if="item.usar_factor" class="relative group animate-fade-in">
                <i class="pi pi-box absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 text-xs z-10 font-bold"></i>
                <InputNumber
                  v-model="item.factor_conversion"
                  :min="1"
                  @update:modelValue="recalcular(index)"
                  inputClass="w-full border border-gray-400 rounded-xl p-3 !pl-11 text-sm font-bold text-gray-800 outline-none focus:border-blue-500 bg-blue-50/20 shadow-sm transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Barra de Costos y Precios Sugeridos (Desglosada con CPP) -->
          <div class="bg-emerald-50/80 p-4 sm:p-5 rounded-2xl border border-emerald-300 shadow-inner space-y-3">

            <!-- Fila superior: Costo neto y Nuevo CPP -->
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10px] text-emerald-800 font-bold border-b border-emerald-200/70 pb-2.5">
              <span>COSTO NETO DE ESTA FACTURA:
                <b class="text-emerald-950 text-[11px] font-black ml-1">${{ ((parseFloat(item.precio_unitario) || 0) / (parseInt(item.factor_conversion) || 1)).toFixed(2) }} / u.</b>
              </span>
              <span class="hidden sm:inline text-emerald-300">|</span>
              <span>NUEVO COSTO PROMEDIO (CPP):
                <b class="text-emerald-950 text-[11px] font-black ml-1">${{ obtenerCppSimuladoText(index) }} / u.</b>
              </span>
            </div>

            <!-- Fila inferior: Precios de venta sugeridos -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 text-[11px] font-bold text-emerald-900">
              <span class="flex items-center gap-2 flex-wrap">
                VENTA AL DETALLE:
                <b class="text-emerald-950 text-sm font-black">${{ item.precio_detalle_sugerido }}</b>
              </span>
              <div class="w-1 h-4 bg-emerald-200 rounded-full hidden sm:block"></div>
              <span class="flex items-center gap-2 flex-wrap">
                VENTA AL MAYOR:
                <b class="text-emerald-950 text-sm font-black">${{ item.precio_mayor_sugerido }}</b>
              </span>
            </div>
          </div>

          <!-- SECCIÓN DE LOTES / CANTIDAD -->
          <div class="border-t border-gray-400 pt-6 sm:pt-8 text-left">
            <p class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
              <i class="pi pi-box text-xs"></i> {{ item.perecedero === 'PERECEDERO' ? 'REGISTRO DE LOTES' : 'CANTIDAD DE INGRESO' }}
            </p>

            <div v-if="item.perecedero === 'PERECEDERO'" class="space-y-4">
              <div v-for="(lote, lIdx) in item.lotes" :key="lIdx" class="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center bg-white p-4 rounded-2xl border border-gray-400 shadow-sm text-left relative">
                <div class="w-full sm:col-span-5 space-y-1.5 pr-10 sm:pr-0">
                  <!-- En desktop: label + selector en la misma fila. En móvil: apilados -->
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <span class="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1 shrink-0">Código Lote</span>

                    <!-- Selector rápido de lotes activos existentes -->
                    <select
                      v-if="item.lotes_existentes && item.lotes_existentes.length > 0"
                      @change="seleccionarLoteExistente($event, index, lIdx)"
                      class="w-full sm:w-auto sm:max-w-[200px] text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-blue-100 transition-colors truncate"
                    >
                      <option value="">-- Copiar Lote --</option>
                      <option
                        v-for="lex in item.lotes_existentes"
                        :key="lex.id"
                        :value="JSON.stringify(lex)"
                      >
                        {{ lex.codigo_lote }} ({{ (lex.fecha_vencimiento || '').slice(0, 10) }})
                      </option>
                    </select>
                  </div>

                  <input
                    v-model="lote.codigo_lote"
                    @input="lote.codigo_lote = lote.codigo_lote.toUpperCase()"
                    class="w-full border border-gray-400 rounded-lg p-2.5 text-[11px] font-black text-blue-700 uppercase outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white shadow-sm"
                    placeholder="EJ: L-100"
                  />
                </div>
                <div class="w-full sm:col-span-4 space-y-1.5">
                  <span class="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1">Vencimiento</span>
                  <input type="date" :min="fechaMinimaLote" v-model="lote.fecha_vencimiento" class="w-full border border-gray-400 rounded-lg p-2.5 text-[11px] font-black text-gray-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white shadow-sm" />
                </div>
                <div class="w-full sm:col-span-2 space-y-1.5">
                  <span class="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1">Cantidad</span>
                  <input
                    type="number"
                    v-model="lote.cantidad"
                    @keydown="soloEnteroPositivo"
                    @input="recalcular(index)"
                    class="w-full border border-gray-400 rounded-lg p-2.5 text-[11px] font-black text-center text-[#0a3622] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white shadow-sm"
                  />
                </div>
                <div class="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 sm:col-span-1 flex items-center justify-end sm:pt-5">
                  <button
                    @click="quitarLote(index, lIdx)"
                    class="w-7 h-7 flex items-center justify-center bg-red-50 text-red-400 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 border border-red-100 hover:border-red-600 shadow-sm group"
                    title="Eliminar lote"
                  >
                    <i class="pi pi-times text-[10px] group-hover:scale-110 transition-transform"></i>
                  </button>
                </div>
              </div>
              <button @click="agregarLote(index)" class="w-full border-2 border-dashed border-gray-600 p-3 rounded-xl text-[10px] font-black text-gray-800 hover:bg-white hover:text-[#0a3622] transition-all flex items-center justify-center gap-2 uppercase tracking-widest group">
                Agregar lote nuevo
              </button>
            </div>

            <div v-else class="flex items-center gap-4 text-left">
              <input
                type="number"
                v-model="item.cantidad"
                @keydown="soloEnteroPositivo"
                @input="recalcular(index)"
                class="w-20 border border-gray-300 rounded-xl p-2 text-base font-bold text-center text-[#0a3622] outline-none focus:border-[#0a3622] focus:ring-4 focus:ring-green-50 shadow-md bg-white"
              />
              <div class="flex flex-col">
                <span class="text-[11px] font-black text-[#0a3622] uppercase tracking-widest">Unidades a ingresar</span>
              </div>
            </div>
          </div>

          <!-- Pie del Item: Resumen -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t-2 border-gray-100 pt-4 text-left">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <span class="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Subtotal de este producto</span>
              <b class="text-[#0a3622] text-lg sm:text-xl font-black tracking-tighter bg-green-50 px-4 sm:px-5 py-2 rounded-xl border border-green-100 shadow-sm w-fit">
                $ {{ ((parseFloat(item.precio_unitario) || 0) * calcularCantidad(index)).toFixed(2) }}
              </b>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón Agregar Otro -->
      <button
        v-if="productosAgregados.length > 0"
        @click="scrollToSearch"
        class="w-full border-2 border-dashed border-gray-600 p-3 rounded-2xl text-[10px] font-black text-gray-800 hover:bg-white hover:border-[#0a3622] hover:text-[#0a3622] transition-all flex flex-col items-center justify-center gap-2 uppercase tracking-[0.25em] shadow-sm mb-8 group"
        >
        Agregar otro producto
      </button>
    </section>

    <!-- RESUMEN FINAL Y NAVEGACIÓN -->
    <div v-if="productosAgregados.length > 0" class="space-y-4 mt-8 pb-32 text-left">
      <!-- Tarjeta de Total General -->
      <div class="bg-[#0a3622] p-5 rounded-xl shadow-xl text-white relative overflow-hidden border border-white/10 flex flex-col items-center gap-2 md:flex-row md:justify-between md:items-center">
        <div class="relative z-10 text-center md:text-left">
          <p class="text-[12px] font-black text-green-300 uppercase tracking-[0.4em] mb-0.5">Inversión total de factura</p>
        </div>
        <div class="text-center md:text-right z-10">
           <p class="text-3xl font-black text-white tracking-tighter shadow-sm leading-none">$ {{ totalFactura }}</p>
        </div>
        <div class="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div class="flex flex-col gap-3 md:flex-row md:justify-between md:items-center px-1">
        <button @click="$emit('atras')" class="w-full md:w-auto px-7 py-2.5 bg-white border border-gray-300 text-[#0a3622] font-black rounded-xl hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
          <i class="pi pi-arrow-left text-[9px]"></i> Volver
        </button>
        <button @click="finalizarPaso" class="w-full md:w-auto px-10 py-3 bg-[#0a3622] text-white font-black rounded-xl hover:bg-[#115033] transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-md group">
          Ver resumen <i class="pi pi-arrow-right text-[9px] group-hover:translate-x-1 transition-transform"></i>
        </button>
      </div>
    </div>

    <!-- MODAL: CREACIÓN RÁPIDA (Teleport) -->
    <Teleport to="body">
      <div v-if="mostrarModalNuevo" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] backdrop-blur-sm p-4 font-dm-sans">
        <div class="bg-white rounded-[28px] w-full max-w-lg shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100 text-left">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
          <button @click="mostrarModalNuevo = false" class="absolute top-6 right-7 text-gray-300 hover:text-[#0a3622] transition-colors"><i class="pi pi-times text-2xl"></i></button>
          <div class="p-10">
            <div class="mb-8 text-left">
              <h2 class="text-2xl font-black text-[#0a3622] uppercase tracking-tight mb-1">Nuevo Producto</h2>
              <p class="text-xs text-gray-800 font-bold uppercase tracking-widest opacity-70">Añadir al catálogo</p>
            </div>
            <form @submit.prevent="confirmarCreacionRapida" class="space-y-6 text-left">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div class="md:col-span-2 space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Nombre Comercial *</label>
                  <InputText v-model="nuevoProducto.nombre" class="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold text-[#0a3622] focus:border-[#0a3622] outline-none transition-all shadow-sm bg-white" />
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Sección *</label>
                  <select v-model="nuevoProducto.seccion" @change="cargarCatalogosPorSeccion" class="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm font-bold text-[#0a3622] outline-none transition-all shadow-sm focus:border-[#0a3622]">
                    <option :value="null" disabled>Seleccionar sección</option>
                    <option value="TIENDA">TIENDA</option>
                    <option value="LIBRERIA">LIBRERIA</option>
                    <option value="MEDICAMENTO">MEDICAMENTO</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Categoría *</label>
                  <Dropdown v-model="nuevoProducto.categoria_id" :options="categorias" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full border border-gray-300 rounded-xl text-sm font-bold bg-white" filter :disabled="!nuevoProducto.seccion" />
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Marca *</label>
                  <Dropdown v-model="nuevoProducto.marca_id" :options="marcas" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full border border-gray-300 rounded-xl text-sm font-bold bg-white" filter :disabled="!nuevoProducto.seccion" />
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Stock Mínimo *</label>
                  <input
                    type="number"
                    v-model="nuevoProducto.stock_minimo"
                    @keydown="soloEnteroPositivo"
                    class="w-full border border-gray-300 rounded-xl p-2 text-sm font-bold text-[#0a3622] focus:border-[#0a3622] outline-none transition-all shadow-sm bg-white"
                  />
                </div>
                <div class="md:col-span-2 bg-[#c5d1c5] p-5 rounded-2xl flex items-center justify-between border border-green-400 shadow-inner">
                  <div class="text-left">
                    <p class="text-xs font-black text-[#0a3622] uppercase tracking-widest">¿Tipo de producto?</p>
                  </div>
                  <select v-model="nuevoProducto.perecedero" class="bg-white border-2 border-gray-200 rounded-xl text-xs font-black p-2.5 outline-none text-[#0a3622] shadow-sm focus:border-[#0a3622]">
                    <option value="NORMAL">NORMAL</option>
                    <option value="PERECEDERO">PERECEDERO</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-4 pt-6">
                <button type="button" @click="mostrarModalNuevo = false" class="px-8 py-3.5 bg-[#f1f5f1] text-[#3a5a3a] font-black rounded-2xl border border-[#e2eee2] hover:bg-white transition-all text-[11px] uppercase tracking-widest">Cancelar</button>
                <button type="submit" class="flex-1 py-4 bg-[#0a3622] hover:bg-[#002800] text-white font-black rounded-2xl shadow-xl transition-all text-[11px] uppercase tracking-[0.25em]">Añadir Producto</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import api from '@/services/api';
  import Swal from 'sweetalert2';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Checkbox from 'primevue/checkbox';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';

  const props = defineProps({
    datos: Object
  })
  const emit = defineEmits(['siguiente', 'atras'])

  //Estados
  const busqueda = ref('')
  const mostrarResultados = ref(false)
  const resultados = ref([])
  const mostrarModalNuevo = ref(false)
  const productosAgregados = ref([...props.datos.detalles])

  // --- ESTADOS PARA EL NUEVO PRODUCTO ---
  const categorias = ref([]);
  const marcas = ref([]);

  const nuevoProducto = ref({
    nombre: '',
    categoria_id: null,
    marca_id: null,
    stock_minimo: 0,
    perecedero: 'NORMAL',
    seccion: null
  });

  //Solo enteros positivos
  const soloEnteroPositivo = (e) => {
    const key = e.key
    if (
        !/^[0-9]$/.test(key) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight' &&
        key !== 'Tab'
    ){
      e.preventDefault()
    }
  }
  //Solo decimales positivos (máximo 2 decimales)
  const soloDecimalPositivo = (e) => {
    const { key, target } = e;
    const { value, selectionStart, selectionEnd } = target;

    // Teclas de control permitidas
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key)) return;

    // Solo números y punto
    if (!/^[0-9.]$/.test(key)) return e.preventDefault();

    // No permitir más de un punto
    if (key === '.' && value.includes('.')) return e.preventDefault();

    // Máximo 2 decimales (solo si no hay texto seleccionado)
    if (key !== '.' && value.includes('.')) {
        const decimales = value.split('.')[1] || '';
        const cursorDespuesDelPunto = selectionStart > value.indexOf('.');
        const sinSeleccion = selectionStart === selectionEnd;

        if (cursorDespuesDelPunto && decimales.length >= 2 && sinSeleccion) {
            e.preventDefault();
        }
    }
  }

  //Busqueda de producto
  let searchTimer = null;
  const buscarProducto = () => {
    if(searchTimer) clearTimeout(searchTimer);

    searchTimer = setTimeout(async () => {
      if(busqueda.value.length < 2){
        resultados.value = []
        mostrarResultados.value = false
        return
      }
      try{
        const {data} = await api.get(`/productos?search=${busqueda.value}`)
        // Como el backend pagina, extraemos los datos de data.data
        resultados.value = data.data || data;
        mostrarResultados.value = true
      }catch(err){
        console.error("Error al buscar productos", err)
      }
    }, 200);
  }

  const inputBusqueda = ref(null)

  //Fecha mínima para vencimiento
  const fechaMinimaLote = computed(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`;
  });

  const scrollToSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (inputBusqueda.value) {
      // Un pequeño retraso para asegurar que el scroll termine antes de enfocar
      setTimeout(() => {
        inputBusqueda.value.$el.focus();
      }, 500);
    }
  };

  //Agregamos el producto
  const agregarProducto = (prod) => {
    if(productosAgregados.value.some(p => p.producto_id === prod.id)){
      Swal.fire('Aviso', 'El producto ya está en la lista', 'info')
      busqueda.value = ''
      mostrarResultados.value = false
      return
    }
    //Extraemos la ultima informacion de la compra
    const ultimoDetalle = prod.ultimo_detalle_compra || {}
    const nuevoItem = {
      producto_id: prod.id,
      nombre: prod.nombre,
      perecedero: prod.perecedero,
      precio_unitario: ultimoDetalle.precio_unitario ? parseFloat(ultimoDetalle.precio_unitario) : 0.00,
      usar_factor: ultimoDetalle.factor_conversion && parseInt(ultimoDetalle.factor_conversion) > 1,
      factor_conversion: ultimoDetalle.factor_conversion ? parseInt(ultimoDetalle.factor_conversion) : 1,
      margen_detalle: ultimoDetalle.margen_detalle ? parseFloat(ultimoDetalle.margen_detalle) : 0,
      margen_mayor: ultimoDetalle.margen_mayor ? parseFloat(ultimoDetalle.margen_mayor) : 0,
      precio_detalle_sugerido: '0.00',
      precio_mayor_sugerido: '0.00',
      cantidad: 1,
      //Almacenamos los valores actuales para el calculo ponderado
      stock_inventario_previo: prod.stock || 0,
      costo_promedio_previo: parseFloat(prod.costo_promedio) || 0,
      lotes_existentes: prod.lotes || [],
      lotes: prod.perecedero === 'PERECEDERO' ? [{ codigo_lote: '', fecha_vencimiento: '', cantidad: 1 }] : []
    }
      productosAgregados.value.unshift(nuevoItem)
      recalcular(0);
      busqueda.value = ''
      mostrarResultados.value = false
    }

  // Función para abrir el modal de producto nuevo
  const prepararNuevoProducto = () => {
    // Limpiar listas y formulario al abrir
    categorias.value = [];
    marcas.value = [];
    nuevoProducto.value = {
      nombre: '',
      categoria_id: null,
      marca_id: null,
      stock_minimo: 5,
      perecedero: 'NORMAL',
      seccion: null
    };
    mostrarModalNuevo.value = true;
  };

  // Cargar categorías y marcas filtradas por la sección seleccionada
  const cargarCatalogosPorSeccion = async () => {
    const seccion = nuevoProducto.value.seccion;
    // Resetear selección previa al cambiar de sección
    nuevoProducto.value.categoria_id = null;
    nuevoProducto.value.marca_id = null;
    categorias.value = [];
    marcas.value = [];

    if (!seccion) return;

    try {
      const [resCat, resMar] = await Promise.all([
        api.get(`/categorias?per_page=100&seccion=${seccion}`),
        api.get(`/marcas?per_page=100&seccion=${seccion}`)
      ]);
      categorias.value = resCat.data.data || resCat.data;
      marcas.value = resMar.data.data || resMar.data;
    } catch (error) {
      console.error("Error al cargar catálogos por sección:", error);
    }
  };

  // Función que añade el producto "en memoria" a la lista de compra
  const confirmarCreacionRapida = () => {
    if (!nuevoProducto.value.nombre || !nuevoProducto.value.categoria_id || !nuevoProducto.value.marca_id  || !nuevoProducto.value.seccion){
      return Swal.fire('Incompleto', 'Complete los campos obligatorios del producto', 'warning');
    }

    const itemParaCompra = {
      producto_id: null,
      nombre: nuevoProducto.value.nombre,
      categoria_id: nuevoProducto.value.categoria_id,
      marca_id: nuevoProducto.value.marca_id,
      stock_minimo: nuevoProducto.value.stock_minimo,
      perecedero: nuevoProducto.value.perecedero,
      seccion: nuevoProducto.value.seccion,
      precio_unitario: 0.00,
      usar_factor: false,
      factor_conversion: 1,
      margen_detalle: 0,
      margen_mayor: 0,
      precio_detalle_sugerido: '0.00',
      precio_mayor_sugerido: '0.00',
      cantidad: 1,
      visible: true,
      lotes: nuevoProducto.value.perecedero === 'PERECEDERO' ? [{ codigo_lote: '', fecha_vencimiento: '', cantidad: 1 }] : []
    };

    productosAgregados.value.unshift(itemParaCompra);
    recalcular(0);
    mostrarModalNuevo.value = false;
    Swal.fire({ icon: 'success', title: 'Añadido', text: 'Producto listo para ingresar', timer: 1500, showConfirmButton: false });
  };

  //Calculos
  const recalcular = (index) => {
    const item = productosAgregados.value[index]
    const costoFactura = parseFloat(item.precio_unitario) || 0

    // Si no aplica factor, forzamos a 1 para el cálculo
    if (!item.usar_factor) item.factor_conversion = 1
    const factor = parseInt(item.factor_conversion) || 1

    // El costo base por unidad real
    const costoUnitarioBase = costoFactura / factor

    //Datos del stock anterior
    const stockPrevio = item.stock_inventario_previo || 0
    const cppAnterior = item.costo_promedio_previo || 0
    //Unidades nuevas que ingresaran en la compra actual
    const cantidadComprada = calcularCantidad(index) * factor
    //Aplicamos la formula del cpp
    const totalUnidades = stockPrevio + cantidadComprada
    let cppCalculado = costoUnitarioBase
    if(totalUnidades > 0){
      cppCalculado = ((stockPrevio * cppAnterior) + (cantidadComprada * costoUnitarioBase)) / totalUnidades
    }

    item.precio_detalle_sugerido = (cppCalculado * (1 + item.margen_detalle / 100)).toFixed(2)
    item.precio_mayor_sugerido = (cppCalculado * (1 + item.margen_mayor / 100)).toFixed(2)
  }
  const calcularCantidad = (index) => {
    const item = productosAgregados.value[index]
    if(item.perecedero === 'PERECEDERO'){
      return item.lotes.reduce((sum, l) => sum + (parseInt(l.cantidad) || 0), 0)
    }
    return parseInt(item.cantidad) || 0
  }

  // Helper para mostrar el CPP simulado en la barra de sugerencias
  const obtenerCppSimuladoText = (index) => {
    const item = productosAgregados.value[index]
    const costoFactura = parseFloat(item.precio_unitario) || 0
    const factor = parseInt(item.factor_conversion) || 1
    const costoUnitarioCompra = costoFactura / factor

    const stockPrevio = item.stock_inventario_previo || 0
    const cppAnterior = item.costo_promedio_previo || 0
    const cantidadComprada = calcularCantidad(index) * factor

    const totalUnidades = stockPrevio + cantidadComprada
    if (totalUnidades > 0) {
      return (((stockPrevio * cppAnterior) + (cantidadComprada * costoUnitarioCompra)) / totalUnidades).toFixed(2)
    }
    return costoUnitarioCompra.toFixed(2)
  }
  const totalFactura = computed(() => {
     return productosAgregados.value.reduce((sum, item, idx) => {
      return sum + (parseFloat(item.precio_unitario) * calcularCantidad(idx))
     }, 0).toFixed(2)
  })

  //Lotes
  const agregarLote = (idx) => {
    productosAgregados.value[idx].lotes.push({ codigo_lote: '', fecha_vencimiento: '', cantidad: 1 })
  }
  //Funcion para buscar y selecionar lotes existentes
  const seleccionarLoteExistente  = (event, pIdx, lIdx) => {
    const value = event.target.value
    if(!value) return

    const loteSeleccionado = JSON.parse(value)
    const loteActual = productosAgregados.value[pIdx].lotes[lIdx]

    loteActual.codigo_lote = loteSeleccionado.codigo_lote
    // Recortamos a YYYY-MM-DD porque el input type="date" no acepta el timestamp completo
    loteActual.fecha_vencimiento = (loteSeleccionado.fecha_vencimiento || '').slice(0, 10)

    event.target.value = ""
  }

  const quitarLote = (pIdx, lIdx) => {
    if(productosAgregados.value[pIdx].lotes.length > 1){
      productosAgregados.value[pIdx].lotes.splice(lIdx, 1)
    }
  }
  const quitarProducto = (idx) => {
    productosAgregados.value.splice(idx, 1)
  }

  //Navegacion
  const finalizarPaso = () => {
    //Validacion de campos vacios
    let incompleto = false
    let mensaje = 'Por favor complete todos los campos obligatorios.'
    productosAgregados.value.forEach(p => {
      if(p.precio_unitario <= 0){
        incompleto = true
        mensaje = 'El costo unitario de todos los productos debe ser mayor a 0.'
      }
      if(p.margen_detalle <= 0 || p.margen_mayor <= 0){
        incompleto = true;
        mensaje = 'Los márgenes de ganancia (detalle y mayor) deben ser mayores a 0%.';
      }
      if(Number(p.margen_mayor) >= Number(p.margen_detalle)){
        incompleto = true;
        mensaje = 'El margen al mayor debe ser menor que el margen al detalle.';
      }
      if(p.perecedero === 'PERECEDERO'){
        p.lotes.forEach(l => {
          if(!l.codigo_lote || !l.fecha_vencimiento || l.cantidad <= 0){
            incompleto = true
             mensaje = 'Complete todos los campos de los lotes para productos perecederos (código, fecha y cantidad).'
          }
        })
      }else{
        if(p.cantidad <= 0){
          incompleto = true
           mensaje = 'La cantidad de ingreso debe ser mayor a 0.'
        }
      }
    })
    if(incompleto){
      return Swal.fire('Datos incorrectos', mensaje, 'warning')
    }
    emit('siguiente', { detalles: productosAgregados.value })
  }
</script>

<style scoped>
  .animate-fade-in{
    animation: fadeIn 0.4s ease-out forwards;
  }
  .animate-fade-up{
    animation: fadeUp 0.3s ease-out forwards;
  }
  @keyframes fadeIn{
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUp{
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  input::-webkit-outer-spin-button, input::-webkit-inner-spin-button{
    -webkit-appearance: none;
    margin: 0;
  }
  .shadow-text {
    text-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
</style>
