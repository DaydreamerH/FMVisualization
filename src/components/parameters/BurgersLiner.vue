<template>
    <div class="burgers-liner">
      <!-- File upload section -->
      <div class="file-choose">
        <input
          id="BLupload-input"
          type="file"
          accept=".txt"
          @change="handleFileChange"
          class="file-input"
        />
        <div class="f-button">选择数据文件</div>
      </div>
  
      <!-- Parameters selection -->
      <ul class="data">
        <li class="first">
          <span>第一维度列：</span>
          <select v-model="firstParm">
            <option value="0">0(T)</option>
            <option value="1">1(X)</option>
            <option value="2">2(V)</option>
            <option value="3">3(U)</option>
          </select>
        </li>
        <li class="second">
          <span>第二维度列：</span>
          <select v-model="secondParm">
            <option value="0">0(T)</option>
            <option value="1">1(X)</option>
            <option value="2">2(V)</option>
            <option value="3">3(U)</option>
          </select>
        </li>
      </ul>
  
      <button @click="submitData" class="confirm">提交</button>
  
      <!-- Chart container -->
      <div id="chart" style="height: 500px; margin-top: 20px;"></div>
    </div>
  </template>
  
  <script>
  import * as echarts from 'echarts';
  
  export default {
    name: 'BurgersLiner',
    data() {
      return {
        firstParm: '0', // 默认选中的维度
        secondParm: '1', // 默认选中的维度
        fileContent: [], // 用于存储文件数据
      };
    },
    methods: {
      // 处理文件选择和读取
      handleFileChange(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const lines = e.target.result.split('\n');
          this.fileContent = lines.map((line) => line.trim().split(/\s+/));
        };
        reader.readAsText(file);
      },
  
      // 提交数据并绘制图表
      submitData() {
        const firstParm = parseInt(this.firstParm);
        const secondParm = parseInt(this.secondParm);
  
        // 筛选数据：第三列为 0.2 的数据
        const filteredData = this.fileContent.filter(
          (row) => parseFloat(row[2]) === 0.2
        );
  
        const seriesData = [];
        const timeIntervals = Math.floor(filteredData.length / 24);
  
        for (let i = 0; i < timeIntervals; i++) {
          const xData = [];
          const yData = [];
          for (let j = i * 24; j < (i + 1) * 24; j++) {
            const row = filteredData[j];
            xData.push(row[firstParm]); // 横轴
            yData.push(row[secondParm]); // 纵轴
          }
          seriesData.push({
            name: `t=${(i + 1) * 0.2}`,
            type: 'line',
            data: yData,
            symbol: 'circle',
            label: {
              show: false,
            },
          });
        }
  
        // 初始化 ECharts 图表
        const chart = echarts.init(document.getElementById('chart'));
        const option = {
          title: {
            text: `Burgers 方程: ${['T', 'X', 'V', 'U'][firstParm]} 与 ${
              ['T', 'X', 'V', 'U'][secondParm]
            } 的关系`,
          },
          tooltip: {
            trigger: 'axis',
          },
          legend: {
            data: seriesData.map((item) => item.name),
          },
          xAxis: {
            type: 'category',
            data: filteredData.slice(0, 24).map((row) => row[0]), // 取前24个点
            name: ['T', 'X', 'V', 'U'][firstParm],
          },
          yAxis: {
            type: 'value',
            name: ['T', 'X', 'V', 'U'][secondParm],
          },
          series: seriesData,
        };
  
        chart.setOption(option);
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
    max-width: 500px;
    margin: 0 auto;
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
  
  .confirm {
    background-color: #409eff;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    font-size: 16px;
  }
  </style>
  