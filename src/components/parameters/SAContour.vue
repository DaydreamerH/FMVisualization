<template>
  <div class="main-chart">
    <div class="content">
      <!-- 左侧：图表展示 -->
      <div class="chart-container" ref="threeContainer"></div>

      <!-- 右侧：参数设置 -->
      <div class="parameters">
        <h3>参数设置</h3>
        <div class="file-choose">
          <el-upload class="upload-demo" drag accept=".txt" :on-change="handleFileChange" :auto-upload="false"
            :show-file-list="false">
            <i class="el-icon-upload"></i>
            <div>选择数据文件</div>
          </el-upload>
        </div>

        <!-- 显示已上传的文件列表 -->
        <div class="uploaded-content" v-if="fileList.length">
          <h4>已上传文件：</h4>
          <ul>
            <li v-for="(file, index) in fileList" :key="index">
              {{ file.name }}
              <el-button type="danger" size="small" @click="removeFile(index)">删除</el-button>
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
    const fileList = ref([]); // 存储上传的文件列表
    const threeContainer = ref(null);

    let scene, camera, renderer, controls;

    // 处理文件上传
    const handleFileChange = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = processFileContent(e.target.result);
        fileList.value.push({ name: file.name, data: content });
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

    // 移除已上传的文件
    const removeFile = (index) => {
      fileList.value.splice(index, 1);
    };

    // 渲染 3D 机翼
    const renderMesh = () => {
      if (fileList.value.length === 0) {
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

      let globalMaxPressure = -Infinity;
      let globalMinPressure = Infinity;

      fileList.value.forEach(file => {
        const validPressures = file.data.filter(p => !isNaN(p.pressure));
        const maxPressureInFile = Math.max(...validPressures.map(p => p.pressure));
        const minPressureInFile = Math.min(...validPressures.map(p => p.pressure));

        globalMaxPressure = Math.max(globalMaxPressure, maxPressureInFile);
        globalMinPressure = Math.min(globalMinPressure, minPressureInFile);
      });

      //fileList.value.forEach(file => {
      // const geometry = createMeshGeometry(file.data, globalMinPressure, globalMaxPressure);
      // const material = new THREE.MeshBasicMaterial({
      //  vertexColors: true,
      //  side: THREE.DoubleSide,
      //  wireframe: false
      //});
      //const mesh = new THREE.Mesh(geometry, material);
      //scene.add(mesh);
      //});

      fileList.value.forEach(file => {
        const lineGeometry = createLineGeometry(file.data, globalMinPressure, globalMaxPressure);
        const material = new THREE.LineBasicMaterial({ vertexColors: true });
        const line = new THREE.LineLoop(lineGeometry, material);
        scene.add(line);
      });

      animate();
    };


    const createLineGeometry = (pointsData, globalMinPressure, globalMaxPressure) => {
      // 如果没有数据或只有一个点，则直接返回空或单点几何
      if (pointsData.length === 0) return new THREE.BufferGeometry();
      if (pointsData.length === 1) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(
          [pointsData[0].x, pointsData[0].y, pointsData[0].z], 3));
        return geometry;
      }

      // 由于所有点都在同一平面上（例如 xy 平面），
      // 计算所有点的重心（centroid）
      let sumX = 0, sumY = 0;
      pointsData.forEach(pt => {
        sumX += pt.x;
        sumY += pt.y;
      });
      const centerX = sumX / pointsData.length;
      const centerY = sumY / pointsData.length;

      // 对点按照其在 xy 平面上的极角进行排序
      // 注意这里使用 Math.atan2(pt.y - centerY, pt.x - centerX)
      const sortedPoints = [...pointsData].sort((a, b) => {
        const angleA = Math.atan2(a.y - centerY, a.x - centerX);
        const angleB = Math.atan2(b.y - centerY, b.x - centerX);
        return angleA - angleB;
      });

      // 构造闭合环的顶点数组：依次加入排序后的所有点，再加入第一个点以闭合
      const vertices = [];
      const colors = [];
      sortedPoints.forEach(pt => {
        vertices.push(pt.x, pt.y, pt.z);
        const color = pressureToColor(pt.pressure, globalMinPressure, globalMaxPressure);
        colors.push(color.r, color.g, color.b);
      });
      // 添加第一个点（闭合环）
      const firstPt = sortedPoints[0];
      vertices.push(firstPt.x, firstPt.y, firstPt.z);
      const firstColor = pressureToColor(firstPt.pressure, globalMinPressure, globalMaxPressure);
      colors.push(firstColor.r, firstColor.g, firstColor.b);

      // 创建 BufferGeometry 并设置属性
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      return geometry;
    };

    // 生成机翼网格
    const createMeshGeometry = (pointsData, globalMinPressure, globalMaxPressure) => {
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

    // 颜色映射
    const pressureToColor = (pressure, globalMinPressure, globalMaxPressure) => {
      const t = Math.max(0, Math.min(1, (pressure - globalMinPressure) / (globalMaxPressure - globalMinPressure)));
      const reversedT = 1 - t;
      const jetColor = d3.scaleSequential(d3.interpolateSpectral).domain([0, 1]);
      return new THREE.Color(jetColor(reversedT));
    };

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      if (controls) controls.update();
      if (renderer && scene && camera) renderer.render(scene, camera);
    };

    return { threeContainer, fileList, handleFileChange, removeFile, renderMesh };
  }
};
</script>

<style scoped>
.main-chart {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  display: flex;
  height: 100%;
}

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
