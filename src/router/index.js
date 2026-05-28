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
          component: () => import('../views/Producto.vue'),
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
          path: 'unidades',
          name: 'unidades',
          component: () => import('../views/Unidad.vue'),
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
          path: 'compras',
          name: 'compras',
          component: () => import('../views/compra/CompraIndex.vue')
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
