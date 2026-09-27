import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

export function initSocialsAndFooter() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. S12 ソーシャル: 7枚のカード 扇状配置 & 中央から外へのスタッガー出現 (T13)
  const cards = document.querySelectorAll('.socials-card-item');
  const socialsSection = document.getElementById('socials');

  if (cards.length === 7 && socialsSection) {
    if (isReducedMotion) {
      cards.forEach((card) => {
        gsap.set(card, { opacity: 1, y: 0, transform: 'none' });
      });
    } else {
      const centerIndex = 3; // 0, 1, 2, [3], 4, 5, 6

    // 初期レイアウト計算 (扇状)
    cards.forEach((card, idx) => {
      const diff = idx - centerIndex; // -3, -2, -1, 0, 1, 2, 3
      const absDiff = Math.abs(diff);

      const targetX = diff * 125; // 左右オフセット
      const targetY = absDiff * 24; // 下方向オフセット
      const targetRotate = diff * 4; // 傾き
      const zIndex = 7 - absDiff;

      card.style.zIndex = zIndex;
      card.dataset.x = targetX;
      card.dataset.y = targetY;
      card.dataset.rotate = targetRotate;

      // 初期状態
      gsap.set(card, {
        x: targetX,
        y: targetY + 160, // 10rem 下
        rotation: targetRotate,
        opacity: 0,
        transformOrigin: '50% 50%',
      });
    });

    // 中央から外へスタッガー入場 (diff 順)
    // 順序: [3, 2, 4, 1, 5, 0, 6]
    const orderIndices = [3, 2, 4, 1, 5, 0, 6];
    const orderedCards = orderIndices.map((i) => cards[i]);

    ScrollTrigger.create({
      trigger: socialsSection,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        orderedCards.forEach((card, i) => {
          const targetY = parseFloat(card.dataset.y) || 0;
          gsap.to(card, {
            y: targetY,
            opacity: 1,
            duration: 1.0,
            delay: i * 0.08,
            ease: 'expo.out',
          });
        });
      },
    });
    }
  }

  // 2. S13 フッター: 下部からの開閉スクラブ (A11)
  // clip-path: inset(0 0 100% 0 round 3rem) -> inset(0 0 0 0 round 3rem)
  const footerSection = document.getElementById('footer');
  const footerClip = document.querySelector('.footer-layout-clip');

  if (footerSection && footerClip) {
    if (isReducedMotion) {
      footerClip.style.clipPath = 'none';
    } else {
      gsap.fromTo(
        footerClip,
        { clipPath: 'inset(0 0 100% 0 round 3rem)' },
        {
          clipPath: 'inset(0 0 0% 0 round 3rem)',
          ease: 'none',
          scrollTrigger: {
            trigger: footerSection,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1,
          },
        }
      );
    }
  }
}
