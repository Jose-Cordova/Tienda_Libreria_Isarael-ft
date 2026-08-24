import { defineStore } from 'pinia'
import productoDaniadoService from '@/services/productoDaniadoService'
import Swal from 'sweetalert2'

export const useProductoDaniadoStore = defineStore('productoDaniado', {
  state: () => ({
    registros: [],
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
    getRegistrosList: (state) => state.registros
  },

  actions: {
    async fetchRegistros(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await productoDaniadoService.getRegistros(params);
        this.registros = response.data.data || [];
        this.pagination = {
          current_page: response.data.current_page || 1,
          per_page: response.data.per_page || 5,
          total: response.data.total || 0,
          last_page: response.data.last_page || 1
        };
      } catch (error) {
        this.error = error;
        Swal.fire('Error', 'Error al cargar productos dañados.', 'error');
      } finally {
        this.loading = false;
      }
    },

    async createRegistro(nuevoRegistro) {
      this.loading = true;
      try {
        const response = await productoDaniadoService.createRegistro(nuevoRegistro);
        await this.fetchRegistros({ page: 1, per_page: this.pagination.per_page });
        return response;
      } finally {
        this.loading = false;
      }
    },

    async anularRegistro(id) {
      this.loading = true;
      try {
        const response = await productoDaniadoService.anular(id);
        await this.fetchRegistros({ page: this.pagination.current_page, per_page: this.pagination.per_page });
        return response;
      } finally {
        this.loading = false;
      }
    }
  }
})