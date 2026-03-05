(function () {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) document.documentElement.classList.add('reduce-motion');

  document.body.classList.add('ui-shell');

  const clickableSelector = [
    'button',
    '.btn',
    '.buy-btn',
    '.resume-btn',
    '.back',
    '.back-btn',
    '.game-card',
    '.bet-btn',
    '.bet-tab'
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

  const primaryButtons = document.querySelectorAll('.btn.pri,.buy-btn,.resume-btn,.spin-btn,.play-btn');
  primaryButtons.forEach((el) => {
    el.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(8);
    });
  });

  const headings = document.querySelectorAll('h1');
  headings.forEach((h) => h.classList.add('ui-title'));

  const subtitles = document.querySelectorAll('.subtitle');
  subtitles.forEach((s) => s.classList.add('ui-subtitle'));
})();
