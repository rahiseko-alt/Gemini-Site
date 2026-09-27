import * as THREE from 'three';
import { lenis } from '../lenis.js';

// テキストテクスチャ生成ヘルパー (Instrument Serif フォント)
function createTextTexture(text, color, fontSize = 160) {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = `700 ${fontSize}px "Instrument Serif", "Fraunces", Georgia, serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  // 繰り返して連続させる
  const fullText = (text + '   ').repeat(6);
  ctx.fillText(fullText, 0, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

export function createCarouselScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8.5);

  const carouselGroup = new THREE.Group();
  scene.add(carouselGroup);

  // 上段: "WE RACE AS ONE WE RACE AS ONE", 色 #b2c73a
  const texTop = createTextTexture('WE RACE AS ONE WE RACE AS ONE', '#b2c73a');
  // 下段: "A WEEKEND WORTH REMEMBERING", 色 #dde1d2
  const texBottom = createTextTexture('A WEEKEND WORTH REMEMBERING', '#dde1d2');

  const radius = 6.5;
  const height = 1.35;
  const cylGeo = new THREE.CylinderGeometry(radius, radius, height, 64, 1, true);

  const matTop = new THREE.MeshBasicMaterial({
    map: texTop,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const matBottom = new THREE.MeshBasicMaterial({
    map: texBottom,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const meshTop = new THREE.Mesh(cylGeo, matTop);
  meshTop.position.set(0, 0.75, 0);
  carouselGroup.add(meshTop);

  const meshBottom = new THREE.Mesh(cylGeo, matBottom);
  meshBottom.position.set(0, -0.75, 0);
  carouselGroup.add(meshBottom);

  let isVisible = false;

  return {
    scene,
    camera,
    setVisible: (val) => {
      isVisible = val;
      scene.visible = val;
    },
    update: (deltaTime, isReducedMotion) => {
      if (!isVisible) return;

      if (!isReducedMotion) {
        // スクロール速度を加算 (lenis.velocity * 0.002)
        const scrollBonus = lenis && lenis.velocity ? lenis.velocity * 0.002 : 0;

        // 上段：右方向へ回転 0.15 rad/s + スクロール加速
        meshTop.rotation.y -= (0.15 + scrollBonus) * deltaTime;

        // 下段：左方向へ回転 0.15 rad/s - スクロール加速
        meshBottom.rotation.y += (0.15 + scrollBonus) * deltaTime;
      }
    },
    resize: (width, height) => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },
  };
}
