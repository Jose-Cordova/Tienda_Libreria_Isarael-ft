<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">
    <!-- Encabezado responsivo -->
    <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3 text-left">
        <i class="pi pi-shield text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Roles del Sistema</h1>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <!-- Buscador (ocupa todo el ancho en móvil) -->
        <span class="relative group w-full sm:w-auto">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
          <InputText
            v-model="busqueda"
            placeholder="Buscar rol..."
            class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-full sm:w-56 focus:border-green-600 transition-all"
          />
        </span>
        <!-- Botón Nuevo Rol -->
        <Button
          label="Nuevo Rol"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all duration-300 w-full sm:w-auto justify-center"
          @click="abrirNuevo"
        />
      </div>
    </section>

    <!-- Tabla de roles responsiva (scroll horizontal en móvil si es necesario) -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 text-left">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
              <th class="py-2 sm:py-3 px-3 sm:px-5">Nombre del Rol</th>
              <th class="py-2 sm:py-3 px-3 sm:px-5 text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 divide-y divide-gray-100">
            <tr v-for="rol in filteredRoles" :key="rol.id" class="hover:bg-gray-50 transition">
              <td class="py-3 sm:py-4 px-3 sm:px-5 font-bold text-gray-800 text-sm">
                <div class="flex items-center gap-3">
                  <span class="uppercase tracking-tight">{{ rol.nombre }}</span>
                </div>
              </td>
              <td class="py-3 sm:py-4 px-3 sm:px-5">
                <div class="flex items-center justify-center gap-1">
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" @click="abrirEditar(rol)" />
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-sm p-button-danger" @click="borrar(rol)" />
                </div>
              </td>
            </tr>
            <tr v-if="filteredRoles.length === 0">
              <td colspan="2" class="py-10 text-center italic text-gray-400">No se encontraron roles.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <!-- MODAL: NUEVO / EDITAR -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4 font-dm-sans">
        <div class="bg-white rounded-[24px] w-full max-w-md shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
          <button @click="mostrarModal = false" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
            <i class="pi pi-times text-xl"></i>
          </button>
          <div class="p-8">
            <div class="mb-4 text-left">
              <h2 class="text-xl font-extrabold text-[#003d00] mb-1">{{ esEdicion ? 'Editar Rol' : 'Nuevo Rol' }}</h2>
              <p class="text-[14px] text-gray-400 font-medium tracking-tight">Roles del sistema</p>
            </div>
            <form @submit.prevent="guardar" class="space-y-6">
              <div class="space-y-2 text-left">
                <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Nombre del Rol</label>
                <InputText
                  v-model="formulario.nombre"
                  @input="formulario.nombre = formulario.nombre.toUpperCase()"
                  class="w-full border border-gray-200 rounded-xl p-4 text-sm font-bold text-[#0a3622] focus:border-[#003d00] outline-none uppercase"
                  placeholder="Ej: CAJERO"
                />
              </div>

              <div class="flex items-center gap-4 mt-10">
                <button type="button" @click="mostrarModal = false" class="px-10 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm flex-1">Cancelar</button>
                <button type="submit" class="flex-[2] py-4 bg-[#0a3622] hover:bg-[#115033] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

  </main>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import Swal from 'sweetalert2';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';

  // --- DATOS ESTÁTICOS ---
  const roles = ref([
    { id: 1, nombre: 'ADMIN' },
    { id: 2, nombre: 'VENDEDOR' }
  ]);

  const busqueda = ref('');
  const mostrarModal = ref(false);
  const esEdicion = ref(false);
  const formulario = ref({ id: null, nombre: '' });

  const filteredRoles = computed(() => {
    if (!busqueda.value) return roles.value;
    const term = busqueda.value.toLowerCase();
    return roles.value.filter(r => r.nombre.toLowerCase().includes(term));
  });

  const abrirNuevo = () => {
    esEdicion.value = false;
    formulario.value = { id: null, nombre: '' };
    mostrarModal.value = true;
  };

  const abrirEditar = (rol) => {
    esEdicion.value = true;
    formulario.value = { ...rol };
    mostrarModal.value = true;
  };

  const guardar = () => {
    if (!formulario.value.nombre) {
      return Swal.fire('Incompleto', 'El nombre del rol es obligatorio', 'warning');
    }

    Swal.fire({
      icon: 'success',
      title: esEdicion.value ? '¡Actualizado!' : '¡Rol Creado!',
      showConfirmButton: false,
      timer: 1500
    });
    mostrarModal.value = false;
  };

  const borrar = (rol) => {
    Swal.fire({
      title: '¿Eliminar Rol?',
      text: `Se quitarán todos los permisos asociados a ${rol.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d1333e',
      cancelButtonColor: '#708090',
      confirmButtonText: 'Sí, eliminar',
      reverseButtons: true
    });
  };
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #c6e5d3;
    border-radius: 10px;
  }
</style>
