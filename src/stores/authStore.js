import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null
  }),

  // Persistir en sessionStorage: se borra al cerrar el navegador
  persist: {
    storage: sessionStorage,
  },

  getters: {
    isAuthenticated: (state) => !!state.token,

    // Verificar si el usuario tiene rol de administrador
    isAdmin: (state) => {
      return state.user?.roles?.some(role => role.name === 'ADMIN' || role.name === 'admin')
    },
    // Verificar si el usuario tiene rol de vendedor
    isVendedor: (state) => {
      return state.user?.roles?.some(role => role.name === 'VENDEDOR' || role.name === 'vendedor')
    },
  },

  actions: {

    async login(credentials) {
      try {
        const { data } = await api.post('/auth/login', credentials)

        this.token = data.access_token
        this.user = data.user

        // Redirigir según el rol del usuario
        if (this.isVendedor && !this.isAdmin) {
          router.push('/punto-venta') // Vendedor va directo a punto de venta
        } else {
          router.push('/') // Admin va al dashboard
        }
      } catch (error) {
        console.error('Error en login:', error)
        throw error
      }
    },

    async register(payload) {
      try {
        const { data } = await api.post('/auth/register', payload)

        this.token = data.access_token
        this.user = data.user

        router.push('/')
      } catch (error) {
        console.error('Error en registro:', error)
        throw error
      }
    },

    async logout() {
      try {
        if (this.token) {
          await api.post('/auth/logout')
        }
      } catch (error) {
        console.warn('Error al cerrar sesión:', error)
      } finally {
        this.$reset()
        router.push('/login') // Redirigir al Login tras cerrar sesión
      }
    },

    async fetchUser(){
      try{
        const {data} = await api.get('/auth/me')
        this.user = data //Actualizamos con los datos nuevos
      }catch(error){
        console.error("Error al actaulizar los datos del usuario.", error)
      }
    }
  }
})
