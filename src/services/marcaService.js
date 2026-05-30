import api from './api'

export default {
  getMarcas(params = {}) {
    return api.get('/marcas', { params })
  },
  createMarca(data) {
    return api.post('/marcas', data)
  },
  updateMarca(id, data) {
    return api.put(`/marcas/${id}`, data)
  },
  deleteMarca(id) {
    return api.delete(`/marcas/${id}`)
  }
}
