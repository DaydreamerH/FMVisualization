<template>
  <div class="main-chart">
    <!-- 主容器 -->
    <div class="content">
      <!-- 左侧：图表展示 -->
      <div class="chart-container">
        <div class="chart-title">Burgers方程热力图</div>
        <div id="plotly-chart" style="height: 94%;top:3%;position: relative"></div>
      </div>

      <!-- 右侧：参数设置 -->
      <div class="parameters">
        <h3>参数设置</h3>
        <div class="file-choose">
          <el-upload class="upload-demo" drag accept=".txt" :on-change="handleFileChange" :show-file-list="false"
            :auto-upload="false">
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
            <el-slider v-model="selectedV" :min="0.2" :max="4.8" :step="0.2" show-tooltip @change="changeVOrLevels"
              style="left:7%;position: relative;margin-top: 5px;width: 60%;" />
          </li>
          <li>
            <span>等高线级数：</span>
            <el-slider v-model="contourLevels" :min="5" :max="50" :step="1" show-tooltip @change="changeVOrLevels"
              style="left:0.5%;position: relative;margin-top: 5px;width: 60%;" />
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
// 导入 Plotly.js
import Plotly from 'plotly.js-dist'; // 从 dist 版本导入
import { ElSlider } from 'element-plus';

export default {
  name: 'BurgersHeat',
  components: {
    ElSlider,
  },
  data() {
    return {
      firstParm: null, // 默认选中的维度
      secondParm: null, // 默认选中的维度
      fileContent: [], // 用于存储文件数据
      selectedV: 0.2, // 默认选中的 V 值
      contourLevels: 10, // 默认等高线级数（通过滑块控制）
      fileName: '', // 存储文件名
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
    changeVOrLevels() {
      if (this.fileName === '' || this.firstParm === null || this.secondParm === null) {
        return;
      }
      this.submitData();
    },
    // 提交数据并绘制图表
    submitData() {
      if (this.fileName === '') {
        this.$message.error('请先上传文件!');
        return;
      }

      if (this.firstParm === null || this.secondParm === null) {
        this.$message.error('请先选择维度!');
        return;
      }
      console.time('绘图时间')
      const firstParm = parseInt(this.firstParm);
      const secondParm = parseInt(this.secondParm);
      const selectedV = this.selectedV;
      const contourLevels = this.contourLevels; // 获取用户设置的等高线级数

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

      // 计算 Z 值的最小值和最大值
      const minZ = Math.min(...zGrid.flat());
      const maxZ = Math.max(...zGrid.flat());

      // 设置等高线的起始值、结束值和间隔
      const start = minZ; // 起始值，U值的最小值
      const end = maxZ; // 结束值，U值的最大值
      const size = (end - start) / contourLevels; // 每个等高线之间的间隔

      // 配置 Plotly 绘图数据
      const contourData = {
        z: zGrid,
        x: xValues,
        y: yValues,
        type: "contour", // 等高线图
        colorscale: "Jet", // 设置 Jet 颜色渐变
        contours: {
          coloring: "fill", // 填充等高线区域
          showlines: true, // 显示等高线
          autocontour: false, // 关闭自动等高线计算
          start: start, // 起始值
          end: end, // 结束值
          size: size, // 等高线间隔
          showlines: false, // 不显示等高线
        },
        colorbar: {
          title: "U 值",
        },
      };

      // 配置布局
      const layout = {
        xaxis: {
          title: ['T', 'X', 'V', 'U'][firstParm],
        },
        yaxis: {
          title: ['T', 'X', 'V', 'U'][secondParm],
        },
      };

      // 获取 Plotly 容器并绘制图表
      const chartDom = document.getElementById("plotly-chart");
      Plotly.react(chartDom, [contourData], layout); // 使用 react 确保图表刷新
      console.timeEnd('绘图时间')
    },
  },
};
</script>

<style src="../../css/styles/drawing-tool.css"></style>
