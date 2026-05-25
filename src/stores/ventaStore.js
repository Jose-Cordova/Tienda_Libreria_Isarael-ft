import { defineStore } from 'pinia';
import api from '@/services/api';
import Swal from 'sweetalert2';

export const useVentaStore = defineStore('venta', {
  state: () => ({
    tipo_cliente: 'DETALLES',
    metodo_pago_id: null,
    estado: 'PAGADA',
    items: [],
    cliente_credito_id: null,
    nombre_cliente: null,
    dui_cliente: null,
    telefono_cliente: null,
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
  },

  actions: {
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

    construirPayload() {
      const payload = {
        user_id: 1, // TODO: obtener del authStore
        metodo_pago_id: this.metodo_pago_id,
        tipo_cliente: this.tipo_cliente,
        estado: this.estado,
        detalle: this.items.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
      };

      if (this.estado === 'CREDITO') {
        payload.cliente_credito_id = this.cliente_credito_id || undefined;
        payload.nombre = this.nombre_cliente;
        payload.dui = this.dui_cliente;
        payload.telefono = this.telefono_cliente;
      }

      return payload;
    },

    async confirmarVenta() {
      try {
        const payload = this.construirPayload();
        const response = await api.post('/ventas', payload);

        Swal.fire({
          icon: 'success',
          title: 'Venta registrada',
          text: `Correlativo: ${response.data.venta.correlativo}`,
          timer: 3000,
        });

        this.resetCarrito();
        return response.data;
      } catch (error) {
        if (error.response?.status === 422) {
          const { errors } = error.response.data;
          if (errors?.dui) {
            Swal.fire({
              icon: 'error',
              title: 'Error al registrar la venta',
              text: errors.dui[0],
            });
          } else {
            const firstError = Object.values(errors)[0][0];
            Swal.fire({
              icon: 'error',
              title: 'Error al registrar la venta',
              text: firstError,
            });
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo completar la venta. Intente de nuevo.',
          });
        }
        return false;
      }
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
