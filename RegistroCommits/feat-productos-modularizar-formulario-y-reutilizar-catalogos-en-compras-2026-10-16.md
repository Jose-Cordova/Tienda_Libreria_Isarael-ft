# feat(productos): modularizar formulario y reutilizar catalogos en compras

- **Fecha:** 2026-10-16.
- **Rama:** `RamaTony`.
- **Commit:** `01f88232c869373df59f5d7133142ff1af61d3aa`.
- **Stack:** frontend Vue 3, PrimeVue y Pinia.
- **Registro:** archivo local en `RegistroCommits/`, carpeta excluida del versionado por la configuración del proyecto.

## Objetivo y trabajo realizado

Organizar las vistas y componentes por módulo, dividir el formulario de productos en responsabilidades mantenibles y reutilizar las altas de categoría y marca desde compras.

### Organización de vistas

- Mover créditos y devoluciones de ventas a `src/views/venta/`.
- Renombrar la vista de productos como `src/views/producto/ProductosView.vue`.
- Mover la tabla y el formulario de productos a `src/components/productos/`.
- Ajustar importaciones y cargas de vistas en el router.

### Formulario modular de productos

- Separar datos generales, precios, inventario, lista de lotes iniciales y nuevo lote en edición.
- Compartir los campos de código, vencimiento y cantidad entre los dos flujos de lotes.
- Extraer el ajuste de stock a un modal con borrador independiente: cancelar descarta los cambios pendientes y aplicar emite una copia validada.
- Separar ciclo de vida/guardado, reglas locales, serialización de fechas y construcción del payload.
- Unificar botón Guardar y Enter en el mismo camino de validación.
- Conservar los IDs individuales de los lotes en los ajustes y permitir ajustar a cero.
- Corregir la visibilidad de los lotes: el scroll pertenece a un `div` y el encabezado/pie conservan su espacio; el `fieldset` agrupa y deshabilita campos.

### Catálogos reutilizables e integración en compras

- Crear modales independientes de categoría y marca con interfaz y lógica de alta compartidas.
- Agregar botones “+” en el modal de producto nuevo de `PasoProducto.vue`.
- Habilitar los botones cuando hay sección seleccionada y sus catálogos terminaron de cargar.
- Incorporar y seleccionar el registro recién creado conservando la selección del otro campo.
- Limpiar selecciones al cambiar de sección e ignorar respuestas de consultas anteriores.

### Validación de duplicados

- Comparar nombres normalizados con Unicode NFKC, minúsculas y eliminación de espacios interiores y exteriores: `ropa` y `R O p A` se consideran iguales.
- Consultar todas las páginas del catálogo correspondiente y abarcar todas sus secciones, sin modificar la lista/paginación visibles.
- Bloquear creación y actualización desde los stores; excluir el propio ID al editar.
- Mostrar errores compatibles con el contrato 422 de los formularios.
- Verificar también desde los modales antes de invocar la acción de creación.
- Registrar `acceptHMRUpdate` en los stores: se reprodujo que una instancia abierta de Pinia podía conservar acciones previas sin validación. Añadir una regresión que bloquea duplicados aun con una acción antigua que guarda directamente.

## Archivos y módulos incluidos

### Vistas e importaciones

- `src/router/index.js`.
- `src/views/venta/CreditosView.vue` (movido desde `src/views/CreditosView.vue`).
- `src/views/venta/DevolucionesVentasView.vue` (movido desde `src/views/DevolucionesVentasView.vue`).
- `src/views/producto/ProductosView.vue` (antes `Producto.vue`).
- `src/views/compra/PasoProducto.vue`.

### Componentes

- `src/components/productos/ProductoTabla.vue` y `ProductoModalForm.vue` (antes en `views/producto/`).
- `src/components/productos/ProductoAjusteStockModal.vue`.
- `src/components/productos/formulario/ProductoDatosGenerales.vue`.
- `src/components/productos/formulario/ProductoPrecios.vue`.
- `src/components/productos/formulario/ProductoInventario.vue`.
- `src/components/productos/formulario/ProductoLoteCampos.vue`.
- `src/components/productos/formulario/ProductoLotesCreacion.vue`.
- `src/components/productos/formulario/ProductoNuevoLote.vue`.
- `src/components/productos/formulario/camposProducto.css`.
- `src/components/catalogos/CatalogoCrearModal.vue`.
- `src/components/categorias/CategoriaCrearModal.vue`.
- `src/components/marcas/MarcaCrearModal.vue`.

### Estado, lógica y utilidades

- `src/composables/productos/useProductoFormulario.js`.
- `src/composables/productos/useProductoAjusteStock.js`.
- `src/composables/useCrearCatalogo.js`.
- `src/utils/productos/formularioProducto.js`.
- `src/utils/productos/validacionesProducto.js`.
- `src/utils/catalogos.js`.
- `src/stores/categoriaStore.js` y `src/stores/marcaStore.js`.

### Pruebas y documentación

- `tests/productos/{formularioProducto,productoFormulario,ajusteStock,crearCatalogo}.test.mjs`.
- `tests/catalogos/{nombresCatalogo,guardadoCatalogos}.test.mjs`.
- `README.md`.
- `docs/productos-formulario.md`: diagnóstico, responsabilidades, contratos y guía de mantenimiento.

## Dependencias

- Sin dependencias nuevas en `package.json`, `package-lock.json` o `pnpm-lock.yaml`.
- Pruebas automatizadas con Node.js, Vue/Pinia y Vite ya presentes en el proyecto.
- Comprobaciones de navegador con Playwright instalado temporalmente fuera del repositorio.
- Sin cambios en Composer ni en el repositorio del backend Laravel.

## Verificación realizada antes del commit

- `node --test tests/catalogos/*.test.mjs tests/productos/*.test.mjs`: **50 pruebas aprobadas**.
- ESLint de los archivos implementados/modificados: **sin errores**.
- `git diff --check`: **correcto**.
- `npm run build -- --logLevel warn`: **correcto**, con las advertencias anteriores de `:deep` y tiempos de plugins.
- Navegador: completar varios lotes en escritorio/móvil; altas de categorías/marcas desde compras con selección automática; rechazo de duplicados y corrección a un nombre disponible desde compras/productos.
- Las pruebas de navegador usan respuestas HTTP simuladas. La API local no respondió durante el último intento de comprobación directa; el caso con datos reales queda para la revisión del usuario.

## Decisiones para mantenimiento

- El modal principal conserva sus props y eventos públicos y compone las secciones.
- Los componentes de campos actualizan mediante modelos/eventos; las utilidades puras concentran reglas y payloads.
- La normalización se utiliza para comparar, conservando el formato del nombre que se guarda.
- La fecha elegida en el calendario se serializa como fecha local, evitando desplazamientos por conversión a UTC.
- La primera carga tras incorporar el soporte HMR requiere recargar la página para inicializar los stores actualizados.
