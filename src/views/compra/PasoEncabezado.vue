<template>
  <div class="pb-20">
    <!-- CARD PRINCIPAL: Datos de Factura -->
    <div class="bg-white p-12 rounded-[28px] border border-gray-100 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-2.5 bg-[#0a3622]"></div>
      <!-- Encabezado del Formulario -->
      <div class="flex items-center gap-5 mb-6 pb-6 border-b border-gray-50 text-left">
        <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#0a3622] shadow-sm border border-green-100">
          <i class="pi pi-file-edit text-2xl"></i>
        </div>
        <div>
          <h3 class="text-2xl font-black text-[#0a3622] tracking-tight">Datos de la Factura</h3>
          <p class="text-sm text-gray-400 font-medium uppercase tracking-widest">Información general</p>
        </div>
      </div>
      <form @submit.prevent="validarContinuar" class="space-y-10">
        <!-- Grid de Entradas de Datos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 text-left">
          <!-- Nº de Factura -->
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-gray-800 uppercase tracking-[0.25em] ml-1">Nº de Control *</label>
            <InputText
              v-model="formulario.numero_factura"
              @input="formulario.numero_factura = formulario.numero_factura.toUpperCase()"
              class="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold text-[#0a3622] focus:border-[#0a3622] outline-none shadow-sm transition-all uppercase"
              placeholder="Ej: DTE-03-12345678-000000000000001"
            />
          </div>
          <!-- Código de Factura -->
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-gray-800 uppercase tracking-[0.25em] ml-1">Código de Generación *</label>
            <InputText
              v-model="formulario.codigo_factura"
              @input="formulario.codigo_factura = formulario.codigo_factura.toUpperCase()"
              class="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold text-[#0a3622] focus:border-[#0a3622] outline-none shadow-sm transition-all uppercase"
              placeholder="Ej: C6A9868C-028D-421B-A9A0-36274CECC2C7"
            />
          </div>
          <!-- Fecha de Emisión -->
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-gray-800 uppercase tracking-[0.25em] ml-1">Fecha de Emisión *</label>
            <Calendar
              v-model="formulario.fecha_emision"
              class="w-full h-[54px]"
              inputClass="border border-gray-200 rounded-xl p-4 text-sm font-bold text-[#0a3622] focus:border-[#0a3622] outline-none w-full shadow-sm"
              dateFormat="yy-mm-dd"
              showIcon
              placeholder="Seleccione la fecha"
              :maxDate="hoy"
            />
          </div>
          <!-- Selección de Proveedor -->
          <div class="space-y-3">
            <label class="block text-[11px] font-black text-gray-800 uppercase tracking-[0.25em] ml-1">Proveedor *</label>
            <Dropdown
              v-model="formulario.proveedor_id"
              :options="proveedorStore.proveedores"
              optionLabel="nombre"
              optionValue="id"
              placeholder="— Seleccione un Proveedor —"
              class="w-full border border-gray-200 rounded-xl text-sm h-[54px] flex items-center font-bold shadow-sm"
              filter
            />
          </div>
        </div>
        <!-- Botones de Navegación -->
        <div class="mt-14 pt-8 border-t border-gray-400 flex justify-end items-center">
          <button
            type="submit"
            class="px-12 py-4 bg-[#0a3622] hover:bg-[#002800] text-white font-black rounded-xl shadow-xl transition-all text-xs tracking-[0.2em] flex items-center gap-3 group uppercase"
          >
            Continuar a productos
            <i class="pi pi-arrow-right text-[10px] group-hover:translate-x-1.5 transition-transform duration-300"></i>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useProveedorStore } from '@/stores/proveedorStore';
  import Swal from 'sweetalert2';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import Calendar from 'primevue/calendar';

  const props = defineProps({
    datos: Object
  })
  const hoy = new Date()
  const emit = defineEmits(['siguiente', 'atras'])
  const proveedorStore = useProveedorStore()

  //Sincronizamos el formulario con los datos que el Wizard tenga guardados
  const formulario = ref({
    numero_factura: props.datos.numero_factura || '',
    codigo_factura: props.datos.codigo_factura || '',
    fecha_emision: props.datos.fecha_emision ? new Date(props.datos.fecha_emision) : null,
    proveedor_id: props.datos.proveedor_id || null
  })
  //Cargamos los proveedores
  onMounted(async () => {
    if(proveedorStore.proveedores.length === 0){
      await proveedorStore.fetchProveedores(1, 100)
    }
  })

  //Validacion de campos obligatorios
  const validarContinuar = () => {
    if(!formulario.value.numero_factura || !formulario.value.codigo_factura || !formulario.value.proveedor_id || !formulario.value.fecha_emision){
      return Swal.fire({
        icon: 'warning',
        title: 'Datos Incompletos',
        text: 'Debe completar el Nº de factura, codigo de factura, la fecha y el proveedor para continuar.',
        confirmButtonColor: '#0a3622'
      })
    }
    //Enviamos los datos al cerebro
    emit('siguiente', formulario.value)
  }
</script>

<style>
  :deep(.p-dropdown-label){
    padding: 0.75rem !important;
    color: #0a3622 !important;
  }
  :deep(.p-dropdown-trigger){
    width: 3.5rem;
  }
  :deep(.p-datepicker){
    border-radius: 20px !important;
    border: 1px solid #f1f1f1 !important;
  }
  .animate-fade-in{
    animation: fadeIn 0.5s ease-out forwards;
  }
  @keyframes fadeIn{
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
