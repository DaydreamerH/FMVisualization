<template>
    <div>
        <el-container style="min-height: 100vh;">
            <!-- Header 区域 -->
            <el-header
                style="background-color: #409EFF; color: white; display: flex; align-items: center; justify-content: space-between;">
                <h3>气动数据可视化平台</h3>
            </el-header>
            <el-container style="flex-direction: row;">
                <!-- Aside 区域 -->
                <el-aside width="200px">
                    <!-- 使用 MainMenu 组件，监听菜单操作事件 -->
                    <MainMenu @menu-action="handleMenuAction" />
                </el-aside>
                <!-- Main Content 区域 -->
                <el-main style="padding: 20px; background-color: #ffffff; flex-grow: 1;">
                    <div class="content">
                        <!-- 动态组件，根据 activeModule 动态加载对应组件 -->
                        <component :is="activeModuleMap[activeModule]" />
                    </div>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import { markRaw } from 'vue';

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

export default {
    data() {
        return {
            activeModule: 'BL', // 默认显示的模块
            // 模块映射表，映射 action 到组件名
            activeModuleMap: {
                BL: markRaw(BurgersLinear),
                BC: markRaw(BurgersContour),
                NL: markRaw(NSLinear),
                NC: markRaw(NSContour),
                ML: markRaw(M6Linear),
                NAL: markRaw(NACALinear),
                CL: markRaw(CASTLinear),
                FS: markRaw(FusionScatter),
                F3DS: markRaw(Fusion3DScatter),
            },
        };
    },
    components: {
        MainMenu, // 主菜单
        BurgersLinear,
        BurgersContour,
        NSLinear,
        NSContour,
        M6Linear,
        NACALinear,
        CASTLinear,
        FusionScatter,
        Fusion3DScatter,
    },
    methods: {
        // 处理菜单点击事件，切换当前显示的模块
        handleMenuAction(action) {
            this.activeModule = action;
        },
    },
};
</script>

<style scoped lang="less">
.el-header {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-menu {
    border: none;
    margin: 0;
    width: 100%;
    height: 100%;
}

.content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}
</style>
