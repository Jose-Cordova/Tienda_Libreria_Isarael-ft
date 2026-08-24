import { defineStore } from 'pinia'
import cambioProductoService from '@/services/cambioProductoService'
import Swal from 'sweetalert2'

export const useCambioProductoStore = defineStore('cambioProducto', {
  state: () => ({
    cambios: [],
    loading: false,
    error: null,
    pagination: {
      current_page: 1,
      per_page: 5,
      total: 0,
      last_page: 1
    }
  }),

  getters: {
    getCambiosList: (state) => state.cambios
  },

  actions: {
    async fetchCambios(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await cambioProductoService.getRegistros(params);
        this.cambios = response.data.data || [];
        this.pagination = {
          current_page: response.data.current_page || 1,
          per_page: response.data.per_page || 5,
          total: response.data.total || 0,
          last_page: response.data.last_page || 1
        };
      } catch (error) {
        this.error = error;
        Swal.fire('Error', 'Error al cargar los cambios de producto.', 'error');
      } finally {
        this.loading = false;
      }
    },

    async createCambio(nuevoCambio) {
      this.loading = true;
      try {
        const response = await cambioProductoService.createRegistro(nuevoCambio);
        await this.fetchCambios({ page: 1, per_page: this.pagination.per_page });
        return response;
      } finally {
        this.loading = false;
      }
    },

    async anularCambio(id) {
      this.loading = true;
      try {
        const response = await cambioProductoService.anular(id);
        await this.fetchCambios({ page: this.pagination.current_page, per_page: this.pagination.per_page });
        return response;
      } finally {
        this.loading = false;
      }
    },

    async aceptarCambio(id, data) {
      this.loading = true;
      try {
        const response = await cambioProductoService.aceptar(id, data);
        await this.fetchCambios({ page: this.pagination.current_page, per_page: this.pagination.per_page });
        return response;
      } finally {
        this.loading = false;
      }
    },

    async rechazarCambio(id) {
      this.loading = true;
      try {
        const response = await cambioProductoService.rechazar(id);
        await this.fetchCambios({ page: this.pagination.current_page, per_page: this.pagination.per_page });
        return response;
      } finally {
        this.loading = false;
      }
    }
  }
})