<template>
  <div class="main-chart">
    <div class="content">
      <!-- 左侧：图表展示 -->
      <div class="chart-container">
        <div class="chart-title">NS方程折线图</div>
        <div id="chart" style="height: 100%;"></div>
      </div>

      <!-- 右侧：参数设置 -->
      <div class="parameters">
        <h3>参数设置</h3>
        <div class="file-choose">
          <el-upload class="upload-demo" drag accept=".csv,.dat" :on-change="handleFileChange" :show-file-list="false"
            :auto-upload="false">
            <i class="el-icon-upload"></i>
            <div>选择数据文件</div>
          </el-upload>
        </div>
        <div class="uploaded-content" v-if="fileName">
          <h4>已选择文件：{{ fileName }}</h4>
        </div>
        <ul class="data">
          <li>
            <span>第一维度列：</span>
            <el-select v-model="firstParm" placeholder="选择维度" style="width: 50%;;position: relative;margin-top: 5px;">
              <el-option v-for="(name, index) in columnNames" :key="index" :value="index" :label="name">
                {{ index }} ({{ name }})
              </el-option>
            </el-select>
          </li>
          <li>
            <span>第二维度列：</span>
            <el-select v-model="secondParm" placeholder="选择维度" style="width: 50%;;position: relative;margin-top: 5px;">
              <el-option v-for="(name, index) in columnNames" :key="index" :value="index" :label="name">
                {{ index }} ({{ name }})
              </el-option>
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
import * as echarts from "echarts";
import Papa from "papaparse"; // 用于解析 CSV 文件

export default {
  name: "NSLinear",
  data() {
    return {
      fileType: null, // 文件类型
      fileContent: [], // 文件内容
      columnNames: [], // 动态列名
      firstParm: null, // 默认第一维度列
      secondParm: null, // 默认第二维度列
      fileName: "", // 存储上传文件名
    };
  },
  methods: {
    // 处理文件选择和读取
    handleFileChange(file) {
      this.fileName = file.name;
      const extension = file.name.split(".").pop().toLowerCase(); // 获取文件扩展名
      this.fileType = extension;

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result; // 文件内容
        if (extension === "csv") {
          this.handleCsv(fileContent); // 处理 CSV 文件
        } else if (extension === "dat") {
          this.handleDat(fileContent); // 处理 DAT 文件
        } else {
          this.$message.error("不支持的文件格式，请上传 CSV 或 DAT 文件");
        }
      };
      reader.readAsText(file.raw); // 使用 el-upload 提供的 `file.raw` 读取文件内容
    },


    // 处理 CSV 文件
    handleCsv(content) {
      const parsedData = Papa.parse(content, { header: true });
      this.columnNames = Object.keys(parsedData.data[0]);
      this.fileContent = parsedData.data.map((row) =>
        this.columnNames.map((col) => parseFloat(row[col]))
      );
      this.firstParm = 0;
      this.secondParm = 1;
    },

    // 处理 DAT 文件
    handleDat(content) {
      const lines = content.split("\n").filter((line) => line.trim());
      const headers = [
        "Iteration",
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
        "Linear_Solver_Iterations",
        "CFL_Number",
        "Time(min)",
      ];
      const parsedData = lines.slice(2).map((line) =>
        line
          .trim()
          .split(/\s+/)
          .map((value) => parseFloat(value.replace(",", "")))
      );
      this.columnNames = headers;
      this.fileContent = parsedData;
      this.firstParm = 1; // 设置默认值，例如 CL
      this.secondParm = 2; // 设置默认值，例如 CD
    },

    // 提交数据并绘制图表
    submitData() {
      if(this.fileName === ''){
        this.$message.error('请先上传文件!');
        return;
      }

      if(this.firstParm === null || this.secondParm === null){
        this.$message.error('请先选择维度!');
        return;
      }


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
        xAxis: {
          type: "value",
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
            smooth: true,
            lineStyle: {
              width: 2,
              color: "#409eff",
            },
          },
        ],
        // 支持缩放和平移功能
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

<style src="../../css/styles/drawing-tool.css"></style>