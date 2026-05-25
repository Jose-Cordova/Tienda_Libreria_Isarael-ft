<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">
    <!-- Listado de Compras (Historial) -->
    <section v-if="!mostrandoRegistro" key="lista">
      <CompraLista @nueva-compra="mostrandoRegistro = true" />
    </section>
    <!-- Registro (Wizard) -->
    <section v-else key="registro" class="w-full">
      <CompraWizard @cerrar="mostrandoRegistro = false" />
    </section>
  </main>
</template>

<script setup>
  import { ref } from 'vue';

  //Importamos los conponentes de la misma carpeta
  import CompraLista from './CompraLista.vue';
  import CompraWizard from './CompraWizard.vue';

  //Estado que controla que pantalla ver
  const mostrandoRegistro = ref(false)
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar{
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb{
    background-color: #c6e5d3;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track{
    background-color: transparent;
  }
</style>
