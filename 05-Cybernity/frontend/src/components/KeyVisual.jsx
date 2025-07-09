/*
  文件注释：KeyVisual.jsx (核心3D视觉组件)

  目标：
  渲染 Cybernity 项目的核心视觉概念——"意识火花"。
  该组件是所有3D元素的家园，包括星空、粒子、光效等。

  核心思路：
  1.  **`@react-three/fiber` (R3F)**: 我们使用 R3F 来在 React 中声明式地构建 Three.js 场景。
      -   `<Canvas>`: 这是 R3F 的核心，它创建了一个 WebGL 渲染上下文 (<canvas> HTML 元素)，并管理着渲染循环。所有3D对象都必须是它的子孙节点。
      -   **声明式语法**: 你会发现我们用类似写 HTML 的方式 (<mesh>, <ambientLight>) 来创建3D对象，而不是 Three.js 的命令式代码 (new THREE.Mesh())。这让场景结构更清晰、更易于管理。

  2.  **自定义星空 (`CustomStars`)**: 为了满足"星空旋转"和"星星大小/亮度各异"的需求，我们放弃了 Drei 的 `<Stars>` 组件，转而手动创建一个更可控的粒子系统。这是实现高级自定义效果的常用方法。

  3.  **场景基础**:
      -   **相机 (Camera)**: `<Canvas>` 会自动创建一个默认的透视相机。我们可以通过 `camera` prop 来设置它的初始位置和其它属性。`position={[0, 0, 1]}` 表示相机位于Z轴正方向1个单位处，距离中心更近，以便更好地观察即将加入的人形轮廓。
      -   **光照 (Lighting)**: 3D世界中，没有光就一片漆黑。`<ambientLight>` (环境光) 会均匀地照亮场景中的所有物体，确保它们不是完全的剪影。`intensity={0.5}` 设置了光照强度。

  当前阶段：
  我们实现了一个自定义的、旋转的、细节丰富的星空。
*/

// 从react中导入所需钩子: useRef用于创建引用, useMemo用于性能优化, Suspense用于异步加载
import React, { useRef, useMemo, Suspense } from 'react';
// 从@react-three/fiber中导入核心组件Canvas和useFrame钩子
import { Canvas, useFrame } from '@react-three/fiber';
// 从three库中导入BufferGeometry和BufferAttribute，用于手动创建几何体
import * as THREE from 'three';
import Silhouette from './Silhouette';

/**
 * @description 自定义星空组件 (v2 - 精修版)
 * 该组件生成一个由5000个粒子组成的球状星空，并使其缓慢旋转。
 * 每个星星都是圆形的、大小和亮度（通过颜色）都随机，以创造更自然、更丰富的视觉效果。
 * 
 * v2版改进点:
 * 1.  **圆形星星**: 使用带有径向渐变的CanvasTexture作为粒子贴图，取代了默认的方形点。
 * 2.  **调整速度**: 降低了旋转速度，感觉更宏大、静谧。
 * 3.  **调整大小**: 减小了星星的整体尺寸，看起来更精致、遥远。
 * 4.  **调整距离**: 增大了星空球体的半径，让天幕感觉离用户更远。
 * 
 * v3版改进点:
 * 1. **中空球体分布**: 星星不再挤在中心，而是分布在一个中空的球体内，为中心区域留出空间。
 * 2. **多彩星光**: 引入了色盘，星星的颜色有了微妙的变化。
 * 
 * v4版改进点:
 * 1. **星座连线**: 随机在邻近的星星之间创建优雅的连线，形成星座。
 * 2. **性能优化**: 使用了排序算法来加速邻近星星的查找，确保动画流畅。
 */
