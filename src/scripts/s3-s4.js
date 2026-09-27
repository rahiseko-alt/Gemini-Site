import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { SplitText } from 'gsap/SplitText.js';

export function initMarqueeAndImpact(carouselScene) {
  // 1. S3 署名アニメーション (ScrollTrigger scrub で stroke-dashoffset 描画)
  const signatureSvg = document.getElementById('marquee-signature');
  if (signatureSvg) {
    const paths = signatureSvg.querySelectorAll('path');
    paths.forEach((p) => {
      const len = p.getTotalLength ? p.getTotalLength() : 300;
      gsap.set(p, {
        strokeDasharray: len,
        strokeDashoffset: len,
      });

      gsap.to(p, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#marquee',
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
        },
      });
    });
  }

  // 2. GL-C カルーセルの表示/非表示切り替え (S3 がビューポート内にある時のみ)
  if (carouselScene) {
    ScrollTrigger.create({
      trigger: '#marquee',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        carouselScene.setVisible(self.isActive);
      },
    });
  }

  // 3. S4 インパクト文出現アニメーション (T12)
  // SplitText lines -> 各行を y: 100% -> 0%, stagger 0.06s, 1.2s expo.out, trigger: top 70%
  const impactText = document.getElementById('impact-text');
  if (impactText) {
    const split = new SplitText(impactText, {
      type: 'lines',
      linesClass: 'impact-line-mask',
    });

    // 内部ラッパーを作成してマスク内でスライド
    split.lines.forEach((line) => {
      const innerHtml = line.innerHTML;
      line.innerHTML = `<span class="impact-line">${innerHtml}</span>`;
    });

    const lines = impactText.querySelectorAll('.impact-line');

    gsap.fromTo(
      lines,
      { y: '100%' },
      {
        y: '0%',
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: {
          trigger: '#impact',
          start: 'top 70%',
          once: true,
        },
      }
    );
  }
}
