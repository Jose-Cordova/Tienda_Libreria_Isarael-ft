import { defineStore } from "pinia";
import compraService from "@/services/compraService";

export const useCompraStore = defineStore('compra',{
  state: () => ({
    compras: [],
    cargando: false,
    error: null,
    compraDetalle: null,
    textoBusqueda: '',
    filtros: {
      estado: '',
      proveedor_id: '',
      fecha_inicio: null,
      fecha_fin: null
    },
    paginacion: {
      total: 0,
      pagina_actual: 1,
      ultima_pagina: 1,
      filas_por_pagina: 10
    }
  }),

  actions: {
    //Obtenemos el listado de compras
    async obtenerCompras(pagina = 1, filas = 10){
      this.cargando = true
      this.error = null
      try{
        const fInicio = this.filtros.fecha_inicio ? this.filtros.fecha_inicio.toISOString().split('T')[0] : ''
        const fFin = this.filtros.fecha_fin ? this.filtros.fecha_fin.toISOString().split('T')[0] : ''
        const {data} = await compraService.listarCompras(
          pagina,
          this.textoBusqueda,
          filas,
          this.filtros.estado,
          this.filtros.proveedor_id,
          fInicio,
          fFin
        )
        this.compras = data.data

        this.paginacion = {
          total: data.total,
          pagina_actual: data.current_page,
          ultima_pagina: data.last_page,
          filas_por_pagina: data.per_page
        }
      }catch(err){
        this.error = 'Hubo un error al cargar el listado de compras.'
        console.error('STORE_ERROR (obtenerCompras):', err)
      }finally{
        this.cargando = false
      }
    },

    //Obtenemos toda la infromacion de una compra por su id
    async obtenerDetalleCompra(id){
      this.cargando = true
      try{
        const {data} = await compraService.obtenerCompra(id)
        this.compraDetalle = data
      }catch(err){
        console.error('STORE_ERROR (obtenerDetalleCompra):', err)
        throw err
      }finally{
        this.cargando = false
      }
    },

    //Registrammos una compra
    async registrarCompra(datosCompra){
      this.cargando = true
      try{
        const {data} = await compraService.registrarCompra(datosCompra)
        await this.obtenerCompras(1, this.paginacion.filas_por_pagina)
        return data
      }catch(err){
        console.error('STORE_ERROR (registrarCompra):', err)
        throw err
      }finally{
        this.cargando = false
      }
    },

    //Proseso de anulacion
    async anularCompra(id){
      this.cargando = true
      try{
        const {data} = await compraService.anularCompra(id)
        await this.obtenerCompras(this.paginacion.pagina_actual, this.paginacion.filas_por_pagina)
        return data
      }catch(err){
        console.error('STORE_ERROR (anularCompra):', err)
        throw err
      }finally{
        this.cargando = false
      }
    },

    //Resetiamos los filtros
    limpiarFiltros(){
      this.textoBusqueda = ''
      this.filtros = {
        estado: '',
        proveedor_id: '',
        fecha_inicio: null,
        fecha_fin: null
      }
    }
  }
})
