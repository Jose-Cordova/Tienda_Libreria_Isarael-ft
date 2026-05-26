<template>
  <section class="grid grid-cols-4 gap-4 mb-6">
    <!-- Cantidad de ventas pagadas -->
    <div class="bg-white border border-[#0a3622] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
      <p class="text-[12px] font-bold text-[#145a32] uppercase tracking-wider mb-0.5">Ventas Pagadas</p>
      <p class="text-3xl font-extrabold text-[#0a3622] leading-none my-1">{{ cantidadPagadas }}</p>
      <p class="text-[10px] text-gray-400 font-medium">ventas</p>
    </div>

    <!-- Total de ventas pagadas -->
    <div class="bg-white border border-[#0a3622] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
      <p class="text-[12px] font-bold text-[#145a32] uppercase tracking-wider mb-0.5">Total Pagadas</p>
      <p class="text-3xl font-extrabold text-[#0a3622] leading-none my-1">{{ totalPagadas }}</p>
      <p class="text-[10px] text-gray-400 font-medium">recaudado</p>
    </div>

    <!-- Cantidad de ventas a crédito -->
    <div class="bg-white border border-[#ff8c00] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
      <p class="text-[12px] font-bold text-[#b8860b] uppercase tracking-wider mb-0.5">Ventas a Crédito</p>
      <p class="text-3xl font-extrabold text-[#b8860b] leading-none my-1">{{ cantidadCredito }}</p>
      <p class="text-[10px] text-gray-400 font-medium">ventas</p>
    </div>

    <!-- Total de ventas a crédito -->
    <div class="bg-white border border-[#ff8c00] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
      <p class="text-[12px] font-bold text-[#b8860b] uppercase tracking-wider mb-0.5">Total Crédito</p>
      <p class="text-3xl font-extrabold text-[#b8860b] leading-none my-1">{{ totalCredito }}</p>
      <p class="text-[10px] text-gray-400 font-medium">pendiente</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  cantidadPagadas: { type: Number, required: true },
  totalPagadas: { type: String, required: true },
  cantidadCredito: { type: Number, required: true },
  totalCredito: { type: String, required: true }
});
</script>
