<template>
  <CatalogoCrearModal :visible="visible" v-model:nombre="nombre" v-model:seccion="seccionElegida" titulo="Nueva Marca" placeholder="Nombre de marca" :bloquear-seccion="bloquearSeccion" :loading="loading" :error="error" @guardar="guardar" @cerrar="emit('update:visible', false)" />
</template>

<script setup>
import CatalogoCrearModal from '@/components/catalogos/CatalogoCrearModal.vue'
import { useMarcaStore } from '@/stores/marcaStore'
import { useCrearCatalogo } from '@/composables/useCrearCatalogo'
import marcaService from '@/services/marcaService'
const props = defineProps({
  visible: Boolean,
  seccion: { type: String, default: '' },
  bloquearSeccion: { type: Boolean, default: true }
})
const emit = defineEmits(['update:visible', 'creado', 'toast'])
const store = useMarcaStore()
const { nombre, seccion: seccionElegida, loading, error, guardar } = useCrearCatalogo(props, emit, {
  crear: datos => store.createMarca(datos),
  listar: params => marcaService.getMarcas(params),
  recargar: () => store.fetchMarcas({ per_page: 9999 }),
  obtenerLista: () => store.marcas,
  entidad: 'marca',
  articulo: 'la'
})
</script>
