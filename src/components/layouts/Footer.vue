<template>
  <footer class="mt-auto border-t border-[#0a3622]" style="background-color: #052216;">
    <div class="w-full px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

      <!-- Logo y descripcion -->
      <div class="flex items-center gap-2">
        <i class="pi pi-shop text-[#529931] text-xl"></i>
        <span class="text-white font-bold text-sm">
          Tienda y <span class="text-[#529931]">Librería Israel</span>
        </span>
      </div>

      <!-- Linea de copyright -->
      <div class="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
        © {{ new Date().getFullYear() }} — Todos los derechos reservados
      </div>

    </div>
  </footer>
</template>

<script setup>
import 'primeicons/primeicons.css'
</script>
