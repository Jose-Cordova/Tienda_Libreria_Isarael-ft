import api from './api'

export default {
  getProductos(params) {
    return api.get('/productos', { params })
  },
  createProducto(data) {
    return api.post('/productos', data)
  },
  updateProducto(id, data) {
    return api.put(`/productos/${id}`, data)
  },
  getAlertaStockMinimo() {
    return api.get('/productos/alerta-stock-minimo')
  },
  cambiarEstado(id) {
    return api.patch(`/productos/${id}/cambiar-estado`)
  }
}
