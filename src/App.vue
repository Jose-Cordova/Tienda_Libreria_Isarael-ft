<script setup>
import { RouterView } from 'vue-router';
import { Toast } from '@/utils/primevue';  // ← importado desde nuestro archivo centralizado
</script>

<template>
  <!-- RouterView renderiza la vista actual -->
  <RouterView />
  
  <!-- Toast global de PrimeVue (siempre presente) -->
  <Toast position="top-right" />
</template>

<style>
/* Estilos globales */
body {
  margin: 0;
  padding: 0;
}
</style>
