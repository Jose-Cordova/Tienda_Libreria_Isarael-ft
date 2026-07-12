import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('../components/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },
        {
          path: 'punto-venta',
          name: 'punto-venta',
          component: () => import('../views/venta/VentasView.vue'),
        },
        {
          path: 'historial-ventas',
          name: 'historial-ventas',
          component: () => import('../views/venta/HistorialVentasView.vue'),
        },
        {
          path: 'creditos',
          name: 'creditos',
          component: () => import('../views/CreditosView.vue'),
        },
        {
          path: 'productos',
          name: 'productos',
          component: () => import('../views/producto/Producto.vue'),
        },
        {
          path: 'categorias',
          name: 'categorias',
          component: () => import('../views/Categoria.vue'),
        },
        {
          path: 'marcas',
          name: 'marcas',
          component: () => import('../views/Marca.vue'),
        },
        {
          path: 'proveedores',
          name: 'proveedores',
          component: () => import('../views/ProveedorView.vue')
        },
        {
          path: 'reportes',
          name: 'reportes',
          component: () => import('../views/Reporte.vue')
        },
        {
          path: 'reporte-historial',
          name: 'reporte-historial',
          component: () => import('../views/ReporteHistorialVenta.vue')
        },
        {
          path: 'reporte-compras',
          name: 'reporte-compras',
          component: () => import('../views/ReporteCompras.vue')
        },
        {
          path: 'reporte-creditos',
          name: 'reporte-creditos',
          component: () => import('../views/ReporteCredito.vue')
        },
        {
          path: 'devoluciones-ventas',
          name: 'devoluciones-ventas',
          component: () => import('../views/DevolucionesVentasView.vue')
        },
        {
          path: 'compras',
          name: 'compras',
          component: () => import('../views/compra/CompraIndex.vue')
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('../views/UsuarioView.vue')
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('../views/RolView.vue')
        },
        {
          path: 'productos-danados',
          name: 'productos-danados',
          component: () => import('../views/ProductoDanado.vue')
        },
        {
          path: 'cronograma-proveedores',
          name: 'cronograma-proveedores',
          component: () => import('../views/CronogramaView.vue')
        }
      ]
    }
  ]
})

// GUARDIA DE NAVEGACIÓN (Protectores de rutas)
router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token

  // Si la ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }
  // Si el usuario ya está logueado e intenta ir al login
  else if (to.name === 'login' && isAuthenticated) {
    return { name: 'home' }
  }
  // En cualquier otro caso, permitir la navegación
  // No retornar nada es equivalente a permitir la navegación
})

export default router
