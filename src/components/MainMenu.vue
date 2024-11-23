<template>
    <el-menu default-active="1" class="el-menu-vertical-demo" :unique-opened="true">
        <el-sub-menu :index="String(index)" v-for="(menu, index) in menus" :key="menu.title">
            <template #title>
                <i :class="menu.icon"></i>
                <span>{{ menu.title }}</span>
            </template>
            <el-menu-item-group>
                <el-menu-item v-for="item in menu.children" :key="item.title" @click="handleMenuClick(item)">
                    {{ item.title }}
                </el-menu-item>
            </el-menu-item-group>
        </el-sub-menu>
    </el-menu>
</template>

<script>
export default{
    data(){
        return {
            menus: [
                {
                    title: "Burgers 方程",
                    icon: "el-icon-s-grid",
                    children: [
                        { title: "折线图", action: "BL" },
                        { title: "等高线图", action: "BC" },
                    ],
                },
                {
                    title: "NS 方程",
                    icon: "el-icon-s-data",
                    children: [
                        { title: "折线图", action: "NL" },
                        { title: "等高线图", action: "NC" },
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
                        { title: "散点图", action: "FS" },
                        { title: "3维散点图", action: "F3DS" },
                    ],
                },
            ],
        }
    },
    methods: {
        handleMenuClick(item) {
            console.log(`Menu clicked: ${item.action}`);
            // TODO: 根据 `action` 值切换到相应的功能或调用后端接口。
        },
    },
}
</script>

<style>
</style>