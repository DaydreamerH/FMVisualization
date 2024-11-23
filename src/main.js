
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { createApp } from 'vue'
import BurgersLinear from './components/parameters/BurgersLinear.vue'; 
import BurgersHeat from './components/parameters/BurgersHeat.vue';
import NSLinear from './components/parameters/NSLinear.vue';
import NSHeat from './components/parameters/NSHeat.vue';
import M6Linear from './components/parameters/M6Linear.vue';
import NACALinear from './components/parameters/NACALinear.vue';
import CASTLinear from './components/parameters/CASTLinear.vue';
import MainMenu from './components/MainMenu.vue';        
import FusionScatter from './components/parameters/FusionScatter.vue';
const app = createApp(App);

// 全局注册组件
app.component('BurgersLinear', BurgersLinear);
app.component('MainMenu', MainMenu);
app.component('BurgersHeat', BurgersHeat);
app.component('NSLinear', NSLinear);
app.component('NSHeat', NSHeat);
app.component('M6Linear', M6Linear);
app.component('NACALinear', NACALinear);
app.component('CASTLinear', CASTLinear);
app.component('FusionScatter', FusionScatter);
app.use(ElementPlus)
app.mount('#app')