import { defineStore } from 'pinia'
import unidadMedidaService from '@/services/unidadMedidaService'
import Swal from 'sweetalert2'

export const useUnidadMedidaStore = defineStore('unidadMedida', {
  state: () => ({
    unidadesMedida: [],
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
    getUnidadesMedidaList: (state) => state.unidadesMedida
  },

  actions: {
    async fetchUnidadesMedida(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await unidadMedidaService.getUnidadesMedida(params);
        this.unidadesMedida = response.data.data || [];
        this.pagination = {
          current_page: response.data.current_page || 1,
          per_page: response.data.per_page || 5,
          total: response.data.total || 0,
          last_page: response.data.last_page || 1
        };
      } catch (error) {
        this.error = error;
        Swal.fire('Error', 'Error al cargar unidades de medida.', 'error');
      } finally {
        this.loading = false;
      }
    },

    async createUnidadMedida(newUnidadMedida) {
      this.loading = true;
      try {
        await unidadMedidaService.createUnidadMedida(newUnidadMedida);
        await this.fetchUnidadesMedida({ page: 1, per_page: this.pagination.per_page });
      } finally {
        this.loading = false;
      }
    },

    async updateUnidadMedida(id, updatedUnidadMedida) {
      this.loading = true;
      try {
        await unidadMedidaService.updateUnidadMedida(id, updatedUnidadMedida);
        await this.fetchUnidadesMedida({ page: this.pagination.current_page, per_page: this.pagination.per_page });
      } catch (error) {
        Swal.fire('Error', 'Error al actualizar unidad de medida.', 'error');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteUnidadMedida(id) {
      this.loading = true;
      try {
        await unidadMedidaService.deleteUnidadMedida(id);
        await this.fetchUnidadesMedida({ page: 1, per_page: this.pagination.per_page });
        Swal.fire('Éxito', 'Unidad de medida eliminada correctamente.', 'success');
      } catch (error) {
        if (error.response && error.response.status === 409) {
          Swal.fire('No se puede eliminar', 'La unidad de medida tiene productos asociados.', 'warning');
        } else {
          Swal.fire('Error', 'Error al eliminar unidad de medida.', 'error');
        }
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
})
