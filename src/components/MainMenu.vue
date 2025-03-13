<template>
    <el-menu default-active="1" class="el-menu-vertical-demo" :unique-opened="true"
    background-color="#F5F5F5" text-color="#424242">
        <el-sub-menu :index="String(index)" v-for="(menu, index) in menus" :key="menu.title">
            <template #title>
                <span style="font-size: 18px; font-weight: bold;">{{ menu.title }}</span>
            </template>
            <el-menu-item-group>
                <el-menu-item v-for="item in menu.children" :key="item.title" @click="handleMenuClick(item)">
                    <span style="font-size: 15px; font-weight: bold;">{{ item.title }}</span>
                </el-menu-item>
            </el-menu-item-group>
        </el-sub-menu>
    </el-menu>
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
                        { title: "等高线图", action: "BC" },
                    ],
                },
                {
                    title: "NS 方程",
                    icon: "el-icon-s-data",
                    children: [
                        { title: "折线图", action: "NL" },
                        { title: "等高线图", action: "NC" },
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
                {
                    title: "S-A方程",
                    icon: "el-icon-s-cooperation",
                    children: [
                        { title: "等高线图", action: "SA" },
                    ],
                },
            ],
        };
    },
    methods: {
        // 将点击的菜单项 action 值传递到父组件
        handleMenuClick(item) {
            this.$emit("menu-action", item.action);
        },
    },
};
</script>
