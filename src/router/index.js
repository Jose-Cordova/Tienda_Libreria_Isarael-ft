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
        }
      ]
    }
  ],
})

// GUARDIA DE NAVEGACIÓN (Protectores de rutas)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token

  // Si la ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } 
  // Si el usuario ya está logueado e intenta ir al login
  else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' })
  } 
  // En cualquier otro caso, permitir la navegación
  else {
    next()
  }
})

export default router
