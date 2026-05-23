import api from './api';

const proveedorService = {
  getProveedores(pagina = 1, buscar = '', paginacion = 10){
    return api.get(`/proveedores?page=${pagina}&buscar=${buscar}&paginacion=${paginacion}`)
  },

  getProveedor(id){
    return api.get(`/proveedores/${id}`)
  },

  createProveedor(data){
    return api.post('/proveedores', data)
  },

  updateProveedor(id, data){
    return api.put(`/proveedores/${id}`, data)
  },

  deleteProveedor(id){
    return api.delete(`/proveedores/${id}`)
  }
}

export default proveedorService;
