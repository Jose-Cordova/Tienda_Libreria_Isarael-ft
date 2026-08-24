import api from './api'

export default {
  getRegistros(params) {
    return api.get('/cambios-productos', { params })
  },
  getLotesVencidos(params) {
    return api.get('/productos-daniados/lotes-vencidos', { params })
  },
  createRegistro(data) {
    return api.post('/cambios-productos', data)
  },
  anular(id) {
    return api.post(`/cambios-productos/${id}/anular`)
  },
  aceptar(id, data) {
    return api.post(`/cambios-productos/${id}/aceptar`, data)
  },
  rechazar(id) {
    return api.post(`/cambios-productos/${id}/rechazar`)
  }
}