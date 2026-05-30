import api from './api'

export default {
  getCategorias(params = {}) {
    return api.get('/categorias', { params })
  },
  createCategoria(data) {
    return api.post('/categorias', data)
  },
  updateCategoria(id, data) {
    return api.put(`/categorias/${id}`, data)
  },
  deleteCategoria(id) {
    return api.delete(`/categorias/${id}`)
  }
}
