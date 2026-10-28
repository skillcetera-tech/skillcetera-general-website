/** Progressively enhance the existing department disclosures on /join. */
(function initDesertAccordion() {
  const triggers = document.querySelectorAll('.ds-dept-trigger');

  triggers.forEach((trigger) => {
    const body = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!body) return;

    // The server-rendered document exposes every JD when JavaScript is unavailable.
    trigger.setAttribute('aria-expanded', 'false');
    body.hidden = true;

    trigger.addEventListener('click', () => {
      const opening = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(opening));
      body.hidden = !opening;
    });
  });
})();

(function initFilloutLoading() {
  const shell = document.querySelector('.ds-fillout-shell');
  const embed = shell?.querySelector('.ds-fillout-embed');
  if (!shell || !embed || typeof MutationObserver === 'undefined') return;

  shell.classList.add('is-loading');
  shell.setAttribute('aria-busy', 'true');
  let activeFrame = null;
  const attachFrame = () => {
    const frame = embed.querySelector('iframe');
    if (!frame || frame === activeFrame) return;

    activeFrame = frame;
    frame.addEventListener('load', () => {
      shell.classList.add('is-loaded');
      shell.classList.remove('is-loading');
      shell.setAttribute('aria-busy', 'false');
      observer.disconnect();
    }, { once: true });
  };
  const observer = new MutationObserver(attachFrame);

  observer.observe(embed, { childList: true, subtree: true });
  attachFrame();
})();
