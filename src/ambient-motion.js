const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
let activeCleanup = null;
const revealedFooterImages = new WeakSet();

/** Shared, optional decoration for the homepage and editorial pages. */
export function initAmbientMotion() {
  activeCleanup?.();

  const reduced = window.matchMedia(REDUCED_QUERY);
  const generated = [];
  const records = [];
  const groups = new Map();
  let destroyed = false;

  const inViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
  };

  const updateRecord = (record) => {
    if (destroyed) return;
    if (reduced.matches) {
      record.animation?.cancel();
      record.animation = null;
      return;
    }
    const canRun = record.visible && !document.hidden;
    if (!canRun) {
      record.animation?.pause();
      return;
    }
    if (record.once && !record.animation && revealedFooterImages.has(record.element)) return;
    if (record.once && record.animation?.playState === 'finished') return;
    if (!record.animation && typeof record.element.animate === 'function') {
      record.animation = record.element.animate(record.keyframes, record.options);
      if (record.once) revealedFooterImages.add(record.element);
    } else {
      record.animation?.play();
    }
  };

  const observeAnimation = (element, group, keyframes, options, once = false) => {
    const record = { element, keyframes, options, once, animation: null, visible: inViewport(group) };
    records.push(record);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(record);
    updateRecord(record);
  };

  const append = (parent, className, styles) => {
    const element = document.createElement('span');
    element.className = className;
    element.dataset.ambientGenerated = 'true';
    Object.assign(element.style, styles);
    parent.appendChild(element);
    generated.push(element);
    return element;
  };

  document.querySelectorAll('.sq-field').forEach((field) => {
    const count = Math.max(0, Math.min(Number(field.dataset.count) || 16, 16));
    for (let index = 0; index < count; index += 1) {
      const square = append(field, 'grid-sq', {
        left: `${5 + ((index * 7 + 3) % 12) * 7.5}%`,
        top: `${8 + ((index * 3 + 1) % 4) * 20}%`,
      });
      observeAnimation(square, field, [{ opacity: 0.16 }, { opacity: 0.46 }, { opacity: 0.16 }], {
        duration: 7000 + (index % 4) * 700,
        delay: -(index % 5) * 900,
        easing: 'ease-in-out',
        iterations: Infinity,
      });
    }
  });

  document.querySelectorAll('.drift-a, .drift-b').forEach((element, index) => {
    const direction = element.classList.contains('drift-b') ? -1 : 1;
    observeAnimation(element, element, [
      { transform: 'translate3d(0, 0, 0)' },
      { transform: `translate3d(${direction * 18}px, 4px, 0)` },
    ], { duration: 16000 + (index % 2) * 2000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
  });

  const petals = document.getElementById('petals');
  if (petals) {
    const colors = ['#ffffff', '#9bb5ff', '#ff9eae'];
    for (let index = 0; index < 12; index += 1) {
      const petal = append(petals, 'petal', {
        left: `${(index * 8.1 + 3) % 98}%`, background: colors[index % colors.length],
      });
      const dx = ((index % 7) - 3) * 18;
      observeAnimation(petal, petals, [
        { transform: 'translate3d(0, -20px, 0) rotate(0deg)', opacity: 0.45 },
        { transform: `translate3d(${dx}px, calc(100vh + 40px), 0) rotate(120deg)`, opacity: 0.1 },
      ], { duration: 16000 + (index % 4) * 1400, delay: -index * 1100, iterations: Infinity, easing: 'linear' });
    }
  }

  document.querySelectorAll('.f-logo-img').forEach((image) => {
    // The logo remains visible before, during and after this small acknowledgment.
    observeAnimation(image, image, [
      { transform: 'scale(1) rotate(0deg)' },
      { transform: 'scale(1.055) rotate(2deg)', offset: 0.4 },
      { transform: 'scale(1) rotate(0deg)' },
    ], { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }, true);
  });

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      groups.get(entry.target)?.forEach((record) => {
        record.visible = entry.isIntersecting;
        updateRecord(record);
      });
    });
  }, { threshold: 0 }) : null;
  groups.forEach((_, element) => observer?.observe(element));

  const sync = () => records.forEach(updateRecord);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);

  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    observer?.disconnect();
    reduced.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    records.forEach((record) => record.animation?.cancel());
    generated.forEach((element) => element.remove());
    if (activeCleanup === cleanup) activeCleanup = null;
  };
  activeCleanup = cleanup;
  return cleanup;
}
