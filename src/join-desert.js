/**
 * join-desert.js — Department accordion for /join Desert Storm redesign.
 * Uses .ds-dept-trigger / .ds-dept-body / aria-expanded pattern.
 * Reduced-motion: instant show/hide, no animation.
 */
(function initDesertAccordion() {
  const triggers = document.querySelectorAll('.ds-dept-trigger');
  if (!triggers.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function openBody(body) {
    body.removeAttribute('hidden');
    if (prefersReduced) return;

    body.style.overflow = 'hidden';
    body.style.maxHeight = '0';
    body.style.transition = 'max-height 340ms cubic-bezier(0.16, 1, 0.3, 1)';

    requestAnimationFrame(() => {
      body.style.maxHeight = body.scrollHeight + 'px';
    });

    body.addEventListener('transitionend', function cleanup() {
      body.style.maxHeight = '';
      body.style.overflow = '';
      body.style.transition = '';
      body.removeEventListener('transitionend', cleanup);
    }, { once: true });
  }

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

    body.addEventListener('transitionend', function cleanup() {
      body.setAttribute('hidden', '');
      body.style.maxHeight = '';
      body.style.overflow = '';
      body.style.transition = '';
      body.removeEventListener('transitionend', cleanup);
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
