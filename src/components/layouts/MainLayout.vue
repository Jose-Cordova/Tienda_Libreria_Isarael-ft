<script setup>
import { ref } from 'vue';
import AppNavbar from './Nevbar.vue';
import AppSidebar from './Sidebar.vue';
import AppFooter from './Footer.vue';
import { RouterView } from 'vue-router';

const sidebarOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};
</script>

<template>
  <div class="h-screen flex flex-col bg-[#f1f5f1] font-sans overflow-hidden relative">
    <!-- Navbar Estático arriba -->
    <AppNavbar class="flex-none z-[60]" @toggle-sidebar="toggleSidebar" />

    <div class="flex flex-1 overflow-hidden relative">
      <!-- Backdrop para móvil -->
      <div 
        v-if="sidebarOpen" 
        class="fixed inset-0 bg-black/50 z-[40] lg:hidden"
        @click="closeSidebar"
      ></div>

      <!-- Sidebar -->
      <AppSidebar 
        class="absolute lg:relative flex-none h-full z-[50] transition-transform duration-300 transform lg:translate-x-0" 
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
        @close-sidebar="closeSidebar"
      />

      <!-- Área de contenido con scroll independiente -->
      <div class="flex-1 flex flex-col overflow-y-auto">
        <div class="min-h-full flex flex-col">
          <main class="flex-1">
            <RouterView />
          </main>
        </div>
      </div>
    </div>

    <!-- Footer Estático al final -->
    <AppFooter class="flex-none z-30" />
  </div>
</template>

<style>
/* Reset de scroll para el body */
body {
  overflow: hidden;
  margin: 0;
}
</style>
