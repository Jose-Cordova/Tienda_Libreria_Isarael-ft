import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';

// 1. IMPORTAR ESTILOS DE Tailwind
import './assets/main.css';

// 2. ESTILOS DE PRIMEVUE
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.css';
import 'primeicons/primeicons.css';
import 'flag-icons/css/flag-icons.min.css';

// 3. LOCALE ESPAÑOL (manual, compatible con PrimeVue 3.29.2)
const es = {
  firstDayOfWeek: 0,
  dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá'],
  monthNames: [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ],
  monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  today: 'Hoy',
  clear: 'Limpiar',
  dateFormat: 'dd/mm/yy',
  weekHeader: 'Semana',
  emptyMessage: 'Sin resultados',
  emptyFilterMessage: 'Sin resultados',
};

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(PrimeVue, { locale: es });
app.use(ToastService);
app.directive('tooltip', Tooltip);

app.mount('#app');
