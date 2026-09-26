# 💻 Frontend - Tienda y Librería Israel (Single Page Application)

Interfaz de usuario moderna y responsiva para la administración de inventario, punto de venta (POS), wizard de compras en varios pasos, trazabilidad de lotes perecederos y reportes gráficos.

---

## 🚀 Tecnologías Principales

* **Framework:** Vue.js 3 (Composition API / <script setup>)
* **Build Tool:** Vite 8.x
* **Librería de Componentes:** PrimeVue 3.x + PrimeIcons
* **Estilos & Diseño:** Tailwind CSS 3.x + PostCSS
* **Gestor de Estado:** Pinia con persistencia (pinia-plugin-persistedstate)
* **Enrutamiento:** Vue Router 5.x
* **Cliente HTTP:** Axios con interceptores automáticos de autenticación JWT
* **Alertas & Notificaciones:** SweetAlert2 y PrimeVue Toast Service
* **Calendarios & Gráficos:** FullCalendar 6.x y Chart.js 4.x

---

## 📂 Estructura Limpia del Proyecto

`	ext
Tienda_Libreria_Isarael-ft/
├── src/
│   ├── assets/                   # Iconos, imágenes y estilos CSS globales
│   ├── components/               # Componentes reutilizables (Modales, Tablas, Layouts)
│   ├── router/                   # Configuración de rutas y guardias de navegación
│   │   └── index.js
│   ├── services/                 # Configuración de Axios e interceptores API
│   │   └── api.js
│   ├── stores/                   # Stores reactivos de Pinia (Auth, Carrito, UI)
│   ├── views/                    # Vistas principales de cada módulo
│   │   ├── compra/               # Módulo de Compras (Asistente en Pasos)
│   │   │   ├── PasoEncabezado.vue    # Paso 1: Factura, proveedor, fechas
│   │   │   ├── PasoProducto.vue      # Paso 2: Selección, CPP, factor y lotes
│   │   │   ├── PasoResumen.vue       # Paso 3: Confirmación y desglose final
│   │   │   ├── CompraLista.vue       # Historial de compras registradas
│   │   │   └── CompraDetalle.vue     # Detalle completo de compra
│   │   ├── venta/                # Módulo de Ventas POS
│   │   │   ├── VentasView.vue        # Caja registradora y cobro rápido
│   │   │   └── HistorialVentasView.vue # Historial de comprobantes emitidos
│   │   ├── producto/             # Módulo de Catálogo e Inventario
│   │   │   ├── Producto.vue
│   │   │   ├── ProductoTabla.vue
│   │   │   └── ProductoModalForm.vue
│   │   ├── cambioProducto/       # Módulo de Garantías y Cambios
│   │   │   ├── CambioProducto.vue
│   │   │   └── CambioWizardAceptar.vue
│   │   ├── productoDanado/       # Módulo de Mermas / Averías
│   │   │   └── ProductoDanado.vue
│   │   ├── CreditosView.vue      # Control de cuentas por cobrar y abonos
│   │   ├── ProveedorView.vue     # Directorio de proveedores
│   │   ├── CronogramaView.vue    # Calendario interactivo de visitas
│   │   ├── ReportesView.vue      # Generador y visualizador de reportes
│   │   ├── UsuarioView.vue       # Administración de usuarios y roles
│   │   └── LoginView.vue         # Pantalla de acceso al sistema
│   ├── App.vue                   # Componente raíz
│   └── main.js                   # Punto de entrada y registro de plugins
├── index.html                    # Plantilla HTML base
├── vite.config.js                # Configuración de Vite y alias
├── tailwind.config.js            # Configuración de tema y colores Tailwind
└── package.json                  # Dependencias y scripts de ejecución
`

---

## ⚙️ Requisitos Previos

* Node.js >= 20.19.0 o >= 22.12.0
* npm >= 10.x
* Servidor Backend (Laravel) en ejecución en http://localhost:8000

---

## 🔧 Instalación y Puesta en Marcha

1. **Navegar a la carpeta del frontend:**
   `ash
   cd Tienda_Libreria_Isarael-ft
   `

2. **Instalar dependencias:**
   `ash
   npm install
   `

3. **Ejecutar en entorno de desarrollo:**
   `ash
   npm run dev
   `
   *La aplicación estará disponible en:* http://localhost:5173

4. **Compilar para producción (Build optimizado):**
   `ash
   npm run build
   `
   *Generará los archivos finales estáticos listos para desplegar en la carpeta /dist.*

---

## 🌟 Características Destacadas de la Interfaz

* **Simulación en Tiempo Real de CPP:** Muestra el costo neto por unidad, el nuevo CPP simulado y los precios sugeridos al detalle y mayor mientras el usuario digita cantidades y costos.
* **Soporte Responsivo Dual:** Optimizado tanto para pantallas de escritorio (cajas registradoras) como dispositivos móviles y tablets (toma de inventario en bodega).
* **Control de Perecederos:** Selector y autocompletado inteligente de lotes activos con formateo automático de fechas de vencimiento.
* **Seguridad por Rutas:** Guardias en Vue Router que protegen las vistas según el estado del token JWT en Pinia.
