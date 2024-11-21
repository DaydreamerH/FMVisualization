<template>
    <div>
    <el-container style="min-height: 100vh;">
        <!-- Header 区域 -->
        <el-header
            style="background-color: #409EFF; color: white; display: flex; align-items: center; justify-content: space-between; margin: 0%;">
            <h3>气动数据可视化平台</h3>
            <el-link type="info" href="#" style="color: white;">关于</el-link>
        </el-header>
        <el-container>
            <!-- Aside 区域 -->
            <el-aside width="200px" style="background-color: #F2F6FC; padding: 20px;">
                <el-menu default-active="1" class="el-menu-vertical-demo" :unique-opened="true">
                    <el-sub-menu :index="index" v-for="(menu, index) in menus" :key="menu.title">
                        <template #title>
                            <i :class="menu.icon"></i>
                            <span>{{ menu.title }}</span>
                        </template>
                        <el-menu-item-group>
                            <el-menu-item v-for="item in menu.children" :key="item.title"
                                @click="handleMenuClick(item)">
                                {{ item.title }}
                            </el-menu-item>
                        </el-menu-item-group>
                    </el-sub-menu>
                </el-menu>
            </el-aside>
            <!-- Main Content 区域 -->
            <el-main style="padding: 20px; background-color: #ffffff;">
                <div class="content">
                    <!-- 添加动态内容展示的区域 -->
                    <el-card>
                        <h4>这里是主内容区域</h4>
                        <p>选择侧边栏的功能查看内容。</p>
                    </el-card>
                </div>
            </el-main>
        </el-container>
    </el-container>
</div>
</template>

<script>
export default {
    data() {
        return {
            menus: [
                {
                    title: "Burgers 方程",
                    icon: "el-icon-s-grid",
                    children: [
                        { title: "折线图", action: "BL" },
                        { title: "热力图", action: "BH" },
                    ],
                },
                {
                    title: "NS 方程",
                    icon: "el-icon-s-data",
                    children: [
                        { title: "折线图", action: "NL" },
                        { title: "热力图", action: "NH" },
                        { title: "场图", action: "NF" },
                    ],
                },
                {
                    title: "M6 翼型数据",
                    icon: "el-icon-s-operation",
                    children: [{ title: "折线图", action: "ML" }],
                },
                {
                    title: "NACA 翼型数据",
                    icon: "el-icon-s-fold",
                    children: [{ title: "折线图", action: "NAL" }],
                },
                {
                    title: "CAST 翼型数据",
                    icon: "el-icon-s-platform",
                    children: [{ title: "折线图", action: "CL" }],
                },
                {
                    title: "气动数据融合",
                    icon: "el-icon-s-cooperation",
                    children: [
                        { title: "折线图", action: "FL" },
                        { title: "3维图", action: "F3D" },
                    ],
                },
            ],
        };
    },
    methods: {
        handleMenuClick(item) {
            console.log(`Menu clicked: ${item.action}`);
            // TODO: 根据 `action` 值切换到相应的功能或调用后端接口。
        },
    },
};
</script>

<style scoped>
.el-header {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-menu {
    border: none;
}

.content {
    text-align: center;
    margin-top: 50px;
}
</style>