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
          <!-- Errores del producto que no tienen un campo propio en la tarjeta -->
          <div v-if="erroresGenerales(index).length" class="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
            <p v-for="(mensaje, i) in erroresGenerales(index)" :key="i" class="text-red-600 text-xs font-bold flex gap-2">
              <i class="pi pi-exclamation-circle text-[11px] mt-0.5"></i>{{ mensaje }}
            </p>
          </div>
          <!-- Barra informativa de contexto: stock y costo promedio anterior -->
          <div v-if="item.producto_id" class="flex flex-wrap gap-x-5 gap-y-2 text-[10px] sm:text-[11px] text-gray-800 font-bold ml-1">
            <span>STOCK ACTUAL EN TIENDA: <b class="text-gray-800 bg-gray-100 px-2 py-0.5 rounded shadow-sm">{{ item.stock_inventario_previo }} u.</b></span>
            <span>COSTO PROMEDIO ANTERIOR: <b class="text-gray-800 bg-gray-100 px-2 py-0.5 rounded shadow-sm">{{ item.costo_promedio_previo > 0 ? '$' + formatoMoneda(item.costo_promedio_previo) : 'SIN COSTO REGISTRADO' }}</b></span>
          </div>

          <!-- Grid de Inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Costo Unitario ($)</label>
              <div class="relative group">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0a3622] font-black text-xs z-10">$</span>
                <input
                  type="text"
                  inputmode="decimal"
                  v-model="item.precio_unitario"
                  @input="item.precio_unitario = limpiarDecimal($event.target.value, 99999.99); limpiarError(index, 'precio_unitario'); recalcular(index)"
                  @keydown="soloDecimalPositivo"
                  class="w-full border border-gray-400 rounded-xl p-3 pl-8 text-sm font-bold text-gray-800 outline-none focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/5 bg-white shadow-sm transition-all"
                  :class="{ '!border-red-500': errorDe(index, 'precio_unitario') }"
                />
              </div>
              <small v-if="errorDe(index, 'precio_unitario')" class="text-red-500 text-xs block ml-1">{{ errorDe(index, 'precio_unitario') }}</small>
            </div>
            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Margen Detalle (%)</label>
              <div class="relative group">
                <input
                  type="text"
                  inputmode="numeric"
                  v-model="item.margen_detalle"
                  @input="item.margen_detalle = limpiarEntero($event.target.value, 100); limpiarError(index, 'margen_detalle'); recalcular(index)"
                  @keydown="soloEnteroPositivo"
                  class="w-full border border-gray-400 rounded-xl p-3 text-sm font-bold text-gray-800 outline-none focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/5 bg-white shadow-sm transition-all"
                  :class="{ '!border-red-500': errorDe(index, 'margen_detalle') }"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">%</span>
              </div>
              <small v-if="errorDe(index, 'margen_detalle')" class="text-red-500 text-xs block ml-1">{{ errorDe(index, 'margen_detalle') }}</small>
            </div>
            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Margen Mayor (%)</label>
              <div class="relative group">
                <input
                  type="text"
                  inputmode="numeric"
                  v-model="item.margen_mayor"
                  @input="item.margen_mayor = limpiarEntero($event.target.value, 100); limpiarError(index, 'margen_mayor'); recalcular(index)"
                  @keydown="soloEnteroPositivo"
                  class="w-full border border-gray-400 rounded-xl p-3 text-sm font-bold text-gray-800 outline-none focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/5 bg-white shadow-sm transition-all"
                  :class="{ '!border-red-500': errorDe(index, 'margen_mayor') }"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">%</span>
              </div>
              <small v-if="errorDe(index, 'margen_mayor')" class="text-red-500 text-xs block ml-1">{{ errorDe(index, 'margen_mayor') }}</small>
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
                  :max="1000"
                  @update:modelValue="limpiarError(index, 'factor_conversion'); recalcular(index)"
                  :inputClass="['w-full border border-gray-400 rounded-xl p-3 !pl-11 text-sm font-bold text-gray-800 outline-none focus:border-blue-500 bg-blue-50/20 shadow-sm transition-all', { '!border-red-500': errorDe(index, 'factor_conversion') }]"
                />
              </div>
              <small v-if="errorDe(index, 'factor_conversion')" class="text-red-500 text-xs block ml-1">{{ errorDe(index, 'factor_conversion') }}</small>
            </div>
          </div>

          <!-- Barra de Costos y Precios Sugeridos (Desglosada con CPP) -->
          <div class="bg-emerald-50/80 p-4 sm:p-5 rounded-2xl border border-emerald-300 shadow-inner space-y-3">

            <!-- Fila superior: Costo neto y Nuevo CPP -->
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10px] text-emerald-800 font-bold border-b border-emerald-200/70 pb-2.5">
              <span>COSTO NETO DE ESTA FACTURA:
                <b class="text-emerald-950 text-[11px] font-black ml-1">${{ formatoMoneda((parseFloat(item.precio_unitario) || 0) / (parseInt(item.factor_conversion) || 1)) }} / u.</b>
              </span>
              <span class="hidden sm:inline text-emerald-300">|</span>
              <span>NUEVO COSTO PROMEDIO (CPP):
                <b class="text-emerald-950 text-[11px] font-black ml-1">${{ formatoMoneda(obtenerCppSimuladoText(index)) }} / u.</b>
              </span>
            </div>

            <!-- Fila inferior: Precios de venta sugeridos -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 text-[11px] font-bold text-emerald-900">
              <span class="flex items-center gap-2 flex-wrap">
                VENTA AL DETALLE:
                <b class="text-emerald-950 text-sm font-black">${{ formatoMoneda(item.precio_detalle_sugerido) }}</b>
              </span>
              <div class="w-1 h-4 bg-emerald-200 rounded-full hidden sm:block"></div>
              <span class="flex items-center gap-2 flex-wrap">
                VENTA AL MAYOR:
                <b class="text-emerald-950 text-sm font-black">${{ formatoMoneda(item.precio_mayor_sugerido) }}</b>
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
                      v-if="lotesParaCopiar(item).length > 0"
                      @change="seleccionarLoteExistente($event, index, lIdx)"
                      class="w-full sm:w-auto sm:max-w-[200px] text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-blue-100 transition-colors truncate"
                    >
                      <option value="">-- Copiar Lote --</option>
                      <option
                        v-for="lex in lotesParaCopiar(item)"
                        :key="lex.codigo_lote + lex.fecha_vencimiento"
                        :value="JSON.stringify(lex)"
                      >
                        {{ lex.codigo_lote }} (vence {{ lex.fecha_vencimiento.split('-').reverse().join('/') }})
                      </option>
                    </select>
                  </div>

                  <input
                    v-model="lote.codigo_lote"
                    @input="lote.codigo_lote = lote.codigo_lote.toUpperCase(); limpiarError(index, `lotes.${lIdx}.codigo_lote`)"
                    class="w-full border border-gray-400 rounded-lg p-2.5 text-[11px] font-black text-blue-700 uppercase outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white shadow-sm"
                    :class="{ '!border-red-500': errorDe(index, `lotes.${lIdx}.codigo_lote`) }"
                    placeholder="EJ: L-100"
                  />
                  <small v-if="errorDe(index, `lotes.${lIdx}.codigo_lote`)" class="text-red-500 text-xs block ml-1">{{ errorDe(index, `lotes.${lIdx}.codigo_lote`) }}</small>
                </div>
                <div class="w-full sm:col-span-4 space-y-1.5">
                  <span class="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1">Vencimiento</span>
                  <input
                    type="date"
                    :min="fechaMinimaLote"
                    v-model="lote.fecha_vencimiento"
                    @input="limpiarError(index, `lotes.${lIdx}.fecha_vencimiento`)"
                    class="w-full border border-gray-400 rounded-lg p-2.5 text-[11px] font-black text-gray-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white shadow-sm"
                    :class="{ '!border-red-500': errorDe(index, `lotes.${lIdx}.fecha_vencimiento`) }"
                  />
                  <small v-if="errorDe(index, `lotes.${lIdx}.fecha_vencimiento`)" class="text-red-500 text-xs block ml-1">{{ errorDe(index, `lotes.${lIdx}.fecha_vencimiento`) }}</small>
                </div>
                <div class="w-full sm:col-span-2 space-y-1.5">
                  <span class="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1">Cantidad</span>
                  <input
                    type="text"
                    inputmode="numeric"
                    v-model="lote.cantidad"
                    @keydown="soloEnteroPositivo"
                    @input="lote.cantidad = limpiarEntero($event.target.value, 99999); limpiarError(index, `lotes.${lIdx}.cantidad`); recalcular(index)"
                    class="w-full border border-gray-400 rounded-lg p-2.5 text-[11px] font-black text-center text-[#0a3622] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white shadow-sm"
                    :class="{ '!border-red-500': errorDe(index, `lotes.${lIdx}.cantidad`) }"
                  />
                  <small v-if="errorDe(index, `lotes.${lIdx}.cantidad`)" class="text-red-500 text-xs block ml-1">{{ errorDe(index, `lotes.${lIdx}.cantidad`) }}</small>
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
                type="text"
                inputmode="numeric"
                v-model="item.cantidad"
                @keydown="soloEnteroPositivo"
                @input="item.cantidad = limpiarEntero($event.target.value, 99999); limpiarError(index, 'cantidad'); recalcular(index)"
                class="w-20 border border-gray-300 rounded-xl p-2 text-base font-bold text-center text-[#0a3622] outline-none focus:border-[#0a3622] focus:ring-4 focus:ring-green-50 shadow-md bg-white"
                :class="{ '!border-red-500': errorDe(index, 'cantidad') }"
              />
              <div class="flex flex-col">
                <span class="text-[11px] font-black text-[#0a3622] uppercase tracking-widest">Unidades a ingresar</span>
              </div>
            </div>
            <small v-if="errorDe(index, 'cantidad')" class="text-red-500 text-xs block ml-1 mt-2">{{ errorDe(index, 'cantidad') }}</small>
          </div>

          <!-- Pie del Item: Resumen -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t-2 border-gray-100 pt-4 text-left">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <span class="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Subtotal de este producto</span>
              <b class="text-[#0a3622] text-lg sm:text-xl font-black tracking-tighter bg-green-50 px-4 sm:px-5 py-2 rounded-xl border border-green-100 shadow-sm w-fit">
                $ {{ formatoMoneda((parseFloat(item.precio_unitario) || 0) * calcularCantidad(index)) }}
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
           <p class="text-3xl font-black text-white tracking-tighter shadow-sm leading-none">$ {{ formatoMoneda(totalFactura) }}</p>
        </div>
        <div class="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div class="flex flex-col gap-3 md:flex-row md:justify-between md:items-center px-1">
        <button @click="$emit('atras')" class="w-full md:w-auto px-7 py-2.5 bg-white border border-gray-300 text-[#0a3622] font-black rounded-xl hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
          <i class="pi pi-arrow-left text-[9px]"></i> Volver
        </button>
        <button @click="finalizarPaso" :disabled="validando" class="w-full md:w-auto px-10 py-3 bg-[#0a3622] text-white font-black rounded-xl hover:bg-[#115033] transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-md group disabled:opacity-60 disabled:cursor-wait">
          <template v-if="validando"><i class="pi pi-spin pi-spinner text-[10px]"></i> Validando…</template>
          <template v-else>Ver resumen <i class="pi pi-arrow-right text-[9px] group-hover:translate-x-1 transition-transform"></i></template>
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
                  <InputText
                    v-model="nuevoProducto.nombre"
                    @input="erroresNuevo.nombre = nuevoProducto.nombre.length > 100 ? 'El nombre del producto no puede tener más de 100 caracteres.' : ''"
                    class="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold text-[#0a3622] focus:border-[#0a3622] outline-none transition-all shadow-sm bg-white"
                    :class="{ 'border-red-500': erroresNuevo.nombre }"
                  />
                  <small v-if="erroresNuevo.nombre" class="text-red-500 text-xs block">{{ erroresNuevo.nombre }}</small>
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Sección *</label>
                  <select
                    v-model="nuevoProducto.seccion"
                    @change="cargarCatalogosPorSeccion"
                    class="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm font-bold text-[#0a3622] outline-none transition-all shadow-sm focus:border-[#0a3622]"
                    :class="{ 'border-red-500': erroresNuevo.seccion }"
                  >
                    <option :value="null" disabled>Seleccionar sección</option>
                    <option value="TIENDA">TIENDA</option>
                    <option value="LIBRERIA">LIBRERIA</option>
                    <option value="MEDICAMENTO">MEDICAMENTO</option>
                  </select>
                  <small v-if="erroresNuevo.seccion" class="text-red-500 text-xs block">{{ erroresNuevo.seccion }}</small>
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Categoría *</label>
                  <Dropdown
                    v-model="nuevoProducto.categoria_id"
                    :options="categorias"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar"
                    class="w-full border border-gray-300 rounded-xl text-sm font-bold bg-white"
                    :class="{ 'border-red-500': erroresNuevo.categoria_id }"
                    filter
                    :disabled="!nuevoProducto.seccion"
                  />
                  <small v-if="erroresNuevo.categoria_id" class="text-red-500 text-xs block">{{ erroresNuevo.categoria_id }}</small>
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Marca *</label>
                  <Dropdown
                    v-model="nuevoProducto.marca_id"
                    :options="marcas"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar"
                    class="w-full border border-gray-300 rounded-xl text-sm font-bold bg-white"
                    :class="{ 'border-red-500': erroresNuevo.marca_id }"
                    filter
                    :disabled="!nuevoProducto.seccion"
                  />
                  <small v-if="erroresNuevo.marca_id" class="text-red-500 text-xs block">{{ erroresNuevo.marca_id }}</small>
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Stock Mínimo *</label>
                  <input
                    type="text"
                    inputmode="numeric"
                    v-model="nuevoProducto.stock_minimo"
                    @keydown="soloEnteroPositivo"
                    @input="nuevoProducto.stock_minimo = limpiarEntero($event.target.value, 999999)"
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
  import { useToast } from 'primevue/usetoast';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Checkbox from 'primevue/checkbox';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import { formatoMoneda } from '@/utils/formatos';
  import compraService from '@/services/compraService';
  import { armarDatosCompra } from '@/utils/compra';

  const props = defineProps({
    datos: Object
  })
  const emit = defineEmits(['siguiente', 'atras'])
  const toast = useToast()

  // Estados
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

  // Errores inline del modal nuevo producto
  const erroresNuevo = ref({
    nombre: '',
    seccion: '',
    categoria_id: '',
    marca_id: ''
  });

  const limpiarErroresNuevo = () => {
    erroresNuevo.value = {
      nombre: '',
      seccion: '',
      categoria_id: '',
      marca_id: ''
    };
  };

  // Errores por campo del paso 2 (mismas claves que el backend: detalles.0.lotes.1.codigo_lote)
  const errores = ref({})
  const validando = ref(false)
  const errorDe = (index, campo) => errores.value[`detalles.${index}.${campo}`] || ''
  const limpiarError = (index, campo) => { delete errores.value[`detalles.${index}.${campo}`] }
  // Errores del producto que no tienen un campo propio en la tarjeta (nombre duplicado, sin lotes, etc.)
  const CAMPOS_CON_LUGAR = /^(precio_unitario|margen_detalle|margen_mayor|factor_conversion|cantidad|lotes\.\d+\.(codigo_lote|fecha_vencimiento|cantidad))$/
  const erroresGenerales = (index) => Object.entries(errores.value)
    .filter(([clave]) => clave.startsWith(`detalles.${index}.`) && !CAMPOS_CON_LUGAR.test(clave.slice(`detalles.${index}.`.length)))
    .map(([, mensaje]) => mensaje)

  //Solo enteros positivos
  const soloEnteroPositivo = (e) => {
    const key = e.key
    if (e.ctrlKey || e.metaKey) return
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
    if (e.ctrlKey || e.metaKey) return;

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
  //Limpia lo que entra por pegar/arrastrar: solo dígitos y tope máximo
  const limpiarEntero = (valor, max) => {
    const limpio = String(valor ?? '').replace(/\D/g, '')
    return max && Number(limpio) > max ? String(max) : limpio
  }
  //Solo dígitos y un punto, máximo 2 decimales y tope máximo
  const limpiarDecimal = (valor, max) => {
    const [entero, ...resto] = String(valor ?? '').replace(/[^0-9.]/g, '').split('.')
    const limpio = resto.length ? `${entero}.${resto.join('').slice(0, 2)}` : entero
    return max && Number(limpio) > max ? String(max) : limpio
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
    // Limpiar listas y formulario
    // al abrir
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
    limpiarErroresNuevo();
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

  // Función auxiliar para normalizar nombres
  const normalizarNombre = (texto) => {
    if(!texto) return '';
    return texto
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
  }

  // Función que añade el producto "en memoria" a la lista de compra
  const confirmarCreacionRapida = async () => {
    limpiarErroresNuevo();
    let valido = true;

    if (!nuevoProducto.value.nombre || !nuevoProducto.value.nombre.trim()){
      erroresNuevo.value.nombre = 'El nombre comercial es obligatorio.';
      valido = false;
    } else if (nuevoProducto.value.nombre.trim().length > 100){
      erroresNuevo.value.nombre = 'El nombre del producto no puede tener más de 100 caracteres.';
      valido = false;
    }
    if (!nuevoProducto.value.seccion){
      erroresNuevo.value.seccion = 'Debe seleccionar una sección.';
      valido = false;
    }
    if (!nuevoProducto.value.categoria_id){
      erroresNuevo.value.categoria_id = 'Debe seleccionar una categoría.';
      valido = false;
    }
    if (!nuevoProducto.value.marca_id){
      erroresNuevo.value.marca_id = 'Debe seleccionar una marca.';
      valido = false;
    }

    if(!valido) return;

    const nombreNorm = normalizarNombre(nuevoProducto.value.nombre);

    // Verificar si ya fue agregado a la lista de compra
    const yaEnLista = productosAgregados.value.some(
      (item) => normalizarNombre(item.nombre) === nombreNorm
    );
    if(yaEnLista){
      erroresNuevo.value.nombre = 'Este producto ya está agregado en la lista de compra actual.';
      return;
    }

    // Verificar si ya existe en la base de datos
    try{
      const res = await api.get("/productos/verificar-nombre", {
        params: { nombre: nuevoProducto.value.nombre.trim() }
      });

      if(res.data?.existe && res.data?.producto){
        erroresNuevo.value.nombre = `Ya existe en el catálogo un producto similar: "${res.data.producto.nombre}". Búscalo en la barra superior.`;
        return;
      }
    }catch(err){
      console.warn("No se pudo verificar duplicados en servidor: ", err);
    }

    const itemParaCompra = {
      producto_id: null,
      nombre: nuevoProducto.value.nombre.trim(),
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
    toast.add({
      severity: 'success',
      summary: 'Añadido',
      detail: 'Producto añadido a la lista de compra',
      life: 3500
    });
  };

  // Calculos
  const recalcular = (index) => {
    const item = productosAgregados.value[index]
    const costoFactura = parseFloat(item.precio_unitario) || 0

    // Si no aplica factor, forzamos a 1 para el cálculo
    if (!item.usar_factor) item.factor_conversion = 1
    const factor = parseInt(item.factor_conversion) || 1

    // El costo base por unidad real
    const costoUnitarioBase = costoFactura / factor

    // Datos del stock anterior (stock sin costo conocido no participa en el promedio)
    const cppAnterior = item.costo_promedio_previo || 0
    const stockPrevio = cppAnterior > 0 ? (item.stock_inventario_previo || 0) : 0
    // Unidades nuevas que ingresaran en la compra actual
    const cantidadComprada = calcularCantidad(index) * factor
    // Aplicamos la formula del cpp
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

    const cppAnterior = item.costo_promedio_previo || 0
    const stockPrevio = cppAnterior > 0 ? (item.stock_inventario_previo || 0) : 0
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

  // Lotes
  const agregarLote = (idx) => {
    productosAgregados.value[idx].lotes.push({ codigo_lote: '', fecha_vencimiento: '', cantidad: 1 })
  }
  // Lotes que se pueden copiar: una opción por código y vencimiento, solo activos, con stock y sin vencer
  const lotesParaCopiar = (item) => {
    const grupos = {}
    ;(item.lotes_existentes || [])
      .filter(l => l.estado === 'ACTIVO' && Number(l.cantidad_actual) > 0 && (l.fecha_vencimiento || '').slice(0, 10) >= fechaMinimaLote.value)
      .forEach(l => {
        const codigo = (l.codigo_lote || '').trim().toUpperCase()
        const fecha = l.fecha_vencimiento.slice(0, 10)
        const clave = `${codigo}|${fecha}`
        if(!grupos[clave]) grupos[clave] = { codigo_lote: codigo, fecha_vencimiento: fecha }
      })
    return Object.values(grupos).sort((a, b) => a.fecha_vencimiento.localeCompare(b.fecha_vencimiento))
  }

  // Funcion para buscar y selecionar lotes existentes
  const seleccionarLoteExistente  = (event, pIdx, lIdx) => {
    const value = event.target.value
    if(!value) return

    const loteSeleccionado = JSON.parse(value)
    const loteActual = productosAgregados.value[pIdx].lotes[lIdx]

    loteActual.codigo_lote = loteSeleccionado.codigo_lote
    // Recortamos a YYYY-MM-DD porque el input type="date" no acepta el timestamp completo
    loteActual.fecha_vencimiento = (loteSeleccionado.fecha_vencimiento || '').slice(0, 10)
    limpiarError(pIdx, `lotes.${lIdx}.codigo_lote`)
    limpiarError(pIdx, `lotes.${lIdx}.fecha_vencimiento`)

    event.target.value = ""
  }

  const quitarLote = (pIdx, lIdx) => {
    if(productosAgregados.value[pIdx].lotes.length > 1){
      productosAgregados.value[pIdx].lotes.splice(lIdx, 1)
      // Las posiciones cambian: los errores quedarían en el campo equivocado
      errores.value = {}
    }
  }

  // Confirmación destructiva antes de quitar un producto de la compra actual
  const quitarProducto = async (idx) => {
    const item = productosAgregados.value[idx]
    const result = await Swal.fire({
      title: '¿Remover producto?',
      text: `Se quitará "${item?.nombre || 'el producto'}" de la compra actual.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d1333e',
      cancelButtonColor: '#d6dfd6',
      confirmButtonText: 'Sí, remover',
      cancelButtonText: 'Cancelar',
      customClass: { cancelButton: '!text-[#3a5a3a] !font-bold' },
      reverseButtons: true,
      allowOutsideClick: false
    })

    if(result.isConfirmed){
      productosAgregados.value.splice(idx, 1)
      errores.value = {}
      toast.add({
        severity: 'info',
        summary: 'Removido',
        detail: 'Producto removido de la lista de compra',
        life: 3000
      })
    }
  }

  // Validaciones locales: mismas reglas de antes, cada error en su campo
  const validarLocal = () => {
    const nuevos = {}
    productosAgregados.value.forEach((p, i) => {
      const clave = (campo) => `detalles.${i}.${campo}`
      if(!(parseFloat(p.precio_unitario) > 0)) nuevos[clave('precio_unitario')] = 'El costo unitario debe ser mayor a 0.'
      if(!(Number(p.margen_detalle) > 0)) nuevos[clave('margen_detalle')] = 'El margen al detalle debe ser mayor a 0%.'
      if(!(Number(p.margen_mayor) > 0)) nuevos[clave('margen_mayor')] = 'El margen al mayor debe ser mayor a 0%.'
      else if(Number(p.margen_mayor) >= Number(p.margen_detalle)) nuevos[clave('margen_mayor')] = 'El margen al mayor debe ser menor que el margen al detalle.'

      if(p.perecedero === 'PERECEDERO'){
        // Vencimientos ya registrados por código (sin contar lotes anulados)
        const vencimientosEnBd = {}
        ;(p.lotes_existentes || [])
          .filter(lex => lex.motivo_inactivo !== 'ANULACION')
          .forEach(lex => { vencimientosEnBd[(lex.codigo_lote || '').trim().toUpperCase()] = (lex.fecha_vencimiento || '').slice(0, 10) })
        const codigosEnProducto = []

        p.lotes.forEach((l, j) => {
          l.codigo_lote = (l.codigo_lote || '').trim().toUpperCase()
          if(!l.codigo_lote) nuevos[clave(`lotes.${j}.codigo_lote`)] = 'El código de lote es obligatorio.'
          else if(codigosEnProducto.includes(l.codigo_lote)) nuevos[clave(`lotes.${j}.codigo_lote`)] = `El lote ${l.codigo_lote} está repetido en este producto.`
          codigosEnProducto.push(l.codigo_lote)

          if(!l.fecha_vencimiento) nuevos[clave(`lotes.${j}.fecha_vencimiento`)] = 'La fecha de vencimiento es obligatoria.'
          else{
            const vencimientoBd = vencimientosEnBd[l.codigo_lote]
            if(vencimientoBd && vencimientoBd !== l.fecha_vencimiento){
              nuevos[clave(`lotes.${j}.fecha_vencimiento`)] = `El lote ${l.codigo_lote} ya está registrado con vencimiento ${vencimientoBd.split('-').reverse().join('/')}.`
            }
          }
          if(!(parseInt(l.cantidad) > 0)) nuevos[clave(`lotes.${j}.cantidad`)] = 'La cantidad debe ser mayor a 0.'
        })
      }else if(!(parseInt(p.cantidad) > 0)){
        nuevos[clave('cantidad')] = 'La cantidad de ingreso debe ser mayor a 0.'
      }
    })
    return nuevos
  }

  const avisarErrores = () => {
    const total = Object.keys(errores.value).length
    toast.add({
      severity: 'warn',
      summary: 'Revise los datos',
      detail: `Hay ${total} ${total === 1 ? 'error' : 'errores'}. Revise los campos marcados en rojo.`,
      life: 5000
    })
  }

  // Navegacion
  const finalizarPaso = async () => {
    if(productosAgregados.value.length === 0){
      return toast.add({
        severity: 'warn',
        summary: 'Lista vacía',
        detail: 'Debe agregar al menos un producto a la compra.',
        life: 4000
      })
    }

    errores.value = validarLocal()
    if(Object.keys(errores.value).length) return avisarErrores()

    // Mismas reglas del backend que al registrar, sin guardar nada
    validando.value = true
    try{
      await compraService.validarCompra(armarDatosCompra({ ...props.datos, detalles: productosAgregados.value }))
      emit('siguiente', { detalles: productosAgregados.value })
    }catch(error){
      const recibidos = error.response?.status === 422 ? error.response.data?.errors : null
      if(!recibidos){
        return toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo validar la compra. Intente de nuevo.',
          life: 5000
        })
      }
      errores.value = Object.fromEntries(Object.entries(recibidos).map(([clave, mensajes]) => [clave, mensajes[0]]))
      // Errores de la factura (paso 1): no tienen campo en este paso
      const deFactura = Object.entries(errores.value).filter(([clave]) => !clave.startsWith('detalles.')).map(([, m]) => m)
      if(deFactura.length){
        toast.add({ severity: 'error', summary: 'Datos de la factura', detail: deFactura.join(' '), life: 6000 })
      }
      avisarErrores()
    }finally{
      validando.value = false
    }
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
