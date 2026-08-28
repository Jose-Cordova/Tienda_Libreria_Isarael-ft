<template>
  <main class="flex-1 bg-[#f4f7f6] p-3 sm:p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">
    <!-- Encabezado -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <i class="pi pi-truck text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Proveedores</h1>
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <!-- Filtro para buscar -->
        <span class="relative flex-1 sm:flex-none">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
          <InputText
            v-model="store.searchQuery"
            placeholder="Buscar..."
            class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-full sm:w-56 focus:border-green-600 transition-all"
            @input="buscar"
          />
        </span>
        <!-- Botón Nuevo -->
        <Button
          label="Nuevo Proveedor"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all duration-300 w-full sm:w-auto"
          @click="abirNuevo"
        />
      </div>
    </section>
    <!-- Tabla de Datos -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Nombre</th>
              <th class="py-3 px-5">Teléfono</th>
              <th class="py-3 px-5">Email</th>
              <th class="py-3 px-5">Dirección</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 divide-y divide-gray-100">
            <tr v-for="prov in store.filteredProveedores" :key="prov.id" class="hover:bg-gray-50 transition">
              <td class="py-4 px-5 font-bold text-gray-800 text-sm">{{ prov.nombre }}</td>
              <td class="py-4 px-5 font-bold text-sm text-gray-800">{{ prov.telefono }}</td>
              <td class="py-4 px-5 font-bold text-gray-800 text-sm">{{ prov.email || '—' }}</td>
              <td class="py-4 px-5 font-bold text-gray-800 text-sm max-w-xs truncate" :title="prov.direccion">{{ prov.direccion || '—' }}</td>
              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-1">
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" @click="abrirEditar(prov)" />
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger" @click="borrar(prov)" />
                </div>
              </td>
            </tr>
            <tr v-if="store.filteredProveedores.length === 0">
              <td colspan="5" class="py-10 text-center italic text-gray-400">No se encontraron resultados.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Paginación integrada -->
      <div class="p-3 border-t border-gray-400 bg-gray-50/50">
        <Paginator
          :rows="store.paginacion.filas_por_pagina"
          :totalRecords="store.paginacion.total"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          :first="(store.paginacion.pagina_actual - 1) * store.paginacion.filas_por_pagina"
          @page="cambiarPagina"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          class="custom-paginator text-[10px]"
        />
      </div>
    </section>
    <!-- MODAL: Nuevo/Editar -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-[24px] w-[95vw] max-w-2xl shadow-2xl relative overflow-hidden animate-fade-up border border-gray-100 overflow-y-auto max-h-[90vh]">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
        <button @click="mostrarModal = false" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
          <i class="pi pi-times text-xl"></i>
        </button>
        <div class="p-8 sm:p-12">
          <div class="mb-10 text-left">
            <h2 class="text-xl font-extrabold text-[#003d00] mb-1">{{ esEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>
            <p class="text-[15px] text-gray-400 font-medium">Datos del proveedor</p>
          </div>
          <form @submit.prevent="procesarGuradado" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Nombre</label>
                <InputText
                  v-model="formulario.nombre"
                  class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-[#003d00] outline-none"
                  :class="{ 'border-red-500': errores.nombre }"
                  placeholder="Ej: Distribuidora García"
                />
                <small v-if="errores.nombre" class="text-red-500 text-xs block">{{ errores.nombre }}</small>
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Teléfono</label>
                <SelectorPaisTelefono ref="selectorTelefono" v-model="formulario.telefono" />
                <small v-if="errores.telefono" class="text-red-500 text-xs block">{{ errores.telefono }}</small>
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Email</label>
                <InputText
                  v-model="formulario.email"
                  class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-[#003d00] outline-none"
                  :class="{ 'border-red-500': errores.email }"
                  placeholder="Ej: correo@gmail.com"
                />
                <small v-if="errores.email" class="text-red-500 text-xs block">{{ errores.email }}</small>
              </div>
              <div class="space-y-2">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Dirección (Opcional)</label>
                <InputText
                  v-model="formulario.direccion"
                  class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-[#003d00] outline-none"
                  placeholder="Ej: Calle, ciudad..."
                />
              </div>
            </div>
            <div class="flex items-center gap-4 mt-10">
              <button type="button" @click="mostrarModal = false" class="px-10 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm">Cancelar</button>
              <button type="submit" :disabled="enviando" class="flex-1 py-4 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest disabled:opacity-50">
                {{ enviando ? 'PROCESANDO...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </main>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useProveedorStore } from '@/stores/proveedorStore';
  import Swal from 'sweetalert2';
  import { useToast } from 'primevue/usetoast';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Paginator from 'primevue/paginator';
  // Componente reutilizable de teléfono con selector de país
  import SelectorPaisTelefono from '@/components/ventas/SelectorPaisTelefono.vue';

  const store = useProveedorStore()
  const toast = useToast()
  const mostrarModal = ref(false)
  const esEdicion = ref(false)
  const enviando = ref(false)
  const formulario = ref({id: null, nombre: '', telefono: '', email: '', direccion: ''})
  const selectorTelefono = ref(null)

  // Errores inline
  const errores = ref({
    nombre: '',
    telefono: '',
    email: ''
  })

  const limpiarErrores = () => {
    errores.value = {
      nombre: '',
      telefono: '',
      email: ''
    }
  }

  onMounted(() => store.fetchProveedores(1, 10))

  const cambiarPagina = (e) => store.fetchProveedores(e.page + 1, e.rows)

  let timer = null
  const buscar = () => {
    clearTimeout(timer)
    timer = setTimeout(() => store.fetchProveedores(1, store.paginacion.filas_por_pagina))
  }

  const abirNuevo = () => {
    esEdicion.value = false
    formulario.value = { id: null, nombre: '', telefono: '', email: '', direccion: '' }
    limpiarErrores()
    mostrarModal.value = true
  }

  const abrirEditar = (p) => {
    esEdicion.value = true
    formulario.value = { ...p }
    limpiarErrores()
    mostrarModal.value = true
  }

  const procesarGuradado = async () => {
    limpiarErrores()

    // Validar teléfono si se ingresó un número
    if (formulario.value.telefono && formulario.value.telefono.trim() !== '') {
      const telefonoValido = selectorTelefono.value?.validar() ?? false
      if (!telefonoValido) {
        errores.value.telefono = selectorTelefono.value?.getError() || 'Teléfono inválido.'
        return
      }
    }

    // Validación inline requerida
    if(!formulario.value.nombre || !formulario.value.nombre.trim()){
      errores.value.nombre = 'El nombre del proveedor es obligatorio.'
      return
    }

    enviando.value = true
    try{
      if(esEdicion.value) {
        await store.editarProveedor(formulario.value.id, formulario.value)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Proveedor actualizado con éxito',
          life: 3500
        })
      } else {
        await store.crearProveedor(formulario.value)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Proveedor guardado con éxito',
          life: 3500
        })
      }
      mostrarModal.value = false
    }catch(error){
      // Si es error de validación 422, mostrar inline bajo el campo
      if (error.response?.status === 422) {
        const valErrors = error.response.data.errors || error.response.data.error || {}
        if(valErrors.nombre) errores.value.nombre = Array.isArray(valErrors.nombre) ? valErrors.nombre[0] : valErrors.nombre
        if(valErrors.telefono) errores.value.telefono = Array.isArray(valErrors.telefono) ? valErrors.telefono[0] : valErrors.telefono
        if(valErrors.email) errores.value.email = Array.isArray(valErrors.email) ? valErrors.email[0] : valErrors.email
      } else {
        // Errores de servidor o red mostrados mediante Toast
        const msg = error.response?.data?.message || 'Error al guardar el proveedor.'
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: msg,
          life: 5000
        })
      }
    }finally{
      enviando.value = false
    }
  }

  // Confirmación destructiva de eliminación únicamente con SweetAlert2
  const borrar = async (p) => {
    const result = await Swal.fire({
      title: '¿Eliminar proveedor?',
      text: `Se eliminará a "${p.nombre}". Esta acción no se puede revertir.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d1333e',
      cancelButtonColor: '#d6dfd6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { cancelButton: '!text-[#3a5a3a] !font-bold' },
      reverseButtons: true,
      allowOutsideClick: false
    })

    if(result.isConfirmed){
      try{
        await store.eliminarProveedor(p.id)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Proveedor eliminado correctamente',
          life: 3500
        })
      }catch(err){
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err.response?.data?.message || 'No se pudo eliminar el proveedor.',
          life: 5000
        })
      }
    }
  }
</script>

<style scoped>
.p-inputtext{
  font-size: 0.875rem !important;
  font-weight: 600 !important;
}
:deep(.p-paginator){
  background: transparent;
  border: none;
  padding: 0;
}
:deep(.p-paginator-page.p-highlight){
  background: #0b580b !important;
  color: white !important;
  font-weight: bold;
}
.custom-scrollbar::-webkit-scrollbar{
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb{
  background-color: #c6e5d3;
  border-radius: 4px;
}
.animate-fade-up{
  animation: fadeUp 0.3s ease-out forwards;
}
@keyframes fadeUp{
  from {opacity: 0; transform: translateY(20px);}
  to {opacity: 1; transform: translateY(0);}
}
</style>
