<script setup>
import Nevbar from './Nevbar.vue';
import Sidebar from './Sidebar.vue';
import Footer from './Footer.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-100 font-sans overflow-hidden">
    <!-- Navbar Estático arriba -->
    <Nevbar class="flex-none z-30" />

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar Estático a la izquierda -->
      <Sidebar class="flex-none h-full z-20" />

      <!-- Área de contenido con scroll independiente -->
      <div class="flex-1 flex flex-col overflow-y-auto bg-gray-100">
        <div class="min-h-full flex flex-col">
          <main class="flex-1">
            <RouterView />
          </main>
        </div>
      </div>
    </div>

    <!-- Footer Estático al final, tomando todo el ancho -->
    <Footer class="flex-none z-30" />
  </div>
</template>

<style>
/* Reset de scroll para el body */
body {
  overflow: hidden;
  margin: 0;
}
</style>
