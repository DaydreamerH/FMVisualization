<template>
  <div class="main-chart">
    <div class="content">
      <!-- 左侧：图表展示 -->
      <div class="chart-container" ref="threeContainer"></div>

      <!-- 右侧：参数设置 -->
      <div class="parameters">
        <h3>参数设置</h3>
        <!-- 上传用于构建面的数据文件 -->
        <div class="file-choose">
          <h4>构建面文件上传</h4>
          <el-upload class="upload-demo" drag accept=".txt" :on-change="handleMeshFileChange" :auto-upload="false"
            :show-file-list="false">
            <i class="el-icon-upload"></i>
            <div>选择构建面数据文件</div>
          </el-upload>
        </div>

        <!-- 显示已上传的构建面文件列表 -->
        <div class="uploaded-content" v-if="meshFileList.length">
          <h4>已上传构建面文件：</h4>
          <ul>
            <li v-for="(file, index) in meshFileList" :key="index">
              {{ file.name }}
              <el-button type="danger" size="small" @click="removeMeshFile(index)">删除</el-button>
            </li>
          </ul>
        </div>

        <!-- 上传用于构建环的数据文件 -->
        <div class="file-choose">
          <h4>构建环文件上传</h4>
          <el-upload class="upload-demo" drag accept=".txt" :on-change="handleLineFileChange" :auto-upload="false"
            :show-file-list="false">
            <i class="el-icon-upload"></i>
            <div>选择构建环数据文件</div>
          </el-upload>
        </div>

        <!-- 显示已上传的构建环文件列表 -->
        <div class="uploaded-content" v-if="lineFileList.length">
          <h4>已上传构建环文件：</h4>
          <ul>
            <li v-for="(file, index) in lineFileList" :key="index">
              {{ file.name }}
              <el-button type="danger" size="small" @click="removeLineFile(index)">删除</el-button>
            </li>
          </ul>
        </div>

        <div class="button-container">
          <el-button type="primary" @click="renderMesh" class="confirm">绘制机翼</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, toRaw } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Delaunay } from 'd3-delaunay';
import * as d3 from 'd3';

