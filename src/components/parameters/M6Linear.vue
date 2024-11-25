<template>
    <div class="burgers-liner">
        <!-- 主容器 -->
        <div class="content">
            <!-- 左侧：图表展示 -->
            <div class="chart-container">
                <div class="chart-title">M6翼型折线图</div>
                <div id="chart" style="height: 94%; top:3%;"></div>
            </div>

            <!-- 右侧：参数设置 -->
            <div class="parameters">
                <h3>参数设置</h3>
                <div class="file-choose">
                    <el-upload class="upload-demo" drag accept=".csv" :on-change="handleFileChange"
                        :show-file-list="false" :auto-upload="false">
                        <i class="el-icon-upload"></i>
                        <div>选择数据文件</div>
                    </el-upload>
                </div>

                <!-- 显示上传文件名 -->
                <div class="uploaded-content" v-if="fileName">
                    <h4>已选择文件：{{ fileName }}</h4>
                </div>
                <ul class="data">
                    <li>
                        <span>第一维度列：</span>
                        <el-select v-model="firstParm" style="width: 50%;" placeholder="选择维度">
                            <el-option v-for="(name, index) in columnNames" :key="index" :value="index" :label="name">{{
                                name }}</el-option>
                        </el-select>
                    </li>
                    <li>
                        <span>第二维度列：</span>
                        <el-select v-model="secondParm" style="width: 50%;" placeholder="选择维度">
                            <el-option v-for="(name, index) in columnNames" :key="index" :value="index" :label="name">{{
                                name }}</el-option>
                        </el-select>
                    </li>
                    <!-- 添加马赫数选择框 -->
                    <li>
                        <span>选择马赫数:</span>
                        <el-select v-model="Ma_sample" style="width: 50%;" placeholder="筛选马赫数">
                            <el-option v-for="(value, index) in machOptions" :key="index" :value="value">{{ value }}
                            </el-option>
                        </el-select>
                    </li>
                    <!-- 添加雷诺数选择框 -->
                    <li>
                        <span>选择雷诺数:</span>
                        <el-select v-model="Re_sample" style="width: 50%;" placeholder="筛选马赫数">
                            <el-option v-for="(value, index) in reynoldsOptions" :key="index" :value="value">{{ value }}
                            </el-option>
                        </el-select>
                    </li>
                </ul>
                <button @click="submitData" class="confirm">提交</button>
            </div>
        </div>
    </div>
</template>



<script>
// 引入 PapaParse 用于 CSV 解析
import Papa from 'papaparse';
import * as echarts from 'echarts';

