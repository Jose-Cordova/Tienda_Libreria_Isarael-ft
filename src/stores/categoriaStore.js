import { defineStore } from 'pinia'
import categoriaService from '@/services/categoriaService'
import Swal from 'sweetalert2'

export const useCategoriaStore = defineStore('categoria', {
  state: () => ({
    categorias: [],
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
    getCategoriasList: (state) => state.categorias
  },

  actions: {
    async fetchCategorias(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await categoriaService.getCategorias({ params });
        // La respuesta de Laravel paginada tiene data, current_page, etc.
        this.categorias = response.data.data || [];
        this.pagination = {
          current_page: response.data.current_page || 1,
          per_page: response.data.per_page || 5,
          total: response.data.total || 0,
          last_page: response.data.last_page || 1
        };
      } catch (error) {
        this.error = error;
        Swal.fire('Error', 'Error al cargar categorías.', 'error');
      } finally {
        this.loading = false;
      }
    },

    async createCategoria(newCategoria) {
      this.loading = true;
      try {
        await categoriaService.createCategoria(newCategoria);
        // Recargar la primera página después de crear
        await this.fetchCategorias({ page: 1, per_page: this.pagination.per_page });
      } finally {
        this.loading = false;
      }
    },

    async updateCategoria(id, updatedCategoria) {
      this.loading = true;
      try {
        await categoriaService.updateCategoria(id, updatedCategoria);
        await this.fetchCategorias({ page: this.pagination.current_page, per_page: this.pagination.per_page });
      } catch (error) {
        Swal.fire('Error', 'Error al actualizar categoría.', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteCategoria(id) {
      this.loading = true;
      try {
        await categoriaService.deleteCategoria(id);
        await this.fetchCategorias({ page: 1, per_page: this.pagination.per_page });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          Swal.fire('No se puede eliminar', 'La categoría tiene productos asociados.', 'warning');
        } else {
          Swal.fire('Error', 'Error al eliminar categoría.', 'error');
        }
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
})
