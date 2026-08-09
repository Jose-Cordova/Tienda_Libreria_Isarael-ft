import { defineStore } from "pinia";
import cronogramaService from "@/services/cronogramaService";
import api from "@/services/api";

export const useCronogramaStore = defineStore('cronograma', {
  state: () => ({
    eventos: [],
    proveedores: [],
    loading: false
  }),

  actions: {
    //Cargar eventos con filltros de fecha
    async fetchEventos(start = null, end = null){
      this.loading = true
      try{
        //
        const params = {}
        if(start) params.fecha_inicio = start
        if(end) params.fecha_fin = end

        const {data} = await cronogramaService.getEventos(params)
        this.eventos = data.map(evento => ({
          id: evento.id,
          title: evento.proveedor?.nombre || 'Proveedor',
          start: typeof evento.fecha === 'string' ? evento.fecha.split('T')[0] : evento.fecha,
          allDay: true,
          extendedProps: {
            descripcion: evento.contenido,
            proveedor_id: evento.proveedor_id
          }
        }))

      }catch(error){
        console.error('Error al cargar eventos: ', error)

      }finally{
        this.loading = false
      }
    },

    //Cargar proveedores para el dropdown
    async fetchProveedores(){
      //Evitar recragar si ya existe
      if(this.proveedores.length > 0) return

      try{
        const {data} = await api.get('/proveedores?paginacion=100')
        this.proveedores = data.data || []

      }catch(error){
        console.error('Error al cargar proveedores: ', error)
        throw error
      }
    },

    //Craer un nuevo evento
    async crearEvento(datos){
      try{
        const {data} = await cronogramaService.createEvento(datos)

        const fechaLimpia = typeof data.evento.fecha === 'string' ? data.evento.fecha.split('T')[0] : data.evento.fecha
        //Agregar el evento a la lista local con el fromato esperado por FullCalendar
        this.eventos.push({
          id: data.evento.id,
          title: data.evento.proveedor?.nombre || 'Proveedor',
          start: fechaLimpia,
          allDay: true,
          extendedProps: {
            descripcion: data.evento.contenido,
            proveedor_id: data.evento.proveedor_id
          }
        })
        return data

      }catch(error){
        console.error('Error al crear evento: ', error)
        throw error
      }
    },

    //Actualizar un evento
    async actualizarEvento(id, datos){
      try{
        const {data} = await cronogramaService.updateEvento(id, datos)

        const fechaLimpia = typeof data.evento.fecha === 'string' ? data.evento.fecha.split('T')[0] : data.evento.fecha
        //Actualizar en la lista local
        const index = this.eventos.findIndex(e => e.id === id)
        if(index !== -1){
          this.eventos[index] = {
            id: data.evento.id,
            title: data.evento.proveedor?.nombre || 'Proveedor',
            start: fechaLimpia,
            allDay: true,
            extendedProps: {
              descripcion: data.evento.contenido,
              proveedor_id: data.evento.proveedor_id
            }
          }
        }
        return data

      }catch(error){
        console.error('Error al actualizar evento: ', error)
        throw error
      }
    },

    //Eliminar un evento
    async eliminarEvento(id){
      try{
        await cronogramaService.deleteEvento(id)

        //Eliminar de la lista local
        this.eventos = this.eventos.filter(e => e.id !== id)

      }catch(error){
        console.error('Error al eliminar evento: ', error)
        throw error
      }
    }
  }
})
