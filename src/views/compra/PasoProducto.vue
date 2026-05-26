<template>
  <div class="w-full font-dm-sans px-4 pb-24 space-y-6">
    <!-- Buscar -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-md relative overflow-visible text-left">
      <div class="flex-1 min-w-[250px]">
        <div class="relative group">
          <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-[#0a3622] z-10 text-xs font-bold"></i>
          <InputText
            ref="inputBusqueda"
            v-model="busqueda"
            @input="buscarProducto"
            placeholder="Buscar producto en el catálogo..."
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
        class="p-button-sm !bg-[#0a3622] hover:!bg-[#115033] border-none rounded-xl px-6 py-2.5 font-black shadow-lg transition-all text-white text-[10px] tracking-widest"
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
        <div class="flex items-center justify-between bg-[#0a3622] px-6 py-3 border-b border-[#0a3622]">
          <div class="flex items-center gap-4">
            <span class="w-7 h-7 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-inner">{{ index + 1 }}</span>
            <span class="font-black text-white text-sm uppercase tracking-wide">{{ item.nombre }}</span>
            <span v-if="item.perecedero === 'PERECEDERO'" class="bg-green-400/20 text-green-500 text-[10px] px-2 py-0.5 rounded font-black uppercase border border-green-400/30 ml-2 shadow-sm">Perecedero</span>
          </div>
          <button @click="quitarProducto(index)" class="w-8 h-8 flex items-center justify-center bg-white/10 text-white/70 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-white/10 group">
            <i class="pi pi-trash text-xs group-hover:scale-110 transition-transform"></i>
          </button>
        </div>

        <div class="p-8 space-y-8 bg-[#fcfdfc]">
          <!-- Grid de Inputs -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Costo Unitario ($)</label>
              <div class="relative group">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0a3622] font-black text-xs z-10">$</span>
                <input type="number" step="0.01" v-model="item.precio_unitario" @input="recalcular(index)" class="w-28 border border-gray-400 rounded-xl p-3 pl-8 text-sm font-bold text-gray-800 outline-none focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/5 bg-white shadow-sm transition-all" />
              </div>
            </div>
            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Margen Detalle (%)</label>
              <div class="relative group">
                <input type="number" v-model="item.margen_detalle" @input="recalcular(index)" class="w-full border border-gray-400 rounded-xl p-3 text-sm font-bold text-gray-800 outline-none focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/5 bg-white shadow-sm transition-all" />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">%</span>
              </div>
            </div>
            <div class="space-y-2 text-left">
              <label class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Margen Mayor (%)</label>
              <div class="relative group">
                <input type="number" v-model="item.margen_mayor" @input="recalcular(index)" class="w-full border border-gray-400 rounded-xl p-3 text-sm font-bold text-gray-800 outline-none focus:border-[#0a3622] focus:ring-2 focus:ring-[#0a3622]/5 bg-white shadow-sm transition-all" />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px]">%</span>
              </div>
            </div>
          </div>

          <!-- Barra de Precios Sugeridos -->
          <div class="bg-green-50/60 p-4 rounded-xl flex flex-wrap items-center gap-8 text-[12px] font-bold text-[#0a3622] px-6 border border-green-400 shadow-inner">
            <span class="flex items-center gap-2">Venta al Detalle: <b class="text-[#0a3622] text-sm font-black tracking-tight">${{ item.precio_detalle_sugerido }}</b></span>
            <div class="w-1 h-4 bg-green-200 rounded-full hidden md:block"></div>
            <span class="flex items-center gap-2">Venta al Mayor: <b class="text-[#0a3622] text-sm font-black tracking-tight">${{ item.precio_mayor_sugerido }}</b></span>
          </div>

          <!-- SECCIÓN DE LOTES / CANTIDAD -->
          <div class="border-t border-gray-400 pt-8">
            <p class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
              <i class="pi pi-box text-xs"></i> {{ item.perecedero === 'PERECEDERO' ? 'REGISTRO DE LOTES' : 'CANTIDAD DE INGRESO' }}
            </p>

            <div v-if="item.perecedero === 'PERECEDERO'" class="space-y-4">
              <div v-for="(lote, lIdx) in item.lotes" :key="lIdx" class="grid grid-cols-12 gap-4 items-center bg-white p-4 rounded-2xl border border-gray-400 shadow-sm text-left">
                <div class="col-span-5 space-y-1.5">
                  <span class="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1">Código Lote</span>
                  <input v-model="lote.codigo_lote" class="w-full border border-gray-400 rounded-lg p-2.5 text-[11px] font-black text-blue-700 uppercase outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white shadow-sm" placeholder="EJ: L-100" />
                </div>
                <div class="col-span-4 space-y-1.5">
                  <span class="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1">Vencimiento</span>
                  <input type="date" :min="fechaMinimaLote" v-model="lote.fecha_vencimiento" class="w-full border border-gray-400 rounded-lg p-2.5 text-[11px] font-black text-gray-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white shadow-sm" />
                </div>
                <div class="col-span-2 space-y-1.5">
                  <span class="text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1">Cantidad</span>
                  <input type="number" v-model="lote.cantidad" class="w-full border border-gray-400 rounded-lg p-2.5 text-[11px] font-black text-center text-[#0a3622] outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white shadow-sm" />
                </div>
                <div class="col-span-1 flex items-center justify-end pt-5">
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
              <input type="number" v-model="item.cantidad" class="w-20 border border-gray-300 rounded-xl p-2 text-base font-bold text-center text-[#0a3622] outline-none focus:border-[#0a3622] focus:ring-4 focus:ring-green-50" />
              <div class="flex flex-col">
                <span class="text-[11px] font-black text-[#0a3622] uppercase tracking-widest">Unidades a ingresar</span>
              </div>
            </div>
          </div>

          <!-- Pie del Item: Resumen -->
          <div class="flex flex-wrap justify-between items-center border-t-2 border-gray-50 mt-4 text-left">
            <div class="flex items-center gap-4">
              <span class="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em]">Subtotal Producto</span>
              <b class="text-[#0a3622] text-xl font-black tracking-tighter bg-green-50 px-5 py-2 rounded-xl border border-green-100 shadow-sm">$ {{ (item.precio_unitario * calcularCantidad(index)).toFixed(2) }}</b>
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

    <!-- RESUMEN FINAL Y NAVEGACIÓN (Escalado hacia abajo) -->
    <div v-if="productosAgregados.length > 0" class="space-y-4 mt-8 pb-32 text-left">
      <!-- Tarjeta de Total General -->
      <div class="bg-[#0a3622] p-5 rounded-xl shadow-xl flex justify-between items-center text-white relative overflow-hidden border border-white/10">
        <div class="relative z-10 text-left">
          <p class="text-[12px] font-black text-green-300 uppercase tracking-[0.4em] mb-0.5">Inversión total de factura</p>
        </div>
        <div class="text-right z-10">
           <p class="text-3xl font-black text-white tracking-tighter shadow-sm leading-none">$ {{ totalFactura }}</p>
        </div>
        <div class="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div class="flex justify-between items-center px-1">
        <button @click="$emit('atras')" class="px-7 py-2.5 bg-white border border-gray-300 text-[#0a3622] font-black rounded-xl hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm text-left">
          <i class="pi pi-arrow-left text-[9px]"></i> Volver
        </button>
        <button @click="finalizarPaso" class="px-10 py-3 bg-[#0a3622] text-white font-black rounded-xl hover:bg-[#115033] transition-all text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-md group">
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
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Categoría *</label>
                  <Dropdown v-model="nuevoProducto.categoria_id" :options="categorias" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full border border-gray-300 rounded-xl text-sm font-bold bg-white" filter />
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Marca *</label>
                  <Dropdown v-model="nuevoProducto.marca_id" :options="marcas" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full border border-gray-300 rounded-xl text-sm font-bold bg-white" filter />
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Unidad de Medida *</label>
                  <Dropdown v-model="nuevoProducto.unidad_medida_id" :options="unidades" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full border border-gray-300 rounded-xl text-sm font-bold bg-white" />
                </div>
                <div class="space-y-2">
                  <label class="block text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] ml-1">Stock Mínimo *</label>
                  <input type="number" v-model="nuevoProducto.stock_minimo" class="w-full border border-gray-300 rounded-xl p-2 text-sm font-bold text-[#0a3622] focus:border-[#0a3622] outline-none transition-all shadow-sm bg-white" />
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
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import InputText from 'primevue/inputtext';
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
  const unidades = ref([]);

  const nuevoProducto = ref({
    nombre: '',
    categoria_id: null,
    marca_id: null,
    unidad_medida_id: null,
    stock_minimo: 0,
    perecedero: 'NORMAL'
  });

  //Busqueda de producto con Debounce
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
        const {data} = await axios.get(`http://localhost:8000/api/productos?search=${busqueda.value}`)
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

    const nuevoItem = {
      producto_id: prod.id,
      nombre: prod.nombre,
      perecedero: prod.perecedero,
      precio_unitario: 0.01,
      margen_detalle: 0,
      margen_mayor: 0,
      precio_detalle_sugerido: '0.01',
      precio_mayor_sugerido: '0.01',
      cantidad: 1,
      lotes: prod.perecedero === 'PERECEDERO' ? [{ codigo_lote: '', fecha_vencimiento: '', cantidad: 1 }] : []
    }
    productosAgregados.value.unshift(nuevoItem)
    recalcular(0);
    busqueda.value = ''
    mostrarResultados.value = false
  }

  // Función para abrir el modal y cargar los selectores
  const prepararNuevoProducto = async () => {
    try {
      const [resCat, resMar, resUni] = await Promise.all([
        axios.get('http://localhost:8000/api/categorias'),
        axios.get('http://localhost:8000/api/marcas'),
        axios.get('http://localhost:8000/api/unidades-medidas')
      ]);

      categorias.value = resCat.data;
      marcas.value = resMar.data;
      unidades.value = resUni.data;

      nuevoProducto.value = { nombre: '', categoria_id: null, marca_id: null, unidad_medida_id: null, stock_minimo: 5, perecedero: 'NORMAL' };
      mostrarModalNuevo.value = true;
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las listas del catálogo', error);
    }
  };

  // Función que añade el producto "en memoria" a la lista de compra
  const confirmarCreacionRapida = () => {
    if (!nuevoProducto.value.nombre || !nuevoProducto.value.categoria_id || !nuevoProducto.value.marca_id || !nuevoProducto.value.unidad_medida_id) {
      return Swal.fire('Incompleto', 'Complete los campos obligatorios del producto', 'warning');
    }

    const itemParaCompra = {
      producto_id: null,
      nombre: nuevoProducto.value.nombre,
      categoria_id: nuevoProducto.value.categoria_id,
      marca_id: nuevoProducto.value.marca_id,
      unidad_medida_id: nuevoProducto.value.unidad_medida_id,
      stock_minimo: nuevoProducto.value.stock_minimo,
      perecedero: nuevoProducto.value.perecedero,
      precio_unitario: 0.01,
      margen_detalle: 1,
      margen_mayor: 1,
      precio_detalle_sugerido: '0.01',
      precio_mayor_sugerido: '0.01',
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
    const costo = parseFloat(item.precio_unitario) || 0
    item.precio_detalle_sugerido = (costo * (1 + item.margen_detalle / 100)).toFixed(2)
    item.precio_mayor_sugerido = (costo * (1 + item.margen_mayor / 100)).toFixed(2)
  }
  const calcularCantidad = (index) => {
    const item = productosAgregados.value[index]
    if(item.perecedero === 'PERECEDERO'){
      return item.lotes.reduce((sum, l) => sum + (parseInt(l.cantidad) || 0), 0)
    }
    return parseInt(item.cantidad) || 0
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
    if(productosAgregados.value.length === 0){
      return Swal.fire('Error', 'Agregue al menos un producto para continuar', 'error')
    }
    //Validacion de campos vacios
    let incompleto = false
    productosAgregados.value.forEach(p => {
      if(p.precio_unitario <= 0) incompleto = true
      if(p.perecedero === 'PERECEDERO'){
        p.lotes.forEach(l => {
          if(!l.codigo_lote || !l.fecha_vencimiento || l.cantidad <= 0){
            incompleto = true
          }
        })
      }else{
        if(p.cantidad <= 0) incompleto = true
      }
    })
    if(incompleto){
      return Swal.fire('Datos faltantes', 'Por favor complete todos los campos de precios, lotes y cantidades.', 'warning')
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
