<template>
    <div class="burgers-liner">
        <div class="content">
            <!-- 左侧：图表展示 -->
            <div class="chart-container">
                <div id="chart" style="height: 100%;"></div>
            </div>

            <!-- 右侧：参数设置 -->
            <div class="parameters">
                <h3>参数设置</h3>

                <!-- 文件上传 -->
                <div class="file-choose" v-for="(file, index) in fileInputs" :key="index">
                    <input :id="'upload-input-' + index" type="file" accept=".txt" @change="handleFileChange(index)"
                        class="file-input" />
                    <div class="f-button">{{ file.label }}</div>
                </div>

                <!-- 参数选择 -->
                <ul class="data">
                    <li>
                        <span>第一维度列：</span>
                        <select v-model="firstParm">
                            <option v-for="(option, index) in firstDimensionOptions" :key="index" :value="index">
                                {{ option }}
                            </option>
                        </select>
                    </li>
                    <li>
                        <span>第二维度列：</span>
                        <select v-model="secondParm">
                            <option v-for="(option, index) in secondDimensionOptions" :key="index" :value="index">
                                {{ option }}
                            </option>
                        </select>
                    </li>
                    <li>
                        <span>第三维度列：</span>
                        <select v-model="thirdParm">
                            <option v-for="(option, index) in secondDimensionOptions" :key="index" :value="index">
                                {{ option }}
                            </option>
                        </select>
                    </li>
                </ul>

                <!-- 提交按钮 -->
                <button @click="submitData" class="confirm">提交</button>
            </div>
        </div>
    </div>
</template>
<script>
import * as echarts from 'echarts';
import 'echarts-gl';
export default {
    name: 'BurgersLiner',
    data() {
        return {
            // 文件输入配置
            fileInputs: [
                { label: '选择数值计算文件', content: [] },
                { label: '选择飞行试验文件', content: [] },
                { label: '选择融合数据文件', content: [] },
            ],
            // 参数选择
            firstParm: 0,
            secondParm: 1,
            thirdParm: 2,
            firstDimensionOptions: ['来流马赫数', '总攻角', '气动转滚轮', '滚转舵偏', '俯仰舵偏', '偏航舵篇'],
            secondDimensionOptions: ['轴向力系数', '法向力系数', '侧向力系数', '滚转力矩系数', '俯仰力矩系数', '偏航力矩系数']
        };
    },
    methods: {
        // 处理文件变化
        handleFileChange(index) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const lines = e.target.result.split('\n');
                this.fileInputs[index].content = lines.map((line) => line.trim().split(/\s+/));
            };
            reader.readAsText(file);
        },

        // 提交数据并绘制图表
        submitData() {
            // 第一维度长度
            const firstDimensionLength = 6;

            const firstParm = parseInt(this.firstParm);
            const secondParm = parseInt(this.secondParm);
            const thirdParm = parseInt(this.thirdParm);

            // 数据融合逻辑
            const [numericalData, experimentData, fusionData] = this.fileInputs.map((file) => file.content);

            // 计算跳跃步长
            const maxLength = Math.max(numericalData.length, experimentData.length, fusionData.length);
            const step = maxLength > 30000 ? 4 : maxLength > 20000 ? 3 : maxLength > 10000 ? 2 : 1;

            // 通用跳跃采样函数
            const sampleData = (data, step) => data.filter((_, index) => index % step === 0);

            // 对所有数据集进行采样
            const sampledDataSets = [numericalData, experimentData, fusionData].map((data) => sampleData(data, step));

            // 构造绘图数据
            const seriesData = sampledDataSets.map((data, fileIndex) => {
                const xData = data.map((row) => row[firstParm]);
                const yData = data.map((row) => row[secondParm + firstDimensionLength]);
                const zData = data.map((row) => row[thirdParm + firstDimensionLength]);
                return {
                    name: this.fileInputs[fileIndex].label,
                    type: 'scatter3D',
                    data: xData.map((x, i) => [x, yData[i], zData[i]]),
                    symbolSize: 5, // 散点大小
                };
            });

            // 初始化图表
            const chartDom = document.getElementById('chart');
            if (echarts.getInstanceByDom(chartDom)) {
                echarts.dispose(chartDom);
            }
            const chart = echarts.init(chartDom);

            // 设置图表选项
            const option = {
                title: {
                    text: '融合数据三维散点图',
                },
                tooltip: {
                    trigger: 'item',
                    formatter: (params) => {
                        const [x, y, z] = params.value;
                        return `${this.firstDimensionOptions[firstParm]}: ${x}<br>
                        ${this.secondDimensionOptions[secondParm]}: ${y}<br>
                        ${this.secondDimensionOptions[thirdParm]}: ${z}`;
                    },
                },
                legend: {
                    data: seriesData.map((item) => item.name),
                },
                grid3D: {
                    viewControl: {
                        projection: 'perspective', // 透视效果
                        rotateSensitivity: 1, // 旋转灵敏度
                    },
                },
                xAxis3D: {
                    type: 'value',
                    name: this.firstDimensionOptions[firstParm],
                },
                yAxis3D: {
                    type: 'value',
                    name: this.secondDimensionOptions[secondParm],
                },
                zAxis3D: {
                    type: 'value',
                    name: this.secondDimensionOptions[thirdParm],
                },
                series: seriesData,
            };

            chart.setOption(option);
        }



    },
};
</script>
<style scoped>
.burgers-liner {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
}

.content {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 1200px;
    height: 100%;
}

.chart-container {
    flex: 3;
    padding: 20px;
    background-color: #ffffff;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    height: auto;
}

.parameters {
    flex: 1;
    margin-left: 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
}

.file-choose {
    position: relative;
    margin-bottom: 20px;
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
    width: 100%;
    height: 40px;
    background-color: #409eff;
    text-align: center;
    line-height: 40px;
    color: white;
    border-radius: 4px;
    cursor: pointer;
}

.confirm {
    width: 100%;
    padding: 10px 0;
    background-color: #409eff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}
</style>
