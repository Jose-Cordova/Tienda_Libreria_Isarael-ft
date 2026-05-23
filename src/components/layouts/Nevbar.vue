<template>
  <!-- Envolver todo en un solo contenedor para evitar fragmentos -->
  <div>
    <nav class="bg-shop-sidebar-bg text-white px-6 py-2 flex items-center justify-between shadow-shop border-b border-white/5 font-dm-sans">
      <div class="flex items-center gap-3">
        <span class="text-xl font-bold tracking-tight">
          Tienda y <span class="text-shop-accent">Librería Israel</span>
        </span>
      </div>

      <div class="flex items-center gap-6">
        <!-- Reloj con fuente JetBrains Mono -->
        <div class="hidden md:block font-jetbrains text-sm text-gray-400 font-bold opacity-80">
          {{ currentTime }}
        </div>

        <div class="flex items-center bg-white/10 rounded-full pl-1 pr-4 py-1 border border-white/10 gap-3">
          <div class="w-8 h-8 rounded-full bg-shop-accent flex items-center justify-center text-xs font-black border border-shop-sidebar-bg">
            {{ getInitials(authStore.user?.name) }}
          </div>
          <span class="text-sm font-bold tracking-wide">
            {{ authStore.user?.name || 'Administrador' }}
          </span>
        </div>

        <button
          @click="mostrarConfirmacion = true"
          class="flex items-center gap-2 bg-transparent border border-white/20 hover:bg-shop-red/20 hover:border-shop-red px-3 py-1.5 rounded-shop-sm text-sm font-bold transition-all group text-white"
        >
          <i class="pi pi-power-off text-xs text-white/70 group-hover:text-shop-red"></i>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>

    <!-- Modal de confirmación (ahora dentro del mismo wrapper) -->
    <div
      v-if="mostrarConfirmacion"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4"
    >
      <div class="bg-shop-surface rounded-shop w-full max-w-xs shadow-shop-lg relative overflow-hidden p-6 text-center border border-shop-border">
        <div class="w-12 h-12 bg-shop-red-pale rounded-full flex items-center justify-center mx-auto mb-4 border border-shop-red-pale text-shop-red">
          <i class="pi pi-exclamation-triangle text-xl"></i>
        </div>

        <h3 class="text-base font-extrabold text-shop-green-deep mb-1">¿Cerrar Sesión?</h3>
        <p class="text-xs text-gray-400 font-medium mb-6">¿Estás seguro de que deseas salir del sistema?</p>

        <div class="flex items-center gap-3">
          <Button
            label="Cancelar"
            class="p-button-outlined p-button-secondary flex-1 py-2 rounded-full text-xs font-extrabold"
            @click="mostrarConfirmacion = false"
          />
          <Button
            label="Salir"
            class="flex-1 py-2 bg-shop-red hover:bg-shop-red-dark text-white border-none rounded-full text-xs font-extrabold shadow-md transition"
            @click="confirmarLogout"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/utils/primevue'  // ← centralizado

const authStore = useAuthStore()
const mostrarConfirmacion = ref(false)
const currentTime = ref(new Date().toLocaleTimeString('es-ES', { hour12: false }))
let timer

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('es-ES', { hour12: false })
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const getInitials = (name) => {
  if (!name) return 'AD'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const confirmarLogout = async () => {
  mostrarConfirmacion.value = false
  await authStore.logout()
}
</script>