export default {
    name: 'M6LineChart',
    data() {
        return {
            firstParm: null, // 默认选中的维度
            secondParm: null, // 默认选中的维度
            fileContent: [], // 用于存储文件数据
            columnNames: [], // 用于存储CSV文件的列名
            Ma_sample: null, // 默认马赫数
            Re_sample: null, // 默认雷诺数
            machOptions: [], // 马赫数的选择范围
            reynoldsOptions: [], // 雷诺数的选择范围
            fileName: ''
        };
    },
    methods: {
        // 处理文件选择和读取
        handleFileChange(file) {
            // 使用 PapaParse 解析 CSV 文件
            this.fileName = file.name;
            Papa.parse(file.raw, {
                complete: (result) => {
                    // 获取文件内容
                    this.fileContent = result.data;

                    // 获取列名
                    this.columnNames = result.meta.fields;

                    // 处理科学计数法数据
                    this.fileContent = this.fileContent.map(row => {
                        let newRow = {};
                        for (let column in row) {
                            newRow[column] = parseFloat(row[column]);
                        }
                        return newRow;
                    });

                    // 提取 MACH_NUMBER马赫数 和 REYNOLDS_NUMBER雷诺数 的数据
                    const machNumbers = this.fileContent.map(row => row['MACH_NUMBER马赫数']).filter(value => !isNaN(value));
                    const reynoldsNumbers = this.fileContent.map(row => row['REYNOLDS_NUMBER雷诺数']).filter(value => !isNaN(value));

                    // 生成 MACH_NUMBER 和 REYNOLDS_NUMBER 的范围
                    this.machOptions = [...new Set(machNumbers)].sort((a, b) => a - b); // 排序后去重
                    this.reynoldsOptions = [...new Set(reynoldsNumbers)].sort((a, b) => a - b); // 排序后去重
                },
                header: true, // 使用第一行作为列名
                skipEmptyLines: true, // 跳过空行
            });
        },


        // 生成范围数据，步长可调
        generateRange(min, max, step) {
            const range = [];
            for (let i = min; i <= max; i += step) {
                range.push(i); // 保留两位小数
            }
            return range;
        },

        // 过滤数据，选择符合条件的数据
        selectMa(data) {
            return data.filter((row) => {
                return row['MACH_NUMBER马赫数'] === this.Ma_sample && row['REYNOLDS_NUMBER雷诺数'] === this.Re_sample;
            });
        },

        // 提交数据并绘制折线图
        submitData() {
            if (this.fileName === '') {
                this.$message.error('请先上传文件!');
                return;
            }

            if (this.firstParm === null || this.secondParm === null) {
                this.$message.error('请先选择维度!');
                return;
            }

            if (this.Ma_sample === null || this.Re_sample === null) {
                this.$message.error('请先选择马赫数和雷诺数!');
                return;
            }



            const firstParm = parseInt(this.firstParm);
            const secondParm = parseInt(this.secondParm);

            // 过滤数据，选择符合条件的数据
            const filteredData = this.selectMa(this.fileContent);
            console.log(filteredData);
            // 按照第一列（AOA）排序
            const sortedData = filteredData.sort((a, b) => parseFloat(a['AOA攻角']) - parseFloat(b['AOA攻角']));

            // 提取X轴和Y轴的数据
            const xData = sortedData.map((row) => row[this.columnNames[firstParm]]);
            const yData = sortedData.map((row) => row[this.columnNames[secondParm]]);

            // 绘制折线图
            const chartDom = document.getElementById('chart');
            if (echarts.getInstanceByDom(chartDom)) {
                echarts.dispose(chartDom); // 销毁已有实例
            }
            const chart = echarts.init(chartDom);

            const option = {
                title: {
                    text: `${this.columnNames[firstParm]} 与 ${this.columnNames[secondParm]} 的关系`,
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: (params) => {
                        const value = params[0].value;
                        return `${this.columnNames[firstParm]}: ${value}`;
                    },
                },
                xAxis: {
                    type: 'category',
                    data: xData, // X轴数据
                    name: this.columnNames[firstParm],
                },
                yAxis: {
                    type: 'value',
                    name: this.columnNames[secondParm],
                },
                series: [
                    {
                        name: 'Data Series',
                        type: 'line',
                        data: yData, // Y轴数据
                        symbol: 'circle',
                        label: {
                            show: false,
                        },
                    },
                ],
                dataZoom: [
                    {
                        type: 'inside', // 允许通过鼠标拖拽图表来平移
                        xAxisIndex: [0],
                        start: 0,
                        end: 100,
                        zoomLock: false, // 设置缩放锁定
                    },
                    {
                        show: true, // 添加外部缩放工具栏
                        type: 'slider',
                        xAxisIndex: [0],
                        start: 0,
                        end: 100,
                    },
                ],
            };

            chart.setOption(option);
        },
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
    height: 100%;
}

.chart-container {
    flex: 3;
    padding: 20px;
    background-color: #ffffff;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    height: auto;
    position: relative;
}

.chart-title {
    position: absolute;
    top: 10px;
    left: 20px;
    font-size: 24px;
    font-weight: bold;
}

.parameters {
    flex: 1;
    margin-left: 20px;
    padding: 20px;
    padding-top: 10px;
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

.uploaded-content {
    margin: 20px 0;
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