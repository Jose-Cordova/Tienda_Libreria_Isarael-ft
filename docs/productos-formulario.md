# Análisis y mantenimiento del formulario de productos

## 1. Diagnóstico del componente original

`ProductoModalForm.vue` tenía 1,010 líneas. Su tamaño era consecuencia de mezclar responsabilidades de interfaz, estado, reglas de negocio y persistencia en un mismo archivo.

| Bloque original | Responsabilidad | Acoplamiento encontrado |
| --- | --- | --- |
| Nombre, sección, categoría y marca | Identificación y clasificación | Campos y filtrado de stores mezclados con creación de catálogos |
| Precios detalle y mayorista | Precios de venta | Interfaz y validación dentro del modal general |
| Stock mínimo e inicial/actual | Inventario | Condiciones de creación, edición y perecederos en el mismo bloque |
| Nuevo lote en edición | Recepción de un lote adicional | Estado de activación, reinicio, interfaz y payload entrelazados |
| Lista de lotes en creación | Stock inicial perecedero | Campos repetidos respecto al lote de edición |
| Modal de ajuste de stock | Ajuste de cantidad y motivo | Modificaba el formulario principal antes de aplicar |
| Nueva categoría y nueva marca | Altas rápidas de catálogos | Plantilla, estado y acciones duplicados; dependían del producto |
| Inicialización y watchers | Ciclo de vida | Reinicio incompleto de submodales y dos definiciones del estado inicial |
| Validación | Reglas locales y errores 422 | Reglas repartidas entre guardar y confirmar stock |
| Construcción del payload | Contrato del backend | Serialización, condiciones y persistencia dentro de una misma función |
| Estilos | Apariencia de campos y modales | Los submodales dependían de estilos del componente contenedor |

### Dependencias y contrato observados

- Vue: `ref`, `computed`, `watch`, `Teleport`.
- PrimeVue: `Button`, `InputText`, `InputNumber`, `Dropdown`, `Calendar`.
- Stores: `productoStore`, `categoriaStore`, `marcaStore`.
- La importación de SweetAlert2 no se utilizaba en este formulario.
- Props públicas: `visible`, `productoAEditar`, `esEdicion`, `tipoPerecedero`.
- Eventos públicos: `update:visible`, `guardado`, `toast`.
- El padre `ProductosView.vue` decide cuándo abrir y recarga el listado al recibir `guardado`.
- Los stores siguen siendo responsables de hablar con los servicios HTTP y recargar sus listas.

### Problemas concretos detectados

1. **Dos caminos de guardado:** el botón validaba, pero el `submit` del formulario llamaba directamente al envío. Enter podía omitir validaciones locales.
2. **Cancelación de stock no transaccional:** escribir en el submodal ya cambiaba el estado principal; cancelar no descartaba necesariamente esos cambios.
3. **Comparación de cantidades distintas:** el envío de un ajuste perecedero dependía de comparar el stock del lote con el stock total del producto. Un ajuste legítimo podía omitirse si ambas cantidades coincidían.
4. **Agrupación de lotes con pérdida de identidad:** se sumaban cantidades de varios lotes con el mismo código/fecha, pero se conservaba un solo ID. El usuario veía una suma y el backend recibía el ID de un lote individual.
5. **Selección ambigua de catálogos:** buscar solo por nombre podía escoger una categoría o marca de otra sección. Como alternativa se escogía el último registro de la lista, aunque no fuera el creado.
6. **Estado de submodales persistente:** el reinicio no cerraba todos los submodales; la sesión siguiente podía heredar estado.
7. **Validaciones incompletas:** no se validaba sección; cantidades y fechas de lotes dependían demasiado de las restricciones visuales; el lote nuevo no validaba su cantidad.
8. **Fecha local convertida a UTC:** `toISOString()` podía desplazar el día elegido según la zona horaria y la hora del valor.
9. **Duplicación:** campos de lotes, alta de catálogos, estado inicial y reglas de motivo de ajuste.
10. **Errores poco visibles:** algunos errores de stock o lotes solo eran visibles al abrir el apartado correspondiente.

