import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip';

// 1. IMPORTAR ESTILOS DE Tailwind
import './assets/main.css'

// 2. ESTILOS DE PRIMEVUE
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.css'
import 'primeicons/primeicons.css'
import 'flag-icons/css/flag-icons.min.css';

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(PrimeVue)
app.use(ToastService)
app.directive('tooltip', Tooltip);

app.mount('#app')
