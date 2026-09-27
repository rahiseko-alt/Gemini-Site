import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { lenis } from './lenis.js';

export function initStoreAndCollabs() {
  // 1. S10 ストア 重ね配置パララックス
  const storeSection = document.getElementById('store');
  if (storeSection) {
    const img1 = storeSection.querySelector('.exe-product-img.is-1');
    const img2 = storeSection.querySelector('.exe-product-img.is-2');
    const img3 = storeSection.querySelector('.exe-product-img.is-3');
    const sticker = storeSection.querySelector('.exe-cta-sticker-w');

    // .is-1: y: 0 -> -60px
    if (img1) {
      gsap.fromTo(
        img1,
        { y: 0 },
        {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: storeSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    }

    // .is-2: y: 0 -> -120px
    if (img2) {
      gsap.fromTo(
        img2,
        { y: 0 },
        {
          y: -120,
          ease: 'none',
          scrollTrigger: {
            trigger: storeSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    }

    // .is-3: y: 0 -> -90px
    if (img3) {
      gsap.fromTo(
        img3,
        { y: 0 },
        {
          y: -90,
          ease: 'none',
          scrollTrigger: {
            trigger: storeSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    }

    // ステッカー: rotate: -8 -> 4deg
    if (sticker) {
      gsap.fromTo(
        sticker,
        { rotate: -8 },
        {
          rotate: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: storeSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    }
  }

  // 2. S11 パートナー ロゴマーキー速度連動 & イラストパララックス
  const collabsSection = document.getElementById('collabs');
  if (collabsSection) {
    const marqueeTrack = collabsSection.querySelector('.marquee-advanced-track');
    const collabRiveW = collabsSection.querySelector('.home-collab-rive-w');
    const part1 = collabsSection.querySelector('.collab-part-1');
    const part2 = collabsSection.querySelector('.collab-part-2');
    const part3 = collabsSection.querySelector('.collab-part-3');

    // ロゴマーキー: スクロール速度で animation-duration を 40s -> 15s に補間 (T14)
    if (marqueeTrack) {
      let currentDuration = 40;
      lenis.on('scroll', (e) => {
        const vel = Math.abs(e.velocity || 0);
        const targetDuration = Math.max(15, 40 - vel * 2.5);
        currentDuration += (targetDuration - currentDuration) * 0.1;
        marqueeTrack.style.animationDuration = `${currentDuration.toFixed(1)}s`;
      });
    }

    // 大型イラスト: scrub で y: 20% -> -10% + 内部パーツ3点の別速度パララックス
    if (collabRiveW) {
      gsap.fromTo(
        collabRiveW,
        { y: '20%' },
        {
          y: '-10%',
          ease: 'none',
          scrollTrigger: {
            trigger: collabsSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      if (part1) {
        gsap.fromTo(
          part1,
          { y: 30 },
          {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: collabsSection,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      }

      if (part2) {
        gsap.fromTo(
          part2,
          { y: -40 },
          {
            y: 40,
            ease: 'none',
            scrollTrigger: {
              trigger: collabsSection,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      }

      if (part3) {
        gsap.fromTo(
          part3,
          { y: 60 },
          {
            y: -60,
            ease: 'none',
            scrollTrigger: {
              trigger: collabsSection,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      }
    }
  }
}
