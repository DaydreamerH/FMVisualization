<template>
  <div class="burgers-liner">
    <!-- 主容器 -->
    <div class="content">
      <!-- 左侧：图表展示 -->
      <div class="chart-container">
        <div class="chart-title">Burgers方程折线图</div>
        <div id="chart" style="height: 100%;"></div>
      </div>

      <!-- 右侧：参数设置 -->
      <div class="parameters">
        <h3>参数设置</h3>
        <div class="file-choose">
          <el-upload
            class="upload-demo"
            drag
            accept=".txt"
            :on-change="handleFileChange"
            :show-file-list="false"
            :auto-upload="false"
          >
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
            <el-select v-model="firstParm" placeholder="选择维度" style="width: 50%;;position: relative;margin-top: 5px;">
              <el-option label="T" value="0"></el-option>
              <el-option label="X" value="1"></el-option>
              <el-option label="V" value="2"></el-option>
              <el-option label="U" value="3"></el-option>
            </el-select>
          </li>
          <li>
            <span>第二维度列：</span>
            <el-select v-model="secondParm" placeholder="选择维度" style="width: 50%;position: relative;margin-top: 5px;">
              <el-option label="T" value="0"></el-option>
              <el-option label="X" value="1"></el-option>
              <el-option label="V" value="2"></el-option>
              <el-option label="U" value="3"></el-option>
            </el-select>
          </li>
          <li>
            <span>V值范围：</span>
            <el-slider v-model="selectedV" :min="0.2" :max="4.8" :step="0.2" show-tooltip @change="changeV" style="left:10%;position: relative;margin-top: 5px;width: 60%;" />
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
import { ElSlider, ElSelect, ElOption, ElButton, ElUpload } from 'element-plus';

export default {
  name: 'BurgersLiner',
  components: {
    ElSlider,
    ElSelect,
    ElOption,
    ElButton,
    ElUpload,
  },
  data() {
    return {
      firstParm: null, // 默认选中的维度
      secondParm: null, // 默认选中的维度
      fileContent: [], // 用于存储文件数据
      selectedV: 0.2, // 默认选中的 V 值
      fileName: '', // 存储上传文件名
    };
  },
  methods: {
    // 处理文件选择和读取
    handleFileChange(file) {
      this.fileName = file.name; // 存储文件名
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result.split('\n');
        this.fileContent = lines.map((line) => line.trim().split(/\s+/));
      };
      reader.readAsText(file.raw);
    },

    changeV(){
      if(this.fileName === ''||this.firstParm === null || this.secondParm === null){
        return;
      }
      this.submitData();
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
      const selectedV = this.selectedV;

      const filteredData = this.fileContent.filter(
        (row) => parseFloat(row[2]) === selectedV
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
          name: `t=${((i + 1) * 0.2).toFixed(2)}`,
          type: 'line',
          data: yData,
          symbol: 'circle',
          label: {
            show: false,
          },
        });
      }

      const chartDom = document.getElementById('chart');
      if (echarts.getInstanceByDom(chartDom)) {
        echarts.dispose(chartDom); // 销毁已存在的实例
      }

      const chart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const time = ((params[0].dataIndex + 1) * 0.2).toFixed(2);
            const value = params[0].value;
            return `t=${time}<br/>${['T', 'X', 'V', 'U'][firstParm]}: ${value}`;
          },
        },
        legend: {
          data: seriesData.map((item) => item.name),
          top: '15%',
          left: '50%',
          formatter: (name) => {
            const time = parseFloat(name.replace('t=', ''));
            return `t=${time.toFixed(2)}`;
          },
        },
        xAxis: {
          type: 'category',
          data: filteredData.slice(0, 24).map((row) => row[firstParm]),
          name: ['T', 'X', 'V', 'U'][firstParm],
        },
        yAxis: {
          type: 'value',
          name: ['T', 'X', 'V', 'U'][secondParm],
        },
        series: seriesData,

        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: 100,
            zoomLock: false,
          },
          {
            show: true,
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
  width: 100%;
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
  padding-top: 0px;
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
  height: auto;
}

.upload-demo {
  cursor: pointer;
}

.uploaded-content {
  margin: 20px 0;
}

.data {
  list-style: none;
  padding: 0;
}

.data li {
  margin-bottom: 15px; 
  width: 100%;
  display: flex;
  align-items: center;
  font-weight: bold;
}

.button-container {
  display: flex;
  justify-content: center; 
  margin-top: 20px; 
}

.confirm {
  width: 50%;
}
</style>