import { ref, computed } from "vue";

export function usePasswordStrength(){
  const password = ref('')
  const score = ref()
  const feedback = ref([])

  const evaluate = (pwd) => {
    password.value = pwd
    const checks = []
    let points = 0

    //Longitud minima de 8 caracteres
    if(pwd.length >= 8){
      points++
    }else{
      checks.push('Al menos 8 caracteres')
    }

    //Mayusculas y minusculas
    if(/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)){
      points++
    }else{
      checks.push('Mayúsculas y minúsculas')
    }

    //Numeros
    if(/\d/.test(pwd)){
      points ++
    }else{
      checks.push('Al menos un número')
    }

    if(/[^a-zA-Z0-9]/.test(pwd)){
      points++
    }else{
      checks.push('Al menos un carácter especial (!@#$%^&*)')
    }

    score.value = Math.min(points, 4)
    feedback.value = checks
    return {score: score.value, feedback: feedback.value}
  }

  const strengthLabel = computed(() => {
    const s = score.value
    if (s === 0 || s === 1) return { label: 'Débil', color: 'bg-red-500', textColor: 'text-red-600' }
    if (s === 2) return { label: 'Media', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    if (s === 3) return { label: 'Buena', color: 'bg-blue-500', textColor: 'text-blue-600' }
    if (s >= 4) return { label: 'Fuerte', color: 'bg-green-500', textColor: 'text-green-600' }
    return { label: '', color: 'bg-gray-300', textColor: 'text-gray-500' }
  })

  return { password, score, feedback, evaluate, strengthLabel }
}
