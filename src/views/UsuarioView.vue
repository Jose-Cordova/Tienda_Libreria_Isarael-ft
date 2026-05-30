<template>
  <main class="flex-1 bg-[#f4f7f6] p-6 overflow-y-auto custom-scrollbar relative font-dm-sans">
    <!-- Encabezado -->
    <section class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-300 border-l-[8px] border-l-[#0a3622]">
      <div class="flex items-center gap-3 text-left">
        <i class="pi pi-users text-xl text-green-600"></i>
        <h1 class="text-lg font-extrabold text-[#0a3622]">Usuarios del Sistema</h1>
      </div>
      <div class="flex items-center gap-3">
        <!-- Filtro para buscar -->
        <span class="relative group">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm z-10"></i>
          <InputText
            v-model="busqueda"
            placeholder="Buscar..."
            class="p-inputtext-sm !pl-10 border-gray-500 rounded-lg text-sm text-[#0a3622] w-56 focus:border-green-600 transition-all"
          />
        </span>
        <!-- Botón Nuevo -->
        <Button
          label="Nuevo Usuario"
          icon="pi pi-plus"
          class="p-button-sm font-bold text-sm !bg-[#062c1b] hover:!bg-[#03160d] text-white border-none shadow-sm transition-all duration-300"
          @click="abrirNuevo"
        />
      </div>
    </section>
    <!-- Seccion de targetitas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <!-- Total -->
      <div class="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group transition-all text-left border-[1px] border-[#0a3622] border-l-[10px] overflow-hidden">
        <div>
          <p class="text-[10px] font-black text-[#0a3622] uppercase tracking-[0.2em] mb-1">Total Usuarios</p>
          <p class="text-2xl font-black text-[#0a3622] tracking-tighter">{{ usuarios.length }}</p>
        </div>
      </div>
      <!-- Activos -->
      <div class="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group transition-all text-left border-[1px] border-[#008a00] border-l-[10px] overflow-hidden">
        <div>
          <p class="text-[10px] font-black text-[#008a00] uppercase tracking-[0.2em] mb-1">Activos</p>
          <p class="text-2xl font-black text-[#008a00] tracking-tighter">{{ countActivos }}</p>
        </div>
      </div>
      <!-- Inactivos -->
      <div class="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group transition-all text-left border-[1px] border-[#d1333e] border-l-[10px] overflow-hidden">
        <div>
          <p class="text-[10px] font-black text-[#d1333e] uppercase tracking-[0.2em] mb-1">Inactivos</p>
          <p class="text-2xl font-black text-[#d1333e] tracking-tighter">{{ countInactivos }}</p>
        </div>
      </div>
    </div>
    <!-- Tabla de usuarios -->
    <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 text-left">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
              <th class="py-3 px-5">Usuario</th>
              <th class="py-3 px-5">Correo</th>
              <th class="py-3 px-5">Rol</th>
              <th class="py-3 px-5 text-center">Estado</th>
              <th class="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 divide-y divide-gray-100">
            <tr v-for="user in filteredUsuarios" :key="user.id" class="hover:bg-gray-50 transition">
              <td class="py-4 px-5 font-bold text-gray-800 text-sm">
                <div class="flex items-center gap-3">
                  <div class="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[9px] font-black text-[#0a3622] uppercase border border-white shadow-sm">
                    {{ user.nombre.substring(0,2) }}
                  </div>
                  {{ user.nombre }}
                </div>
              </td>
              <td class="py-4 px-5 font-bold text-gray-800 text-sm">{{ user.email }}</td>
              <td class="py-4 px-5 font-bold text-gray-800 text-sm">
                <span :class="user.rol === 'ADMIN' ? 'bg-[#0a3622] text-white' : 'bg-gray-100 text-gray-600'" class="px-2 py-0.5 rounded text-[10px] font-bold border border-black/5">
                  {{ user.rol }}
                </span>
              </td>
              <td class="py-4 px-5 text-center">
                <span :class="[
                  user.estado === 'ACTIVO' ? 'bg-green-100 text-green-700 border-green-200' :
                  user.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-red-100 text-red-700 border-red-200'
                ]" class="px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase">
                  {{ user.estado }}
                </span>
              </td>
              <td class="py-4 px-5">
                <div class="flex items-center justify-center gap-1">
                  <!-- Solo si NO es el Master Admin -->
                  <template v-if="user.id !== 1">
                    <!-- Botón Reenviar (Solo Pendientes) -->
                    <Button
                      v-if="user.estado === 'PENDIENTE'"
                      icon="pi pi-send"
                      class="p-button-rounded p-button-text p-button-sm p-button-info"
                      @click="reenviarNotificacion(user)"
                    />
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" @click="abrirEditar(user)" />
                    <!-- Botón Cambiar Estado (Activo/Inactivo) -->
                    <Button
                      v-if="user.estado !== 'PENDIENTE'"
                      :icon="user.estado === 'ACTIVO' ? 'pi pi-user-minus' : 'pi pi-user-plus'"
                      :class="user.estado === 'ACTIVO' ? 'p-button-danger' : 'p-button-success'"
                      class="p-button-rounded p-button-text p-button-sm"
                      @click="cambiarEstado(user)"
                    />
                    <!-- Botón Borrar (SOLO si es Pendiente) -->
                    <Button
                      v-if="user.estado === 'PENDIENTE'"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-text p-button-sm p-button-danger"
                      @click="borrar(user)"
                    />
                  </template>
                  <!-- Si es Master Admin, solo permitir edición -->
                  <template v-else>
                    <Button icon="pi pi-lock" class="p-button-rounded p-button-text p-button-sm p-button-secondary" disabled />
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" @click="abrirEditar(user)" />
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsuarios.length === 0">
              <td colspan="5" class="py-10 text-center italic text-gray-400">No se encontraron usuarios.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Paginación -->
      <div class="p-3 border-t border-gray-400 bg-gray-50/50">
        <Paginator
          :rows="paginacion.filas_por_pagina"
          :totalRecords="paginacion.total"
          :rowsPerPageOptions="[5, 10, 20, 30]"
          :first="(paginacion.pagina_actual - 1) * paginacion.filas_por_pagina"
          @page="cambiarPagina"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          class="custom-paginator text-[10px]"
        />
      </div>
    </section>
    <!-- MODAL: NUEVO / EDITAR -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4 font-dm-sans">
        <div class="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl relative overflow-hidden border border-gray-100">
          <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03]"></div>
          <button @click="mostrarModal = false" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition">
            <i class="pi pi-times text-xl"></i>
          </button>
          <div class="p-12">
            <div class="mb-4 text-left">
              <h2 class="text-xl font-extrabold text-[#003d00] mb-1">{{ esEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
              <p class="text-[15px] text-gray-400 font-medium">Datos de usuario</p>
            </div>
            <form @submit.prevent="guardar" class="space-y-6">
              <div class="grid grid-cols-2 gap-x-8 gap-y-6 text-left">
                <div class="space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Nombre Completo</label>
                  <InputText v-model="formulario.nombre" class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-[#003d00] outline-none" placeholder="Ej: Juan Pérez" />
                </div>
                <div class="space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Correo Electrónico</label>
                  <InputText v-model="formulario.email" class="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-[#003d00] outline-none" placeholder="Ej: usuario@gmail.com" />
                </div>
                <div class="space-y-2">
                  <label class="block text-[12px] font-extrabold text-[#3a5a3a] uppercase tracking-[0.2em]">Rol de Acceso</label>
                  <Dropdown
                    v-model="formulario.rol"
                    :options="roles"
                    placeholder="Seleccionar"
                    :disabled="formulario.id === 1"
                    class="w-full border border-gray-200 rounded-xl text-sm h-[38px] flex items-center font-bold disabled:bg-gray-100 disabled:opacity-70"
                  />
                </div>
              </div>
              <div v-if="!esEdicion" class="bg-green-100 p-4 rounded-xl border border-green-100 mt-4 text-left">
                <p class="text-[11px] font-bold text-green-800 uppercase tracking-tight flex items-center gap-2">
                  <i class="pi pi-info-circle"></i> Token de 24h será enviado al correo.
                </p>
              </div>
              <div class="flex items-center gap-4 mt-10">
                <button type="button" @click="mostrarModal = false" class="px-10 py-4 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition-all text-sm">Cancelar</button>
                <button type="submit" class="flex-1 py-4 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-lg transition-all text-sm uppercase tracking-widest">Guardar</button>
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
  import Dropdown from 'primevue/dropdown';
  import Paginator from 'primevue/paginator';

  // --- DATOS ESTÁTICOS (Simulando Backend) ---
  const roles = ['ADMIN', 'VENDEDOR'];
  const usuarios = ref([
    { id: 1, nombre: 'Dev Jose', email: 'jose@gmail.com', rol: 'ADMIN', estado: 'ACTIVO' },
    { id: 2, nombre: 'Usuario Prueba', email: 'usuario@gmail.com', rol: 'VENDEDOR', estado: 'ACTIVO' },
    { id: 3, nombre: 'Ana García', email: 'ana.garcia@gmail.com', rol: 'VENDEDOR', estado: 'INACTIVO' },
    { id: 4, nombre: 'Carlos López', email: 'carlos.l@gmail.com', rol: 'VENDEDOR', estado: 'PENDIENTE' }
  ]);

  const paginacion = ref({
    pagina_actual: 1,
    filas_por_pagina: 10,
    total: 4
  });

  const busqueda = ref('');
  const mostrarModal = ref(false);
  const esEdicion = ref(false);
  const formulario = ref({ id: null, nombre: '', email: '', rol: 'VENDEDOR' });

  // --- FILTRADO Y MÉTRICAS ---
  const filteredUsuarios = computed(() => {
    if (!busqueda.value) return usuarios.value;
    const term = busqueda.value.toLowerCase();
    return usuarios.value.filter(u =>
      u.nombre.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  });

  const countActivos = computed(() => usuarios.value.filter(u => u.estado === 'ACTIVO').length);
  const countInactivos = computed(() => usuarios.value.filter(u => u.estado === 'INACTIVO').length);

  // --- ACCIONES ---
  const cambiarPagina = (e) => {
    paginacion.value.pagina_actual = e.page + 1;
    paginacion.value.filas_por_pagina = e.rows;
  };

  const abrirNuevo = () => {
    esEdicion.value = false;
    formulario.value = { id: null, nombre: '', email: '', rol: 'VENDEDOR' };
    mostrarModal.value = true;
  };

  const abrirEditar = (user) => {
    esEdicion.value = true;
    formulario.value = { ...user };
    mostrarModal.value = true;
  };

  const guardar = () => {
    if (!formulario.value.nombre || !formulario.value.email) {
      return Swal.fire('Incompleto', 'Por favor llena los campos obligatorios', 'warning');
    }
    // Simulación de guardado
    Swal.fire({
      icon: 'success',
      title: esEdicion.value ? '¡Actualizado!' : '¡Usuario Creado!',
      text: esEdicion.value ? 'Los datos han sido actualizados' : 'Se ha enviado la invitación al correo',
      showConfirmButton: false,
      timer: 2000
    });
    mostrarModal.value = false;
  };

  const reenviarNotificacion = (user) => {
    Swal.fire({
      icon: 'info',
      title: 'Reenviando Invitación',
      text: `Se ha generado un nuevo token para ${user.email}`,
      confirmButtonColor: '#0a3622'
    });
  };

  const cambiarEstado = (user) => {
    const nuevoEstado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    Swal.fire({
      title: `¿Pasar a ${nuevoEstado}?`,
      text: `El usuario ${user.nombre} cambiará su estado de acceso.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: nuevoEstado === 'ACTIVO' ? '#008a00' : '#d1333e',
      cancelButtonColor: '#708090',
      confirmButtonText: `Sí, pasar a ${nuevoEstado}`,
      reverseButtons: true
    }).then((result) => {
      if(result.isConfirmed){
        user.estado = nuevoEstado;
        Swal.fire({
          icon: 'success',
          title: 'Estado Actualizado',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  };

  const borrar = (user) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás el acceso de ${user.nombre}`,
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
    border-radius: 10px;
  }
  .animate-fade-up{
    animation: fadeUp 0.3s ease-out forwards;
  }
  @keyframes fadeUp{
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
