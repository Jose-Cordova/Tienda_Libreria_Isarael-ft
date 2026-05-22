<template>
  <div class="punto-venta">

    <div class="seccion-izquierda">
      <div class="busqueda">
        <i class="pi pi-search text-gray-400"></i>
        <input v-model="busqueda" type="text" placeholder="Buscar producto..." />
      </div>

      <div class="categorias">
        <button
          v-for="cat in categorias"
          :key="cat"
          :class="{ activa: categoriaSeleccionada === cat }"
          @click="categoriaSeleccionada = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div class="productos-grid custom-scrollbar">
        <div
          v-for="producto in productosFiltrados"
          :key="producto.id"
          class="producto-card"
          @click="abrirModalProducto(producto)"
        >
          <div>
            <span class="nombre">{{ producto.nombre }}</span>
            <span class="marca">{{ producto.marca }}</span>
            <span class="precio">${{ producto.precio_detalle.toFixed(2) }}</span>
          </div>
          <span :class="producto.stock > 5 ? 'badge-disp' : 'badge-bajo'">
            {{ producto.stock > 5 ? `${producto.stock} DISP.` : 'STOCK BAJO' }}
          </span>
        </div>
      </div>
    </div>

    <div class="seccion-derecha">
      <div class="carrito-header">
        <div class="flex-center">
          <i class="pi pi-shopping-cart text-lg mr-2"></i>
          <h3>Venta Actual</h3>
        </div>
        <span class="badge">{{ carrito.length }}</span>
      </div>

      <div class="carrito-body custom-scrollbar">
        <div v-if="carrito.length === 0" class="vacio">
          <i class="pi pi-shopping-bag text-5xl mb-3 opacity-20"></i>
          <p>Sin productos</p>
        </div>

        <div v-else class="items">
          <div v-for="item in carrito" :key="item.id" class="item-carrito">
            <span>{{ item.nombre }} <b>x{{ item.cantidad }}</b></span>
            <span>${{ (item.precio * item.cantidad).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <div class="carrito-footer">
        <div class="total-row subt">Subtotal <span>${{ total.toFixed(2) }}</span></div>
        <div class="total-row gran-total">TOTAL <span>${{ total.toFixed(2) }}</span></div>

        <div class="botones-pago">
          <button
            :class="metodoPago === 'Efectivo' ? 'btn-metodo activo' : 'btn-metodo inactivo'"
            @click="metodoPago = 'Efectivo'"
          >
            <i class="pi pi-money-bill"></i> Efectivo
          </button>
          <button
            :class="metodoPago === 'Transferencia' ? 'btn-metodo activo' : 'btn-metodo inactivo'"
            @click="metodoPago = 'Transferencia'"
          >
            <i class="pi pi-mobile"></i> Transferencia
          </button>
        </div>

        <div v-if="metodoPago === 'Efectivo'" class="input-pago">
          <label>Pagó con:</label>
          <input type="number" v-model="pagoCon" placeholder="$0.00" />
        </div>

        <button class="btn-fiado" @click="abrirModalCliente"><i class="pi pi-credit-card mr-2"></i> Dar a crédito (fiado)</button>

        <div v-if="metodoPago === 'Crédito' && clienteSeleccionado" class="cliente-info">
          Fiando a: <b>{{ clienteSeleccionado }}</b>
        </div>

        <button class="btn-cobrar" @click="cobrar">✓ Finalizar Venta</button>
        <button class="btn-limpiar" @click="limpiarVenta">✕ Limpiar Venta</button>
      </div>
    </div>

    <div v-if="mostrarModalProd" class="modal" @click.self="mostrarModalProd = false">
      <div class="modal-box modal-green-border">
        <button class="btn-close" @click="mostrarModalProd = false">✕</button>

        <h3 class="modal-title">{{ prodSeleccionado?.nombre }}</h3>
        <p class="modal-subtitle">
          {{ prodSeleccionado?.marca }} ${{ prodSeleccionado?.precio_detalle.toFixed(2) }} detalle / ${{ prodSeleccionado?.precio_mayorista.toFixed(2) }} mayorista
        </p>

        <label class="lbl">UNIDAD</label>
        <select v-model="unidadSeleccionada" class="select-input">
          <option value="Unidad (1x1)">Unidad (1x1)</option>
          <option value="Caja">Caja cerrada</option>
        </select>

        <label class="lbl mt-3">TIPO PRECIO</label>
        <select v-model="tipoPrecio" class="select-input">
          <option value="Detalle">Detalle</option>
          <option value="Mayorista">Mayorista</option>
        </select>

        <div class="precio-dinamico">
          Precio: <b>${{ precioCalculadoModal.toFixed(2) }}</b> / unidad
        </div>

        <div class="botones-modal">
          <button class="btn-cancelar" @click="mostrarModalProd = false">Cancelar</button>
          <button class="btn-guardar" @click="agregarAlCarrito">+ Agregar al carrito</button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalCliente" class="modal" @click.self="mostrarModalCliente = false">
      <div class="modal-box modal-green-border modal-lg">
        <button class="btn-close" @click="mostrarModalCliente = false">✕</button>

        <h3 class="modal-title">Seleccionar Cliente</h3>
        <p class="modal-subtitle-client">Busca un cliente existente o crea uno nuevo</p>

        <label class="lbl">BUSCAR CLIENTE</label>
        <div class="input-icon">
          <i class="pi pi-search absolute left-3 text-gray-400"></i>
          <input type="text" placeholder="Nombre o teléfono..." />
        </div>

        <div class="divider">
          <span>O crear nuevo</span>
        </div>

        <div class="grid-2">
          <div>
            <label class="lbl">NOMBRE COMPLETO *</label>
            <input v-model="nuevoClienteNombre" type="text" class="select-input bg-green-light" placeholder="Ej: Ana Martínez" />
          </div>
          <div>
            <label class="lbl">TELÉFONO</label>
            <input v-model="nuevoClienteTelefono" type="text" class="select-input bg-green-light" placeholder="Ej: 7018-5432" />
          </div>
        </div>

        <div class="botones-modal mt-4">
          <button class="btn-cancelar" @click="mostrarModalCliente = false">Cancelar</button>
          <button class="btn-guardar" @click="confirmarCliente">✓ Confirmar Cliente</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Datos de prueba //
const categorias = ref(['Todas', 'Bebidas', 'Golosinas', 'Limpieza', 'Aseo Personal', 'Librería', 'Medicamentos']);
const categoriaSeleccionada = ref('Todas');
const busqueda = ref('');
const carrito = ref([]);

const productos = ref([
  { id: 1, nombre: 'Coca Cola 500ml', marca: 'Coca-Cola', categoria: 'Bebidas', precio_detalle: 1.25, precio_mayorista: 1.10, stock: 48 },
  { id: 2, nombre: 'Coca Cola 250ml', marca: 'Coca-Cola', categoria: 'Bebidas', precio_detalle: 0.75, precio_mayorista: 0.65, stock: 60 },
  { id: 3, nombre: 'Agua Pura 500ml', marca: 'Sin marca', categoria: 'Bebidas', precio_detalle: 0.50, precio_mayorista: 0.40, stock: 80 },
  { id: 4, nombre: 'Churro Diana', marca: 'Diana', categoria: 'Golosinas', precio_detalle: 0.25, precio_mayorista: 0.20, stock: 120 },
  { id: 5, nombre: 'Snickers', marca: 'Sin marca', categoria: 'Golosinas', precio_detalle: 0.75, precio_mayorista: 0.60, stock: 4 },
  { id: 6, nombre: 'Jabón de trastes', marca: 'Sin marca', categoria: 'Limpieza', precio_detalle: 1.50, precio_mayorista: 1.35, stock: 15 },
  { id: 7, nombre: 'Lapicero Bic', marca: 'Bic', categoria: 'Librería', precio_detalle: 0.30, precio_mayorista: 0.25, stock: 50 },
  { id: 8, nombre: 'Pasta Colgate', marca: 'Colgate', categoria: 'Aseo Personal', precio_detalle: 1.75, precio_mayorista: 1.50, stock: 2 }
]);

// Variables del modal PRODUCTO //
const mostrarModalProd = ref(false);
const prodSeleccionado = ref(null);
const tipoPrecio = ref('Detalle');
const unidadSeleccionada = ref('Unidad (1x1)');

// Variables del modal CLIENTE //
const mostrarModalCliente = ref(false);
const nuevoClienteNombre = ref('');
const nuevoClienteTelefono = ref('');
const clienteSeleccionado = ref(null);

// Variables de Cobro //
const metodoPago = ref('Efectivo');
const pagoCon = ref('');

//  Lógica del buscador //
const productosFiltrados = computed(() => {
  return productos.value.filter(p => {
    const pasaTexto = p.nombre.toLowerCase().includes(busqueda.value.toLowerCase());
    const pasaCategoria = categoriaSeleccionada.value === 'Todas' || p.categoria === categoriaSeleccionada.value;
    return pasaTexto && pasaCategoria;
  });
});

// Suma del carrito //
const total = computed(() => {
  return carrito.value.reduce((suma, item) => suma + (item.precio * item.cantidad), 0);
});

// Dinámico Modal //
const precioCalculadoModal = computed(() => {
  if (!prodSeleccionado.value) return 0;
  return tipoPrecio.value === 'Mayorista'
    ? prodSeleccionado.value.precio_mayorista
    : prodSeleccionado.value.precio_detalle;
});

//  Funciones PRODUCTOS //
const abrirModalProducto = (producto) => {
  prodSeleccionado.value = producto;
  tipoPrecio.value = 'Detalle';
  unidadSeleccionada.value = 'Unidad (1x1)';
  mostrarModalProd.value = true;
};

const agregarAlCarrito = () => {
  const precioFinal = precioCalculadoModal.value;
  const existe = carrito.value.find(item => item.id === prodSeleccionado.value.id && item.precio === precioFinal);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.value.push({
      id: prodSeleccionado.value.id,
      nombre: prodSeleccionado.value.nombre,
      precio: precioFinal,
      cantidad: 1,
      tipo: tipoPrecio.value
    });
  }
  mostrarModalProd.value = false;
};

//  Funciones CLIENTES (FIADO) //
const abrirModalCliente = () => {
  mostrarModalCliente.value = true;
};

const confirmarCliente = () => {
  if (nuevoClienteNombre.value.trim() === '') {
    alert("Por favor ingrese el nombre del cliente");
    return;
  }
  clienteSeleccionado.value = nuevoClienteNombre.value;
  metodoPago.value = 'Crédito';
  mostrarModalCliente.value = false;
};

//  Funciones VENTA //
const limpiarVenta = () => {
  carrito.value = [];
  pagoCon.value = '';
  metodoPago.value = 'Efectivo';
  clienteSeleccionado.value = null;
  nuevoClienteNombre.value = '';
  nuevoClienteTelefono.value = '';
};

const cobrar = () => {
  if (carrito.value.length === 0) return alert("El carrito está vacío");
  if (metodoPago.value === 'Crédito' && !clienteSeleccionado.value) {
    return alert("Debe seleccionar un cliente para dar a crédito");
  }

  alert(`¡Venta cobrada con éxito!\nMétodo: ${metodoPago.value}\nTotal: $${total.value.toFixed(2)}`);
  limpiarVenta();
};
</script>

<style scoped>
/*  ESTRUCTURA PRINCIPAL */
.punto-venta { display: flex; gap: 20px; padding: 20px; height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6;}

.seccion-izquierda { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.busqueda { display: flex; align-items: center; border: 1px solid #d1d5db; padding: 10px 15px; border-radius: 8px; margin-bottom: 20px; background: white; }
.busqueda input { border: none; outline: none; width: 100%; margin-left: 10px; font-size: 14px; color: #4b5563;}

.categorias { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.categorias button { padding: 6px 16px; border: 1px solid #a7f3d0; border-radius: 20px; background: white; color: #0a3622; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s;}
.categorias button.activa { background: #168a3b; color: white; border-color: #168a3b; }

.productos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; overflow-y: auto; padding-right: 5px; align-content: flex-start;}
.producto-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 15px; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; min-height: 140px; transition: 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);}
.producto-card:hover { border-color: #168a3b; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transform: translateY(-2px);}
.nombre { font-weight: 700; color: #1f2937; display: block; font-size: 14px;}
.marca { font-size: 11px; color: #9ca3af; display: block; margin-top: 2px;}
.precio { font-size: 16px; font-weight: 800; margin-top: 8px; display: block; color: #0a3622;}

.badge-disp { background: #e6f4ea; color: #168a3b; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; margin-top: 10px; display: inline-block; width: max-content;}
.badge-bajo { background: #fef3c7; color: #d97706; padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; margin-top: 10px; display: inline-block; width: max-content;}

/*  CARRITO Y COBRO */
.seccion-derecha { width: 340px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 4px 6px rgba(0,0,0,0.02);}
.carrito-header { background: #0a3622; color: white; padding: 15px 20px; border-radius: 11px 11px 0 0; display: flex; justify-content: space-between; align-items: center; }
.flex-center { display: flex; align-items: center; gap: 8px; }
.carrito-header h3 { margin: 0; font-size: 15px; font-weight: 700;}
.badge { background: #168a3b; color: white; padding: 2px 10px; border-radius: 12px; font-weight: 800; font-size: 12px;}

.carrito-body { flex: 1; padding: 15px; overflow-y: auto; background: #fafafa; }
.vacio { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #9ca3af; font-weight: 600; font-size: 14px;}
.bolsa-icono { font-size: 40px; margin-bottom: 10px; opacity: 0.5;}
.item-carrito { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151;}

.carrito-footer { padding: 20px; background: white; border-radius: 0 0 11px 11px; border-top: 1px solid #e5e7eb;}
.total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
.subt { color: #6b7280; font-size: 13px; font-weight: 600;}
.gran-total { font-size: 18px; font-weight: 800; margin-bottom: 20px; color: #0a3622;}

/* AJUSTES A BOTONES DE MÉTODO DE PAGO */
.botones-pago { display: flex; gap: 10px; margin-bottom: 15px; }
.btn-metodo { flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 800; transition: all 0.2s ease; display: flex; justify-content: center; align-items: center; gap: 6px;}
.btn-metodo.activo { background: #0a3622; color: white; border: 1px solid #0a3622; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.btn-metodo.inactivo { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

.input-pago { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; font-size: 13px; font-weight: 600; color: #4b5563;}
.input-pago input { width: 60%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-weight: bold; outline: none;}
.input-pago input:focus { border-color: #168a3b;}

.btn-fiado { width: 100%; padding: 12px; border: 2px dashed #10b981; color: #10b981; background: #f0fdf4; border-radius: 8px; margin-bottom: 12px; cursor: pointer; font-weight: 700; font-size: 13px;}
.cliente-info { font-size: 12px; color: #0a3622; background: #e6f4ea; padding: 8px; border-radius: 6px; text-align: center; margin-bottom: 12px;}
.btn-cobrar { width: 100%; padding: 14px; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 14px; margin-bottom: 10px;}
.btn-limpiar { width: 100%; padding: 12px; background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;}

/* MODALES */
.modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px);}
.modal-box { background: white; padding: 30px; border-radius: 30px; width: 400px; position: relative; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border-top-left-radius: 30px; border-bottom-right-radius: 30px;}
.modal-green-border { border: 2px solid #0a3622; border-top-left-radius: 40px !important; border-bottom-right-radius: 40px !important; border-top-right-radius: 10px !important; border-bottom-left-radius: 10px !important;}
.modal-lg { width: 450px; }

.btn-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 18px; color: #6b7280; cursor: pointer;}
.modal-title { margin: 0; color: #0a3622; font-size: 20px; font-weight: 800;}
.modal-subtitle { color: #6b7280; font-size: 12px; margin-top: 4px; margin-bottom: 20px; font-weight: 600;}
.modal-subtitle-client { color: #9ca3af; font-size: 12px; margin-top: 4px; margin-bottom: 25px;}

.lbl { font-size: 10px; color: #168a3b; font-weight: 800; display: block; margin-bottom: 6px; letter-spacing: 0.5px;}
.mt-3 { margin-top: 15px; }
.mt-4 { margin-top: 25px; }

.select-input { width: 100%; padding: 10px 15px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; color: #374151; outline: none; background: white;}
.select-input:focus { border-color: #168a3b; box-shadow: 0 0 0 2px #dcfce7;}
.bg-green-light { background: #edfcf5; border-color: #a7f3d0;}

.precio-dinamico { text-align: center; margin: 20px 0; font-size: 14px; color: #374151; font-weight: 600;}
.precio-dinamico b { font-size: 16px; color: #0a3622; font-weight: 800;}

.botones-modal { display: flex; gap: 15px; justify-content: space-between;}
.btn-cancelar { flex: 1; padding: 12px; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 20px; font-weight: 700; cursor: pointer;}
.btn-guardar { flex: 2; padding: 12px; background: #0a3622; color: white; border: none; border-radius: 20px; font-weight: 700; cursor: pointer;}

/* Estilos específicos Modal Cliente */
.input-icon { position: relative; display: flex; align-items: center;}
.input-icon span { position: absolute; left: 12px; font-size: 14px;}
.input-icon input { width: 100%; padding: 10px 15px 10px 35px; border: 1px solid #d1d5db; background: #f9fafb; border-radius: 8px; outline: none; font-size: 13px;}

.divider { text-align: center; margin: 20px 0; position: relative; }
.divider::before { content: ""; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: #e5e7eb; z-index: 1;}
.divider span { position: relative; background: white; padding: 0 10px; color: #9ca3af; font-size: 11px; z-index: 2;}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
</style>
