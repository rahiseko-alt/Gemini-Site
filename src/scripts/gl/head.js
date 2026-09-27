import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

// 人物写真のプレースホルダーテクスチャを Canvas で生成
function createPortraitTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#f2f2eb';
  ctx.fillRect(0, 0, 600, 750);

  // 体・肩のシルエット (暗色)
  ctx.fillStyle = '#282c20';
  ctx.beginPath();
  ctx.ellipse(300, 700, 240, 180, 0, 0, Math.PI * 2);
  ctx.fill();

  // レーシングスーツの襟・ジッパー線
  ctx.strokeStyle = '#d2ff00';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 560);
  ctx.lineTo(300, 750);
  ctx.stroke();

  // 首
  ctx.fillStyle = '#dcd6c8';
  ctx.fillRect(250, 430, 100, 140);

  // 頭部プレースホルダー（ヘルメットの下に隠れるシルエット）
  ctx.fillStyle = '#c5beae';
  ctx.beginPath();
  ctx.ellipse(300, 340, 120, 150, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createHeadScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  // ライティング
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xd2ff00, 1.2);
  dirLight.position.set(2, 4, 3);
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-2, 0, 2);
  scene.add(fillLight);

  // 1. 人物写真平面 (カーソル周辺ノイズ歪み)
  const portraitTex = createPortraitTexture();
  const portraitGeo = new THREE.PlaneGeometry(2.4, 3.0, 32, 32);

  const portraitUniforms = {
    uTexture: { value: portraitTex },
    uCursor: { value: new THREE.Vector2(0.5, 0.5) },
    uDistortIntensity: { value: 0.5 },
    uDistortScale: { value: 1.0 },
    uOpacity: { value: 1.0 },
    uTime: { value: 0.0 },
  };

  const portraitMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: portraitUniforms,
    vertexShader: `
      uniform vec2 uCursor;
      uniform float uDistortIntensity;
      uniform float uDistortScale;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        vec2 cursorOffset = uCursor - vec2(0.5);
        float dist = length(uv - (uCursor * 0.5 + 0.25));
        float effect = smoothstep(0.4, 0.0, dist) * uDistortIntensity;
        pos.z += sin(dist * 10.0 - uTime * 2.0) * effect * 0.1;
        pos.xy += cursorOffset * effect * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec4 col = texture2D(uTexture, vUv);
        gl_FragColor = vec4(col.rgb, col.a * uOpacity);
      }
    `,
  });

  const portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
  portraitMesh.position.set(0, -0.2, -0.3);
  scene.add(portraitMesh);

  // 2. ヘルメット3D（シェル + バイザー + チンガードのプロシージャルメッシュ）
  const helmetGroup = new THREE.Group();
  helmetGroup.position.set(0, 0.35, 0.2);

  // ヘルメット用リビールユニフォーム
  // uReveal: 0.0 = 完全ワイヤーフレーム, 1.0 = 完全ソリッド
  const helmetUniforms = {
    uReveal: { value: 0.0 },
    uTime: { value: 0.0 },
    uWireColor: { value: new THREE.Color('#CBCBB9') },
    uSolidColor: { value: new THREE.Color('#282c20') },
    uAccentColor: { value: new THREE.Color('#d2ff00') },
    uVisorHover: { value: 1.0 },
  };

  // カスタムシェーダー：ワイヤーフレーム ↔ ソリッドのリビール
  const helmetMaterial = new THREE.ShaderMaterial({
    uniforms: helmetUniforms,
    wireframe: false,
    vertexShader: `
      uniform float uTime;
      uniform float uReveal;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        
        // ワイヤーフレーム時の微細な脈動: sin(time + position.y * 4.0) * 0.01
        float pulse = sin(uTime * 2.0 + position.y * 4.0) * 0.01 * (1.0 - uReveal);
        vec3 transformed = position + normal * pulse;

        vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uReveal;
      uniform vec3 uWireColor;
      uniform vec3 uSolidColor;
      uniform vec3 uAccentColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vPosition;

      void main() {
        // 上から下へのリビール境界 (y: 0.95 -> -0.45)
        float top = 0.95;
        float bottom = -0.45;
        float revealThreshold = mix(top, bottom, uReveal);

        float isSolid = step(vPosition.y, revealThreshold);

        // 基本ライティング
        vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0) * 0.8 + 0.2;

        // レーシングストライプ
        float stripe = smoothstep(0.04, 0.0, abs(vPosition.x));
        vec3 baseColor = mix(uSolidColor, uAccentColor, stripe * 0.8);

        vec3 solidRender = baseColor * diff;
        vec3 wireRender = uWireColor * 0.7;

        // 境界部分の発光ライムエッジ
        float edge = smoothstep(0.06, 0.0, abs(vPosition.y - revealThreshold)) * (1.0 - step(1.0, uReveal)) * step(0.01, uReveal);
        vec3 col = mix(wireRender, solidRender, isSolid);
        col += uAccentColor * edge * 2.0;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  // ヘルメットのメインシェル（球体変形）
  const shellGeo = new THREE.SphereGeometry(0.78, 48, 48);
  // スケールでヘルメット形状に成形
  shellGeo.scale(1.0, 1.15, 1.25);
  const shellMesh = new THREE.Mesh(shellGeo, helmetMaterial);
  helmetGroup.add(shellMesh);

  // バイザー（ガラスメッシュ: transmission 0.9, roughness 0.05）
  const visorGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.35, 32, 1, false, -Math.PI * 0.45, Math.PI * 0.9);
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x111112,
    transmission: 0.9,
    opacity: 1,
    transparent: true,
    roughness: 0.05,
    metalness: 0.1,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.rotation.y = Math.PI;
  visorMesh.position.set(0, -0.02, 0.28);
  helmetGroup.add(visorMesh);

  scene.add(helmetGroup);

  // マウス追従 lerp 0.06
  const targetRot = { x: 0, y: 0 };
  const currentRot = { x: 0, y: 0 };

  // ENTERイベント連携：上から下へのリビール (1.1s, power4.inOut)
  window.addEventListener('apex:enter', () => {
    gsap.to(helmetUniforms.uReveal, {
      value: 1.0,
      duration: 1.1,
      ease: 'power4.inOut',
    });
  });

  // スクロール連動 (S2 の 100vh 分): y: 0 -> +0.6, scale: 1 -> 0.85, 写真 opacity 1 -> 0
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      const p = self.progress;
      helmetGroup.position.y = 0.35 + p * 0.6;
      const s = 1.0 - p * 0.15;
      helmetGroup.scale.set(s, s, s);
      portraitUniforms.uOpacity.value = Math.max(0, 1.0 - p * 1.5);

      // 0.7 以降にソリッド -> ワイヤーフレームに逆リビール
      if (p > 0.7) {
        helmetUniforms.uReveal.value = Math.max(0, 1.0 - (p - 0.7) / 0.3);
      }
    },
  });

  return {
    scene,
    camera,
    helmetGroup,
    uniforms: { helmet: helmetUniforms, portrait: portraitUniforms },
    update: (time, mouse, isReducedMotion) => {
      portraitUniforms.uTime.value = time;
      helmetUniforms.uTime.value = time;
      portraitUniforms.uCursor.value.set(mouse.currentX, mouse.currentY);

      if (!isReducedMotion) {
        // rotation.y = mouseX * 0.25, rotation.x = mouseY * 0.12 (lerp 0.06)
        const mx = (mouse.currentX - 0.5) * 2;
        const my = (mouse.currentY - 0.5) * 2;
        targetRot.y = mx * 0.25;
        targetRot.x = -my * 0.12;

        currentRot.x += (targetRot.x - currentRot.x) * 0.06;
        currentRot.y += (targetRot.y - currentRot.y) * 0.06;

        helmetGroup.rotation.x = currentRot.x;
        helmetGroup.rotation.y = currentRot.y;
      }
    },
    resize: (width, height) => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },
    setTouchRotation: (deltaX, deltaY) => {
      helmetGroup.rotation.y += deltaX * 0.01;
      helmetGroup.rotation.x += deltaY * 0.01;
    },
  };
}
