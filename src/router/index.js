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
      path: '/set-password',
      name: 'set-password',
      component: () => import('../views/SetPasswordView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue')
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
          meta: { roles: ['ADMIN'] } // Solo administradores pueden ver el dashboard
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },
        {
          path: 'notas',
          name: 'notas',
          component: () => import('../views/NotasView.vue'),
          meta: { roles: ['ADMIN', 'VENDEDOR'] } // Permitido para ambos
        },
        {
          path: 'punto-venta',
          name: 'punto-venta',
          component: () => import('../views/venta/VentasView.vue'),
          meta: { roles: ['ADMIN', 'VENDEDOR'] } // Permitido para ambos
        },
        {
          path: 'historial-ventas',
          name: 'historial-ventas',
          component: () => import('../views/venta/HistorialVentasView.vue'),
          meta: { roles: ['ADMIN', 'VENDEDOR'] } // Permitido para ambos
        },
        {
          path: 'creditos',
          name: 'creditos',
          component: () => import('../views/CreditosView.vue'),
          meta: { roles: ['ADMIN', 'VENDEDOR'] } // Permitido para ambos
        },
        {
          path: 'productos',
          name: 'productos',
          component: () => import('../views/producto/Producto.vue'),
          meta: { roles: ['ADMIN', 'VENDEDOR'] } // Permitido para ambos
        },
        {
          path: 'categorias',
          name: 'categorias',
          component: () => import('../views/Categoria.vue'),
          meta: { roles: ['ADMIN'] } // Solo administradores
        },
        {
          path: 'marcas',
          name: 'marcas',
          component: () => import('../views/Marca.vue'),
          meta: { roles: ['ADMIN'] } // Solo administradores
        },
        {
          path: 'proveedores',
          name: 'proveedores',
          component: () => import('../views/ProveedorView.vue'),
          meta: { roles: ['ADMIN'] } // Solo administradores
        },
        {
          path: 'reportes',
          name: 'reportes',
          component: () => import('../views/ReportesView.vue'),
          meta: { roles: ['ADMIN'] } // Solo administradores
        },
        {
          path: 'devoluciones-ventas',
          name: 'devoluciones-ventas',
          component: () => import('../views/DevolucionesVentasView.vue'),
          meta: { roles: ['ADMIN', 'VENDEDOR'] } // Permitido para ambos
        },
        {
          path: 'compras',
          name: 'compras',
          component: () => import('../views/compra/CompraIndex.vue'),
          meta: { roles: ['ADMIN'] } // Solo administradores
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('../views/UsuarioView.vue'),
          meta: { roles: ['ADMIN'] } // Solo administradores
        },
        {
          path: 'configuracion',
          name: 'configuracion',
          component: () => import('../views/ConfiguracionView.vue'),
          meta: { roles: ['ADMIN'] } // Solo administradores
        },
        {
          path: 'productos-danados',
          name: 'productos-danados',
          component: () => import('../views/ProductoDanado.vue'),
          meta: { roles: ['ADMIN', 'VENDEDOR'] } // Permitido para ambos
        },
        {
          path: 'cronograma-proveedores',
          name: 'cronograma-proveedores',
          component: () => import('../views/CronogramaView.vue'),
          meta: { roles: ['ADMIN'] } // Solo administradores
        }
      ]
    },
    // Ruta comodín para capturar cualquier URL inexistente (Error 404)
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

// Guard de navegación para verificar autenticación y permisos por rol
router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token

  // Si la ruta requiere autenticación y no hay sesión activa
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    return { name: 'login' }
  }

  // Si el usuario ya está autenticado e intenta ir al login
  if (to.name === 'login' && isAuthenticated) {
    if (authStore.isVendedor && !authStore.isAdmin) {
      return { name: 'punto-venta' } // Redirigir vendedor al punto de venta
    }
    return { name: 'home' } // Redirigir admin al dashboard
  }

  // Si el usuario está autenticado, validar permisos de rol en la ruta
  if (isAuthenticated && to.meta.roles) {
    const rolesPermitidos = to.meta.roles
    const esVendedorSolamente = authStore.isVendedor && !authStore.isAdmin

    // Si es vendedor y la ruta requiere rol ADMIN (como dashboard o configuracion)
    if (esVendedorSolamente && !rolesPermitidos.includes('VENDEDOR')) {
      return { name: 'punto-venta' } // Redirigir automáticamente a su vista permitida
    }
  }
})

export default router
