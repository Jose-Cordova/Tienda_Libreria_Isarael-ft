<template>
  <footer class="mt-auto border-t border-shop-border bg-shop-sidebar-bg font-dm-sans">
    <div class="w-full px-6 py-2 sm:py-4 flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-4">

      <!-- Logo y descripcion -->
      <div class="flex items-center gap-2">
        <i class="pi pi-shop text-shop-accent text-base sm:text-xl"></i>
        <span class="text-white font-bold text-xs sm:text-sm">
          Tienda y <span class="text-shop-accent">Librería Israel</span>
        </span>
      </div>

      <!-- Linea de copyright -->
      <div class="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
        © {{ new Date().getFullYear() }} — Todos los derechos reservados
      </div>

    </div>
  </footer>
</template>

<script setup>
import 'primeicons/primeicons.css'
</script>
