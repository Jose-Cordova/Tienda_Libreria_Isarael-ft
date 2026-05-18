<template>
    <div class="min-h-screen flex font-sans">
        <!-- Lado Izquierdo: Branding -->
        <div class="hidden lg:flex lg:w-1/3 bg-[#0a3622] text-white flex-col items-center justify-center relative overflow-hidden">
            <!-- Patrón de ondas decorativo -->
            <div class="absolute inset-0 opacity-20 pointer-events-none">
                <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,20 Q25,10 50,20 T100,20 V100 H0 Z" fill="none" stroke="white" stroke-width="0.5" />
                    <path d="M0,50 Q25,40 50,50 T100,50" fill="none" stroke="white" stroke-width="0.5" />
                    <path d="M0,80 Q25,70 50,80 T100,80" fill="none" stroke="white" stroke-width="0.5" />
                </svg>
            </div>

            <div class="z-10 text-center px-8">
                <!-- Logo Circular -->
                <div class="w-32 h-32 bg-[#76b852] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-[#0a3622]">
                    <i class="pi pi-shop text-white text-5xl"></i>
                </div>

                <h1 class="text-4xl font-bold tracking-tight mb-2">Tienda y Librería Israel</h1>
                <div class="w-4/5 h-1 bg-white/30 mx-auto rounded-full"></div>
            </div>
        </div>

        <!-- Lado Derecho: Formulario -->
        <div class="flex-1 bg-[#f1f5f1] flex flex-col relative">
            <!-- Barra superior con reloj -->
            <div class="h-2 bg-[#062012]"></div>
            <div class="flex justify-end p-1 text-[#0a3622] font-mono text-sm font-bold">
                {{ currentTime }}
            </div>

            <!-- Contenedor del Formulario -->
            <div class="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
                <div class="w-full max-w-lg bg-[#ced6cf] rounded-sm p-10 shadow-sm border border-green-100">
                    <div class="text-center mb-10">
                        <p class="text-xs font-bold text-[#0a3622] tracking-widest mb-2">BIENVENIDO DE VUELTA</p>
                        <h2 class="text-4xl font-extrabold text-[#0a3622] mb-4">Iniciar sesión</h2>
                        <p class="text-[#2e7d32] font-medium text-sm">
                            Ingresa tus credenciales para entrar al panel administrativo.
                        </p>
                    </div>

                    <form @submit.prevent="sendLogin" class="space-y-8">
                        <!-- Input Usuario -->
                        <div>
                            <label class="block text-xs font-bold text-[#0a3622] uppercase tracking-wider mb-2">
                                USUARIO O CORREO
                            </label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i class="pi pi-user text-[#0a3622] text-lg"></i>
                                </div>
                                <input
                                    v-model="form.email"
                                    type="text"
                                    placeholder="ej: admin"
                                    class="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-[#0a3622] focus:ring-2 focus:ring-[#1a8a4d] focus:border-transparent transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <!-- Input Contraseña -->
                        <div>
                            <label class="block text-xs font-bold text-[#0a3622] uppercase tracking-wider mb-2">
                                CONTRASEÑA
                            </label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i class="pi pi-lock text-[#0a3622] text-lg"></i>
                                </div>
                                <input
                                    v-model="form.password"
                                    :type="showPassword ? 'text' : 'password'"
                                    placeholder="••••••••"
                                    class="block w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-[#0a3622] focus:ring-2 focus:ring-[#1a8a4d] focus:border-transparent transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    @click="showPassword = !showPassword"
                                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#1a8a4d] transition-colors"
                                >
                                    <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Checkbox y Olvidaste -->
                        <div class="flex items-center justify-between">
                            <label class="flex items-center cursor-pointer group">
                                <input
                                    v-model="rememberMe"
                                    type="checkbox"
                                    class="w-5 h-5 rounded border-gray-300 text-[#1a8a4d] focus:ring-[#1a8a4d] transition-all"
                                />
                                <span class="ml-2 text-sm font-bold text-[#0a3622] group-hover:text-[#1a8a4d] transition-colors">Recordar sesión</span>
                            </label>
                            <a href="#" class="text-xs font-bold text-[#2e7d32] hover:text-[#1a8a4d] hover:underline transition-all">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <!-- Botón Ingresar -->
                        <button
                            type="submit"
                            :disabled="loading"
                            class="w-full bg-[#0a5c2f] hover:bg-[#074623] text-white font-bold py-4 px-6 rounded-lg uppercase tracking-widest transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span v-if="!loading">INGRESAR AL SISTEMA</span>
                            <i v-else class="pi pi-spin pi-spinner text-xl"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
//definiendo variables de estado
const loading = ref(false);
const errorMessage = ref(null);
const showPassword = ref(false);
const rememberMe = ref(false);

const form = reactive({
  email: "",
  password: "",
});

//función para enviar peticion
const sendLogin = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    await authStore.login(form);
  } catch (err) {
    if(err.response && err.response.status===401){
        const {message} = err.response.data;
        errorMessage.value = message;
    }else{
      errorMessage.value = "Hubo un error inesperado. Inténtalo más tarde.";
    }

  } finally {
    loading.value = false;
  }
};
// Reloj para el diseño
const currentTime = ref(new Date().toLocaleTimeString('es-ES', { hour12: false }));
setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('es-ES', { hour12: false });
}, 1000);
</script>

<style scoped>
/* Transición suave para los bordes de los inputs */
input::placeholder {
    color: #a0aec0;
    font-weight: normal;
}

/* Estilo personalizado para el checkbox si no es nativo de tailwind forms */
input[type="checkbox"]:checked {
    background-color: #1a8a4d;
}
</style>
