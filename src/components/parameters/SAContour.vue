<template>
  <div class="main-chart">
    <div class="content">
      <!-- 左侧：图表展示 -->
      <div class="chart-container" ref="threeContainer"></div>

      <!-- 右侧：参数设置 -->
      <div class="parameters">
        <h3>参数设置</h3>
        <div class="file-choose">
          <el-upload class="upload-demo" drag accept=".txt" :on-change="handleFileChange" :show-file-list="false"
            :auto-upload="false">
            <i class="el-icon-upload"></i>
            <div>选择数据文件</div>
          </el-upload>
        </div>

        <!-- 显示上传文件名 -->
        <div class="uploaded-content" v-if="fileName">
          <h4>已选择文件：{{ fileName }}</h4>
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

export default {
  setup() {
    const fileContent = ref([]);
    const fileName = ref('');
    const threeContainer = ref(null);
    const fileList = ref([]);

    let scene, camera, renderer, controls;

    const handleFileChange = (file) => {
      fileName.value = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        processFileContent(e.target.result);
      };
      reader.readAsText(file.raw);
    };

    const processFileContent = (content) => {
      const lines = content.split('\n').filter(line => line.trim() !== '');
      fileContent.value = lines.map(line => {
        const columns = line.split(',').map(col => col.trim());
        return {
          x: parseFloat(columns[1]),
          y: parseFloat(columns[2]),
          z: parseFloat(columns[3]),
        };
      });
      fileList.value.push(fileContent.value);
    };

    const renderMesh = () => {
      if (fileContent.value.length === 0) {
        alert("请先上传数据文件！");
        return;
      }

      // 清空旧的场景
      if (scene) {
        scene.clear();
      }

      const container = toRaw(threeContainer.value);
      container.innerHTML = '';

      // 初始化 Three.js 场景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);

      camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0.5, 0.5, 1.5);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // 生成机翼的三角网格，传入外部数据
      fileList.value.forEach(file => {
        const geometry = createMeshGeometry(file);
        const material = new THREE.MeshBasicMaterial({
          color: 0x0077ff,  // 固定颜色
          side: THREE.DoubleSide,  // 渲染两面
          wireframe: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      });

      animate();
    };

    const createMeshGeometry = (pointsData) => {
      // 使用x和z坐标进行Delaunay剖分
      const points = pointsData.map(p => [p.x, p.z]);
      const delaunay = Delaunay.from(points);
      const { triangles } = delaunay;

      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];

      // 填充顶点数据
      pointsData.forEach(p => {
        vertices.push(p.x, p.y, p.z);
      });

      // 调整顶点顺序为逆时针
      for (let i = 0; i < triangles.length; i += 3) {
        indices.push(
          triangles[i],
          triangles[i + 2], // 交换顺序
          triangles[i + 1]
        );
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      geometry.normalizeNormals(); // 规范化法线

      return geometry;
    };


    const animate = () => {
      requestAnimationFrame(animate);
      if (controls) controls.update();
      if (renderer && scene && camera) renderer.render(scene, camera);
    };

    return { threeContainer, fileName, handleFileChange, renderMesh };
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
</style>
