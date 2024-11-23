<template>
    <div class="naca-liner">
        <!-- 主容器 -->
        <div class="content">
            <!-- 左侧：图表展示 -->
            <div class="chart-container">
                <div id="scatter-chart" style="height: 45%;"></div>
                <div id="line-chart" style="height: 45%;"></div>
            </div>

            <!-- 右侧：参数设置 -->
            <div class="parameters">
                <h3>参数设置</h3>
                <div class="file-choose">
                    <input id="NALupload-input" type="file" accept=".txt" @change="handleFileChange"
                        class="file-input" />
                    <div class="f-button">选择数据文件</div>
                </div>
                <ul class="data">
                    <li>
                        <span>翼型序号：</span>
                        <input v-model.number="planeID" type="number" min="0" max="111" class="input-number" />
                    </li>
                    <li>
                        <span>第一维度列：</span>
                        <select v-model="firstParm">
                            <option value="0">0(Alpha)</option>
                            <option value="1">1(CD)</option>
                            <option value="2">2(CL)</option>
                        </select>
                    </li>
                    <li>
                        <span>第二维度列：</span>
                        <select v-model="secondParm">
                            <option value="0">0(Alpha)</option>
                            <option value="1">1(CD)</option>
                            <option value="2">2(CL)</option>
                        </select>
                    </li>
                </ul>
                <button @click="submitData" class="confirm">提交</button>
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
            planeID: 0, // 翼型序号
            firstParm: '0', // 第一维度列
            secondParm: '1', // 第二维度列
            fileContent: [], // 文件内容数据
        };
    },
    methods: {
        // 读取文件内容
        handleFileChange(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const lines = e.target.result.split('\n');
                this.fileContent = lines.map((line) => line.trim().split(/\s+/));
            };
            reader.readAsText(file);
        },

        // 绘制图表
        submitData() {
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
                title: { text: `NACA 翼型 No.${planeID} 轮廓图` },
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

<style scoped>
.naca-liner {
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

.parameters h3 {
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: bold;
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

.data li {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.data li span {
    width: 120px;
    font-weight: bold;
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