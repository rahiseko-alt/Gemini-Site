import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { SplitText } from 'gsap/SplitText.js';

// M1. ラインリビール (data-anim-high="<方向>, <色>, <遅延ms>")
export function initLineReveals() {
  const elements = document.querySelectorAll('[data-anim-high]');

  elements.forEach((el) => {
    const rawAttr = el.getAttribute('data-anim-high') || '';
    const parts = rawAttr.split(',').map((p) => p.trim());
    const direction = parts[0] || 'right'; // 'right' or 'left'
    const color = parts[1] || 'var(--color-accent)';
    const delayMs = parts[2] ? parseFloat(parts[2]) / 1000 : 0;

    // SplitText で lines に分割
    const split = new SplitText(el, { type: 'lines', linesClass: 'high-line-wrap' });

    // 各行に reveal 用の要素を挿入し、テキスト自体を wrap
    split.lines.forEach((line) => {
      const textContent = line.innerHTML;
      line.innerHTML = `
        <span class="high-line-reveal" style="background-color: ${color};"></span>
        <span class="high-line-inner">${textContent}</span>
      `;
    });

    const revealBars = el.querySelectorAll('.high-line-reveal');
    const lineInners = el.querySelectorAll('.high-line-inner');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      delay: delayMs,
    });

    // 1. .high-line-reveal を scaleX: 0 -> 1 (origin left) 0.75s
    // 2. 同時に .line の clip-path を inset(0 100% 0 0) -> inset(0 0 0 0)
    // 3. 完了後 .high-line-reveal を scaleX: 1 -> 0 (origin right/left) 0.75s
    // 4. 行ごとに stagger 0.08s
    revealBars.forEach((bar, idx) => {
      const inner = lineInners[idx];
      const lineTl = gsap.timeline();

      // 初期 origin 設定
      gsap.set(bar, { transformOrigin: 'left center', scaleX: 0 });
      gsap.set(inner, { clipPath: 'inset(0 100% 0 0)' });

      const disappearOrigin = direction === 'left' ? 'left center' : 'right center';

      lineTl
        .to(bar, {
          scaleX: 1,
          duration: 0.75,
          ease: 'cubicDefault',
        })
        .to(
          inner,
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.75,
            ease: 'cubicDefault',
          },
          '<'
        )
        .set(bar, { transformOrigin: disappearOrigin })
        .to(bar, {
          scaleX: 0,
          duration: 0.75,
          ease: 'cubicDefault',
        });

      tl.add(lineTl, idx * 0.08);
    });
  });
}

// M2. 文字ホバー (data-anim="text-hover")
export function initTextHovers() {
  const elements = document.querySelectorAll('[data-anim="text-hover"]');

  elements.forEach((el) => {
    // 既にラップ済みならスキップ
    if (el.querySelector('.text-hover-w')) return;

    const originalText = el.textContent.trim();
    el.innerHTML = `
      <span class="text-hover-w">
        <span class="text-hover-primary"></span>
        <span class="text-hover-secondary"></span>
      </span>
    `;

    const primary = el.querySelector('.text-hover-primary');
    const secondary = el.querySelector('.text-hover-secondary');

    primary.textContent = originalText;
    secondary.textContent = originalText;

    const splitPrimary = new SplitText(primary, { type: 'chars', charsClass: 'text-hover-char' });
    const splitSecondary = new SplitText(secondary, { type: 'chars', charsClass: 'text-hover-char' });

    let hoverTween = null;

    el.addEventListener('mouseenter', () => {
      if (hoverTween) hoverTween.kill();
      hoverTween = gsap.timeline();
      hoverTween
        .to(splitPrimary.chars, {
          y: '-100%',
          duration: 0.5,
          ease: 'expo.out',
          stagger: 0.02,
        })
        .to(
          splitSecondary.chars,
          {
            y: '-100%',
            duration: 0.5,
            ease: 'expo.out',
            stagger: 0.02,
          },
          '<'
        );
    });

    el.addEventListener('mouseleave', () => {
      if (hoverTween) hoverTween.kill();
      hoverTween = gsap.timeline();
      hoverTween
        .to(splitPrimary.chars, {
          y: '0%',
          duration: 0.5,
          ease: 'expo.out',
          stagger: 0.02,
        })
        .to(
          splitSecondary.chars,
          {
            y: '0%',
            duration: 0.5,
            ease: 'expo.out',
            stagger: 0.02,
          },
          '<'
        );
    });
  });
}

