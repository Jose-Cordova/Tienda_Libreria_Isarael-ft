<template>
    <div class="min-h-screen flex font-sans">
        <!-- Lado Izquierdo: Branding -->
        <div class="hidden lg:flex lg:w-1/2 bg-[#0a3622] text-white flex-col items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 opacity-20 pointer-events-none">
                <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,20 Q25,10 50,20 T100,20 V100 H0 Z" fill="none" stroke="white" stroke-width="0.5" />
                    <path d="M0,50 Q25,40 50,50 T100,50" fill="none" stroke="white" stroke-width="0.5" />
                    <path d="M0,80 Q25,70 50,80 T100,80" fill="none" stroke="white" stroke-width="0.5" />
                </svg>
            </div>
            <div class="z-10 text-center px-8">
                <div class="w-32 h-32 bg-[#76b852] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-[#0a3622]">
                    <img src="/logo/1778204674961.png" alt="Logo" class="w-32 h-" />
                </div>
                <h1 class="text-4xl font-bold tracking-tight mb-2">Tienda y Librería Israel</h1>
                <div class="w-4/5 h-1 bg-white/30 mx-auto rounded-full"></div>
            </div>
        </div>

        <!-- Lado Derecho: Formulario -->
        <div class="flex-1 bg-[#f1f5f1] flex flex-col relative">
            <div class="h-2 bg-[#062012]"></div>
            <div class="flex justify-end p-1 text-[#0a3622] font-mono text-sm font-bold">
                {{ currentTime }}
            </div>

            <div class="flex-1 flex items-center justify-center px-6 sm:px-12 py-12">
                <div class="w-full max-w-lg bg-[#e8f5e9] rounded-md p-10 shadow-md border border-green-200">
                    <div class="text-center mb-10">
                        <p class="text-xs font-bold text-[#0a3622] tracking-widest mb-2">BIENVENIDO DE VUELTA</p>
                        <h2 class="text-4xl font-extrabold text-[#0a3622] mb-4">Iniciar sesión</h2>
                        <p class="text-[#2e7d32] font-1xl text-sm">Ingresa tus credenciales.</p>
                        <div v-if="loginError" class="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center gap-3 animate-fade-in shadow-sm">
                            <i class="pi pi-exclamation-circle text-red-500 text-xl"></i>
                            <p class="text-xs text-red-700 font-bold uppercase tracking-tight text-left">{{ loginError }}</p>
                        </div>
                    </div>

                    <form @submit.prevent="sendLogin" class="space-y-8">
                        <!-- Input Usuario -->
                        <div>
                            <label class="block text-xs font-bold text-[#0a3622] uppercase tracking-wider mb-2">CORREO Electrónico</label>
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
                            <div class="flex items-center justify-between mb-2">
                                <label class="block text-xs font-bold text-[#0a3622] uppercase tracking-wider">CONTRASEÑA</label>
                            </div>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i class="pi pi-lock text-[#0a3622] text-lg"></i>
                                </div>
                                <input
                                    v-model="form.password"
                                    :type="mostrarPassword ? 'text' : 'password'"
                                    placeholder="••••••••"
                                    class="block w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-[#0a3622] focus:ring-2 focus:ring-[#1a8a4d] focus:border-transparent transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    @click="mostrarPassword = !mostrarPassword"
                                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    <i :class="mostrarPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mt-2 text-center">
                          <router-link to="/forgot-password" class="text-[#1a8a4d] text-[12px] font-bold hover:underline uppercase tracking-tight">
                            ¿Olvidaste tu contraseña?
                          </router-link>
                        </div>

                        <!-- Botón de inicio de sesión -->
                        <button
                            type="submit"
                            :disabled="isLoading"
                            class="w-full bg-[#07331b] text-white py-3 rounded-lg font-bold text-sm tracking-wider uppercase hover:bg-[#145a32] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {{ isLoading ? 'Cargando...' : 'INGRESAR AL SISTEMA' }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const form = ref({
    email: '',
    password: ''
});
const loginError = ref('');
const currentTime = ref('');
const isLoading = ref(false);
const mostrarPassword = ref(false);

onMounted(() => {
    setInterval(() => {
        const now = new Date();
        currentTime.value = now.toLocaleTimeString();
    }, 1000);
});

async function sendLogin() {
    loginError.value = '';
    isLoading.value = true;

    try {
        await authStore.login({
            email: form.value.email,
            password: form.value.password
        });
    } catch (error) {
        isLoading.value = false;
        if (error.response) {
            loginError.value = error.response.data.message || 'Error de autenticación. Revisa tus credenciales.';
        }
    }
}
</script>

<style scoped>
/* Estilos adicionales */
</style>
