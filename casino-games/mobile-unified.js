(function () {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) document.documentElement.classList.add('reduce-motion');
  document.body.classList.add('ui-shell');

  const root = document.querySelector('.container') || document.querySelector('.page') || document.body;
  const titleEl = document.querySelector('h1');
  const subtitleEl = document.querySelector('.subtitle');
  const backEl = document.querySelector('.back,.back-btn');

  if (root && titleEl && !root.querySelector('.ui-topbar')) {
    const top = document.createElement('header');
    top.className = 'ui-topbar';

    if (backEl) {
      const back = document.createElement('a');
      back.className = 'ui-topbar-back ui-interactive';
      back.href = backEl.getAttribute('href') || 'index.html';
      back.textContent = '← 返回';
      top.appendChild(back);
      backEl.classList.add('ui-source-hidden');
    }

    const titleWrap = document.createElement('div');
    titleWrap.className = 'ui-topbar-titles';

    const t = document.createElement('div');
    t.className = 'ui-topbar-title';
    t.textContent = titleEl.textContent.trim();
    titleWrap.appendChild(t);

    if (subtitleEl && subtitleEl.textContent.trim()) {
      const s = document.createElement('div');
      s.className = 'ui-topbar-subtitle';
      s.textContent = subtitleEl.textContent.trim();
      titleWrap.appendChild(s);
      subtitleEl.classList.add('ui-source-hidden');
    }

    top.appendChild(titleWrap);
    root.insertBefore(top, root.firstChild);
    titleEl.classList.add('ui-source-hidden');
  }

  const sectionSelectors = [
    '.stats', '.status-grid', '.global-balance', '.game-table', '.dealer-area', '.player-area',
    '.controls', '.bet-section', '.dice-area', '.wheel-container', '.cards', '.zones',
    '.resume-panel', '.result-display', '.result-popup', '.box', '.rules', '.head'
  ];

  sectionSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => el.classList.add('ui-section'));
  });

  const clickableSelector = [
    'button', '.btn', '.buy-btn', '.resume-btn', '.back', '.back-btn', '.game-card', '.bet-btn', '.bet-tab',
    '.spin-btn', '.spin-button', '.action-btn', '.reset-button', '.ui-topbar-back'
  ].join(',');

  const clickables = Array.from(document.querySelectorAll(clickableSelector));
  clickables.forEach((el) => {
    el.classList.add('ui-interactive');

    if (!reduceMotion) {
      el.addEventListener('pointerdown', () => el.classList.add('is-pressed'));
      const clear = () => el.classList.remove('is-pressed');
      el.addEventListener('pointerup', clear);
      el.addEventListener('pointerleave', clear);
      el.addEventListener('pointercancel', clear);
    }

    if (el.classList.contains('game-card') && !el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    }
  });

  const primaryButtons = document.querySelectorAll('.btn.pri,.buy-btn,.resume-btn,.spin-btn,.spin-button,.play-btn,.action-btn.deal,#reveal,#spinBtn,#dealBtn');
  primaryButtons.forEach((el) => {
    el.classList.add('ui-primary-cta');
    el.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(8);
    });
  });

  document.querySelectorAll('h1').forEach((h) => h.classList.add('ui-title'));
  document.querySelectorAll('.subtitle').forEach((s) => s.classList.add('ui-subtitle'));
})();
