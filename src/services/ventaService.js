import api from './api';

export const ventaService = {
  async obtenerVentas(params = {}) {
    const response = await api.get('/ventas', { params });
    return response.data;
  },
  async obtenerVentaPorId(id) {
  const { data } = await api.get(`/ventas/${id}`);
  // El controlador devuelve { venta: {...} }
  return data.venta;
}

};
