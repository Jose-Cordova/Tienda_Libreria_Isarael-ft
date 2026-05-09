<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-10">

    <Card class="w-full max-w-md shadow-2xl">
      <template #title>
        <div class="text-center text-2xl font-bold">
          🚀 TechStore UI Test
        </div>
      </template>

      <template #content>
        <p class="mb-6 text-center">
          Si ves esto con estilo moderno,
          PrimeVue y Tailwind están funcionando correctamente.
        </p>

        <div class="flex justify-center gap-4">
          <Button label="Primario" icon="pi pi-check" />
          <Button label="Secundario" severity="secondary" />
        </div>
      </template>
    </Card>

  </div>
</template>
