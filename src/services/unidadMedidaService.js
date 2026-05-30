import api from './api'

export default {
  getUnidadesMedida(params = {}) {
    return api.get('/unidades-medidas', { params })
  },
  createUnidadMedida(data) {
    return api.post('/unidades-medidas', data)
  },
  updateUnidadMedida(id, data) {
    return api.put(`/unidades-medidas/${id}`, data)
  },
  deleteUnidadMedida(id) {
    return api.delete(`/unidades-medidas/${id}`)
  }
}