// M3. 楕円クリップ開閉 (data-oval)
export function initOvalClips() {
  const elements = document.querySelectorAll('[data-oval]');

  elements.forEach((el) => {
    // 自動開閉（スクロール時 top 80% で発火）
    if (el.dataset.ovalAuto !== 'manual') {
      gsap.fromTo(
        el,
        { clipPath: 'ellipse(20% 0% at 50% 0%)' },
        {
          clipPath: 'ellipse(120% 100% at 50% 0%)',
          duration: 0.75,
          ease: 'cubicDefault',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }
  });
}

// M4. パララックスY (data-parallax="<px>")
export function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');

  elements.forEach((el) => {
    const px = parseFloat(el.getAttribute('data-parallax')) || 100;
    const parentSection = el.closest('section') || el.parentElement;

    gsap.fromTo(
      el,
      { y: 0 },
      {
        y: -px,
        ease: 'none',
        scrollTrigger: {
          trigger: parentSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      }
    );
  });
}

// M5. ボタン初期化 (SVG矢印補完と文字ホバー)
export function initButtons() {
  const buttons = document.querySelectorAll('.btn-w');

  buttons.forEach((btn) => {
    // 矢印がない場合は追加
    if (!btn.querySelector('.btn-arrow')) {
      const arrowSpan = document.createElement('span');
      arrowSpan.className = 'btn-arrow';
      arrowSpan.innerHTML = `
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.5 6H10.5M10.5 6L6 1.5M10.5 6L6 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      const inner = btn.querySelector('.btn-inner');
      if (inner) {
        inner.appendChild(arrowSpan);
      } else {
        const textNode = btn.childNodes[0];
        const span = document.createElement('span');
        span.className = 'btn-inner';
        if (textNode) span.appendChild(textNode);
        span.appendChild(arrowSpan);
        btn.appendChild(span);
      }
    }

    // テキストに M2 適用
    const inner = btn.querySelector('.btn-inner');
    if (inner) {
      const textEl = inner.querySelector('.btn-text');
      if (textEl && !textEl.hasAttribute('data-anim')) {
        textEl.setAttribute('data-anim', 'text-hover');
      }
    }
  });

  initTextHovers();
}

// M6. テーマ切替 (data-theme-trigger="dark|light")
export function initThemeTriggers() {
  const triggers = document.querySelectorAll('[data-theme-trigger]');
  const body = document.body;
  const nav = document.querySelector('.nav');

  const themes = {
    dark: {
      bgColor: '#282c20',
      textColor: '#f4f4ed',
      navTheme: 'dark',
    },
    light: {
      bgColor: '#f4f4ed',
      textColor: '#111112',
      navTheme: 'light',
    },
    black: {
      bgColor: '#111112',
      textColor: '#f4f4ed',
      navTheme: 'dark',
    },
  };

  triggers.forEach((trigger) => {
    const themeName = trigger.getAttribute('data-theme-trigger');
    const theme = themes[themeName] || themes.dark;

    ScrollTrigger.create({
      trigger: trigger,
      start: 'top 50%',
      onEnter: () => {
        applyTheme(theme);
      },
      onEnterBack: () => {
        applyTheme(theme);
      },
    });
  });

  function applyTheme(theme) {
    // 0.75s 補間で背景色を変更（瞬時切替禁止）
    gsap.to(body, {
      backgroundColor: theme.bgColor,
      color: theme.textColor,
      duration: 0.75,
      ease: 'power1.inOut',
    });

    if (nav) {
      nav.setAttribute('data-nav-theme', theme.navTheme);
    }
  }
}
