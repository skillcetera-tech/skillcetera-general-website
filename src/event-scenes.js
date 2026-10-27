const DESKTOP = '(min-width: 1024px) and (min-height: 760px)';
const REDUCED = '(prefers-reduced-motion: reduce)';
const COUNT_MS = 2000;

/** Run counter animations naturally as event scenes scroll into view without scroll-snapping. */
export function initEventScenes({ headerOffset = () => 76 } = {}) {
  const scenes = [...document.querySelectorAll('.event-scene')];
  const desktop = matchMedia(DESKTOP);
  const reduced = matchMedia(REDUCED);
  const counters = new Map();
  const runs = new Map();
  const removers = [];
  let destroyed = false;
  let layoutFrame = 0;
  let observer;

  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    removers.push(() => target.removeEventListener(type, handler, options));
  };

  const frameTop = scene => scene.querySelector('.event-inner')?.getBoundingClientRect().top ?? 0;
  const destination = scene => frameTop(scene) + scrollY - headerOffset();

  scenes.forEach(scene => {
    delete scene.dataset.frameState;
    const values = [...scene.querySelectorAll('[data-to]')].map(element => {
      const to = Number(element.dataset.to);
      const decimals = Number(element.dataset.dec || 0);
      const suffix = element.dataset.suf || '';
      const final = `${to.toFixed(decimals)}${suffix}`;
      let visual = element.querySelector('.event-counter-value');
      if (!visual) {
        visual = document.createElement('span');
        visual.className = 'event-counter-value';
        visual.setAttribute('aria-hidden', 'true');
        const accessible = document.createElement('span');
        accessible.className = 'event-counter-accessible';
        accessible.textContent = final;
        element.replaceChildren(visual, accessible);
      }
      visual.textContent = final;
      return { visual, to, decimals, suffix, final };
    });
    counters.set(scene, values);
  });

  function finish(scene) {
    const run = runs.get(scene);
    if (run) cancelAnimationFrame(run.frame);
    runs.delete(scene);
    counters.get(scene)?.forEach(counter => { counter.visual.textContent = counter.final; });
    if (scene.dataset.eventCounted === 'true') scene.dataset.counterState = 'complete';
  }

  function count(scene) {
    if (destroyed || !scene || scene.dataset.eventCounted === 'true') return;
    scene.dataset.eventCounted = 'true';
    scene.dataset.counterState = 'running';
    if (reduced.matches) {
      finish(scene);
      return;
    }
    const run = { start: performance.now(), frame: 0 };
    runs.set(scene, run);
    const tick = now => {
      if (destroyed || document.hidden) {
        finish(scene);
        return;
      }
      const progress = Math.min(1, (now - run.start) / COUNT_MS);
      const eased = 1 - (1 - progress) ** 2;
      counters.get(scene)?.forEach(counter => {
        const digits = /M/.test(counter.suffix) && counter.to < 10 ? Math.max(1, counter.decimals) : counter.decimals;
        counter.visual.textContent = progress === 1 ? counter.final : `${(counter.to * eased).toFixed(digits)}${counter.suffix}`;
      });
      if (progress === 1) finish(scene);
      else run.frame = requestAnimationFrame(tick);
    };
    tick(run.start);
  }

  function checkVisibility() {
    if (destroyed) return;
    const vh = window.innerHeight;
    const offset = headerOffset();
    scenes.forEach(scene => {
      if (scene.dataset.eventCounted === 'true') return;
      const rect = scene.getBoundingClientRect();
      if (rect.top < vh * 0.75 && rect.bottom > offset) {
        count(scene);
      }
    });
  }

  function syncLayout() {
    layoutFrame = 0;
    if (destroyed) return;
    const available = Math.max(innerHeight - headerOffset(), 640);
    scenes.forEach(scene => {
      const canFit = desktop.matches && !reduced.matches;
      if (canFit) {
        scene.dataset.motionFit = 'true';
        scene.style.setProperty('--event-frame-height', `${available}px`);
      } else {
        delete scene.dataset.motionFit;
        scene.style.removeProperty('--event-frame-height');
      }
    });
    checkVisibility();
  }

  function refresh() {
    if (!destroyed && !layoutFrame) layoutFrame = requestAnimationFrame(syncLayout);
  }

  function navigate(scene) {
    if (scene) count(scene);
  }

  function arrive(scene) {
    if (scene) count(scene);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(layoutFrame);
    observer?.disconnect();
    removers.forEach(remove => remove());
    scenes.forEach(scene => {
      finish(scene);
      delete scene.dataset.motionFit;
      delete scene.dataset.frameState;
      scene.style.removeProperty('--event-frame-height');
    });
    runs.clear();
  }

  syncLayout();

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          count(entry.target);
        }
      });
    }, { threshold: [0.15, 0.35] });
    scenes.forEach(scene => observer.observe(scene));
  } else {
    listen(window, 'scroll', checkVisibility, { passive: true });
  }

  listen(window, 'resize', refresh, { passive: true });
  listen(desktop, 'change', refresh);
  listen(reduced, 'change', refresh);
  listen(document, 'visibilitychange', () => {
    if (document.hidden) {
      runs.forEach((_, scene) => finish(scene));
    }
  });

  return {
    refresh,
    navigate,
    arrive,
    targetFor: scene => destination(scene),
    destroy,
  };
}
