
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { createApp } from 'vue'
import BurgersLinear from './components/parameters/BurgersLinear.vue'; 
import BurgersContour from './components/parameters/BurgersContour.vue';
import NSLinear from './components/parameters/NSLinear.vue';
import NSContour from './components/parameters/NSContour.vue';
import M6Linear from './components/parameters/M6Linear.vue';
import NACALinear from './components/parameters/NACALinear.vue';
import CASTLinear from './components/parameters/CASTLinear.vue';
import MainMenu from './components/MainMenu.vue';        
import FusionScatter from './components/parameters/FusionScatter.vue';
import Fusion3DScatter from './components/parameters/Fusion3DScatter.vue';
const app = createApp(App);

// 全局注册组件
app.component('BurgersLinear', BurgersLinear);
app.component('MainMenu', MainMenu);
app.component('BurgersContour', BurgersContour);
app.component('NSLinear', NSLinear);
app.component('NSContour', NSContour);
app.component('M6Linear', M6Linear);
app.component('NACALinear', NACALinear);
app.component('CASTLinear', CASTLinear);
app.component('FusionScatter', FusionScatter);
app.component('Fusion3DScatter', Fusion3DScatter);
app.use(ElementPlus)
app.mount('#app')