import { defineStore } from 'pinia';
import api from '@/services/api';

export const useVentaStore = defineStore('venta', {
  state: () => ({
    tipo_cliente: 'DETALLES',
    metodo_pago_id: null,
    estado: 'PAGADA',
    items: [],
    // Crédito: cliente existente
    cliente_credito_id: null,
    // Crédito: nuevo cliente
    nombre_cliente: null,
    dui_cliente: null,
    telefono_cliente: null,
    // Métodos de pago dinámicos
    metodosPago: [],
    transferenciaId: null,
  }),

  getters: {
    detalle: (state) => {
      return state.items.map(item => ({
        ...item,
        subtotal: item.cantidad * item.precio_unitario,
      }));
    },
    total: (state) => {
      return state.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    },
    cantidadItems: (state) => state.items.reduce((acc, item) => acc + item.cantidad, 0),
    isTransferencia: (state) => {
      return state.metodo_pago_id === state.transferenciaId;
    },
  },

  actions: {
    // Cargar métodos de pago desde API y obtener ID de transferencia
    async cargarMetodosPago() {
      try {
        const response = await api.get('/metodos-pagos');
        this.metodosPago = response.data;
        const transferencia = this.metodosPago.find(m => m.nombre === 'TRANSFERENCIA');
        this.transferenciaId = transferencia ? transferencia.id : null;
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
      }
    },

    agregarProducto(producto) {
      const cantidad = producto.cantidad || 1;
      const index = this.items.findIndex(i => i.producto_id === producto.id);

      const precio_unitario = this.tipo_cliente === 'MAYORISTA'
        ? producto.precio_mayor
        : producto.precio_detalle;

      if (index >= 0) {
        const nuevaCantidad = this.items[index].cantidad + cantidad;
        if (nuevaCantidad > producto.stock) {
          throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
        }
        this.items[index].cantidad = nuevaCantidad;
      } else {
        if (cantidad > producto.stock) {
          throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
        }
        this.items.push({
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_unitario,
          precio_mayor: producto.precio_mayor,
          precio_detalle: producto.precio_detalle,
          perecedero: producto.perecedero,
          stock: producto.stock,
          cantidad,
        });
      }
    },

    incrementarCantidad(producto_id) {
      const item = this.items.find(i => i.producto_id === producto_id);
      if (!item) return;
      if (item.cantidad + 1 > item.stock) {
        throw new Error(`No hay más stock disponible. Máximo: ${item.stock}`);
      }
      item.cantidad++;
    },

    decrementarCantidad(producto_id) {
      const item = this.items.find(i => i.producto_id === producto_id);
      if (item && item.cantidad > 1) {
        item.cantidad--;
      } else if (item && item.cantidad === 1) {
        this.eliminarProducto(producto_id);
      }
    },

    eliminarProducto(producto_id) {
      this.items = this.items.filter(i => i.producto_id !== producto_id);
    },

    cambiarTipoCliente(tipo) {
      this.tipo_cliente = tipo;
      this.items.forEach(item => {
        item.precio_unitario = tipo === 'MAYORISTA' ? item.precio_mayor : item.precio_detalle;
      });
    },

    // Establecer cliente crédito existente
    setClienteExistente(clienteId) {
      this.cliente_credito_id = clienteId;
      this.nombre_cliente = null;
      this.dui_cliente = null;
      this.telefono_cliente = null;
      this.estado = 'CREDITO';
      this.metodo_pago_id = null; // ← Limpiar método de pago al pasar a crédito
    },

    // Establecer cliente crédito nuevo (datos del formulario)
    setClienteNuevo({ nombre, dui, telefono }) {
      this.cliente_credito_id = null;
      this.nombre_cliente = nombre;
      this.dui_cliente = dui;
      this.telefono_cliente = telefono;
      this.estado = 'CREDITO';
      this.metodo_pago_id = null; // ← Limpiar método de pago al pasar a crédito
    },

    // Cancelar crédito y volver a contado
    cancelarCredito() {
      this.estado = 'PAGADA';
      this.cliente_credito_id = null;
      this.nombre_cliente = null;
      this.dui_cliente = null;
      this.telefono_cliente = null;
      // método_pago_id se mantiene null para que el usuario elija uno nuevo
    },

    construirPayload() {
  const payload = {
    user_id: 1,
    tipo_cliente: this.tipo_cliente,
    estado: this.estado,
    detalle: this.items.map(item => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
    })),
  };

  // Solo se agrega método_pago_id si NO es crédito
  if (this.estado !== 'CREDITO') {
    payload.metodo_pago_id = this.metodo_pago_id;
  } else {
    // Por seguridad, eliminar cualquier rastro de método de pago en crédito
    delete payload.metodo_pago_id;
  }

  if (this.estado === 'CREDITO') {
    if (this.cliente_credito_id) {
      payload.cliente_credito_id = this.cliente_credito_id;
    } else {
      payload.nombre = this.nombre_cliente;
      payload.dui = this.dui_cliente;
      payload.telefono = this.telefono_cliente;
    }
  }

  return payload;
},

    // Confirmar venta (envía al backend y limpia el carrito)
    async confirmarVenta() {
      const payload = this.construirPayload();
      const response = await api.post('/ventas', payload);
      this.resetCarrito();
      return response.data; // { venta: {...} }
    },

    resetCarrito() {
      this.items = [];
      this.estado = 'PAGADA';
      this.metodo_pago_id = null;
      this.cliente_credito_id = null;
      this.nombre_cliente = null;
      this.dui_cliente = null;
      this.telefono_cliente = null;
    },
  },
});