export default {
  setup() {
    // 两类文件列表：用于构建面和用于构建环
    const meshFileList = ref([]); // 构建面文件
    const lineFileList = ref([]); // 构建环文件
    const threeContainer = ref(null);

    let scene, camera, renderer, controls;

    const jetScale = d3.scaleLinear()
      .domain([0, 0.125, 0.375, 0.625, 0.875, 1]) // 数据的范围
      .range(['rgb(0,0,131)', 'rgb(0,60,170)', 'rgb(5,255,255)', 'rgb(255,255,0)', 'rgb(250,0,0)', 'rgb(128,0,0)']);


    // 处理上传文件（构建面文件）
    const handleMeshFileChange = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = processFileContent(e.target.result);
        meshFileList.value.push({ name: file.name, data: content });
      };
      reader.readAsText(file.raw);
    };

    // 处理上传文件（构建环文件）
    const handleLineFileChange = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = processFileContent(e.target.result);
        lineFileList.value.push({ name: file.name, data: content });
      };
      reader.readAsText(file.raw);
    };

    // 解析文件内容
    const processFileContent = (content) => {
      const lines = content.split('\n').filter(line => line.trim() !== '');
      return lines.map(line => {
        const columns = line.split(',').map(col => col.trim());
        return {
          x: parseFloat(columns[1]),
          y: parseFloat(columns[2]),
          z: parseFloat(columns[3]),
          pressure: parseFloat(columns[4])
        };
      });
    };

    // 删除构建面文件
    const removeMeshFile = (index) => {
      meshFileList.value.splice(index, 1);
    };

    // 删除构建环文件
    const removeLineFile = (index) => {
      lineFileList.value.splice(index, 1);
    };

    // 渲染 3D 机翼：分别处理构建面和构建环的文件
    const renderMesh = () => {
      if (meshFileList.value.length === 0 && lineFileList.value.length === 0) {
        alert("请先上传数据文件！");
        return;
      }

      if (scene) {
        scene.clear();
      }

      const container = toRaw(threeContainer.value);
      container.innerHTML = '';

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);

      camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0.5, 0.5, 1.5);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // 计算全局 pressure 范围（两个文件列表合并）
      let globalMaxPressure = -Infinity;
      let globalMinPressure = Infinity;

      // 遍历构建面文件
      meshFileList.value.forEach(file => {
        const validPressures = file.data.filter(p => !isNaN(p.pressure));
        const maxPressureInFile = Math.max(...validPressures.map(p => p.pressure));
        const minPressureInFile = Math.min(...validPressures.map(p => p.pressure));
        globalMaxPressure = Math.max(globalMaxPressure, maxPressureInFile);
        globalMinPressure = Math.min(globalMinPressure, minPressureInFile);
      });
      // 遍历构建环文件
      lineFileList.value.forEach(file => {
        const validPressures = file.data.filter(p => !isNaN(p.pressure));
        const maxPressureInFile = Math.max(...validPressures.map(p => p.pressure));
        const minPressureInFile = Math.min(...validPressures.map(p => p.pressure));
        globalMaxPressure = Math.max(globalMaxPressure, maxPressureInFile);
        globalMinPressure = Math.min(globalMinPressure, minPressureInFile);
      });

      // 对构建面文件，生成网格
      meshFileList.value.forEach(file => {
        const geometry = createMeshGeometry(file.data, globalMinPressure, globalMaxPressure);
        const material = new THREE.MeshStandardMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
          wireframe: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      });

      // 对构建环文件，生成线条闭合环
      lineFileList.value.forEach(file => {
        const geometry = createLineGeometry(file.data, globalMinPressure, globalMaxPressure);
        const material = new THREE.LineBasicMaterial({ vertexColors: true });
        const line = new THREE.LineLoop(geometry, material);
        scene.add(line);
      });

      // 环境光：为整个场景提供均匀光照，消除阴影过深的区域
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(ambientLight);

      // 添加坐标轴
      const axesHelper = new THREE.AxesHelper(10); // 坐标轴大小
      axesHelper.material.linewidth = 2; // 设置线条宽度为 2，适合可视化
      axesHelper.setColors(new THREE.Color(0x808080), new THREE.Color(0x808080), new THREE.Color(0x808080)); // 将坐标轴颜色设置为灰色
      scene.add(axesHelper);

      // 调用 createLegend 获取 HUD 图例相关对象
      const { hudScene, hudCamera } = createLegend(globalMaxPressure, globalMinPressure);

      // 修改渲染器设置（关闭自动清除）
      renderer.autoClear = false;

      // 渲染循环：先渲染主场景，再渲染 HUD 层
      function animate() {
        requestAnimationFrame(animate);
        controls.update();


        renderer.clear();
        renderer.render(scene, camera);

        renderer.clearDepth();
        renderer.render(hudScene, hudCamera);
      }

      animate();
    };

    // 用极角排序构造闭合环：假设所有点在同一平面上（例如 xy 平面）
    const createLineGeometry = (pointsData, globalMinPressure, globalMaxPressure) => {
      if (pointsData.length === 0) return new THREE.BufferGeometry();
      if (pointsData.length === 1) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(
          [pointsData[0].x, pointsData[0].y, pointsData[0].z], 3));
        return geometry;
      }

      // 计算所有点在 xy 平面的重心
      let sumX = 0, sumY = 0;
      pointsData.forEach(pt => {
        sumX += pt.x;
        sumY += pt.y;
      });
      const centerX = sumX / pointsData.length;
      const centerY = sumY / pointsData.length;

      // 按极角排序
      const sortedPoints = [...pointsData].sort((a, b) => {
        const angleA = Math.atan2(a.y - centerY, a.x - centerX);
        const angleB = Math.atan2(b.y - centerY, b.x - centerX);
        return angleA - angleB;
      });

      const vertices = [];
      const colors = [];
      sortedPoints.forEach(pt => {
        vertices.push(pt.x, pt.y, pt.z);
        const color = pressureToColor(pt.pressure, globalMinPressure, globalMaxPressure);
        colors.push(color.r, color.g, color.b);
      });
      // 加入首点以闭合环路
      const firstPt = sortedPoints[0];
      vertices.push(firstPt.x, firstPt.y, firstPt.z);
      const firstColor = pressureToColor(firstPt.pressure, globalMinPressure, globalMaxPressure);
      colors.push(firstColor.r, firstColor.g, firstColor.b);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      return geometry;
    };

    // 生成机翼网格，利用 d3-delaunay 构造面
    const createMeshGeometry = (pointsData, globalMinPressure, globalMaxPressure) => {
      // 这里采用 x 与 z 作为二维投影（假设所有点在同一水平面上）
      const points = pointsData.map(p => [p.x, p.z]);
      const delaunay = Delaunay.from(points);
      const { triangles } = delaunay;

      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const colors = [];
      const indices = [];

      pointsData.forEach(p => {
        vertices.push(p.x, p.y, p.z);
        const color = pressureToColor(p.pressure, globalMinPressure, globalMaxPressure);
        colors.push(color.r, color.g, color.b);
      });

      for (let i = 0; i < triangles.length; i += 3) {
        indices.push(triangles[i], triangles[i + 1], triangles[i + 2]);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      geometry.normalizeNormals();

      return geometry;
    };

    // 颜色映射函数
    const pressureToColor = (pressure, globalMinPressure, globalMaxPressure) => {
      const t = Math.max(0, Math.min(1, (pressure - globalMinPressure) / (globalMaxPressure - globalMinPressure)));

      return new THREE.Color(jetScale(t));
    };

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      if (controls) controls.update();
      if (renderer && scene && camera) renderer.render(scene, camera);
    };

    const createLegend = (globalMaxPressure, globalMinPressure) => {
      // 创建 HUD 场景
      const hudScene = new THREE.Scene();

      // 创建正交摄像头，坐标范围基于 window 尺寸（单位：像素）
      const hudCamera = new THREE.OrthographicCamera(
        window.innerWidth / -2,  // left
        window.innerWidth / 2,   // right
        window.innerHeight / 2,  // top
        window.innerHeight / -2, // bottom
        0,                       // near
        30                       // far
      );
      hudCamera.position.z = 10; // 确保摄像头在 HUD 对象前面

      // 定义尺寸：整个容器、文本区域与渐变区域
      const containerWidth = 300;      // 容器宽度
      const containerHeight = 600;     // 容器高度
      const textBoxHeight = 50;        // 文本区域高度
      const gradientWidth = 60;        // 渐变区域宽度
      const gradientHeight = 400;      // 渐变区域高度
      const tickLength = 10;           // 刻度线长度
      const numTicks = 11;             // 刻度数量

      // 创建一个 Canvas，尺寸为整个容器的大小
      const legendCanvas = document.createElement('canvas');
      legendCanvas.width = containerWidth;
      legendCanvas.height = containerHeight;
      const ctx = legendCanvas.getContext('2d');

      // 清空画布（透明背景）
      ctx.fillStyle = 'rgba(255,255,255,0)';
      ctx.fillRect(0, 0, containerWidth, containerHeight);

      // 绘制文本：文本区域在顶部，占据整个容器宽度和 textBoxHeight 高度
      const text = "Static Pressure [Pa]";
      ctx.font = "20px sans-serif";
      ctx.fillStyle = "black";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      // 文本从左侧开始显示
      ctx.fillText(text, 0, textBoxHeight / 2);

      // 定义渐变区域的位置：位于文本区域下方，左侧对齐
      const gradientX = 0;
      const gradientY = textBoxHeight; // 从文本区域下方开始

      // 绘制渐变：沿竖直方向逐行绘制颜色
      for (let y = 0; y < gradientHeight; y++) {
        const t = y / (gradientHeight - 1); // t 从 0 到 1
        const value = 1 - t; // 翻转，使得上部对应 1（红色），下部对应 0（蓝色）
        const color = jetScale(value);
        ctx.fillStyle = color;
        ctx.fillRect(gradientX, gradientY + y, gradientWidth, 1);
      }

      // 绘制渐变区域边框
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(gradientX, gradientY, gradientWidth, gradientHeight);

      // 绘制刻度线和标签
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = "18px sans-serif";

      for (let i = 0; i < numTicks; i++) {
        const y = gradientY + (i * gradientHeight) / (numTicks - 1);
        // 绘制刻度线
        ctx.beginPath();
        ctx.moveTo(gradientX + gradientWidth, y);
        ctx.lineTo(gradientX + gradientWidth + tickLength, y);
        ctx.stroke();
        // 计算并绘制标签
        const pressureValue = globalMaxPressure - (i * (globalMaxPressure - globalMinPressure) / (numTicks - 1));
        const label = pressureValue.toExponential(2); 
        ctx.fillText(label, gradientX + gradientWidth + tickLength + 5, y);
      }

      // 利用 Canvas 创建纹理
      const legendTexture = new THREE.CanvasTexture(legendCanvas);

      // 创建与 Canvas 尺寸对应的平面几何体
      const legendGeometry = new THREE.PlaneGeometry(containerWidth, containerHeight);
      const legendMaterial = new THREE.MeshBasicMaterial({
        map: legendTexture,
        transparent: true
      });
      const legendMesh = new THREE.Mesh(legendGeometry, legendMaterial);

      // 将图例定位在屏幕左上角，设置一定边距（例如 margin = 10）
      const margin = 10;
      legendMesh.position.x = -window.innerWidth / 2 + margin + containerWidth / 2;
      legendMesh.position.y = window.innerHeight / 2 - containerHeight / 2 - margin;

      // 将图例加入 HUD 场景
      hudScene.add(legendMesh);

      // 返回 HUD 场景和正交摄像头，便于在渲染循环中使用
      return { hudScene, hudCamera, legendMesh };
    };



    return { threeContainer, meshFileList, lineFileList, handleMeshFileChange, handleLineFileChange, removeMeshFile, removeLineFile, renderMesh };
  }
};
</script>

<style scoped>
.chart-container {
  flex: 2;
  background: #eee;
  position: relative;
}

.parameters {
  flex: 1;
  padding: 20px;
  background: #fff;
  border-left: 1px solid #ddd;
}

.uploaded-content ul {
  list-style: none;
  padding: 0;
}

.uploaded-content li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  padding: 5px;
  background: #f5f5f5;
  border-radius: 5px;
}
</style>
<style src="../../css/styles/drawing-tool.css"></style>
