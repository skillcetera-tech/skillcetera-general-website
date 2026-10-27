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
