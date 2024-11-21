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
                <el-aside width="200px">
                    <MainMenu />
                </el-aside>
                <!-- Main Content 区域 -->
                <el-main style="padding: 20px; background-color: #ffffff;">
                    <div class="content">
                        <!-- 添加动态内容展示的区域 -->
                         <BugersLiner></BugersLiner>
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
            
        };
    },
    components: {
        
    }
};
</script>

<style scoped lang = less>
.el-header {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-menu {
    border: none;
    margin: 0%;
    width: 100%;
    height: 100%;
}

.content {
    text-align: center;
    margin-top: 50px;
}
</style>