<template>
  <div class="burgers-liner">
    <!-- 主容器 -->
    <div class="content">
      <!-- 左侧：图表展示 -->
      <div class="chart-container">
        <div id="chart" style="height: 100%;"></div>
      </div>

      <!-- 右侧：参数设置 -->
      <div class="parameters">
        <h3>参数设置</h3>
        <div class="file-choose">
          <input id="BLupload-input" type="file" accept=".txt" @change="handleFileChange" class="file-input" />
          <div class="f-button">选择数据文件</div>
        </div>
        <ul class="data">
          <li>
            <span>第一维度列：</span>
            <select v-model="firstParm">
              <option value="0">0(T)</option>
              <option value="1">1(X)</option>
              <option value="2">2(V)</option>
              <option value="3">3(U)</option>
            </select>
          </li>
          <li>
            <span>第二维度列：</span>
            <select v-model="secondParm">
              <option value="0">0(T)</option>
              <option value="1">1(X)</option>
              <option value="2">2(V)</option>
              <option value="3">3(U)</option>
            </select>
          </li>
          <li>
            <span>V值范围：</span>
            <!-- 修改这里，去掉了 marks 属性，这样就不会显示滑动条上的值 -->
            <el-slider
              v-model="selectedV"
              :min="0.2"
              :max="4.8"
              :step="0.2"
              show-tooltip
              @change="submitData"
            />
          </li>
        </ul>
        <button @click="submitData" class="confirm">提交</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { ElSlider } from 'element-plus';

export default {
  name: 'BurgersLiner',
  components: {
    ElSlider,
  },
  data() {
    return {
      firstParm: '0', // 默认选中的维度
      secondParm: '1', // 默认选中的维度
      fileContent: [], // 用于存储文件数据
      selectedV: 0.2, // 默认选中的 V 值
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
      const selectedV = this.selectedV;

      // 筛选数据：第三列为 selectedV 的数据
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

      // 检查并清理已经存在的 ECharts 实例
      const chartDom = document.getElementById('chart');
      if (echarts.getInstanceByDom(chartDom)) {
        echarts.dispose(chartDom); // 销毁已存在的实例
      }

      // 初始化新的 ECharts 图表
      const chart = echarts.init(chartDom);
      const option = {
        title: {
          text: `Burgers 方程: ${['T', 'X', 'V', 'U'][firstParm]} 与 ${['T', 'X', 'V', 'U'][secondParm]} 的关系`,
        },
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
          left: '40%',
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
