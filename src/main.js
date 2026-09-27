import './styles/tokens.css';
import './styles/motions.css';
import './styles/s0-s1.css';
import './styles/s9-s11.css';
import './styles/s12-s13.css';
import './styles/responsive.css';
import { lenis } from './scripts/lenis.js';
import {
  initLineReveals,
  initTextHovers,
  initOvalClips,
  initParallax,
  initButtons,
  initThemeTriggers,
} from './scripts/motions.js';
import { initLoader, initNavigation } from './scripts/s0-s1.js';
import { initApexGL } from './scripts/gl/index.js';
import { initHero } from './scripts/s2.js';
import { initMarqueeAndImpact } from './scripts/s3-s4.js';
import { initHorizontalTrack } from './scripts/s5.js';
import { initOtotAndHelmets } from './scripts/s6-s8.js';
import { initStoreAndCollabs } from './scripts/s9-s11.js';
import { initSocialsAndFooter } from './scripts/s12-s13.js';

// DOM コンテンツ読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', () => {
  // WebGL 基盤および GL-A, GL-B, GL-C 初期化
  const gl = initApexGL();

  // S0, S1 の初期化
  initLoader();
  initNavigation();

  // S2 ヒーローの初期化
  if (gl && gl.scenes && gl.scenes.head) {
    initHero(gl.scenes.head);
  }

  // S3 マーキー & S4 インパクト文の初期化
  if (gl && gl.scenes && gl.scenes.carousel) {
    initMarqueeAndImpact(gl.scenes.carousel);
  } else {
    initMarqueeAndImpact(null);
  }

  // S5 横スクロールトラックの初期化
  initHorizontalTrack();

  // S6 ON/OFF, S7 フルブリード, S8 ヘルメットグリッドの初期化
  initOtotAndHelmets();

  // S9 コールアウト, S10 ストア, S11 パートナーの初期化
  initStoreAndCollabs();

  // S12 ソーシャル, S13 フッターの初期化
  initSocialsAndFooter();

  // 共通モーションの初期化
  initButtons();
  initLineReveals();
  initTextHovers();
  initOvalClips();
  initParallax();
  initThemeTriggers();

  console.log('[APEX DRIVER] Core motion, S0 Loader, and S1 Navigation initialized.');
});
