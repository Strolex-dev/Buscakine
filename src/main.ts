import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { Quasar, Notify } from 'quasar'
import { createHead } from '@unhead/vue/client'

import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v7/fontawesome-v7.css'
import 'quasar/src/css/index.sass'
import './css/app.scss'

import App from './App.vue'
import { router } from './router'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(createHead())
app.use(Quasar, {
  plugins: { Notify },
})

app.mount('#app')
