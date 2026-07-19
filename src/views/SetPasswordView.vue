<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-dm-sans">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <h2 class="text-2xl font-bold text-center mb-6 text-[#0a3622]">Establecer contraseña</h2>

      <!-- Mensaje de éxito -->
      <div v-if="exito" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {{ mensajeExito }}
      </div>

      <!-- Mensaje de error -->
      <div v-if="error && !exito" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardarPassword" v-if="!exito">
        <!-- Campo: Nueva contraseña -->
      <div class="mb-4">
        <label class="block text-sm font-bold mb-2 text-[#0a3622]">Nueva contraseña</label>
        <div class="relative">
          <input
            :type="mostrarPassword ? 'text' : 'password'"
            v-model="form.password"
            @input="evaluateStrength(form.password)"
            required
            class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3622]"
            placeholder="Mínimo 8 caracteres"
          />
          <button
            type="button"
            @click="mostrarPassword = !mostrarPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            <i :class="mostrarPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>

        <!-- Medidor de fortaleza -->
        <div v-if="form.password.length > 0" class="mt-2">
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300 rounded-full"
                :class="strenghLabel.color"
                :style="{ width: `${(score / 4) * 100}%` }"
              ></div>
            </div>
            <span class="text-xs font-bold" :class="strenghLabel.textColor">
              {{ strenghLabel.label }}
            </span>
          </div>
          <!-- Lista de requisitos pendientes -->
          <ul v-if="feedback.length > 0" class="mt-1 text-xs text-gray-500 list-disc list-inside">
            <li v-for="item in feedback" :key="item" class="text-red-500">
              Faltan: {{ item }}
            </li>
          </ul>
        </div>
      </div>

        <!-- Campo: Confirmar contraseña -->
        <div class="mb-6">
          <label class="block text-sm font-bold mb-2 text-[#0a3622]">Confirmar contraseña</label>
          <div class="relative">
            <input
              :type="mostrarConfirmacion ? 'text' : 'password'"
              v-model="form.password_confirmation"
              required
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3622]"
              placeholder="Repite la contraseña"
            />
            <button
              type="button"
              @click="mostrarConfirmacion = !mostrarConfirmacion"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              <i :class="mostrarConfirmacion ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="cargando"
          class="w-full bg-[#0a3622] hover:bg-[#115033] text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {{ cargando ? 'Guardando...' : 'Guardar contraseña' }}
        </button>
      </form>

      <!-- Botón Volver al inicio de sesión -->
      <div class="mt-4 text-center">
        <button
          @click="volverLogin"
          class="text-[#0a3622] hover:underline font-bold cursor-pointer bg-transparent border-none"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute} from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { usePasswordStrength } from '@/composables/usePasswordStrength';
import api from '@/services/api';
import router from '@/router';

const route = useRoute()
const authStore = useAuthStore()
const {score, feedback, evaluate: evaluateStrength, strenghLabel} = usePasswordStrength()

const form = ref({
  password: '',
  password_confirmation: ''
})
const token = ref('')
const cargando = ref(false)
const error = ref('')
const exito = ref(false)
const mensajeExito = ref('')
const mostrarPassword = ref(false)
const mostrarConfirmacion = ref(false)

onMounted(() => {
  token.value = route.query.token || ''
  if(!token.value){
    error.value = 'No se encontró el token de invitación.'
  }
})

const guardarPassword = async () => {
  if(!token.value){
    error.value = 'Token inválido.'
    return
  }
  if(form.value.password !== form.value.password_confirmation){
    error.value = 'Las contraseñas no coinciden.'
    return
  }
  if(form.value.password.length < 8){
    error.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }

  cargando.value = true
  error.value = ''
  try{
    const response = await api.post('/set-password', {
      token: token.value,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation
    })
    exito.value = true
    mensajeExito.value = response.data.message || 'Contraseña establecida correctamente.'
  }catch(err){
    error.value = err.response?.data?.message || 'Ocurrió un error.'
    if(err.response?.status === 422){
      const errors = err.response.data.errors
      if(errors){
        // Mostrar errores de validación
        error.value = Object.values(errors).flat().join('. ')
      }
    }
  }finally{
    cargando.value = false
  }
}
  const volverLogin = () => {
    authStore.$reset()
    router.push('/login')
  }
</script>
