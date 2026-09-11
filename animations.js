const previewHeader = document.querySelector('[data-header], .legal-simple-header');
const previewMenu = document.querySelector('[data-nav-toggle]');
const previewNav = document.querySelector('[data-nav]');

window.lucide?.createIcons({ attrs: { 'stroke-width': 1.6 } });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && previewNav?.classList.contains('is-open')) {
    previewNav.classList.remove('is-open');
    previewMenu?.setAttribute('aria-expanded', 'false');
    previewMenu?.focus();
  }
});

// Anchor targets inside mission details must remain visible below the compact header.
function revealTarget() {
  const target = document.getElementById(location.hash.slice(1));
  if (!target) return;
  for (let parent = target.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS') parent.open = true;
  }
}
window.addEventListener('hashchange', revealTarget);
revealTarget();

if (previewHeader) {
  const syncHeight = () => document.documentElement.style.setProperty('--header-height', `${previewHeader.offsetHeight}px`);
  new ResizeObserver(syncHeight).observe(previewHeader);
  syncHeight();
}

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const runningAnimations = new Set();
const motionCurve = 'cubic-bezier(.22, 1, .36, 1)';

function animateElement(element, keyframes, options) {
  if (motionPreference.matches || !element.animate) return null;
  const animation = element.animate(keyframes, options);
  runningAnimations.add(animation);
  const release = () => runningAnimations.delete(animation);
  animation.addEventListener('finish', release, { once: true });
  animation.addEventListener('cancel', release, { once: true });
  return animation;
}

function revealElement(element, delay = 0) {
  animateElement(element, [
    { opacity: 0, transform: 'translateY(22px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ], { duration: 620, delay, easing: motionCurve, fill: 'backwards' });
}

// Content stays visible without JavaScript or when motion is disabled.
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      entry.target.dataset.revealed = 'true';
      revealElement(entry.target, delay);
      delay = Math.min(delay + 70, 210);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });

  document.querySelectorAll([
    '.section-heading', '.intro > div', '.intro > p', '.service-card',
    '.target-card', '.field-copy', '.field-image', '.mission-card',
    '.dossier-copy', '.dossier-image', '.ai-copy', '.ai-features article',
    '.sector-grid article', '.contact-copy', '.contact-form',
  ].join(',')).forEach((element) => revealObserver.observe(element));
}

if (!location.hash || location.hash === '#accueil') {
  document.querySelectorAll('.hero-content > *').forEach((element, index) => {
    revealElement(element, index * 70);
  });
}

document.querySelectorAll('.content-details').forEach((details) => {
  const summary = details.querySelector('summary');
  if (!summary) return;
  const state = { details, summary, targetOpen: details.open, animation: null };

  function complete() {
    state.animation = null;
    details.open = state.targetOpen;
    details.style.removeProperty('overflow');
    summary.setAttribute('aria-expanded', String(details.open));
  }

  summary.addEventListener('click', (event) => {
    if (motionPreference.matches || !details.animate) return;
    event.preventDefault();
    const startHeight = details.getBoundingClientRect().height;
    state.targetOpen = state.animation ? !state.targetOpen : !details.open;
    state.animation?.cancel();
    details.open = true;
    details.style.overflow = 'hidden';
    summary.setAttribute('aria-expanded', String(state.targetOpen));
    const endHeight = state.targetOpen
      ? details.getBoundingClientRect().height
      : summary.getBoundingClientRect().height;
    state.animation = animateElement(details, [
      { height: `${startHeight}px` },
      { height: `${endHeight}px` },
    ], { duration: 320, easing: motionCurve });
    if (state.animation) state.animation.addEventListener('finish', complete, { once: true });
    else complete();
  });

  details.addEventListener('toggle', () => {
    if (!state.animation) {
      state.targetOpen = details.open;
      summary.setAttribute('aria-expanded', String(details.open));
    }
  });
});

motionPreference.addEventListener('change', () => {
  if (!motionPreference.matches) return;
  runningAnimations.forEach((animation) => animation.finish());
});

let progressFrame = 0;
function updateProgress() {
  progressFrame = 0;
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const progress = distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
  previewHeader?.style.setProperty('--scroll-progress', progress);
}
function queueProgress() {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
}
window.addEventListener('scroll', queueProgress, { passive: true });
window.addEventListener('resize', queueProgress);
document.addEventListener('toggle', queueProgress, true);
document.documentElement.classList.add('motion-enabled');
queueProgress();
