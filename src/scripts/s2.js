import { gsap } from 'gsap';
import { lenis } from './lenis.js';

export function initHero(headScene) {
  const nextRaceWidget = document.getElementById('next-race-widget');
  const touchSwipeBtn = document.getElementById('touch-swipe-btn');

  // ローディング完了（apex:enter）後 0.6s 遅延で NEXT RACE ウィジェット出現 (0.75s)
  window.addEventListener('apex:enter', () => {
    if (nextRaceWidget) {
      nextRaceWidget.classList.add('is-visible');
      gsap.to(nextRaceWidget, {
        clipPath: 'ellipse(150% 150% at 50% 0%)',
        duration: 0.75,
        delay: 0.6,
        ease: 'cubicDefault',
      });
    }
  });

  // タブレット用: TAP TO LOCK トグル
  if (touchSwipeBtn && headScene) {
    let isLocked = false;
    let touchStartX = 0;
    let touchStartY = 0;

    touchSwipeBtn.addEventListener('click', () => {
      isLocked = !isLocked;
      const textSpan = touchSwipeBtn.querySelector('.btn-text');

      if (isLocked) {
        lenis.stop();
        if (textSpan) textSpan.innerHTML = 'BACK TO<br>SCROLL';
      } else {
        lenis.start();
        if (textSpan) textSpan.innerHTML = 'TAP TO<br>LOCK';
      }
    });

    window.addEventListener('touchstart', (e) => {
      if (!isLocked) return;
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isLocked || !headScene.setTouchRotation) return;
      if (e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        headScene.setTouchRotation(deltaX, deltaY);
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
  }
}
