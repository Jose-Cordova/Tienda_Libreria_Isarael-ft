<template>
  <section class="grid grid-cols-4 gap-4 mb-6">
    <div class="bg-white border border-red-600 border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
      <p class="text-[12px] font-bold text-red-700 uppercase tracking-wider mb-0.5">DEUDAS TOTALES</p>
      <p class="text-3xl font-extrabold text-red-600 leading-none my-1">${{ totalDeuda }}</p>
    </div>
    <div class="bg-white border border-orange-400 border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
      <p class="text-[12px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">CLIENTES CON DEUDAS</p>
      <p class="text-3xl font-extrabold text-orange-400 leading-none my-1">{{ clientesConDeuda }}</p>
    </div>
    <div class="bg-white border border-gray-800 border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
      <p class="text-[12px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">CRÉDITOS PAGADOS</p>
      <p class="text-3xl font-extrabold text-gray-800 leading-none my-1">{{ creditosPagados }}</p>
    </div>
    <div class="bg-white border border-[#0a3622] border-l-[8px] rounded-xl px-4 py-2.5 shadow-sm flex flex-col justify-center">
      <p class="text-[12px] font-bold text-[#145a32] uppercase tracking-wider mb-0.5">TOTAL ABONADO</p>
      <p class="text-3xl font-extrabold text-[#0a3622] leading-none my-1">${{ totalAbonado }}</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  totalDeuda: { type: Number, default: 0 },
  clientesConDeuda: { type: Number, default: 0 },
  creditosPagados: { type: Number, default: 0 },
  totalAbonado: { type: Number, default: 0 }
});
</script>
