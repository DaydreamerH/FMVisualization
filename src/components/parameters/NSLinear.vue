<template>
    <div class="ns-linear">
        <div class="content">
            <!-- 左侧：图表展示 -->
            <div class="chart-container">
                <div id="chart" style="height: 100%;"></div>
            </div>

            <!-- 右侧：参数设置 -->
            <div class="parameters">
                <h3>参数设置</h3>
                <div class="file-choose">
                    <input id="NSupload-input" type="file" accept=".csv,.dat" @change="handleFileChange"
                        class="file-input" />
                    <div class="f-button">选择数据文件</div>
                </div>
                <ul class="data">
                    <li>
                        <span>第一维度列：</span>
                        <select v-model="firstParm">
                            <option v-for="(name, index) in columnNames" :key="index" :value="index">
                                {{ index }} ({{ name }})
                            </option>
                        </select>
                    </li>
                    <li>
                        <span>第二维度列：</span>
                        <select v-model="secondParm">
                            <option v-for="(name, index) in columnNames" :key="index" :value="index">
                                {{ index }} ({{ name }})
                            </option>
                        </select>
                    </li>
                </ul>
                <button @click="submitData" class="confirm">提交</button>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from "echarts";

export default {
    name: "NSLinear",
    data() {
        return {
            fileType: null, // 文件类型
            fileContent: [], // 文件内容
            columnNames: [], // 动态列名
            firstParm: null, // 默认第一维度列
            secondParm: null, // 默认第二维度列
        };
    },
    methods: {
        // 处理文件选择和读取
        handleFileChange(event) {
            const file = event.target.files[0];
            const extension = file.name.split(".").pop().toLowerCase();
            this.fileType = extension;

            const reader = new FileReader();
            reader.onload = (e) => {
                const lines = e.target.result.split("\n").filter((line) => line.trim());
                if (extension === "csv") {
                    this.columnNames = [
                        "x_coord",
                        "y_coord",
                        "Pressure",
                        "Pressure_Coefficient",
                        "Skin_Friction_Coefficient_X",
                        "Skin_Friction_Coefficient_Y",
                        "Heat_Flux",
                    ];
                    this.fileContent = lines.map((line) => line.split(","));
                } else if (extension === "dat") {
                    this.columnNames = [
                        "CL",
                        "CD",
                        "CSF",
                        "CMx",
                        "CMy",
                        "CMz",
                        "CFx",
                        "CFy",
                        "CFz",
                        "CL/CD",
                        "AoA",
                        "Custom_ObjFunc",
                        "HeatFlux_Total",
                        "HeatFlux_Maximum",
                        "Temperature_Total",
                        "Res_Flow[0]",
                        "Res_Flow[1]",
                        "Res_Flow[2]",
                        "Res_Flow[3]",
                        "Res_Flow[4]",
                        "Res_Turb[0]",
                        "Linear_Solver_Iterations",
                        "CFL_Number",
                        "Time(min)",
                    ];
                    this.fileContent = lines.map((line) => line.split(/\s+/));
                }
                this.firstParm = 0; // 设置默认值
                this.secondParm = 1;
            };
            reader.readAsText(file);
        },

        // 提交数据并绘制图表
        submitData() {
            const firstParm = parseInt(this.firstParm);
            const secondParm = parseInt(this.secondParm);

            const xValues = this.fileContent.map((row) =>
                parseFloat(row[firstParm])
            );
            const yValues = this.fileContent.map((row) =>
                parseFloat(row[secondParm])
            );

            // 检查并清理已存在的 ECharts 实例
            const chartDom = document.getElementById("chart");
            if (echarts.getInstanceByDom(chartDom)) {
                echarts.dispose(chartDom);
            }

            // 初始化新图表
            const chart = echarts.init(chartDom);
            const option = {
                title: {
                    text: `NS 方程: ${this.columnNames[firstParm]} 与 ${this.columnNames[secondParm]} 的关系`,
                },
                xAxis: {
                    type: "category",
                    name: this.columnNames[firstParm],
                    data: xValues,
                },
                yAxis: {
                    type: "value",
                    name: this.columnNames[secondParm],
                },
                series: [
                    {
                        name: "数据",
                        type: "line",
                        data: xValues.map((x, i) => [x, yValues[i]]),
                    },
                ],
            };
            chart.setOption(option);
        },
    },
};
</script>

<style scoped>
.ns-linear {
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