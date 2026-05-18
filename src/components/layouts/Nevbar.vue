<template>
    <nav class="bg-[#052216] text-white px-6 py-2 flex items-center justify-between shadow-lg border-b border-white/5">
        <!-- Izquierda: Branding -->
        <div class="flex items-center gap-3">
            <span class="text-xl font-bold tracking-tight">
                Tienda y <span class="text-[#529931]">Librería Israel</span>
            </span>
        </div>

        <!-- Derecha: Info y Acciones -->
        <div class="flex items-center gap-6">
            <!-- Reloj -->
            <div class="hidden md:block font-mono text-sm text-gray-400 font-bold opacity-80">
                {{ currentTime }}
            </div>

            <!-- Usuario Info Pill -->
            <div class="flex items-center bg-[#0a3622] rounded-full pl-1 pr-4 py-1 border border-white/10 gap-3">
                <div class="w-8 h-8 rounded-full bg-[#529931] flex items-center justify-center text-xs font-black border border-[#052216]">
                    {{ getInitials(authStore.user?.name) }}
                </div>
                <span class="text-sm font-bold tracking-wide">
                    {{ authStore.user?.name || 'Administrador' }}
                </span>
            </div>

            <!-- Botón Salir -->
            <button
                @click="handleLogout"
                class="flex items-center gap-2 bg-transparent border border-white/20 hover:bg-red-900/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg text-sm font-bold transition-all group text-white"
            >
                <i class="pi pi-power-off text-xs text-white/70 group-hover:text-red-600"></i>
                <span>Cerrar Sesión</span>
            </button>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

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

const handleLogout = async () => {
    await authStore.logout();
};
</script>
