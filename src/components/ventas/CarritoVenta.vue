<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Encabezado -->
    <div class="p-3 border-b border-shop-border bg-shop-surface-2 flex justify-between items-center shrink-0">
      <h2 class="font-bold text-shop-text flex items-center gap-2">
        <i class="pi pi-shopping-cart text-shop-green"></i> Venta Actual
      </h2>
      <span class="bg-shop-green text-white text-xs font-bold px-2 py-1 rounded-full">
        {{ ventaStore.cantidadItems }} ítems
      </span>
    </div>

    <!-- Lista de productos -->
    <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
      <!-- Carrito vacío -->
      <div v-if="ventaStore.detalle.length === 0" class="h-full flex flex-col items-center justify-center text-shop-text-3 gap-2">
        <i class="pi pi-box text-4xl mb-2"></i>
        <p class="text-sm font-bold">El carrito está vacío</p>
      </div>

      <!-- Items -->
      <div
        v-for="item in ventaStore.detalle"
        :key="item.producto_id"
        class="flex flex-col p-2 border-b border-shop-border hover:bg-shop-bg transition-colors"
      >
        <div class="flex justify-between items-start mb-1">
          <span class="font-bold text-sm text-shop-text leading-tight">{{ item.nombre }}</span>
          <Button
            icon="pi pi-times"
            text rounded severity="danger" size="small"
            @click="ventaStore.eliminarProducto(item.producto_id)"
            class="w-6 h-6 p-0"
          />
        </div>

        <div class="flex justify-between items-center mt-1">
          <div class="flex items-center gap-2 bg-shop-bg rounded-lg p-0.5">
            <button
              @click="ventaStore.decrementarCantidad(item.producto_id)"
              class="w-6 h-6 flex items-center justify-center text-shop-text-2 hover:bg-white rounded-md font-bold"
            >-</button>
            <span class="text-xs font-bold w-4 text-center">{{ item.cantidad }}</span>
            <button
              @click="ventaStore.incrementarCantidad(item.producto_id)"
              class="w-6 h-6 flex items-center justify-center text-shop-text-2 hover:bg-white rounded-md font-bold"
            >+</button>
          </div>
          <span class="font-black text-shop-green text-sm">
            ${{ item.subtotal.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useVentaStore } from '@/stores/venta/ventaStore';
import { Button } from '@/utils/primevue';

const ventaStore = useVentaStore();
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
</style>
