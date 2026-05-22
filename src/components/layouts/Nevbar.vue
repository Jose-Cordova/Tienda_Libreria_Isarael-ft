<template>
    <nav class="bg-[#052216] text-white px-6 py-2 flex items-center justify-between shadow-lg border-b border-white/5">
        <div class="flex items-center gap-3">
            <span class="text-xl font-bold tracking-tight">
                Tienda y <span class="text-[#529931]">Librería Israel</span>
            </span>
        </div>

        <div class="flex items-center gap-6">
            <div class="hidden md:block font-mono text-sm text-gray-400 font-bold opacity-80">
                {{ currentTime }}
            </div>

            <div class="flex items-center bg-[#0a3622] rounded-full pl-1 pr-4 py-1 border border-white/10 gap-3">
                <div class="w-8 h-8 rounded-full bg-[#529931] flex items-center justify-center text-xs font-black border border-[#052216]">
                    {{ getInitials(authStore.user?.name) }}
                </div>
                <span class="text-sm font-bold tracking-wide">
                    {{ authStore.user?.name || 'Administrador' }}
                </span>
            </div>

            <button
                @click="mostrarConfirmacion = true"
                class="flex items-center gap-2 bg-transparent border border-white/20 hover:bg-red-900/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg text-sm font-bold transition-all group text-white"
            >
                <i class="pi pi-power-off text-xs text-white/70 group-hover:text-red-600"></i>
                <span>Cerrar Sesión</span>
            </button>
        </div>
    </nav>

    <div
        v-if="mostrarConfirmacion"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4"
    >
        <div class="bg-white rounded-[24px] w-full max-w-xs shadow-2xl relative overflow-hidden p-6 text-center border border-gray-100">
            <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <i class="pi pi-exclamation-triangle text-xl text-red-600"></i>
            </div>

            <h3 class="text-base font-extrabold text-[#0a3622] mb-1">¿Cerrar Sesión?</h3>
            <p class="text-xs text-gray-400 font-medium mb-6">¿Estás seguro de que deseas salir del sistema?</p>

            <div class="flex items-center gap-3">
                <Button
                    label="Cancelar"
                    class="p-button-outlined p-button-secondary flex-1 py-2 rounded-full text-xs font-extrabold"
                    @click="mostrarConfirmacion = false"
                />
                <Button
                    label="Salir"
                    class="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white border-none rounded-full text-xs font-extrabold shadow-md transition"
                    @click="confirmarLogout"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import Button from 'primevue/button';

const authStore = useAuthStore();

// Control del modal de confirmación
const mostrarConfirmacion = ref(false);

// Lógica del Reloj
const currentTime = ref(new Date().toLocaleTimeString('es-ES', { hour12: false }));
let timer;

onMounted(() => {
    timer = setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString('es-ES', { hour12: false });
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});

// Obtener iniciales del usuario
const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

// Confirmar y ejecutar la salida definitiva
const confirmarLogout = async () => {
    mostrarConfirmacion.value = false;
    await authStore.logout();
};
</script>
