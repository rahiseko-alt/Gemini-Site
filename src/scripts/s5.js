import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

export function initHorizontalTrack() {
  const section = document.getElementById('track');
  const track = document.getElementById('horizontal-track');
  if (!section || !track) return;

  // タブレット以下（<=991px）は縦スクロールフォールバック
  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    // 終端が画面右端にぴったり一致する移動量を計算
    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

    const horizontalTween = gsap.to(track, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // 1. 各画像のスクラブパララックス: x: -8% -> 8% (containerAnimation 連動)
    const images = track.querySelectorAll('.horizontal-item-img');
    images.forEach((img) => {
      gsap.fromTo(
        img,
        { x: '-8%' },
        {
          x: '8%',
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.col'),
            containerAnimation: horizontalTween,
            start: 'left right',
            end: 'right left',
            scrub: 1,
          },
        }
      );
    });

    // 2. トラック内の M1 アイブロウ発火 (containerAnimation 連動)
    const trackEyebrows = track.querySelectorAll('[data-track-eyebrow]');
    trackEyebrows.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'cubicDefault',
          scrollTrigger: {
            trigger: el,
            containerAnimation: horizontalTween,
            start: 'left 85%',
            once: true,
          },
        }
      );
    });

    // 3. 途中テーマ切替 (トラックの60%位置通過で 暗 -> 明 #f4f4ed)
    const themeChangeTrigger = track.querySelector('.sticky-track-theme-change');
    const body = document.body;
    const nav = document.querySelector('.nav');

    if (themeChangeTrigger) {
      ScrollTrigger.create({
        trigger: themeChangeTrigger,
        containerAnimation: horizontalTween,
        start: 'left center',
        onEnter: () => {
          gsap.to([body, section], {
            backgroundColor: '#f4f4ed',
            color: '#111112',
            duration: 0.75,
            ease: 'power1.inOut',
          });
          if (nav) nav.setAttribute('data-nav-theme', 'light');
        },
        onLeaveBack: () => {
          gsap.to([body, section], {
            backgroundColor: '#282c20',
            color: '#f4f4ed',
            duration: 0.75,
            ease: 'power1.inOut',
          });
          if (nav) nav.setAttribute('data-nav-theme', 'dark');
        },
      });
    }

    return () => {
      horizontalTween.kill();
    };
  });
}
