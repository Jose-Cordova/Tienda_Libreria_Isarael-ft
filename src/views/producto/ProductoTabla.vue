<template>
  <section class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr class="bg-[#99bba7] text-[#000000] text-[12px] font-bold uppercase tracking-wider">
            <th class="py-3 px-4">Producto</th>
            <th class="py-3 px-4">Sección</th>
            <th class="py-3 px-4">Categoría</th>
            <th class="py-3 px-4">Marca</th>
            <th class="py-3 px-4">P. Detalle</th>
            <th class="py-3 px-4">P. Mayor</th>
            <th class="py-3 px-4">Stock</th>
            <th class="py-3 px-4">Stock Mínimo</th>
            <th class="py-3 px-4 text-center">Perec.</th>
            <th class="py-3 px-4 text-center">Estado</th>
            <th class="py-3 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 divide-y divide-gray-100">
          <!-- Loading Skeleton -->
          <template v-if="isTableLoading">
            <tr v-for="i in perPage" :key="'skel-'+i">
              <td class="py-4 px-4"><Skeleton width="100%" height="1.5rem" /></td>
              <td class="py-4 px-4"><Skeleton width="80%" height="1.5rem" /></td>
              <td class="py-4 px-4"><Skeleton width="80%" height="1.5rem" /></td>
              <td class="py-4 px-4"><Skeleton width="80%" height="1.5rem" /></td>
              <td class="py-4 px-4"><Skeleton width="70%" height="1.5rem" /></td>
              <td class="py-4 px-4"><Skeleton width="70%" height="1.5rem" /></td>
              <td class="py-4 px-4"><Skeleton width="50%" height="1.5rem" /></td>
              <td class="py-4 px-4"><Skeleton width="50%" height="1.5rem" /></td>
              <td class="py-4 px-4"><Skeleton width="40%" height="1.5rem" class="mx-auto" /></td>
              <td class="py-4 px-4"><Skeleton width="60%" height="1.5rem" class="mx-auto" /></td>
              <td class="py-4 px-4"><Skeleton width="60%" height="1.5rem" class="mx-auto" /></td>
            </tr>
          </template>
          <!-- Normal Data -->
          <template v-else>
            <tr v-for="prod in productos" :key="prod.id" class="hover:bg-gray-50 transition">
              <td class="py-4 px-4 font-bold text-gray-800 text-sm">{{ prod.nombre }}</td>
              <td class="py-4 px-4">
                <span :class="getSeccionClass(prod.seccion)" class="px-2 py-0.5 rounded text-[10px] font-bold border">
                  {{ formatSeccion(prod.seccion) }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">
                  {{ prod.categoria?.nombre || 'N/A' }}
                </span>
              </td>
              <td class="py-4 px-4 font-bold text-gray-800 text-sm">{{ prod.marca?.nombre || 'N/A' }}</td>
              <td class="py-4 px-4 font-bold text-gray-800 text-sm">${{ formatPrice(prod.precio_detalle) }}</td>
              <td class="py-4 px-4 font-bold text-gray-800 text-sm">${{ formatPrice(prod.precio_mayor) }}</td>
              <td class="py-4 px-4">
                <div :class="prod.stock <= prod.stock_minimo ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-700 border-green-200'" class="w-16 text-center py-1 rounded font-black border text-[10px]">
                  {{ prod.stock }} u.
                </div>
              </td>
              <td class="py-4 px-4 text-center text-sm font-semibold text-gray-600">
                {{ prod.stock_minimo }} u.
              </td>
              <td class="py-4 px-4 text-center">
                <Checkbox :binary="true" :modelValue="prod.perecedero === 'PERECEDERO'" disabled class="p-checkbox-sm" />
              </td>
              <td class="py-4 px-4 text-center">
                <Tag :severity="prod.estado === 'ACTIVO' ? 'success' : 'danger'" :value="prod.estado" />
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center justify-center gap-1">
                  <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm p-button-warning" @click="$emit('editar', prod)" />
                  <Button
                    icon="pi pi-power-off"
                    class="p-button-rounded p-button-sm text-white !border-none"
                    :class="prod.estado === 'ACTIVO' ? '!bg-red-600 hover:!bg-red-700 focus:!ring-0 focus:!ring-offset-0' : '!bg-green-600 hover:!bg-green-700 focus:!ring-0 focus:!ring-offset-0'"
                    @click="$emit('cambiarEstado', prod.id, prod.estado)"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="productos.length === 0">
              <td colspan="11" class="py-10 text-center italic text-gray-400">No se encontraron productos.</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="p-3 border-t border-gray-400 bg-gray-50/50">
      <Paginator
        :rows="10"
        :totalRecords="pagination.total"
        :first="(pagination.current_page - 1) * 10"
        @page="$emit('cambiarPagina', $event)"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        class="custom-paginator text-[10px]"
      />
    </div>
  </section>
</template>

<script setup>
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import Paginator from 'primevue/paginator'
import Skeleton from 'primevue/skeleton'

defineProps({
  productos: { type: Array, required: true },
  pagination: { type: Object, required: true },
  isTableLoading: { type: Boolean, required: true },
  perPage: { type: Number, required: true }
})

defineEmits(['editar', 'cambiarEstado', 'cambiarPagina'])

const formatPrice = (value) => Number(value).toFixed(2)

const getSeccionClass = (seccion) => {
  switch (seccion) {
    case 'TIENDA':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'MEDICAMENTO':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'LIBRERIA':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const formatSeccion = (seccion) => {
  switch (seccion) {
    case 'TIENDA':
      return 'Tienda'
    case 'MEDICAMENTO':
      return 'Medicamento'
    case 'LIBRERIA':
      return 'Librería'
    default:
      return seccion || 'N/A'
  }
}
</script>

<style scoped>
:deep(.p-paginator) { background: transparent; border: none; padding: 0; }
:deep(.p-paginator-page.p-highlight) { background: #0b580b !important; color: white !important; font-weight: bold; }
</style>
