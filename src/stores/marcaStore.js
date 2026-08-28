import { defineStore } from 'pinia'
import marcaService from '@/services/marcaService'

export const useMarcaStore = defineStore('marca', {
  state: () => ({
    marcas: [],
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
    getMarcasList: (state) => state.marcas
  },

  actions: {
    async fetchMarcas(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await marcaService.getMarcas(params);
        this.marcas = response.data.data || [];
        this.pagination = {
          current_page: response.data.current_page || 1,
          per_page: response.data.per_page || 5,
          total: response.data.total || 0,
          last_page: response.data.last_page || 1
        };
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createMarca(newMarca) {
      this.loading = true;
      try {
        await marcaService.createMarca(newMarca);
        await this.fetchMarcas({ page: 1, per_page: this.pagination.per_page });
      } finally {
        this.loading = false;
      }
    },

    async updateMarca(id, updatedMarca) {
      this.loading = true;
      try {
        await marcaService.updateMarca(id, updatedMarca);
        await this.fetchMarcas({ page: this.pagination.current_page, per_page: this.pagination.per_page });
      } finally {
        this.loading = false;
      }
    },

    async deleteMarca(id) {
      this.loading = true;
      try {
        await marcaService.deleteMarca(id);
        await this.fetchMarcas({ page: 1, per_page: this.pagination.per_page });
      } finally {
        this.loading = false;
      }
    }
  }
})
