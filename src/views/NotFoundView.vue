<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f4f7f6] p-4 font-dm-sans">
    <div class="bg-white rounded-[24px] shadow-xl border border-gray-200 p-8 sm:p-12 max-w-md w-full text-center relative overflow-hidden">
      <!-- Barra de acento superior -->
      <div class="absolute top-0 left-0 w-full h-3 bg-[#0a3622]"></div>

      <!-- Ícono de error 404 -->
      <div class="w-20 h-20 bg-green-50 text-[#0a3622] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <i class="pi pi-[#0a3622] pi-exclamation-triangle text-4xl"></i>
      </div>

      <!-- Código de error y títulos -->
      <h1 class="text-6xl font-black text-[#0a3622] tracking-tighter mb-2">404</h1>
      <h2 class="text-lg font-bold text-gray-800 uppercase tracking-wide mb-3">Página no encontrada</h2>
      <p class="text-sm text-gray-500 font-medium leading-relaxed mb-8">
        La ruta a la que intentas acceder no existe, fue movida o no tienes permisos para visualizarla.
      </p>

      <!-- Botón para regresar -->
      <button
        @click="irInicio"
        class="w-full py-3.5 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
      >
        <i class="pi pi-arrow-left text-xs"></i>
        <span>Volver al inicio</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Iniciar router y store de autenticación
const router = useRouter();
const authStore = useAuthStore();

// Función para redirigir al usuario según su rol
const irInicio = () => {
  // Si no está autenticado, ir al login
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  // Si es vendedor únicamente, ir a punto de venta; de lo contrario al inicio/dashboard
  if (authStore.isVendedor && !authStore.isAdmin) {
    router.push('/punto-venta');
  } else {
    router.push('/');
  }
};
</script>
