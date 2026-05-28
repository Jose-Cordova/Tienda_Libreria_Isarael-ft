<template>
  <div class="w-full font-dm-sans px-4">
    <!-- Encabezado-->
    <section class="flex flex-wrap items-center justify-between gap-6 mb-6 bg-white p-4 rounded-[12px] border border-gray-100 shadow-md border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-5">
        <div class="flex items-center justify-center text-[#0a3622] shadow-sm border border-green-100 flex-shrink-0">
          <i class="pi pi-cart-plus text-xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-extrabold text-[#0a3622]">Registrar Nueva Compra</h1>
        </div>
      </div>
      <button
        @click="$emit('cerrar')"
        class="group flex items-center gap-3 px-6 py-2.5 bg-red-50 text-red-600 font-black rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 text-[12px] tracking-widest border border-red-100 shadow-sm"
      >
        <i class="pi pi-times-circle text-lg group-hover:rotate-90 transition-transform duration-300"></i>
        Cancelar Registro
      </button>
    </section>
    <!-- Barra de progreso -->
    <div class="flex border border-gray-200 rounded-xl overflow-hidden bg-white mb-8 shadow-md h-14">
      <div
        v-for="(nombre, index) in nombresPasos"
        :key="index"
        :class="[
          'flex-[1_0_150px] flex items-center justify-center p-1 border-r last:border-0 transition-all relative',
          pasoActual === (index + 1) ? 'bg-white text-[#0a3622]' : (pasoActual > (index + 1) ? 'bg-[#f0f9f0] text-green-700' : 'bg-gray-50 text-gray-400 opacity-60')
        ]"
      >
        <div v-if="pasoActual === (index + 1)" class="absolute bottom-0 left-0 w-full h-1 bg-[#0a3622]"></div>

        <div class="flex items-center gap-3">
          <span :class="[
            'w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-black transition-all shadow-sm',
            pasoActual === (index + 1) ? 'border-[#0a3622] bg-[#0a3622] text-white scale-105' : (pasoActual > (index + 1) ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-white')
          ]">
            <i v-if="pasoActual > (index + 1)" class="pi pi-check text-[9px]"></i>
            <span v-else>{{ index + 1 }}</span>
          </span>
          <span class="text-[12px] font-black uppercase tracking-widest whitespace-nowrap">{{ nombre }}</span>
        </div>
      </div>
    </div>
    <!-- Vista dinamica de los pasos-->
    <div class="relative min-h-[600px] mb-24 px-2">
      <component
        :is="componenteActual"
        :datos="compraTemporal"
        @siguiente="avanzarPaso"
        @atras="retrosederPaso"
        @finalizar="finalizarCompra"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  //Conponentes para el proseso de compra
  import PasoEncabezado from './PasoEncabezado.vue';
  import PasoProducto from './PasoProducto.vue';
  import PasoResumen from './PasoResumen.vue';

  const emit = defineEmits(['cerrar'])

  //Estado global del registro
  const pasoActual = ref(1)
  const nombresPasos = ['Factura y Proveedor', 'Productos y Lotes', 'Revisión y Confirmación']

  //Objeto que viajara por todos los pasos guardando la informacion
  const compraTemporal = ref({
    numero_factura: '',
    codigo_factura: '',
    fecha_emision: null,
    proveedor_id: null,
    detalles: []
  })

  //Decidimos que componente mostrar segun el paso actual
  const componenteActual = computed(() => {
    switch(pasoActual.value){
      case 1: return PasoEncabezado
      case 2: return PasoProducto
      case 3: return PasoResumen
      default: return null
    }
  })

  //Funcion de navegacion
  const avanzarPaso = (datosHijo) => {
    compraTemporal.value = {...compraTemporal.value, ...datosHijo}
    pasoActual.value++
  }
  const retrosederPaso = () => {
    if(pasoActual.value > 1) pasoActual.value--
  }
  const finalizarCompra = () =>{
    //Aqui llamaremos al store para guardar
    emit('cerrar')
  }
</script>

<style>
  .fade-enter-active, .fade-leave-active{
    transition: opacity 0.3s ease;
  }
  .fade-enter-from, .fade-leave-to{
    opacity: 0;
  }
</style>
