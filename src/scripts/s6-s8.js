import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

export function initOtotAndHelmets() {
  // 1. S6 ON/OFF 分岐演出
  const ototSection = document.getElementById('otot-home');
  const leftBlock = document.querySelector('.otot-block.is-left');
  const rightBlock = document.querySelector('.otot-block.is-right');
  const bgImgs = document.querySelectorAll('.otot-home-img-w');

  if (ototSection) {
    // 左右ブロックの入場アニメーション (x: ±5rem -> 0, 1s expo.out)
    if (leftBlock && rightBlock) {
      gsap.fromTo(
        leftBlock,
        { x: '-5rem', opacity: 0 },
        {
          x: '0rem',
          opacity: 1,
          duration: 1.0,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: ototSection,
            start: 'top 70%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        rightBlock,
        { x: '5rem', opacity: 0 },
        {
          x: '0rem',
          opacity: 1,
          duration: 1.0,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: ototSection,
            start: 'top 70%',
            once: true,
          },
        }
      );
    }

    // 背景画像パララックス: y: 10% -> -10%
    bgImgs.forEach((bg) => {
      gsap.fromTo(
        bg,
        { y: '10%' },
        {
          y: '-10%',
          ease: 'none',
          scrollTrigger: {
            trigger: ototSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    });
  }

  // 2. S7 フルブリード画像パララックス: y: -10% -> 0%
  const ototEndSection = document.getElementById('otot-end');
  const endImg = document.querySelector('.is-otot-home-end');

  if (ototEndSection && endImg) {
    gsap.fromTo(
      endImg,
      { y: '-10%' },
      {
        y: '0%',
        ease: 'none',
        scrollTrigger: {
          trigger: ototEndSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      }
    );
  }

  // 3. S8 ヘルメットグリッド出現 (各行ごとに y: 5rem -> 0, opacity: 0 -> 1, stagger 0.05s)
  const helmetItems = document.querySelectorAll('.helmet-grid-item');
  if (helmetItems.length > 0) {
    // 4アイテムずつ行単位でトリガー
    const rows = [];
    for (let i = 0; i < helmetItems.length; i += 4) {
      rows.push(Array.from(helmetItems).slice(i, i + 4));
    }

    rows.forEach((row) => {
      gsap.fromTo(
        row,
        { y: '5rem', opacity: 0 },
        {
          y: '0rem',
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.05,
          scrollTrigger: {
            trigger: row[0],
            start: 'top 85%',
            once: true,
          },
        }
      );
    });
  }
}
