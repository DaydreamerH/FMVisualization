
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './css/styles/index.scss'
import App from './App.vue'
import { createApp } from 'vue'
const app = createApp(App);


app.use(ElementPlus)
app.mount('#app')