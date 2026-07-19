import { defineStore } from "pinia";
import api from "@/services/api";

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 0,
      last_page: 1
    },
    filters: {
      search: '',
      estado: null,
      role: null
    }
  }),
  actions: {
    //Obtenemos las listas de usuarios
    async fetchUsers(page = 1){
      this.loading = true
      try{
        const params = {
          page,
          per_page: this.pagination.per_page,
          ...this.filters
        }
        //Eliminar filtros vacios
        Object.keys(params).forEach(key => {
          if(params[key] === null || params[key] === '') delete params[key]
        })

        const response = await api.get('/users', {params})
        const data = response.data

        this.users = data.data
        this.pagination = {
          current_page: data.current_page,
          per_page: data.per_page,
          last_page: data.last_page
        }

      }catch(error){
        console.error('Error al cargar usuarios:', error)
        throw error

      }finally{
        this.loading = false
      }
    },

    //Creamos el usuario
    async createUser(userData){
      try{
        const response = await api.post('/users', userData)
        await this.fetchUsers(this.pagination.current_page)
        return response.data

      }catch(error){
        console.error('Error al crear usuario:', error)
        throw error
      }
    },

    //Actualizamos el usuario
    async updateUser(id, userData){
      try{
        const response = await api.put(`/users/${id}`, userData)
        await this.fetchUsers(this.pagination.current_page)
        return response.data

      }catch(error){
        console.error('Error al actualizar usuario:', error)
        throw error
      }
    },

    //Eliminamos usuario
    async deleteUser(id){
      try{
        await api.delete(`/users/${id}`)
        await this.fetchUsers(this.pagination.current_page)

      }catch(error){
        console.error('Error al eliminar usuario:', error)
        throw error
      }
    },

    //Cambiar estado
    async changeStatus(id){
      try{
        await api.patch(`/users/${id}/status`)
        await this.fetchUsers(this.pagination.current_page)

      }catch(error){
        console.error('Error al cambiar estado:', error)
        throw error
      }
    },

    //Reenviar invitacion
    async resendInvitation(id){
      try{
        await api.post(`/users/${id}/resend`)

      }catch(error){
        console.error('Error al reenviar invitación:', error)
        throw error
      }
    },

    //Actualizar filtros y recargar
    setFilters(filters){
      this.filters = {...this.filters, ...filters}
      this.fetchUsers(1)
    },

    //Resetiar filtros
    reserFilters(){
      this.filters = {search: '', estado: null, role: null}
      this.fetchUsers(1)
    }
  }
})
