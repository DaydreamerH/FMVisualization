<template>
    <div class="main-chart">
        <!-- 主容器 -->
        <div class="content">
            <!-- 左侧：图表展示 -->
            <div class="chart-container">
                <div class="chart-title">CAST翼型</div>
                <div id="scatter-chart" style="height: 45%;position: relative; top:5%;"></div>
                <div id="line-chart" style="height: 45%;position: relative; top:5%;"></div>
            </div>

            <!-- 右侧：参数设置 -->
            <div class="parameters">
                <h3>参数设置</h3>
                <div class="file-choose">
                    <el-upload class="upload-demo" drag accept=".txt" :on-change="handleFileChange"
                        :show-file-list="false" :auto-upload="false">
                        <i class="el-icon-upload"></i>
                        <div>选择数据文件</div>
                    </el-upload>
                </div>
                <div class="uploaded-content" v-if="fileName">
                    <h4>已选择文件：{{ fileName }}</h4>
                </div>
                <ul class="data">
                    <li>
                        <span>翼型序号：</span>
                        <el-input v-model.number="planeID" type="number" min="1" max="111" class="input-number"
                            style="width:50%;" />
                    </li>
                    <li>
                        <span>第一维度列：</span>
                        <el-select v-model="firstParm" style="width: 50%;" placeholder="选择维度">
                            <el-option label="Alpha" value="0"></el-option>
                            <el-option label="CD" value="1"></el-option>
                            <el-option label="CL" value="2"></el-option>
                        </el-select>
                    </li>
                    <li>
                        <span>第二维度列：</span>
                        <el-select v-model="secondParm" style="width: 50%;" placeholder="选择维度">
                            <el-option label="Alpha" value="0"></el-option>
                            <el-option label="CD" value="1"></el-option>
                            <el-option label="CL" value="2"></el-option>
                        </el-select>
                    </li>
                </ul>
                <div class="button-container">
                    <el-button type="primary" @click="submitData" class="confirm">提交</el-button> <!-- 提交按钮 -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    name: 'NACALiner',
    data() {
        return {
            planeID: 1, // 翼型序号
            firstParm: null, // 第一维度列
            secondParm: null, // 第二维度列
            fileContent: [], // 文件内容数据
            fileName: ''
        };
    },
    methods: {
        // 读取文件内容
        handleFileChange(file) {
            this.fileName = file.name; // 存储文件名
            const reader = new FileReader();
            reader.onload = (e) => {
                const lines = e.target.result.split('\n');
                this.fileContent = lines.map((line) => line.trim().split(/\s+/));
            };
            reader.readAsText(file.raw);
        },

        // 绘制图表
        submitData() {
            if (this.fileName === '') {
                this.$message.error('请先上传文件!');
                return;
            }

            if(this.planeID < 1 || this.planeID > 111) {
                this.$message.error('请输入正确的翼型序号!');
                return;
            }

            if (this.firstParm === null || this.secondParm === null) {
                this.$message.error('请先选择维度!');
                return;
            }



            const SHAPE_DATA_LENGTH = 562;

            const planeID = this.planeID;
            const firstParm = parseInt(this.firstParm); // 第一维度列
            const secondParm = parseInt(this.secondParm); // 第二维度列

            // 获取数据范围
            const startIndex = planeID * 21;
            const endIndex = (planeID + 1) * 21;

            // 过滤数据
            const filteredData = this.fileContent.slice(startIndex, endIndex);

            // 提取翼型轮廓图 (xshape 和 yshape)
            const xIndices = Array.from({ length: SHAPE_DATA_LENGTH }, (_, i) => (i % 2 === 0 ? i : null)).filter((i) => i !== null);
            const yIndices = Array.from({ length: SHAPE_DATA_LENGTH }, (_, i) => (i % 2 === 1 ? i : null)).filter((i) => i !== null);

            // 从第 22 行 (Python 的第 21 行) 提取 xshape 和 yshape
            const shapeRow = filteredData[0]; // 假设第 22 行的索引为 0
            const xshape = xIndices.map((idx) => parseFloat(shapeRow[idx] || 0));
            const yshape = yIndices.map((idx) => parseFloat(shapeRow[idx] || 0));

            // 提取折线数据 (c1 和 c2 对应的列数据)
            // +1 是因为第一个非形状数据为马赫数，按照马赫数、Alpha、CD、CL 排序
            const col1 = filteredData.map((row) => parseFloat(row[firstParm + SHAPE_DATA_LENGTH + 1]));
            const col2 = filteredData.map((row) => parseFloat(row[secondParm + SHAPE_DATA_LENGTH + 1]));

            // 检查并清理 ECharts 实例
            const scatterDom = document.getElementById('scatter-chart');
            const lineDom = document.getElementById('line-chart');
            if (echarts.getInstanceByDom(scatterDom)) {
                echarts.dispose(scatterDom);
            }
            if (echarts.getInstanceByDom(lineDom)) {
                echarts.dispose(lineDom);
            }

            // 初始化散点图 (翼型轮廓)
            const scatterChart = echarts.init(scatterDom);
            scatterChart.setOption({
                title: { text: `CAST 翼型 No.${planeID} 轮廓图` },
                xAxis: { name: 'x' },
                yAxis: { name: 'y' },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross', // 显示十字坐标线
                    },
                },
                dataZoom: [
                    {
                        type: 'inside', // 内部缩放
                        xAxisIndex: 0,
                        start: 0,
                        end: 100,
                    },
                    {
                        type: 'inside', // 内部缩放
                        yAxisIndex: 0,
                        start: 0,
                        end: 100,
                    },
                ],
                series: [
                    {
                        type: 'scatter',
                        data: xshape.map((x, i) => [x, yshape[i]]),
                        symbolSize: 5,
                    },
                ],
            });

            // 初始化折线图
            const lineChart = echarts.init(lineDom);
            const machNumber = parseFloat(filteredData[0][SHAPE_DATA_LENGTH]).toFixed(2);
            lineChart.setOption({
                title: {
                    text: `马赫数为 ${machNumber} 时，${['Alpha', 'CD', 'CL'][firstParm]} 和 ${['Alpha', 'CD', 'CL'][secondParm]} 的关系`
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: (params) => {
                        return `${['Alpha', 'CD', 'CL'][firstParm]}: ${params[0].value[0]}<br/>
                    ${['Alpha', 'CD', 'CL'][secondParm]}: ${params[0].value[1]}`;
                    }
                },
                xAxis: {
                    type: 'value',
                    name: ['Alpha', 'CD', 'CL'][firstParm],
                },
                yAxis: {
                    type: 'value',
                    name: ['Alpha', 'CD', 'CL'][secondParm],
                },
                series: [
                    {
                        type: 'line',
                        data: col1.map((x, i) => [x, col2[i]]),
                    }
                ],
                dataZoom: [
                    {
                        type: 'slider', // 显示的缩放工具条
                        xAxisIndex: 0, // 应用到 X 轴
                        start: 0, // 初始显示范围的起点
                        end: 100, // 初始显示范围的终点
                    },
                    {
                        type: 'inside', // 鼠标滚轮或触摸缩放
                        xAxisIndex: 0, // 应用到 X 轴
                    }
                ],
            });
        }
        ,
    },
};
</script>

<style src="../../css/styles/drawing-tool.css"></style>