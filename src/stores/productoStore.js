import { defineStore } from 'pinia'
import productoService from '@/services/productoService'

export const useProductoStore = defineStore('producto', {
  state: () => ({
    productos: [],
    loading: false,
    error: null,
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1
    }
  }),

  getters: {
    getProductosList: (state) => state.productos
  },

  actions: {
    async fetchProductos({ page = 1, per_page = 10, search = '', seccion = '' } = {}) {
      this.loading = true
      this.error = null
      try {
        const params = { page, per_page }
        if (search) params.search = search
        if (seccion) params.seccion = seccion
        if (seccion) params.seccion = seccion

        const response = await productoService.getProductos(params)
        this.productos = response.data.data
        this.pagination = {
          current_page: response.data.current_page,
          per_page: response.data.per_page,
          total: response.data.total,
          last_page: response.data.last_page
        }
      } catch (error) {
        this.error = error
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },

    async createProducto(newProducto) {
      this.loading = true
      try {
        await productoService.createProducto(newProducto)
        // Recargar la página actual después de crear
        await this.fetchProductos({
          page: this.pagination.current_page,
          per_page: this.pagination.per_page
        })
      } finally {
        this.loading = false
      }
    },

    async updateProducto(id, updatedProducto) {
      this.loading = true
      try {
        await productoService.updateProducto(id, updatedProducto)
        await this.fetchProductos({
          page: this.pagination.current_page,
          per_page: this.pagination.per_page
        })
      } finally {
        this.loading = false
      }
    },

    async cambiarEstado(id) {
      this.loading = true
      try {
        await productoService.cambiarEstado(id)
        await this.fetchProductos({
          page: this.pagination.current_page,
          per_page: this.pagination.per_page
        })
      } finally {
        this.loading = false
      }
    }
  }
})
