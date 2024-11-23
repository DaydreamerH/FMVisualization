<template>
    <div>
        <el-container style="min-height: 100vh;">
            <!-- Header 区域 -->
            <el-header
                style="background-color: #409EFF; color: white; display: flex; align-items: center; justify-content: space-between; margin: 0%;">
                <h3>气动数据可视化平台</h3>
            </el-header>
            <el-container style="flex-direction: row;">
                <!-- Aside 区域 -->
                <el-aside width="200px">
                    <MainMenu />
                </el-aside>
                <!-- Main Content 区域 -->
                <el-main style="padding: 20px; background-color: #ffffff; flex-grow: 1;">
                    <div class="content">
                        <!-- 添加动态内容展示的区域 -->
                        <!-- <BurgersLinear></BurgersLinear> -->
                         <!-- <BurgersHeat></BurgersHeat> -->
                          <!-- <NSLinear></NSLinear> -->
                           <!-- <NSHeat></NSHeat> -->
                            <!-- <M6Linear></M6Linear> -->
                             <NACALinear></NACALinear>
                    </div>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import NACALinear from './components/parameters/NACALinear.vue';

export default {
    data() {
        return {
            
        };
    },
    components: {
        
    }
};
</script>

<style scoped lang="less">
.el-header {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-menu {
    border: none;
    margin: 0%;
    width: 100%;
    height: 100%;
}

/* Content section styling */
.content {
    display: flex;
    flex-direction: column;  /* Or row, depending on the layout you want */
    height: 100%;            /* Ensure it fills up all available space */
    justify-content: center; /* Center the content if necessary */
}

/* Adjust BurgersLiner to fill the available space */
BurgersLiner {
    flex-grow: 1; /* This ensures it grows to fill the available space */
    width: 100%;  /* Make sure the component occupies full width */
}
</style>
