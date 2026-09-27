import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { createBackgroundScene } from './background.js';
import { createHeadScene } from './head.js';
import { createCarouselScene } from './carousel.js';

export function initApexGL() {
  const canvas = document.querySelector('canvas.gl');
  if (!canvas) return null;

  // WebGL レンダラー設定 (alpha: true, antialias: true, pixelRatio <= 2)
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.autoClear = false;

  // 各シーン初期化
  const backgroundScene = createBackgroundScene();
  const headScene = createHeadScene();
  const carouselScene = createCarouselScene();

  // マウス座標管理 (lerp 0.08 追従)
  const mouse = {
    targetX: 0.5,
    targetY: 0.5,
    currentX: 0.5,
    currentY: 0.5,
  };

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX / window.innerWidth;
    mouse.targetY = 1.0 - e.clientY / window.innerHeight; // WebGL UV 基準 (下原点)
  });

  // リサイズハンドラ
  function onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    backgroundScene.resize(width, height);
    headScene.resize(width, height);
    carouselScene.resize(width, height);
  }
  window.addEventListener('resize', onResize);

  // S2 -> S3 背景明暗トランジション (uTransition: 0 -> 1, 1.1s)
  ScrollTrigger.create({
    trigger: '#marquee',
    start: 'top 80%',
    end: 'top 20%',
    onEnter: () => {
      gsap.to(backgroundScene.uniforms.uTransition, {
        value: 1.0,
        duration: 1.1,
        ease: 'power2.inOut',
      });
    },
    onLeaveBack: () => {
      gsap.to(backgroundScene.uniforms.uTransition, {
        value: 0.0,
        duration: 1.1,
        ease: 'power2.inOut',
      });
    },
  });

  // レンダリングループ (RAF)
  let lastTime = 0;
  function animate(time) {
    requestAnimationFrame(animate);
    const t = time * 0.001;
    const deltaTime = lastTime ? t - lastTime : 0.016;
    lastTime = t;

    // マウス lerp 0.08 (reduced-motion 時は中央固定)
    if (!isReducedMotion) {
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.08;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.08;
    } else {
      mouse.currentX = 0.5;
      mouse.currentY = 0.5;
    }

    backgroundScene.uniforms.uCursor.value.set(mouse.currentX, mouse.currentY);
    backgroundScene.update(t);

    // GL-B ヘッド更新
    headScene.update(t, mouse, isReducedMotion);

    // GL-C カルーセル更新
    carouselScene.update(deltaTime, isReducedMotion);

    renderer.clear();

    // 画面内判定
    const heroEl = document.getElementById('hero');
    let showHead = false;
    let showBackground = true;

    if (heroEl) {
      const rect = heroEl.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        showHead = true;
      }
    }

    const impactEl = document.getElementById('impact');
    if (impactEl) {
      const rect = impactEl.getBoundingClientRect();
      if (rect.bottom < 0) {
        showBackground = false; // インパクトセクションより下は背景描画停止
      }
    }

    if (showBackground) {
      renderer.render(backgroundScene.scene, backgroundScene.camera);
    }

    if (showHead) {
      renderer.render(headScene.scene, headScene.camera);
    }

    if (carouselScene.scene.visible) {
      renderer.render(carouselScene.scene, carouselScene.camera);
    }
  }
  requestAnimationFrame(animate);

  const apexGL = {
    renderer,
    scenes: {
      background: backgroundScene,
      head: headScene,
      carousel: carouselScene,
    },
    mouse,
    onResize,
  };

  window.APEX_GL = apexGL;
  return apexGL;
}
