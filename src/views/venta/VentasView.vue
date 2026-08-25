<template>
  <div class="min-h-[calc(100vh-4rem)] p-2 sm:p-4 bg-shop-bg font-dm-sans flex flex-col lg:flex-row gap-2 sm:gap-4">

    <!-- Panel izquierdo: Buscador de productos -->
    <div class="flex-1 bg-shop-surface rounded-shop shadow-shop border border-shop-border overflow-hidden min-h-[400px] sm:min-h-[500px]">
      <BuscadorProductos />
    </div>

    <!-- Panel derecho: Carrito + Cobro -->
    <div class="w-full lg:w-[420px] flex flex-col gap-2 sm:gap-4 shrink-0">

      <div class="bg-shop-surface rounded-shop shadow-shop border border-shop-border overflow-hidden flex-1 min-h-[250px] sm:min-h-[300px]">
        <CarritoVenta />
      </div>

      <div class="bg-shop-surface rounded-shop shadow-shop border border-shop-border p-3 sm:p-4">
        <PanelCobro />
      </div>

    </div>

  </div>
</template>

<script setup>
import BuscadorProductos from '@/components/ventas/BuscadorProductos.vue';
import CarritoVenta from '@/components/ventas/CarritoVenta.vue';
import PanelCobro from '@/components/ventas/PanelCobro.vue';
</script>
