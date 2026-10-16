<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <form @submit.prevent="guardar" class="bg-white rounded-[24px] w-[95vw] max-w-5xl shadow-2xl relative animate-fade-up border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2.5 bg-[#034e03] z-20"></div>
        <button type="button" @click="cerrar" :disabled="loading" aria-label="Cerrar formulario" class="absolute top-6 right-7 text-gray-400 hover:text-gray-700 transition z-10">
          <i class="pi pi-times text-xl"></i>
        </button>
        <div class="shrink-0 p-6 md:p-8 pb-4 border-b border-gray-100 text-left pr-16">
          <h2 class="text-2xl font-extrabold text-[#003d00] mb-1">{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
          <p class="text-gray-400 font-medium text-sm">Complete los datos del producto</p>
        </div>
        <!-- El scroll va en un div: fieldset puede recortar su contenido anónimo. -->
        <div class="min-h-0 flex-1 overflow-y-auto">
          <fieldset :disabled="loading" :inert="loading" class="min-w-0 p-6 md:p-8 space-y-4 md:space-y-6 text-left">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <ProductoDatosGenerales
                v-model:nombre="productoForm.nombre" v-model:seccion="productoForm.seccion"
                v-model:categoria-id="productoForm.categoria_id" v-model:marca-id="productoForm.marca_id"
                :es-edicion="esEdicion" :categorias="categoriasFiltradas" :marcas="marcasFiltradas" :errors="errors"
                @nueva-categoria="categoriaVisible = true" @nueva-marca="marcaVisible = true"
              />
              <ProductoPrecios v-model:precio-detalle="productoForm.precio_detalle" v-model:precio-mayor="productoForm.precio_mayor" :errors="errors" />
              <ProductoInventario
                v-model:stock-minimo="productoForm.stock_minimo" v-model:cantidad-inicial="productoForm.cantidad_inicial"
                :es-edicion="esEdicion" :perecedero="productoForm.perecedero" :errors="errors"
                :total-stock="totalStockCalculado" :stock-proyectado="stockProyectado" @ajustar-stock="ajusteVisible = true"
              />
            </div>
            <ProductoNuevoLote v-if="esEdicion && productoForm.perecedero" v-model="nuevoLote" :errors="errors" :fecha-minima="fechaMinima" />
            <ProductoLotesCreacion v-if="!esEdicion && productoForm.perecedero" v-model="lotesCreacion" :errors="errors" :fecha-minima="fechaMinima" />
          </fieldset>
        </div>
        <div class="shrink-0 p-6 md:p-8 pt-4 border-t border-gray-200 flex items-center gap-4 bg-gray-50/50 rounded-b-[24px]">
          <button type="button" @click="cerrar" :disabled="loading" class="px-8 py-3 bg-[#d6dfd6] text-[#3a5a3a] font-bold rounded-xl border border-[#c7c7c7] hover:bg-white transition">Cancelar</button>
          <button type="submit" :disabled="loading" class="flex-1 py-3 bg-[#003d00] hover:bg-[#002800] text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50">{{ loading ? 'GUARDANDO...' : 'Guardar' }}</button>
        </div>
      </form>
    </div>
  </Teleport>
  <ProductoAjusteStockModal v-model:visible="ajusteVisible" :formulario="productoForm" :ajuste="ajusteStock" :errores-servidor="errors" @aplicar="aplicarAjuste" />
  <CategoriaCrearModal v-model:visible="categoriaVisible" :seccion="productoForm.seccion" @creado="seleccionarCategoria" @toast="emit('toast', $event)" />
  <MarcaCrearModal v-model:visible="marcaVisible" :seccion="productoForm.seccion" @creado="seleccionarMarca" @toast="emit('toast', $event)" />
</template>

<script setup>
import ProductoDatosGenerales from './formulario/ProductoDatosGenerales.vue'
import ProductoPrecios from './formulario/ProductoPrecios.vue'
import ProductoInventario from './formulario/ProductoInventario.vue'
import ProductoLotesCreacion from './formulario/ProductoLotesCreacion.vue'
import ProductoNuevoLote from './formulario/ProductoNuevoLote.vue'
import ProductoAjusteStockModal from './ProductoAjusteStockModal.vue'
import CategoriaCrearModal from '@/components/categorias/CategoriaCrearModal.vue'
import MarcaCrearModal from '@/components/marcas/MarcaCrearModal.vue'
import { useProductoFormulario } from '@/composables/productos/useProductoFormulario'

const props = defineProps({
  visible: { type: Boolean, required: true },
  productoAEditar: { type: Object, default: null },
  esEdicion: { type: Boolean, required: true },
  tipoPerecedero: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'guardado', 'toast'])
const {
  productoForm, lotesCreacion, nuevoLote, ajusteStock, errors, loading,
  categoriaVisible, marcaVisible, ajusteVisible, categoriasFiltradas, marcasFiltradas,
  totalStockCalculado, stockProyectado, fechaMinima,
  seleccionarCategoria, seleccionarMarca, aplicarAjuste, cerrar, guardar
} = useProductoFormulario(props, emit)
</script>

<style scoped>
.animate-fade-up { animation: fadeUp 0.3s ease-out forwards; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
