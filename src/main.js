
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { createApp } from 'vue'
import BurgersLiner from './components/parameters/BurgersLiner.vue'; 
import MainMenu from './components/MainMenu.vue';        

const app = createApp(App);

// 全局注册组件
app.component('BurgersLiner', BurgersLiner);
app.component('MainMenu', MainMenu);
app.use(ElementPlus)
app.mount('#app')