<template>
  <div>
    <nav class="bg-shop-sidebar-bg text-white px-6 py-2 flex items-center justify-between shadow-shop border-b border-white/5 font-dm-sans">
      <div class="flex items-center gap-3">
        <span class="text-xl font-bold tracking-tight">
          Tienda y <span class="text-shop-accent">Librería Israel</span>
        </span>
      </div>

      <div class="flex items-center gap-6">
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

    <!-- MODAL: Confirmar Cierre de Sesión -->
    <div
      v-if="mostrarConfirmacion"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4"
    >
      <div class="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100 text-center">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a4b0a]"></div>
        <div class="p-10">
          <div class="flex justify-center mb-3 text-red-500/20">
            <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
              <i class="pi pi-power-off text-5xl text-red-500"></i>
            </div>
          </div>
          <h3 class="text-xl font-extrabold text-shop-green-deep mb-2">¿Cerrar Sesión?</h3>
          <p class="text-sm text-gray-500 font-medium mb-8">¿Estás seguro de que deseas salir del sistema?</p>
          <div class="flex items-center gap-3">
            <button
              @click="mostrarConfirmacion = false"
              class="flex-1 py-3 bg-[#f1f5f1] text-[#3a5a3a] font-bold rounded-xl border border-[#e2eee2] hover:bg-white transition-all text-sm"
            >
              Cancelar
            </button>
            <button
              @click="confirmarLogout"
              class="flex-1 py-3 bg-shop-red hover:bg-shop-red-dark text-white font-bold rounded-xl shadow-md transition-all text-sm uppercase tracking-wider"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

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
