import { initEventScenes } from './event-scenes.js';
import { initChapterScroll } from './chapter-scroll.js';

const DESKTOP_QUERY = '(min-width: 1024px) and (min-height: 760px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

export function splitWords(element) {
  if (!element || element.dataset.splitDone === 'true') return;
  element.setAttribute('aria-label', element.textContent.replace(/\s+/g, ' ').trim());
  function walk(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).filter(Boolean).forEach(part => {
          if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
          else {
            const word = document.createElement('span');
            word.className = 'w';
            word.setAttribute('aria-hidden', 'true');
            word.textContent = part;
            fragment.append(word);
          }
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') walk(child);
    });
  }
  walk(element);
  element.dataset.splitDone = 'true';
}

/** Readable sections with optional reveals and independent event-frame alignment. */
export function initMotion() {
  window.skillceteraMotion?.destroy();
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const desktopQuery = window.matchMedia(DESKTOP_QUERY);
  const reducedQuery = window.matchMedia(REDUCED_QUERY);
  const removers = [];
  let effectsContext;
  let frame = 0;
  let destroyed = false;
  let mode = '';

  function listen(target, type, callback, options) {
    target.addEventListener(type, callback, options);
    removers.push(() => target.removeEventListener(type, callback, options));
  }

  function headerOffset() {
    const header = document.querySelector('.site-header');
    return header ? (parseFloat(getComputedStyle(header).top) || 0) + header.offsetHeight + 10 : 76;
  }

  document.querySelectorAll('.split').forEach(splitWords);
  document.body.classList.remove('intro');
  document.querySelector('.backdrop')?.remove();
  const events = initEventScenes({ headerOffset });
  const chapters = initChapterScroll();

  function buildEffects(reduced, desktop) {
    effectsContext?.revert();
    effectsContext = gsap.context(() => {
      if (reduced) return;
      const heroHeading = document.querySelector('#hero-title');
      if (heroHeading && heroHeading.dataset.motionSeen !== 'true') {
        heroHeading.dataset.motionSeen = 'true';
        gsap.fromTo(heroHeading.querySelectorAll('.w'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: { amount: 0.12 }, ease: 'power2.out' });
      }
      if (desktop && document.querySelector('.hero')) {
        const hero = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 0, end: 'bottom top', scrub: true } });
        hero.to('#heroCopy', { yPercent: -20, ease: 'none' }, 0);
        document.querySelectorAll('.hero [data-par]').forEach(element => hero.to(element, { y: Number(element.dataset.par || 0), ease: 'none' }, 0));
        hero.to('.hero-media img', { yPercent: 3, ease: 'none' }, 0);
      }
      document.querySelectorAll('.reveal:not(.event-scene .reveal)').forEach(element => {
        if (element.dataset.motionSeen === 'true') return;
        gsap.fromTo(element, { y: 16, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 93%', once: true, onEnter: () => { element.dataset.motionSeen = 'true'; } },
        });
      });
      document.querySelectorAll('#about .split, #bridge .split, #projects .split, #connect .split').forEach(heading => {
        if (heading.dataset.motionSeen === 'true') return;
        gsap.fromTo(heading.querySelectorAll('.w'), { y: 12, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.6, stagger: { amount: 0.12 }, ease: 'power2.out',
          scrollTrigger: { trigger: heading, start: 'top 90%', once: true, onEnter: () => { heading.dataset.motionSeen = 'true'; } },
        });
      });
      if (desktop && document.getElementById('ctaImg')) gsap.fromTo('#ctaImg', { yPercent: -3 }, {
        yPercent: 0, ease: 'none', scrollTrigger: { trigger: '#connect', start: 'top bottom', end: 'bottom bottom', scrub: true },
      });
    });
  }

  function syncLayout() {
    if (destroyed || !gsap || !ScrollTrigger) return;
    const desktop = desktopQuery.matches;
    const reduced = reducedQuery.matches;
    const nextMode = `${desktop}:${reduced}`;
    events.refresh();
    if (mode !== nextMode) buildEffects(reduced, desktop);
    mode = nextMode;
    ScrollTrigger.refresh();
  }

  function refresh() {
    if (destroyed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; syncLayout(); });
  }

  function scrollToSection(id, { behavior = 'smooth', focus = false } = {}) {
    let target;
    try { target = document.getElementById(decodeURIComponent(String(id).replace(/^#/, ''))); } catch { return false; }
    if (!target || destroyed) return false;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    const instant = reducedQuery.matches || behavior !== 'smooth';
    window.scrollTo({ top: Math.max(0, top), behavior: instant ? 'instant' : 'smooth' });
    if (instant) { window.dispatchEvent(new Event('scroll')); ScrollTrigger?.update(); }
    if (focus) {
      const element = target.matches('h1,h2,h3') ? target : target.querySelector('h1,h2,h3') || target;
      if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
      element.focus({ preventScroll: true });
    }
    return true;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frame);
    removers.forEach(remove => remove());
    events.destroy();
    chapters.destroy();
    effectsContext?.revert();
    if (window.skillceteraMotion === api) delete window.skillceteraMotion;
  }

  const api = { scrollToSection, refresh, destroy, splitWords };
  window.skillceteraMotion = api;
  if (!gsap || !ScrollTrigger) return api;
  gsap.registerPlugin(ScrollTrigger);
  syncLayout();
  listen(window, 'resize', refresh, { passive: true });
  listen(desktopQuery, 'change', refresh);
  listen(reducedQuery, 'change', refresh);
  listen(window, 'hashchange', () => { if (location.hash) scrollToSection(location.hash, { behavior: 'instant', focus: false }); });
  listen(document, 'focusin', event => {
    if (!(event.target instanceof Element)) return;
    const reveal = event.target.closest('.reveal');
    if (reveal) {
      reveal.dataset.motionSeen = 'true';
      gsap.killTweensOf(reveal);
      gsap.set(reveal, { clearProps: 'opacity,visibility,transform' });
    }
  });
  document.querySelectorAll('img').forEach(image => {
    listen(image, 'load', refresh);
    listen(image, 'error', refresh);
  });
  document.fonts?.ready.then(refresh);
  return api;
}
