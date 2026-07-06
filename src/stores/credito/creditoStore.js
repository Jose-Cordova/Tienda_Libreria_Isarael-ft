import { defineStore } from 'pinia';
import api from '@/services/api';

export const useCreditoStore = defineStore('credito', {
  state: () => ({
    // Para el index (tabla principal)
    clientes: [],
    loading: false,
    filtroEstado: null,
    search: '',
    // Paginación
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,

    // Para el show (detalle de un cliente)
    clienteSeleccionado: null,
    creditosCliente: [],
    loadingDetalle: false,

    // Métodos de pago para el modal de abono
    metodosPago: [],
  }),

  actions: {
    // Cargar listado de clientes con resumen
    async fetchClientes(page = 1) {
      this.loading = true;
      try {
        const params = { page, per_page: this.perPage };
        if (this.filtroEstado) params.estado = this.filtroEstado;
        if (this.search) params.search = this.search;

        const response = await api.get('/creditos', { params });
        const data = response.data;

        this.clientes = data.data;
        this.currentPage = data.current_page;
        this.lastPage = data.last_page;
        this.total = data.total;
      } catch (error) {
        console.error('Error al cargar créditos:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Cargar detalle de un cliente (créditos con abonos)
    async fetchDetalleCliente(clienteId) {
      this.loadingDetalle = true;
      try {
        const response = await api.get(`/creditos/${clienteId}`);
        this.clienteSeleccionado = response.data.cliente;
        this.creditosCliente = response.data.creditos;
        return response.data;
      } catch (error) {
        console.error('Error al cargar detalle del cliente:', error);
        throw error;
      } finally {
        this.loadingDetalle = false;
      }
    },

    // Registrar un abono
    async storeAbono(creditoId, datos) {
      const response = await api.post(`/creditos/${creditoId}/abonos`, datos);
      return response.data;
    },

    // Anular un abono
    async anularAbono(abonoId) {
      const response = await api.patch(`/abonos/${abonoId}/anular`);
      return response.data;
    },

    // Cargar métodos de pago (si no están en otro store)
    async cargarMetodosPago() {
      try {
        const response = await api.get('/metodos-pagos');
        this.metodosPago = response.data;
      } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
      }
    },

    // Setters para filtros
    setFiltroEstado(estado) {
      this.filtroEstado = estado;
    },
    setSearch(search) {
      this.search = search;
    },
    setPage(page) {
      this.fetchClientes(page);
    },
    setPerPage(perPage) {
      this.perPage = perPage;
      this.fetchClientes(1);
    },
  },
});
