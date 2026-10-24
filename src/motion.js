const DESKTOP_QUERY = '(min-width: 1024px) and (min-height: 760px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

/** Enhance the document with Petalyx-inspired choreography while keeping all content accessible. */
export function initMotion() {
  window.skillceteraMotion?.destroy?.();

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const scenes = [...document.querySelectorAll('.event-scene')];
  const pinnedScenes = new Map();
  const listeners = [];
  let destroyed = false;
  let refreshTimer = 0;
  let refreshFrame = 0;
  let rebuildPins = null;
  let media = null;
  let observer = null;
  let internalFocus = false;
  let introPlayed = false;

  const isReduced = () => window.matchMedia(REDUCED_QUERY).matches;
  const isMobile = () => window.innerWidth <= 760;

  // 1) Split .split headings into <span class="w"> per word while preserving <br> and <em>
  function splitWords(el) {
    if (el.dataset.splitDone === 'true') return;
    const plainText = el.textContent.replace(/\s+/g, ' ').trim();
    if (plainText && !el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', plainText);
    }
    function walk(node) {
      const children = [...node.childNodes];
      node.innerHTML = '';
      children.forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              node.appendChild(document.createTextNode(part));
            } else {
              const span = document.createElement('span');
              span.className = 'w';
              span.setAttribute('aria-hidden', 'true');
              span.textContent = part;
              node.appendChild(span);
            }
          });
        } else if (child.nodeType === 1) {
          if (child.tagName === 'BR') {
            node.appendChild(child.cloneNode());
          } else {
            const clone = child.cloneNode(true);
            walk(clone);
            node.appendChild(clone);
          }
        }
      });
    }
    walk(el);
    el.dataset.splitDone = 'true';
  }
  document.querySelectorAll('.split').forEach(splitWords);

  // 2) Generate .sq-field grid squares
  document.querySelectorAll('.sq-field').forEach((field) => {
    if (field.dataset.ready === 'true') return;
    field.dataset.ready = 'true';
    Object.assign(field.style, {
      position: 'absolute',
      inset: '0 0 auto 0',
      height: '42%',
      zIndex: '1',
      pointerEvents: 'none',
      webkitMaskImage: 'linear-gradient(#000, transparent)',
      maskImage: 'linear-gradient(#000, transparent)',
    });
    const count = Number(field.dataset.count || 16);
    for (let i = 0; i < count; i++) {
      const sq = document.createElement('span');
      sq.className = 'grid-sq';
      const col = (i * 7 + 3) % 28;
      const row = (i * 3 + 1) % 6;
      Object.assign(sq.style, {
        width: '46px',
        height: '46px',
        left: `${col * 48 - 10}px`,
        top: `${row * 48 + 6}px`,
        opacity: isReduced() ? '0.35' : '0',
      });
      field.appendChild(sq);
      if (gsap && !isReduced()) {
        gsap.to(sq, {
          opacity: 0.9,
          yoyo: true,
          repeat: -1,
          duration: 1.2,
          delay: (i % 5) * 0.55,
          repeatDelay: 0.8 + (i % 4) * 0.6,
        });
      }
    }
  });

  // 3) Generate #heroGlass frosted squares
  const heroGlass = document.getElementById('heroGlass');
  if (heroGlass && !heroGlass.dataset.ready) {
    heroGlass.dataset.ready = 'true';
    const coords = [
      [3, 64], [3, 71], [6.5, 71], [10, 71], [3, 78],
      [-1, 70],
      [45.5, 76], [49, 80], [49, 76], [52.5, 76],
      [86, 58], [86, 67], [82, 76], [89.5, 76], [86, 84],
    ];
    coords.forEach(([x, y], idx) => {
      if (isMobile() && idx % 2 === 1) return;
      const sq = document.createElement('span');
      sq.className = 'glass';
      const isCenter = x > 40 && x < 60;
      const size = isCenter ? 'clamp(28px, 3.4vw, 44px)' : 'clamp(36px, 5.2vw, 70px)';
      Object.assign(sq.style, {
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        aspectRatio: '1',
      });
      heroGlass.appendChild(sq);
      if (gsap && !isReduced()) {
        gsap.to(sq, {
          opacity: 0.18,
          duration: 0.95,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: (idx % 6) * 0.4,
          repeatDelay: 1 + (idx % 4) * 0.6,
        });
      }
    });
  }

  // 4) Generate #petals falling particles in #connect
  const petalsWrap = document.getElementById('petals');
  if (petalsWrap && !petalsWrap.dataset.ready) {
    petalsWrap.dataset.ready = 'true';
    const colors = ['#ffffff', '#9bb5ff', '#ff9eae'];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      const dx = ((i % 7) - 3) * 24;
      const dur = 10 + (i % 6) * 1.4;
      const delay = -(i * 0.85);
      const scale = 0.65 + (i % 5) * 0.16;
      p.style.left = `${(i * 5.5 + 3) % 98}%`;
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dx', `${dx}px`);
      p.style.animationDuration = `${dur}s`;
      p.style.animationDelay = `${delay}s`;
      p.style.transform = `scale(${scale})`;
      petalsWrap.appendChild(p);
    }
  }

  // Clear body.intro immediately so #app has no scale transform that would distort ScrollTrigger pin offsets
  document.body.classList.remove('intro');
  document.querySelector('.backdrop')?.remove();

  function headerHeight() {
    return 76;
  }

  function getTarget(id) {
    try {
      return document.getElementById(decodeURIComponent(String(id).replace(/^#/, '')));
    } catch {
      return null;
    }
  }

  function scrollToSection(id, { behavior = 'smooth', focus = true } = {}) {
    const target = getTarget(id);
    if (!target) return false;

    const scene = target.closest('.event-scene');
    const trigger = scene && pinnedScenes.get(scene);
    const top = trigger
      ? trigger.start + (trigger.end - trigger.start) * 0.45
      : target.getBoundingClientRect().top + window.scrollY - headerHeight() - 16;

    const resolvedBehavior = isReduced() ? 'instant' : behavior;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: resolvedBehavior,
    });
    if (resolvedBehavior !== 'smooth') {
      window.dispatchEvent(new Event('scroll'));
      ScrollTrigger?.update();
    }

    if (focus) {
      const heading = target.matches('h1,h2,h3') ? target : target.querySelector('h1,h2,h3');
      const focusTarget = heading || target;
      if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
      internalFocus = true;
      try {
        focusTarget.focus({ preventScroll: true });
      } finally {
        internalFocus = false;
      }
    }

    return true;
  }

  function refresh() {
    if (destroyed || !ScrollTrigger) return;
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        if (destroyed) return;
        rebuildPins?.();
        ScrollTrigger.update();
        ScrollTrigger.refresh();
      });
    }, 90);
  }

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    window.clearTimeout(refreshTimer);
    cancelAnimationFrame(refreshFrame);
    observer?.disconnect();
    listeners.forEach((remove) => remove());
    media?.revert();
    pinnedScenes.clear();
    if (window.skillceteraMotion === api) delete window.skillceteraMotion;
  }

  const api = { scrollToSection, refresh, destroy };
  window.skillceteraMotion = api;

  if (!gsap || !ScrollTrigger) return api;

  gsap.registerPlugin(ScrollTrigger);
  media = gsap.matchMedia();

  media.add(
    { desktop: DESKTOP_QUERY, reduced: REDUCED_QUERY, all: 'all' },
    ({ conditions }) => {
      let sceneContext = null;
      let previousFit = '';

      function setSceneCounters(scene, progress) {
        scene.querySelectorAll('.card b[data-to]').forEach((b) => {
          const to = Number(b.dataset.to);
          const dec = Number(b.dataset.dec || 0);
          const suf = b.dataset.suf || '';
          const val = (to * progress).toFixed(dec);
          b.textContent = `${val}${suf}`;
        });
      }

      function setupPins() {
        const availableHeight = window.innerHeight - headerHeight();
        const fittingScenes = conditions.desktop && !conditions.reduced
          ? scenes.filter((scene) => {
              const inner = scene.querySelector('.event-inner');
              return inner && inner.scrollHeight <= availableHeight + 2;
            })
          : [];
        const signature = fittingScenes.map((scene) => scene.id).join('|');
        if (signature === previousFit) return;
        previousFit = signature;

        sceneContext?.revert();
        pinnedScenes.clear();
        sceneContext = gsap.context(() => {
          fittingScenes.forEach((scene) => {
            const inner = scene.querySelector('.event-inner');
            const treeWrap = scene.querySelector('.tree-wrap');
            const image = scene.querySelector('.event-photo img');
            const ghost = scene.querySelector('.event-ghost');
            const graphic = scene.querySelector('.event-graphic');
            const direction = scene.dataset.event === 'tedx' ? -1 : 1;
            const counterProxy = { p: 1 };

            const timeline = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: scene,
                pin: inner,
                start: () => `top ${headerHeight()}px`,
                end: () => `+=${Math.round(window.innerHeight * 0.9)}`,
                scrub: 0.35,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });

            // 20% entrance (stage photo rises + counters reach 100%), 60% stable reading, 20% subtle exit
            if (treeWrap) {
              timeline.fromTo(treeWrap, { yPercent: 32 }, { yPercent: 0, duration: 0.2 }, 0);
              timeline.to(treeWrap, { yPercent: -4, duration: 0.2 }, 0.8);
            }
            if (image) {
              timeline.fromTo(image, { scale: 1.05 }, { scale: 1, duration: 0.2 }, 0);
              timeline.to(image, { scale: 1.02, duration: 0.2 }, 0.8);
            }
            if (ghost) {
              timeline.fromTo(ghost, { x: direction * -16 }, { x: 0, duration: 0.2 }, 0);
              timeline.to(ghost, { x: direction * 16, duration: 0.2 }, 0.8);
            }
            if (graphic) {
              timeline.fromTo(
                graphic,
                { scaleX: 0.78, transformOrigin: direction > 0 ? 'left center' : 'right center' },
                { scaleX: 1, duration: 0.2 },
                0,
              );
              timeline.to(graphic, { scaleX: 0.94, duration: 0.2 }, 0.8);
            }
            timeline.fromTo(
              counterProxy,
              { p: 0.35 },
              {
                p: 1,
                duration: 0.2,
                onUpdate: () => setSceneCounters(scene, counterProxy.p),
              },
              0,
            );
            setSceneCounters(scene, 1);

            pinnedScenes.set(scene, timeline.scrollTrigger);
          });
        });
      }

      rebuildPins = setupPins;
      setupPins();

      if (conditions.reduced) {
        scenes.forEach((scene) => setSceneCounters(scene, 1));
        gsap.set('.reveal, .w', { clearProps: 'opacity,visibility,transform,filter' });
      } else {
        // Hero intro word & glass reveal (run once so resize does not re-blur)
        const heroWords = document.querySelectorAll('#hero-title .w');
        if (heroWords.length && !introPlayed) {
          introPlayed = true;
          gsap.fromTo(
            heroWords,
            { opacity: 0, y: 16, filter: 'blur(6px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.35, stagger: 0.025, ease: 'power3.out' },
          );
        }

        // Hero parallax on scroll
        const hero = document.querySelector('.hero');
        if (hero && conditions.desktop) {
          const heroTl = gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
          heroTl.to('#heroCopy', { yPercent: -35, ease: 'none' }, 0);
          document.querySelectorAll('.hero [data-par]').forEach((el) => {
            const par = Number(el.dataset.par || 0);
            heroTl.to(el, { y: par * 1.6, ease: 'none' }, 0);
          });
          heroTl.to('.hero-media img', { yPercent: 6, scale: 1.035, ease: 'none' }, 0);
        }

        // Reveal elements
        gsap.utils.toArray('.reveal').forEach((element) => {
          gsap.fromTo(
            element,
            { y: 16, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: 'power2.out',
              scrollTrigger: { trigger: element, start: 'top 93%', once: true },
            },
          );
        });

        // Split headings in sections below hero
        document.querySelectorAll('#about .split, #esc .split, #tedx .split, #projects .split, #community .split, #connect .split').forEach((heading) => {
          const words = heading.querySelectorAll('.w');
          if (!words.length) return;
          gsap.fromTo(
            words,
            { opacity: 0, y: 18, filter: 'blur(6px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.75,
              stagger: 0.045,
              ease: 'power3.out',
              scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
            },
          );
        });

        // CTA backdrop parallax
        const ctaImg = document.getElementById('ctaImg');
        if (ctaImg) {
          gsap.fromTo(
            ctaImg,
            { yPercent: -10 },
            {
              yPercent: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: '#connect',
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: true,
              },
            },
          );
        }

        // Footer animated SVG logo (Petalyx style)
        const dots = [...document.querySelectorAll('#footer .fdot')];
        if (dots.length === 3) {
          const footerTl = gsap.timeline({
            scrollTrigger: {
              trigger: '#footer',
              start: 'top 95%',
              once: true,
            },
          });
          footerTl
            .to(dots, {
              y: -7,
              duration: 0.22,
              stagger: 0.07,
              yoyo: true,
              repeat: 3,
              ease: 'sine.inOut',
            })
            .to(dots, {
              attr: { cx: 27, cy: 50 },
              y: 0,
              duration: 0.4,
              ease: 'power3.inOut',
            })
            .to([dots[1], dots[2]], { opacity: 0, duration: 0.1 })
            .to('#fMark', { strokeDashoffset: 0, duration: 0.55, ease: 'power3.out' }, '-=0.05')
            .to(dots[0], { attr: { r: 5.5 }, duration: 0.35, ease: 'back.out(3)' }, '<')
            .to('#fRing', { strokeDashoffset: 0, duration: 0.85, ease: 'power2.inOut' }, '-=0.3');
        }
      }

      return () => {
        rebuildPins = null;
        sceneContext?.revert();
        pinnedScenes.clear();
      };
    },
  );

  listen(document, 'focusin', (event) => {
    if (!(event.target instanceof Element)) return;

    const reveal = event.target.closest('.reveal');
    if (reveal) {
      gsap.killTweensOf(reveal);
      gsap.set(reveal, { clearProps: 'opacity,visibility,transform' });
    }

    if (internalFocus) return;

    const scene = event.target.closest('.event-scene');
    const trigger = scene && pinnedScenes.get(scene);
    if (!trigger) return;

    const bounds = event.target.getBoundingClientRect();
    const outsideReadingPhase = trigger.progress < 0.2 || trigger.progress > 0.8;
    if (outsideReadingPhase || bounds.top < headerHeight() || bounds.bottom > window.innerHeight) {
      scrollToSection(scene.id, { behavior: 'instant', focus: false });
      ScrollTrigger.update();
    }
  });

  listen(window, 'resize', refresh, { passive: true });
  listen(window, 'hashchange', () => {
    if (window.location.hash) scrollToSection(window.location.hash, { behavior: 'instant', focus: false });
  });

  document.querySelectorAll('img').forEach((image) => {
    if (image.complete) return;
    listen(image, 'load', refresh, { once: true });
    listen(image, 'error', refresh, { once: true });
  });
  document.fonts?.ready.then(() => {
    if (!destroyed) refresh();
  });

  if ('ResizeObserver' in window) {
    const heights = new WeakMap();
    observer = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const nextHeight = Math.round(entry.target.scrollHeight);
        const prevHeight = heights.get(entry.target);
        if (prevHeight === undefined) {
          heights.set(entry.target, nextHeight);
        } else if (Math.abs(nextHeight - prevHeight) > 2) {
          heights.set(entry.target, nextHeight);
          changed = true;
        }
      }
      if (changed) refresh();
    });
    scenes.forEach((scene) => {
      const inner = scene.querySelector('.event-inner');
      if (inner) observer.observe(inner);
    });
  }

  refreshFrame = requestAnimationFrame(() => {
    if (destroyed) return;
    ScrollTrigger.refresh();
    if (window.location.hash) scrollToSection(window.location.hash, { behavior: 'instant', focus: false });
  });

  return api;
}