## 2. Estructura resultante

```text
src/
├── components/
│   ├── catalogos/
│   │   └── CatalogoCrearModal.vue
│   ├── categorias/
│   │   └── CategoriaCrearModal.vue
│   ├── marcas/
│   │   └── MarcaCrearModal.vue
│   └── productos/
│       ├── ProductoModalForm.vue
│       ├── ProductoAjusteStockModal.vue
│       ├── ProductoTabla.vue
│       └── formulario/
│           ├── ProductoDatosGenerales.vue
│           ├── ProductoPrecios.vue
│           ├── ProductoInventario.vue
│           ├── ProductoLotesCreacion.vue
│           ├── ProductoNuevoLote.vue
│           ├── ProductoLoteCampos.vue
│           └── camposProducto.css
├── composables/
│   ├── useCrearCatalogo.js
│   └── productos/
│       ├── useProductoFormulario.js
│       └── useProductoAjusteStock.js
└── utils/
    ├── catalogos.js
    └── productos/
        ├── formularioProducto.js
        └── validacionesProducto.js
```

## 3. Responsabilidad de cada pieza

| Archivo | Responsabilidad y cuándo modificarlo |
| --- | --- |
| `ProductoModalForm.vue` | Estructura del modal, composición de secciones y conexión de eventos. Cambiarlo para añadir o quitar una sección completa. |
| `ProductoDatosGenerales.vue` | Nombre, sección y selectores de categoría/marca. Emite solicitudes de creación de catálogos. |
| `ProductoPrecios.vue` | Presentación y edición de precios. |
| `ProductoInventario.vue` | Stock mínimo, cantidad inicial, total inicial perecedero y stock proyectado; solicita abrir el ajuste. |
| `ProductoLotesCreacion.vue` | Añadir, editar y quitar lotes iniciales. Conserva al menos una fila. |
| `ProductoNuevoLote.vue` | Activar/cancelar y editar un lote adicional durante la edición. `null` representa que no se agregará lote. |
| `ProductoLoteCampos.vue` | Campos comunes de código, fecha y cantidad. Actualiza mediante un objeto nuevo, sin mutar props. |
| `camposProducto.css` | Estilos de campos PrimeVue, importados con alcance local por las secciones. |
| `ProductoAjusteStockModal.vue` | Interfaz del ajuste de stock, con su propio formulario teletransportado. |
| `useProductoAjusteStock.js` | Borrador local, selección de lote y confirmación. Solo aplicar emite cambios hacia el padre. |
| `CategoriaCrearModal.vue` | Entrada reutilizable para crear categorías con su store. |
| `MarcaCrearModal.vue` | Entrada reutilizable para crear marcas con su store. |
| `CatalogoCrearModal.vue` | Interfaz común de nombre/sección, estado de carga y error. No conoce stores. |
| `useCrearCatalogo.js` | Reinicio, comprobación de nombre duplicado antes del guardado, alta, recarga, selección por nombre/sección, errores y bloqueo de doble envío. Recibe las acciones de cada catálogo y una consulta directa de su servicio. |
| `useProductoFormulario.js` | Ciclo de vida del formulario, filtrado de catálogos, estado aceptado, validación y coordinación de persistencia. |
| `formularioProducto.js` | Valores iniciales, secciones, serialización de fechas/lotes, construcción del payload, opciones de lotes y proyección de stock. Funciones sin dependencias de Vue. |
| `validacionesProducto.js` | Reglas del producto, lotes y ajuste; adaptación de errores del servidor. Funciones comprobables sin navegador. |

### Criterios de separación