function CustomStars() {
  const ref = useRef();

  // useFrame钩子，在每一帧执行，用于动画。
  useFrame((state, delta) => {
    // 复合旋转：同时在Y轴和X轴上进行非常缓慢的旋转
    // 这可以确保星空的任何一个点（包括旋转的"极点"）都在缓慢移动，避免了任何星星看起来是完全静止的。
    ref.current.rotation.y += delta * 0.01;
    ref.current.rotation.x += delta * 0.005;
  });

  // 使用useMemo来缓存星星的几何体和圆形纹理，确保它们只被计算和创建一次，以优化性能。
  const [geometry, lineGeometry, texture] = useMemo(() => {
    // --- 创建圆形纹理 ---
    // 1. 创建一个临时的canvas元素
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const size = 32; // 纹理尺寸
    canvas.width = size;
    canvas.height = size;
    // 2. 绘制一个径向渐变来模拟柔和的光点
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');    // 中心是纯白色
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)'); // 向外逐渐变淡
    gradient.addColorStop(1, 'rgba(255,255,255,0)');    // 边缘是完全透明的
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    // 3. 从canvas创建Three.js纹理对象
    const tex = new THREE.CanvasTexture(canvas);

    // --- 创建星星几何体 ---
    // 再次增加星星数量以提高密度，达到更饱满的视觉效果
    const count = 12000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // 定义一个星光色盘，用于生成多彩的星星
    const starColors = [
      new THREE.Color('#FFFFFF'), // 意识白
      new THREE.Color('#FFD700'), // 智慧金
      new THREE.Color('#add8e6'), // 淡蓝色
      new THREE.Color('#ffac81'), // 淡橙色
      new THREE.Color('#ff7c7c'), // 新增：淡红色
      new THREE.Color('#D8B4FE'), // 新增：星云紫
    ];

    for (let i = 0; i < count; i++) {
      // --- v3版核心改动：中空球体分布 ---
      // 为了避免星星离镜头中心过近，我们将其分布在一个中空的球体内部。
      // 1. 定义球壳的内外半径
      const rMin = 5;  // 最小半径，创建了一个"安全区"
      const rMax = 150; // 最大半径，保持用户调整后的大小
      // 2. 使用正确的数学公式在球壳体积内均匀生成一个随机半径
      //    这可以确保星星在三维空间中是均匀分布的，而不是聚集在外壳
      const r = Math.cbrt(Math.random() * (rMax ** 3 - rMin ** 3) + rMin ** 3);
      // 3. 使用三角函数将球坐标（半径r, 角度phi, a角度theta）转换为笛卡尔坐标(x,y,z)
      const phi = Math.random() * 2 * Math.PI; // 方位角
      const theta = Math.acos(2 * Math.random() - 1); // 极角
      
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 1. 从色盘中随机选择一个基础颜色
      const baseColor = starColors[Math.floor(Math.random() * starColors.length)];
      // 2. 创建一个最终颜色，并通过一个更高的随机亮度因子来增强亮度，使其更加璀璨
      const finalColor = baseColor.clone().multiplyScalar(Math.random() * 1.2 + 1.5);
      finalColor.toArray(colors, i * 3);

      // 调整星星的随机尺寸范围
      sizes[i] = Math.random() * 0.8 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // --- v9: 最终平衡版星座算法 ---
    const linePoints = [];
    const connectionDistance = 10;
    const maxConnectionsPerNode = 3;
    const initialNodeProbability = 0.07; // 提升初始节点概率以增加密度
    const propagationProbability = 0.30; // 略微提升传播几率以帮助星座成长
    const minAngle = Math.PI / 6; 
    const minConstellationSize = 5;

    const points3D = [];
    for (let i = 0; i < count; i++) {
        points3D.push({
            id: i,
            vec: new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]),
            connections: 0,
            isNode: false,
            connectionVectors: [],
        });
    }
    points3D.sort((a, b) => a.vec.x - b.vec.x);

    points3D.forEach(p => {
        if (Math.random() < initialNodeProbability) p.isNode = true;
    });

    // 步骤1: 找出所有可能的有效连接
    const validConnections = [];
    for (let i = 0; i < count; i++) {
        const pointA = points3D[i];
        if (!pointA.isNode || pointA.connections >= maxConnectionsPerNode) continue;

        for (let j = i + 1; j < count; j++) {
            const pointB = points3D[j];
            if (pointB.vec.x - pointA.vec.x > connectionDistance) break;
            if (pointB.connections >= maxConnectionsPerNode) continue;
            
            const dist = pointA.vec.distanceTo(pointB.vec);
            if (dist < connectionDistance) {
                const newVecA = new THREE.Vector3().subVectors(pointB.vec, pointA.vec).normalize();
                let angleOk = true;
                for (const existingVec of pointA.connectionVectors) if (existingVec.angleTo(newVecA) < minAngle) { angleOk = false; break; }
                if (!angleOk) continue;

                const newVecB = newVecA.clone().negate();
                for (const existingVec of pointB.connectionVectors) if (existingVec.angleTo(newVecB) < minAngle) { angleOk = false; break; }
                if (!angleOk) continue;

                validConnections.push([pointA, pointB]);
                
                pointA.connections++; pointB.connections++;
                pointA.connectionVectors.push(newVecA); pointB.connectionVectors.push(newVecB);
                if (!pointB.isNode && Math.random() < propagationProbability) pointB.isNode = true;
                if (pointA.connections >= maxConnectionsPerNode) break;
            }
        }
    }

    // 步骤2: 构建邻接表并筛选星座
    const adj = new Map();
    points3D.forEach(p => adj.set(p.id, []));
    validConnections.forEach(([pA, pB]) => {
        adj.get(pA.id).push(pB.id);
        adj.get(pB.id).push(pA.id);
    });

    const finalLinePoints = [];
    const visited = new Set();
    const pointMap = new Map(points3D.map(p => [p.id, p]));

    for (const p of points3D) {
        if (!visited.has(p.id)) {
            const componentNodeIds = [];
            const q = [p.id];
            visited.add(p.id);

            // 步骤3: 识别一个完整的星座（连通分量）
            while (q.length > 0) {
                const currentId = q.shift();
                componentNodeIds.push(currentId);
                const neighbors = adj.get(currentId) || [];
                for (const neighborId of neighbors) {
                    if (!visited.has(neighborId)) {
                        visited.add(neighborId);
                        q.push(neighborId);
                    }
                }
            }
            
            // 步骤4: 如果星座规模够大，则将其连线加入最终渲染列表
            if (componentNodeIds.length >= minConstellationSize) {
                for (const nodeId of componentNodeIds) {
                    const neighbors = adj.get(nodeId) || [];
                    for (const neighborId of neighbors) {
                        if (nodeId < neighborId) { // 避免重复添加
                            const node = pointMap.get(nodeId);
                            const neighbor = pointMap.get(neighborId);
                            finalLinePoints.push(node.vec.x, node.vec.y, node.vec.z);
                            finalLinePoints.push(neighbor.vec.x, neighbor.vec.y, neighbor.vec.z);
                        }
                    }
                }
            }
        }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(finalLinePoints, 3));
    
    return [geo, lineGeo, tex];
  }, []);

  return (
    <group ref={ref}>
      <points geometry={geometry}>
        <pointsMaterial 
          // 减小基础尺寸
          size={0.3} 
          vertexColors
          sizeAttenuation
          // 将我们创建的圆形纹理应用到map属性上
          map={texture}
          // 设置为透明，因为我们的纹理有透明部分
          transparent={true}
          // 设置混合模式为叠加，可以产生更亮的辉光效果
          blending={THREE.AdditiveBlending}
          // 关闭深度写入，这通常用于处理透明物体的渲染排序问题，可以避免一些视觉上的瑕疵
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial 
          color="white" 
          transparent 
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

function KeyVisual() {
  return (
    // Canvas 是 R3F 场景的根，它会创建一个全屏的 <canvas> 元素来渲染3D内容。
    <Canvas
      // camera prop 用于配置场景的默认相机。
      // Z轴位置调整为1，让我们离场景中心更近，为之后的人物剪影做准备。
      camera={{ position: [0, 0, 1], fov: 75 }}
    >
      {/* 
        环境光是一种基础光源，它会均匀地从所有方向照射到场景中的所有物体上。
        没有它，物体背光的部分会是纯黑色。
      */}
      <ambientLight intensity={0.5} />

      {/* 
        Suspense 是 React 的一个功能，用于处理异步加载的组件。
      */}
      <Suspense fallback={null}>
        {/* 使用我们自定义的、可旋转的、细节更丰富的星空组件 */}
        <CustomStars />
        {/* 渲染粒子化人类剪影 
        <Silhouette />*/}
      </Suspense>

      {/* 
        此处是未来添加更多核心视觉元素的地方，例如：
        - 消散的人形粒子
        - 核心光球
        - 数据光纤
      */}
    </Canvas>
  );
}

export default KeyVisual; 