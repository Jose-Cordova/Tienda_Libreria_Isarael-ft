import api from "./api";

const cronogramaService = {
  //Obtener todos los eventos
  getEventos(params = {}){
    return api.get('/cronograma-proveedores', {params})
  },

  //Crear un evento
  createEvento(data){
    return api.post('/cronograma-proveedores', data)
  },

  //Actaulizar un evento
  updateEvento(id, data){
    return api.put(`/cronograma-proveedores/${id}`, data)
  },

  deleteEvento(id){
    return api.delete(`/cronograma-proveedores/${id}`)
  }
}

export default cronogramaService