- Se extraen responsabilidades completas, no un componente por cada etiqueta o botón.
- Los componentes de campos usan `v-model`/eventos; no acceden a stores ni realizan HTTP.
- Los catálogos tienen puntos de entrada separados para que agregar reglas propias de categoría o marca no afecte al formulario de productos.
- La interfaz repetida de lotes y catálogos se comparte; no se mantiene una copia por flujo.
- La validación local y el payload están fuera de los componentes visuales. Un cambio de aspecto no obliga a tocar persistencia.
- El ajuste tiene un borrador separado del ajuste aceptado: editar, aplicar y cancelar son acciones distintas.
- El modal principal conserva las props y eventos que utiliza `ProductosView.vue`.
- El desplazamiento del cuerpo pertenece a un `div` con `min-h-0` y `overflow-y-auto`. El `fieldset` interior solo agrupa/deshabilita los campos: usarlo como contenedor de scroll recortaba los lotes detrás del pie del modal en Chromium. Encabezado y pie usan `shrink-0` para conservar su espacio.

## 4. Flujo de datos y guardado

1. El padre abre el modal con un producto o con el tipo de creación.
2. `useProductoFormulario` crea un formulario nuevo, copia los lotes y limpia errores, ajustes y submodales.
3. Los campos actualizan únicamente sus valores mediante `v-model`.
4. Cambiar de sección limpia categoría/marca y recalcula las opciones. Hidratar otro objeto de producto no borra sus IDs.
5. Agregar un catálogo devuelve el registro completo mediante `creado`; el formulario toma su ID.
6. Aplicar un ajuste guarda una copia validada y recalcula la proyección. Cancelar descarta el borrador; conserva un ajuste previamente aplicado.
7. Botón Guardar y Enter pasan por la misma función y validaciones.
8. Se construye el payload según creación/edición y normal/perecedero.
9. El store guarda. Un error 422 se distribuye por las mismas claves que utiliza cada sección (`lotes.0.cantidad`, `nuevo_lote.fecha_vencimiento`, etc.).
10. Tras guardar se emiten cierre, `guardado` y toast. Durante el envío se bloquean el segundo guardado y el cierre por los controles del formulario.

### Contrato del payload

| Operación | Campos adicionales a los datos generales/precios |
| --- | --- |
| Crear normal | `cantidad_inicial` |
| Crear perecedero | `lotes[]` con código normalizado, fecha local `YYYY-MM-DD` y cantidad |
| Editar sin cambios de inventario | Ningún campo de ajuste ni cantidad inicial |
| Editar normal con ajuste aplicado | `nuevo_stock`, `motivo_ajuste` |
| Editar perecedero con ajuste aplicado | `nuevo_stock`, `motivo_ajuste`, `lote_id` individual |
| Editar perecedero con lote adicional | `nuevo_lote`; puede coexistir con un ajuste |

La proyección muestra el stock resultante del ajuste aceptado. La incorporación del lote adicional se representa en su sección y se procesa al guardar, como en el flujo anterior. Se sigue enviando un solo ajuste por guardado.

## 5. Modales de categoría y marca reutilizables

Ambos exponen:

- `v-model:visible`: apertura/cierre.
- `seccion`: sección inicial.
- `bloquearSeccion`: `true` por defecto; puede establecerse en `false` para que el usuario elija sección en otro contexto.
- `creado(registro)`: registro encontrado por nombre y sección, incluyendo su ID.
- `toast({ tipo, mensaje })`: notificación para el contenedor.

Ejemplo de contrato de categoría:

```vue
<CategoriaCrearModal
  v-model:visible="categoriaVisible"
  :seccion="seccionActual"
  @creado="categoriaId = $event.id"
  @toast="mostrarToast"
/>
```

La marca utiliza el mismo contrato. Cada contenedor administra su selección, sin que los modales conozcan `productoForm`.

## 6. Reglas locales centralizadas

