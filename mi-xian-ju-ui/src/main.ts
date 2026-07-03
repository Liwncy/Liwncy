import { createApp } from 'vue'
import Layui from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'

import App from './App.vue'
import router from './router'
import store from './store'
import LayCode from '@/components/LayCode.vue'
import LayTableBox from '@/components/LayTableBox.vue'
import LayAnchor from '@/components/LayAnchor.vue'
import '@/assets/styles/index.css'
import '@/assets/styles/site-page.css'
import '@/assets/styles/site-docs.css'
import '@/assets/styles/docs/index.css'

const app = createApp(App)

app.use(store).use(router).use(Layui)
app.component('LayCode', LayCode)
app.component('LayTableBox', LayTableBox)
app.component('LayAnchor', LayAnchor)
app.mount('#app')
