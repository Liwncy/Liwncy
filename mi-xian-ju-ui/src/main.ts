import { MotionPlugin } from 'motion-v'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './styles/index.css'

createApp(App).use(MotionPlugin).use(router).mount('#app')
