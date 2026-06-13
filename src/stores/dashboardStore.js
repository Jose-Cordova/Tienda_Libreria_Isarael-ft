import { defineStore } from 'pinia'
import api from '@/services/api'

export const useDashboardStore = defineStore('dashboard',{
  state: () => ({
    stats: {
      ventas_hoy: 0,
      creditos_pendientes: 0,
      tendencia: { labels: [], data: [] },
      ganancias_perdidas: { labels: [], ganancias: [], perdidas: [] },
      top_productos: [],
      metodos_pago: {}
    },
    loading: false
  }),

  actions:{
    async fetchDashboardData(periodo = 'day') {
      this.loading = true
      try{
        const { data } = await api.get('/dashboard', { params: { periodo } })
        this.stats = data

      }catch(error){
        console.error('Error al obtener datos del dashboard:', error)

      }finally{
        this.loading = false
      }
    }
  }
})