- Nombre obligatorio de 3 a 100 caracteres, con los caracteres admitidos previamente.
- Sección válida, categoría y marca obligatorias.
- Precios positivos hasta $999,999.99; mayorista estrictamente menor que detalle.
- Stock mínimo entero entre 1 y 999,999.
- Cantidad inicial y cantidades de lotes enteras entre 1 y 999,999,999.
- Fecha de lote válida y posterior a hoy, coherente con el calendario.
- Al menos un lote en creación perecedera; códigos iniciales duplicados detectados ignorando espacios exteriores y mayúsculas/minúsculas.
- Nuevo stock entero entre 0 y 999,999,999 y distinto al stock individual afectado.
- Ajuste perecedero asociado a un lote existente.
- Motivo de 3 a 255 caracteres con los signos admitidos previamente.

El backend conserva la validación definitiva. Los mensajes 422 permanecen visibles en el formulario para corregirlos.

### Nombres de categorías y marcas duplicados

`src/utils/catalogos.js` normaliza el nombre para comparar: normalización Unicode, minúsculas y eliminación de todos los espacios, incluidos los interiores. Por ejemplo, `ropa`, ` ROPA ` y `R O p A` tienen la misma clave. El formato original del nombre se conserva al guardar.

Los stores de categoría y marca consultan todas las páginas de su respectivo catálogo antes de crear o actualizar, sin cambiar la lista ni la paginación visibles. La comprobación abarca todas las secciones del mismo catálogo. Al editar se excluye el ID del registro actual.

Un duplicado produce un error de validación del campo `nombre` con el mensaje `Categoría ya existente.` o `Marca ya existente.` y detiene la escritura. Esto cubre las altas desde productos, compras y las pantallas de categorías/marcas. Si la consulta falla, el guardado tampoco se envía.

Los modales reutilizables muestran el mensaje y permiten corregir el nombre; el error se limpia al editar el nombre o la sección.

Además de la comprobación en los stores, `useCrearCatalogo` consulta directamente el servicio y valida todas las páginas antes de invocar la acción de creación. Esta comprobación independiente cubre sesiones donde Pinia conserva una acción creada antes de agregar la validación. Los stores de categorías y marcas registran `acceptHMRUpdate` para actualizar sus acciones durante el desarrollo. Al incorporar esta corrección por primera vez se debe recargar la página para inicializar los stores actualizados.

La regresión incluye una acción de guardado que intencionalmente no valida: el modal debe bloquear `R O p A` si existe `ropa`, no llamar a esa acción y permitir corregir a un nombre diferente.

## 7. Verificación y revisión de esta etapa

Pruebas sin dependencias adicionales:

```bash
node --test tests/catalogos/*.test.mjs tests/productos/*.test.mjs
```

Cobertura de regresión:

- Payloads de creación y edición normal/perecedera.
- Ajuste a cero y ajuste de lote igual al total del producto.
- Identidad individual de lotes que comparten código/fecha.
- Lotes duplicados, fechas, cantidades y precios inválidos.
- Fechas locales cerca de medianoche y copia del estado inicial.
- Cancelación/reapertura de borradores de ajuste y confirmación como copia.
- Filtrado por sección, reapertura del formulario y limpieza de submodales.
- Selección de catálogos por nombre/sección, reinicio y errores.
- Doble envío, cierre durante guardado y tratamiento de errores 422.

Las pruebas del formulario utilizan Vue/Pinia reales y Vite para resolver los alias. La API se aísla y las acciones de persistencia se sustituyen: no crean datos reales ni requieren el backend.

Comprobaciones adicionales:

```bash
npx eslint src/components/productos src/components/catalogos src/components/categorias src/components/marcas src/composables/productos src/composables/useCrearCatalogo.js src/utils/productos src/utils/catalogos.js src/stores/categoriaStore.js src/stores/marcaStore.js tests/productos tests/catalogos
npm run build
```

La revisión visual y contra el backend corresponde a la segunda pausa: crear normal, crear perecedero con varios lotes, crear categoría/marca desde producto, editar, aplicar/cancelar stock y agregar/cancelar un lote adicional.
