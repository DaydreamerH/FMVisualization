<template>
  <div class="burgers-liner">
    <!-- 主容器 -->
    <div class="content">
      <!-- 左侧：图表展示 -->
      <div class="chart-container">
        <div id="plotly-chart" style="height: 100%;"></div>
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
            <span>粘度系数 (V值)：</span>
            <el-slider v-model="selectedV" :min="0.2" :max="4.8" :step="0.2" show-tooltip @change="submitData" />
          </li>
        </ul>
        <button @click="submitData" class="confirm">提交</button>
      </div>
    </div>
  </div>
</template>

<script>
// 导入 Plotly.js
import Plotly from 'plotly.js-dist'; // 从 dist 版本导入
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

      // 提取 X 和 Y 值的唯一值
      const xValues = [...new Set(filteredData.map((row) => row[firstParm]))].sort(
        (a, b) => a - b
      );
      const yValues = [...new Set(filteredData.map((row) => row[secondParm]))].sort(
        (a, b) => a - b
      );

      // 创建 Z 值的网格
      const zGrid = yValues.map(() => new Array(xValues.length).fill(0));

      // 填充 Z 值
      filteredData.forEach((row) => {
        const xIndex = xValues.indexOf(row[firstParm]);
        const yIndex = yValues.indexOf(row[secondParm]);
        if (xIndex !== -1 && yIndex !== -1) {
          zGrid[yIndex][xIndex] = row[3]; // 假设 U 值存储在第四列
        }
      });

      // 配置 Plotly 绘图数据
      const contourData = {
        z: zGrid,
        x: xValues,
        y: yValues,
        type: "contour", // 等高线图
        colorscale: "Viridis", // 颜色渐变
        contours: {
          coloring: "fill", // 填充等高线区域
          showlines: true, // 显示等高线
        },
        colorbar: {
          title: "U 值",
        },
      };

      // 配置布局
      const layout = {
        title: `Burgers 方程: ${['T', 'X', 'V', 'U'][firstParm]} 与 ${['T', 'X', 'V', 'U'][secondParm]} 的关系`,
        xaxis: {
          title: ['T', 'X', 'V', 'U'][firstParm],
        },
        yaxis: {
          title: ['T', 'X', 'V', 'U'][secondParm],
        },
      };

      // 获取 Plotly 容器并绘制图表
      const chartDom = document.getElementById("plotly-chart");
      Plotly.newPlot(chartDom, [contourData], layout);
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
