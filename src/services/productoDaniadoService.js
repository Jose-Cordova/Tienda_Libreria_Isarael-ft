import api from './api'

export default {
  getRegistros(params) {
    return api.get('/productos-daniados', { params })
  },
  createRegistro(data) {
    return api.post('/productos-daniados', data)
  },
  anular(id) {
    return api.post(`/productos-daniados/${id}/anular`)
  },
  aceptar(id, data) {
    return api.post(`/productos-daniados/${id}/aceptar`, data)
  },
  rechazar(id) {
    return api.post(`/productos-daniados/${id}/rechazar`)
  }
}
