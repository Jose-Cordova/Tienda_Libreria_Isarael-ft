import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
})

// Interceptor de petición: adjunta el token JWT a cada request
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  return config
})

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false
let failedQueue = []

// Procesa la cola de peticiones que fallaron mientras se refrescaba el token
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Interceptor de respuesta: detecta 401 e intenta refrescar el token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // Si el error es 401 y no es un retry ni la ruta de login/refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      // Si ya se está refrescando, encolar la petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Intentar refrescar el token con el endpoint del backend
        const { data } = await api.post('/auth/refresh')
        const newToken = data.access_token

        // Actualizar el token en el store
        authStore.token = newToken
        if (data.user) {
          authStore.user = data.user
        }

        // Procesar las peticiones en cola con el nuevo token
        processQueue(null, newToken)

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Si el refresh también falla, cerrar sesión
        processQueue(refreshError, null)
        authStore.$reset()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
