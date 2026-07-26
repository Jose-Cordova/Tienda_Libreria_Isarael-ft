<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-dm-sans">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <!-- Logo o título -->
      <h2 class="text-2xl font-bold text-center mb-2 text-[#0a3622]">Recuperar contraseña</h2>
      <p class="text-center text-gray-500 text-sm mb-6">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <!-- Mensaje de éxito -->
      <div v-if="exito" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {{ mensajeExito }}
      </div>
      <!-- Mensaje de error -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>
      <!-- Formulario -->
      <form @submit.prevent="enviarCorreo" v-if="!exito">
        <div class="mb-4">
          <label class="block text-sm font-bold mb-2 text-[#0a3622]">Correo electrónico</label>
          <InputText
            v-model="email"
            type="email"
            placeholder="ej: usuario@correo.com"
            class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#0a3622] focus:border-transparent"
            :class="{ 'border-red-500': error }"
          />
        </div>
        <button
          type="submit"
          :disabled="cargando"
          class="w-full bg-[#0a3622] hover:bg-[#115033] text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {{ cargando ? 'Enviando...' : 'Enviar enlace de recuperación' }}
        </button>
      </form>
      <!-- Enlace para volver al login -->
      <div class="mt-4 text-center">
        <router-link to="/login" class="text-[#0a3622] hover:underline font-bold text-sm">
          Volver al inicio de sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import api from '@/services/api';

  const email = ref('')
  const cargando = ref(false)
  const error = ref('')
  const exito = ref(false)
  const mensajeExito = ref('')

  const enviarCorreo = async () =>{
    if(!email.value.trim()){
      error.value = 'El correo electrónico es obligatorio.'
      return
    }
    if(!email.value.includes('@') || !email.value.includes('.')){
      error.value = 'El correo electrónico no es válido.'
      return
    }

    cargando.value = true
    error.value = ''
    exito.value = false

    try{
      const response = await api.post('/forgot-password', {
        email: email.value.trim()
      })

      exito.value = true
      mensajeExito.value = response.data.message || 'Revisa tu correo para restablecer tu contraseña.'

    }catch(err){
      error.value = err.response?.data?.message || 'Ocurrió un error al enviar el correo.'

    }finally{
      cargando.value = false
    }
  }
</script>
