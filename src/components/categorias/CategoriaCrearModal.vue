<template>
  <CatalogoCrearModal :visible="visible" v-model:nombre="nombre" v-model:seccion="seccionElegida" titulo="Nueva Categoría" placeholder="Nombre de categoría" :bloquear-seccion="bloquearSeccion" :loading="loading" :error="error" @guardar="guardar" @cerrar="emit('update:visible', false)" />
</template>

<script setup>
import CatalogoCrearModal from '@/components/catalogos/CatalogoCrearModal.vue'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useCrearCatalogo } from '@/composables/useCrearCatalogo'
import categoriaService from '@/services/categoriaService'
const props = defineProps({
  visible: Boolean,
  seccion: { type: String, default: '' },
  bloquearSeccion: { type: Boolean, default: true }
})
const emit = defineEmits(['update:visible', 'creado', 'toast'])
const store = useCategoriaStore()
const { nombre, seccion: seccionElegida, loading, error, guardar } = useCrearCatalogo(props, emit, {
  crear: datos => store.createCategoria(datos),
  listar: params => categoriaService.getCategorias(params),
  recargar: () => store.fetchCategorias({ per_page: 9999 }),
  obtenerLista: () => store.categorias,
  entidad: 'categoría',
  articulo: 'la'
})
</script>
