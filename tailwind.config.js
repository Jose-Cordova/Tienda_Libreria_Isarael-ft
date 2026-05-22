/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal basada en las variables CSS de tienda.html
        shop: {
          // Verdes (principal, oscuro, profundo, claro, pálido)
          green: '#005c00',       // --green
          'green-dark': '#003d00',// --green-dark
          'green-deep': '#002800',// --green-deep
          'green-light': '#007700',// --green-light
          'green-pale': '#dff0df',// --green-pale
          'green-mid': '#3d9940', // --green-mid

          // Rojos
          red: '#d1333e',         // --red
          'red-dark': '#a82430',  // --red-dark
          'red-pale': '#fde8ea',  // --red-pale

          // Negros / grises oscuros
          black: '#061817',       // --black
          'black-soft': '#0d2422',// --black-soft

          // Acentos brillantes
          accent: '#00cc44',      // --accent
          'accent-2': '#33dd66',  // --accent2

          // Fondos y superficies
          bg: '#f0f5f0',          // --bg
          surface: '#ffffff',     // --surface
          'surface-2': '#f7faf7', // --surface2

          // Bordes
          border: '#c8dfc8',      // --border
          'border-dark': '#9dc09d',// --border-dark

          // Textos
          text: '#061817',        // --text
          'text-2': '#3a5a3a',    // --text2
          'text-3': '#7a9a7a',    // --text3

          // Amarillos (alertas, créditos)
          yellow: '#e8a020',      // --yellow
          'yellow-pale': '#fef5e0',// --yellow-pale

          // Sidebar específico (puedes usarlo si replicas el menú lateral)
          'sidebar-bg': '#002800',
          'sidebar-hover': 'rgba(255,255,255,0.09)',
          'sidebar-active': 'rgba(255,255,255,0.17)',
        },
      },
      // Sombras personalizadas (basadas en --shadow y --shadow-lg)
      boxShadow: {
        'shop': '0 1px 4px rgba(0,70,0,0.08), 0 4px 16px rgba(0,70,0,0.06)',
        'shop-lg': '0 8px 40px rgba(0,70,0,0.18)',
      },
      // Tipografías (las mismas que se usan en tienda.html)
      fontFamily: {
        'dm-sans': ['DM Sans', 'sans-serif'],
        'dm-serif': ['DM Serif Display', 'serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      // Bordes redondeados (--r y --r-sm)
      borderRadius: {
        'shop': '10px',
        'shop-sm': '6px',
      },
      // (Opcional) Algunas animaciones si las necesitas
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp .2s ease both',
      },
    },
  },
  plugins: [],
};
