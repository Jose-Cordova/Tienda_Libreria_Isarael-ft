// src/stores/historialStore.js
import { defineStore } from 'pinia';
import api from '@/services/api';

export const useHistorialStore = defineStore('historial', {
  state: () => ({
    ventas: [],
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 10, // valor inicial por defecto (puedes cambiarlo a 15 si prefieres)
    filters: {
      estado: null,
      user_id: null,
      tipoCliente: null,
      estado_producto: null,
      metodo_pago_id: null,
      fecha_inicio: null,
      fecha_fin: null,
    },
    loading: false,
    // Totales globales (no paginados) recibidos del backend
    totales: {
      pagadas: { cantidad: 0, total: 0 },
      credito: { cantidad: 0, total: 0 },
      anuladas: { cantidad: 0, total: 0 },
    },
  }),

  actions: {
    async fetchVentas(page = 1) {
      this.loading = true;
      try {
        const params = {
          page,
          per_page: this.perPage,
          ...this.filters,
        };
        const response = await api.get('/ventas', { params });
        const data = response.data;
        this.ventas = data.data;
        this.currentPage = data.current_page;
        this.lastPage = data.last_page;
        this.total = data.total;
        // Guardar totales globales provenientes del backend
        if (data.totales) {
          this.totales = data.totales;
        }
      } catch (error) {
        console.error('Error al obtener ventas:', error);
      } finally {
        this.loading = false;
      }
    },

    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },

    resetFilters() {
      this.filters = {
        estado: null,
        user_id: null,
        tipoCliente: null,
        estado_producto: null,
        metodo_pago_id: null,
        fecha_inicio: null,
        fecha_fin: null,
      };
    },

    setPage(event) {
      // event.page es la página en base 0 -> Laravel usa base 1
      this.fetchVentas(event.page + 1);
    },

    setPerPage(newRows) {
      this.perPage = newRows;
      this.fetchVentas(1); // Al cambiar la cantidad, volvemos a la página 1
    },
  },
});
