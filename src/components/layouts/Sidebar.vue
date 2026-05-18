<template>
  <aside class="w-45 bg-[#062a1b] text-white flex flex-col h-full border-r border-white/10 shadow-xl overflow-hidden">

    <!-- Navegación -->
    <div class="flex-1 overflow-y-auto py-6 custom-scrollbar">

      <!-- SECCIÓN: PRINCIPAL -->
      <div class="mb-6">
        <p class="px-7 text-[10px] font-bold text-[#4d7c68] uppercase tracking-[0.2em] mb-3">Principal</p>
        <RouterLink to="/" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
          <i class="pi pi-home text-lg text-[#529931]"></i>
          <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white no-underline">Inicio</span>
        </RouterLink>
      </div>

      <!-- SECCIÓN: VENTAS -->
      <div class="mb-6">
        <p class="px-7 text-[10px] font-bold text-[#4d7c68] uppercase tracking-[0.2em] mb-3">Ventas</p>
        <div class="space-y-0.5">
          <RouterLink to="/punto-venta" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
            <i class="pi pi-shopping-cart text-lg text-[#529931]"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Punto de Ventas</span>
          </RouterLink>
          <RouterLink to="/historial-ventas" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
            <i class="pi pi-file text-lg text-[#529931]"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Historial de Ventas</span>
          </RouterLink>
          <RouterLink to="/creditos" class="flex items-center justify-between px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
            <div class="flex items-center gap-3">
              <i class="pi pi-credit-card text-lg text-[#529931]"></i>
              <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Crédito/Fiados</span>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- SECCIÓN: INVENTARIO -->
      <div class="mb-6">
        <p class="px-7 text-[10px] font-bold text-[#4d7c68] uppercase tracking-[0.2em] mb-3">Inventario</p>
        <div class="space-y-0.5">
          <RouterLink to="/productos" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
            <i class="pi pi-box text-lg text-[#529931]"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Productos</span>
          </RouterLink>
          <RouterLink to="/categorias" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
            <i class="pi pi-tags text-lg text-[#529931]"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Categorías</span>
          </RouterLink>
          <RouterLink to="/marcas" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
            <i class="pi pi-bookmark text-lg text-[#529931]"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Marcas</span>
          </RouterLink>
          <RouterLink to="/unidades" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
            <i class="pi pi-sliders-h text-lg text-[#529931]"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Unidades</span>
          </RouterLink>


        </div>
      </div>

      <!-- SECCIÓN: COMPRAS -->
      <div class="mb-6">
        <p class="px-7 text-[10px] font-bold text-[#4d7c68] uppercase tracking-[0.2em] mb-3">Compras</p>
        <div class="space-y-0.5">
          <RouterLink to="/proveedores" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
            <i class="pi pi-truck text-lg text-[#529931]"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Proveedor</span>
          </RouterLink>
          <RouterLink to="/compras" class="flex items-center gap-3 px-7 py-2.5 transition-all hover:bg-white/5 group no-underline">
            <i class="pi pi-download text-lg text-[#529931]"></i>
            <span class="text-sm font-bold tracking-wide text-gray-200 group-hover:text-white">Compras</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
  import { RouterLink } from 'vue-router';
</script>

<style scoped>
/* Quitar subrayado azul de los enlaces */
a {
  text-decoration: none !important;
}

.router-link-active {
  background-color: #1a4a2b !important;
  border-left: 4px solid #52b831;
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
