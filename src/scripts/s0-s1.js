import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

// S0: ローディング & エントリー演出
export function initLoader() {
  const loader = document.getElementById('loader-layer');
  const enterBtn = document.getElementById('loader-enter-btn');
  const logo = document.getElementById('loader-logo');
  if (!loader || !enterBtn || !logo) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) {
    loader.style.display = 'none';
    window.dispatchEvent(new CustomEvent('apex:enter'));
    return;
  }
  const paths = logo.querySelectorAll('polygon, polyline, path');
  paths.forEach((p) => {
    const len = p.getTotalLength ? p.getTotalLength() : 200;
    gsap.set(p, {
      strokeDasharray: len,
      strokeDashoffset: len,
    });
    gsap.to(p, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power2.out',
    });
  });

  // GLアセット読込準備完了時 (シミュレーションまたは即時準備)
  // 1.2s 経過後に ENTER ボタンを opacity 0 -> 1 (0.3s)
  window.addEventListener('load', () => {
    gsap.delayedCall(1.2, () => {
      enterBtn.classList.add('is-ready');
    });
  });

  // 万が一のフォールバック
  gsap.delayedCall(1.5, () => {
    enterBtn.classList.add('is-ready');
  });

  // ENTER クリック時の挙動 (T1)
  enterBtn.addEventListener('click', () => {
    const tl = gsap.timeline({
      onComplete: () => {
        loader.style.display = 'none';
        // GL-B リビール発火用のカスタムイベント通知
        window.dispatchEvent(new CustomEvent('apex:enter'));
      },
    });

    // 1. ボタン opacity -> 0 (0.3s)
    tl.to(enterBtn, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
    })
      // 2. レイヤーを clip-path: inset(0 0 0 0) -> inset(0 0 100% 0) で上方へ 1s expo.inOut
      .to(loader, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.0,
        ease: 'expo.inOut',
      });
  });
}

// S1: ナビゲーション & フルスクリーンメニュー & スクロールインジケーター
export function initNavigation() {
  const hamburgerBtn = document.getElementById('nav-hamburger');
  const navMenu = document.getElementById('nav-menu');
  const menuLinks = document.querySelectorAll('.nav-menu-link');
  const scrollBar = document.getElementById('scroll-bar');

  // フルスクリーンメニューの開閉 (M3 楕円クリップ: 0.75s --cubic-default)
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
      navMenu.classList.add('is-active');
      gsap.fromTo(
        navMenu,
        { clipPath: 'ellipse(20% 0% at 50% 0%)' },
        {
          clipPath: 'ellipse(120% 100% at 50% 0%)',
          duration: 0.75,
          ease: 'cubicDefault',
        }
      );
    } else {
      gsap.to(navMenu, {
        clipPath: 'ellipse(20% 0% at 50% 0%)',
        duration: 0.75,
        ease: 'cubicDefault',
        onComplete: () => {
          navMenu.classList.remove('is-active');
        },
      });
    }
  }

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', toggleMenu);

    menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (isMenuOpen) toggleMenu();
      });
    });
  }

  // メニュー内画像タイルのカーソルパララックス (±20px)
  const tilesContainer = document.getElementById('nav-menu-tiles');
  if (tilesContainer) {
    const tiles = tilesContainer.querySelectorAll('.nav-menu-tile');

    window.addEventListener('mousemove', (e) => {
      if (!isMenuOpen) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;

      tiles.forEach((tile) => {
        const speed = parseFloat(tile.getAttribute('data-speed')) || 1.0;
        gsap.to(tile, {
          x: nx * 20 * speed,
          y: ny * 20 * speed,
          duration: 0.5,
          ease: 'power2.out',
        });
      });
    });
  }

  // スクロールインジケーターバー: ScrollTrigger scrub で y: 0 -> (100vh - バー高さ)
  if (scrollBar) {
    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const barHeight = window.innerHeight * 0.1; // 10vh
        const maxTravel = window.innerHeight - barHeight;
        const currentY = self.progress * maxTravel;
        gsap.set(scrollBar, { y: currentY - window.innerHeight * 0.5 + barHeight * 0.5 });
      },
    });
  }
}
