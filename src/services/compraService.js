import api from "./api";

const compraService = {
  listarCompras(pagina = 1, buscar = '', paginacion = 10, estado = '', proveedor_id = '', fecha_inicio = '', fecha_fin = ''){
    //Construimos los paramentros de consulta
    const params = new URLSearchParams({
      page: pagina,
      buscar: buscar,
      paginacion: paginacion
    })
    //Solo se agregaran si se elije un estado o proveedor
    if (estado) params.append('estado', estado);
    if (proveedor_id) params.append('proveedor_id', proveedor_id);
    if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
    if (fecha_fin) params.append('fecha_fin', fecha_fin);

    return api.get(`/compras?${params.toString()}`)
  },

  //Obtenemos la infromacion detalla de unan compra
  obtenerCompra(id){
    return api.get(`/compras/${id}`)
  },

  //Registramos compra
  registrarCompra(datos){
    return api.post('/compras', datos)
  },

  //Anulamos una compra
  anularCompra(id){
    return api.post(`/compras/${id}/anular`)
  }
}

export default compraService
