import { defineStore } from "pinia";
import api from "@/services/api";

export const useNotaStore = defineStore('nota', {
  state: () => ({
    notas: [],
    loading: false,
    pagination: {
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1
    }
  }),

  actions: {
    async fetchNotas(page = 1){
      this.loading = true
      try{
        const params = {page, per_page: this.pagination.per_page}
        const {data} = await api.get('/notas', {params})
        this.notas = data.data
        this.pagination = {
          current_page: data.current_page,
          per_page: data.per_page,
          total: data.total,
          last_page: data.last_page
        }

      }catch(error){
        console.error('Error al cargar notas', error)
        throw error

      }finally{
        this.loading = false
      }
    },

    async crearNota(datos){
      try{
        const {data} = await api.post('/notas', datos)
        //Agregamos al inicio de la lista mas reciente
        this.notas.unshift(data.nota)
        this.pagination.total += 1
        return data

      }catch(error){
        console.error('Error al crear nota: ', error)
        throw error
      }
    },

    async actualizarNota(id, datos){
      try{
        const {data} = await api.put(`/notas/${id}`, datos)
        const index = this.notas.findIndex(n => n.id === id)
        if(index !== -1){
          this.notas[index] = data.nota
        }
        return data

      }catch(error){
        console.error('Error al actualizar la nota: ', error)
        throw error
      }
    },

    async eliminarNota(id){
      try{
        await api.delete(`/notas/${id}`)
        this.notas = this.notas.filter(n => n.id !== id)
        this.pagination.total -= 1

      }catch(error){
        console.error('Error al eliminar la nota: ', error)
        throw error
      }
    }
  }
})
