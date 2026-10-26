/**
 * join.js — Department accordion for /join page
 * Expands/collapses .dept-body panels with keyboard support.
 * Accessible: aria-expanded, aria-controls, keyboard Enter/Space.
 * Reduced motion: no animation, instant show/hide via hidden attribute.
 */

(function initJoinAccordion() {
  const triggers = document.querySelectorAll('.dept-trigger');
  if (!triggers.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Open a dept body with a short height-from-zero animation (unless reduced motion).
   * @param {HTMLElement} body
   */
  function openBody(body) {
    body.removeAttribute('hidden');

    if (prefersReduced) return;

    // Animate max-height from 0 → scrollHeight
    body.style.overflow = 'hidden';
    body.style.maxHeight = '0';
    body.style.transition = 'max-height 320ms cubic-bezier(0.16, 1, 0.3, 1)';

    requestAnimationFrame(() => {
      body.style.maxHeight = body.scrollHeight + 'px';
    });

    body.addEventListener('transitionend', function onEnd() {
      body.style.maxHeight = '';
      body.style.overflow = '';
      body.style.transition = '';
      body.removeEventListener('transitionend', onEnd);
    }, { once: true });
  }

  /**
   * Close a dept body with a short animation (unless reduced motion).
   * @param {HTMLElement} body
   */
  function closeBody(body) {
    if (prefersReduced) {
      body.setAttribute('hidden', '');
      return;
    }

    body.style.overflow = 'hidden';
    body.style.maxHeight = body.scrollHeight + 'px';
    body.style.transition = 'max-height 260ms cubic-bezier(0.55, 0, 0.45, 1)';

    requestAnimationFrame(() => {
      body.style.maxHeight = '0';
    });

    body.addEventListener('transitionend', function onEnd() {
      body.setAttribute('hidden', '');
      body.style.maxHeight = '';
      body.style.overflow = '';
      body.style.transition = '';
      body.removeEventListener('transitionend', onEnd);
    }, { once: true });
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const bodyId = trigger.getAttribute('aria-controls');
      const body = document.getElementById(bodyId);
      if (!body) return;

      if (expanded) {
        trigger.setAttribute('aria-expanded', 'false');
        closeBody(body);
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        openBody(body);
      }
    });
  });
})();
