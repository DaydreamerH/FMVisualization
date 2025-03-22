<template>
    <div class="main-chart">
        <div class="content">
            <div class="chart-container">
                <div class="chart-title">气动数据融合3D散点图</div>
                <div id="chart" style="height: 94%; top:3%"></div>
            </div>

            <div class="parameters">
                <h3>参数设置</h3>

                <div class="file-choose">
                    <div v-for="(file, index) in fileInputs" :key="index" class="file-container">
                        <div class="file-label">{{ file.label }}:</div>
                        <div v-if="file.name" class="file-name">{{ file.name }}</div>
                        <el-upload class="upload-demo" :auto-upload="false"
                            :on-change="(file) => handleFileChange(index, file)" :show-file-list="false" accept=".txt">
                            <el-button size="small" type="primary">
                                {{ file.name ? '重新上传' : '点击上传' }}
                            </el-button>
                        </el-upload>
                    </div>
                </div>

                <ul class="data">
                    <li>
                        <span>第一维度列：</span>
                        <el-select v-model="firstParm" style="width: 50%;" placeholder="选择维度">
                            <el-option v-for="(option, index) in firstDimensionOptions" :key="index" :value="index"
                                :label="option" >
                                {{ option }}
                            </el-option>
                        </el-select>
                    </li>
                    <li>
                        <span>第二维度列：</span>
                        <el-select v-model="secondParm" style="width: 50%;" placeholder="选择维度">
                            <el-option v-for="(option, index) in secondDimensionOptions" :key="index" :value="index"
                                :label="option" >
                                {{ option }}
                            </el-option>
                        </el-select>
                    </li>
                    <li>
                        <span>第三维度列：</span>
                        <el-select v-model="thirdParm" style="width: 50%;" placeholder="选择维度">
                            <el-option v-for="(option, index) in secondDimensionOptions" :key="index" :value="index"
                                :label="option" >
                                {{ option }}
                            </el-option>
                        </el-select>
                    </li>
                </ul>

                <div class="button-container">
                    <el-button type="primary" @click="submitData" class="confirm">提交</el-button>
                </div>
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
                { label: '数值计算文件', content: [] },
                { label: '飞行试验文件', content: [] },
                { label: '融合数据文件', content: [] },
            ],
            // 参数选择
            firstParm: null,
            secondParm: null,
            thirdParm: null,
            firstDimensionOptions: ['来流马赫数', '总攻角', '气动转滚轮', '滚转舵偏', '俯仰舵偏', '偏航舵篇'],
            secondDimensionOptions: ['轴向力系数', '法向力系数', '侧向力系数', '滚转力矩系数', '俯仰力矩系数', '偏航力矩系数'],
            fileName:[]
        };
    },
    methods: {
        // 处理文件变化
        handleFileChange(index, file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const lines = e.target.result.split('\n');
                this.fileInputs[index].content = lines.map((line) => line.trim().split(/\s+/));
            };

            if (file.raw) {
                this.fileInputs[index].name = file.name;  // 更新文件名
                reader.readAsText(file.raw);
            }
        },

        // 提交数据并绘制图表
        submitData() {
            if(this.fileInputs[0].content.length == 0 || this.fileInputs[1].content.length == 0 || this.fileInputs[2].content.length == 0){
                this.$message.error('请上传文件')
                return
            }

            if(this.firstParm == null || this.secondParm == null || this.thirdParm == null){
                this.$message.error('请选择参数')
                return
            }

            console.time('绘制时间')

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

            console.timeEnd('绘制时间')
        }
    },
};
</script>

<style src="../../css/styles/drawing-tool.css"></style>

<style scoped>
.file-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.file-label {
    width: 120px;
    font-weight: bold;
}

.file-name {
  margin-right: 10px;
  color: #555;
}
</style>