<template>
  <aside
    class="w-64 bg-shop-sidebar-bg text-white flex flex-col h-full border-r border-white/10 shadow-shop overflow-hidden font-dm-sans"
    @click="$emit('close-sidebar')"
  >
    <div class="flex-1 overflow-y-auto py-6 custom-scrollbar">
      <!-- Sección Principal (Dashboard solo para Admin) -->
      <div v-if="authStore.isAdmin" class="mb-6">
        <p class="px-7 text-[10px] font-bold text-shop-text-3 uppercase tracking-[0.2em] mb-3">Principal</p>
        <RouterLink to="/" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
          <i class="pi pi-home text-lg text-shop-accent"></i>
          <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Inicio</span>
        </RouterLink>
      </div>

      <!-- Sección Ventas (Permitida para Vendedor y Admin) -->
      <div class="mb-6">
        <p class="px-7 text-[10px] font-bold text-shop-text-3 uppercase tracking-[0.2em] mb-3">Ventas</p>
        <div class="space-y-0.5">
          <RouterLink to="/punto-venta" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-shopping-cart text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Punto de Ventas</span>
          </RouterLink>
          <RouterLink to="/historial-ventas" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-file text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Historial de Ventas</span>
          </RouterLink>
          <RouterLink to="/creditos" class="flex items-center justify-between px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <div class="flex items-center gap-3">
              <i class="pi pi-credit-card text-lg text-shop-accent"></i>
              <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Crédito/Fiados</span>
            </div>
          </RouterLink>
          <RouterLink to="/devoluciones-ventas" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-replay text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Devoluciones de Ventas</span>
          </RouterLink>
        </div>
      </div>

      <!-- Sección Inventario (Productos visible para todos, Categorías/Marcas solo para Admin) -->
      <div class="mb-6">
        <p class="px-7 text-[10px] font-bold text-shop-text-3 uppercase tracking-[0.2em] mb-3">Inventario</p>
        <div class="space-y-0.5">
          <RouterLink to="/productos" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-box text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Productos</span>
          </RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/categorias" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-tags text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Categorías</span>
          </RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/marcas" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-bookmark text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Marcas</span>
          </RouterLink>
          <RouterLink to="/productos-danados" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-trash text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Productos Dañados</span>
          </RouterLink>
          <RouterLink to="/cambios-productos" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-refresh text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Cambio de Producto</span>
          </RouterLink>
        </div>
      </div>

      <!-- Sección Compras (Solo para Admin) -->
      <div v-if="authStore.isAdmin" class="mb-6">
        <p class="px-7 text-[10px] font-bold text-shop-text-3 uppercase tracking-[0.2em] mb-3">Compras</p>
        <div class="space-y-0.5">
          <RouterLink to="/proveedores" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-truck text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Proveedor</span>
          </RouterLink>
          <RouterLink to="/compras" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-download text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Compras</span>
          </RouterLink>
        </div>
      </div>

      <!-- Sección Gestiones (Solo para Admin) -->
      <div v-if="authStore.isAdmin" class="mb-6">
        <p class="px-7 text-[10px] font-bold text-shop-text-3 uppercase tracking-[0.2em] mb-3">Reportes</p>
        <div class="space-y-0.5">
          <RouterLink to="/reportes" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-chart-bar text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Reportes</span>
          </RouterLink>
          <RouterLink to="/cronograma-proveedores" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-calendar text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Cronograma</span>
          </RouterLink>
        </div>
      </div>

      <!-- Sección Administración (Solo para Admin) -->
      <div v-if="authStore.isAdmin" class="mb-6">
        <p class="px-7 text-[10px] font-bold text-shop-text-3 uppercase tracking-[0.2em] mb-3">Administración</p>
        <div class="space-y-0.5">
          <RouterLink to="/usuarios" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-users text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Usuarios</span>
          </RouterLink>
          <RouterLink to="/configuracion" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-shop-sidebar-hover group no-underline">
            <i class="pi pi-cog text-lg text-shop-accent"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Configuración</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Instancia de la tienda de autenticación para consultar el rol
const authStore = useAuthStore();

defineEmits(['close-sidebar'])
</script>

<style scoped>
a {
  text-decoration: none !important;
}

.router-link-exact-active {
  background-color: theme('colors.shop.sidebar-active') !important;
  border-left: 4px solid theme('colors.shop.accent');
  padding-left: 24px !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
}
</style>
