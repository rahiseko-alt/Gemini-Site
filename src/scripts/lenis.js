import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { SplitText } from 'gsap/SplitText.js';
import { Flip } from 'gsap/Flip.js';
import { Observer } from 'gsap/Observer.js';
import { CustomEase } from 'gsap/CustomEase.js';
import Lenis from 'lenis';

// プラグイン登録（GSAP 3.13+）
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer, CustomEase);

// カスタムイージング登録 (--cubic-default と同一)
CustomEase.create('cubicDefault', '0.65, 0.05, 0, 1');

const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lenis スムーススクロール初期化 (lerp: 0.1, wheelMultiplier: 1, smoothWheel: true)
export const lenis = new Lenis({
  lerp: isReducedMotion ? 1 : 0.1,
  wheelMultiplier: 1,
  smoothWheel: !isReducedMotion,
  syncTouch: false,
});

// Lenis と ScrollTrigger の連携
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// グローバル参照
window.lenis = lenis;
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.SplitText = SplitText;
