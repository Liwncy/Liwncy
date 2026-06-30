import { createApp } from 'vue'
import Layui from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'

import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/styles/index.css'

const app = createApp(App)

app.use(store).use(router).use(Layui)
app.mount('#app')
