import { defineStore } from 'pinia'
import proveedorService from '@/services/proveedorService'

export const useProveedorStore = defineStore('proveedor', {
  state: () => ({
    proveedores: [],
    loading: false,
    searchQuery: '',
    paginacion: {
      total: 0,
      pagina_actual: 1,
      ultima_pagina: 1,
      filas_por_pagina: 10
    }
  }),

  getters: {
    filteredProveedores: (state) => {
      const query = state.searchQuery.toLowerCase().trim()
      if(!query) return state.proveedores

      return state.proveedores.filter(p => p.nombre.toLowerCase().includes(query))
    }
  },

  actions: {
    async fetchProveedores(pagina = 1, filas = 10){
      this.loading = true
      try{
        const { data } = await proveedorService.getProveedores(pagina, this.searchQuery, filas)
        this.proveedores = data.data
        this.paginacion = {
          total: data.total,
          pagina_actual: data.current_page,
          ultima_pagina: data.last_page,
          filas_por_pagina: data.per_page
        }
      }catch(err){
        this.error = 'Error al cargar los proveedores'
        console.error(err)
        throw err
      }finally{
        this.loading = false
      }
    },

    async crearProveedor(proveedor){
      this.loading = true
      try{
        const { data } = await proveedorService.createProveedor(proveedor)
        this.proveedores.unshift(data.proveedor)
        return data
      }catch(err){
        this.error = 'Error al crear el proveedor'
        console.error(err)
        throw err
      }finally{
        this.loading = false
      }
    },

    async editarProveedor(id, proveedor){
      this.loading = true
      try{
        const { data } = await proveedorService.updateProveedor(id, proveedor)
        const index = this.proveedores.findIndex(p => p.id === id)
        if(index !== -1){
          this.proveedores[index] = data.proveedor
        }
        return data
      }catch(err){
        this.error = 'Error al actualizar el proveedor';
        console.error(err)
        throw err
      }finally{
        this.loading = false
      }
    },

    async eliminarProveedor(id){
      try{
        await proveedorService.deleteProveedor(id)
        this.proveedores = this.proveedores.filter(p => p.id !== id)
      }catch(err){
        this.error = 'Error al eliminar el proveedor'
        console.error(err)
        throw err
      }
    }
  }
})
