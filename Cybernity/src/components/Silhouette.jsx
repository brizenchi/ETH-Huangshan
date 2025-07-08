import React, { useMemo, useRef } from 'react';
import { useLoader, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

// 3. 创建自定义着色器材质
const ParticleMaterial = shaderMaterial(
  // Uniforms: 从React传递到Shader的变量
  {
    uTime: 0,
    uPixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
    uSize: 40.0,
  },
  // Vertex Shader (GLSL)
  `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSize;

    attribute float aRandom;

    // Simplex Noise 3D GLSL (c) 2011-2012 Stefan Gustavson, Ian McEwan
    // ... (一系列复杂的噪声函数定义)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      // 动画计算
      float time = uTime * 0.1;
      vec3 pos = position;
      
      // 使用噪声和时间来创建流动的位移
      float displacement = snoise(vec3(pos.x * 0.5, pos.y * 0.5, time + aRandom * 10.0)) * 0.2;
      pos.z += displacement;

      // 创建最终位置
      vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      gl_Position = projectionMatrix * viewPosition;

      // 设置粒子大小
      gl_PointSize = uSize * uPixelRatio;
      gl_PointSize *= (1.0 / -viewPosition.z); // 根据深度调整大小
    }
  `,
  // Fragment Shader (GLSL)
  `
    void main() {
      // 在粒子中心创建一个更亮的核心，并向边缘淡出，形成柔和的圆形
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
      float strength = 1.0 - (distanceToCenter * 2.0);

      // 设置最终颜色
      gl_FragColor = vec4(0.39, 1.0, 0.85, strength); // 赛博青，带有透明度
    }
  `
);

extend({ ParticleMaterial });


function Silhouette() {
  const materialRef = useRef();
  
  // 1. 加载剪影图片
  const texture = useLoader(THREE.TextureLoader, '/silhouette.png');

  // 2. 从图片生成粒子坐标和随机属性
  const [particles, randoms] = useMemo(() => {
    if (!texture.image) return [new Float32Array(0), new Float32Array(0)];

    const img = texture.image;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const positions = [];
    const randoms = [];
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        if (data[i + 3] > 128) {
          const scale = 0.05;
          positions.push((x - canvas.width / 2) * scale, -(y - canvas.height / 2) * scale, 0);
          randoms.push(Math.random());
        }
      }
    }
    
    return [new Float32Array(positions), new Float32Array(randoms)];
  }, [texture]);

  // 4. 驱动动画
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          key={particles.length}
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      {/* 使用我们的自定义着色器材质 */}
      <particleMaterial ref={materialRef} transparent={true} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default Silhouette; 