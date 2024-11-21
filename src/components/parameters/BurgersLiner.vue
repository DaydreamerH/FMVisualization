<template>
    <div class="burgers-liner">
        <!-- File upload section -->
        <div class="file-choose">
            <input id="BLupload-input" class="file-input" type="file" accept=".txt" @change="handleFileChange" />
            <div class="f-button"></div>
        </div>

        <!-- Parameters selection -->
        <ul class="data">
            <li class="first">
                <span>第一维度列：</span>
                <el-select v-model="firstParm" placeholder="请选择第一维度列">
                    <el-option v-for="option in options" :key="option.value" :label="option.label"
                        :value="option.value" />
                </el-select>
            </li>
            <li class="second">
                <span>第二维度列：</span>
                <el-select v-model="secondParm" placeholder="请选择第二维度列">
                    <el-option v-for="option in options" :key="option.value" :label="option.label"
                        :value="option.value" />
                </el-select>
            </li>
        </ul>

        <!-- Submit button -->
        <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
</template>

<script>
export default {
    name: "BurgersLiner",
    data() {
        return {
            firstParm: null,
            secondParm: null,
            options: [
                { label: "0(T)", value: "0(T)" },
                { label: "1(X)", value: "1(X)" },
                { label: "2(V)", value: "2(V)" },
                { label: "3(U)", value: "3(U)" },
            ],
        };
    },
    methods: {
        handleFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                console.log("选中的文件:", file.name);
                // TODO: Implement file handling logic
            }
        },
        handleSubmit() {
            console.log("提交的参数:", {
                firstParm: this.firstParm,
                secondParm: this.secondParm,
            });
            // TODO: Implement submit logic
        },
    },
};
</script>

<style scoped>
.burgers-liner {
    padding: 20px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    background-color: #f9f9f9;
    max-width: 400px;
}

.file-choose {
    position: relative;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.file-input {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0;
}

.f-button {
    width: 100px;
    height: 40px;
    background-color: #409eff;
    border-radius: 4px;
    text-align: center;
    line-height: 40px;
    color: white;
    cursor: pointer;
}

.data {
    list-style: none;
    padding: 0;
    margin: 0;
}

.data li {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.data li span {
    width: 100px;
    font-weight: bold;
}
</style>