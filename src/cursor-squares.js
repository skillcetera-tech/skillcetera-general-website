let activeCleanup = null;

/** Optional pointer feedback with the same lifecycle as ambient motion. */
export function initCursorSquares() {
  activeCleanup?.();
  const pointer = window.matchMedia('(pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const squares = new Map();
  let container = null;
  let enabled = false;
  let destroyed = false;
  let frame = 0;
  let pendingPoint = null;
  let lastX = -999;
  let lastY = -999;
  let lastTime = 0;
  let counter = 0;

  const removeSquare = (element) => {
    const timer = squares.get(element);
    if (timer !== undefined) clearTimeout(timer);
    squares.delete(element);
    element.remove();
  };

  const clearEffects = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    pendingPoint = null;
    squares.forEach((timer, element) => {
      clearTimeout(timer);
      element.remove();
    });
    squares.clear();
    container?.remove();
    container = null;
  };

  const spawnSquare = (x, y, burst = false, angle = 0, distance = 0) => {
    if (!enabled || destroyed || !container || reduced.matches) return;
    const square = document.createElement('span');
    counter += 1;
    square.className = 'cursor-sq';
    if (counter % 14 === 0) square.classList.add('accent-tedx');
    else if (counter % 7 === 0) square.classList.add('accent-esc');
    const size = burst ? 16 + Math.floor(Math.random() * 16) : 22 + Math.floor(Math.random() * 18);
    square.style.width = `${size}px`;
    square.style.height = `${size}px`;
    square.style.left = `${x + (burst ? Math.cos(angle) * distance : Math.random() * 16 - 8)}px`;
    square.style.top = `${y + (burst ? Math.sin(angle) * distance : Math.random() * 16 - 8)}px`;
    square.style.setProperty('--rot-start', `${Math.round(Math.random() * 32 - 16)}deg`);
    square.style.setProperty('--rot-mid', `${Math.round(Math.random() * 12 - 6)}deg`);
    square.style.setProperty('--rot-end', `${Math.round(Math.random() * 44 - 22)}deg`);
    square.style.setProperty('--dx', `${Math.round(Math.random() * 26 - 13)}px`);
    container.appendChild(square);
    squares.set(square, setTimeout(() => removeSquare(square), 950));
    square.addEventListener('animationend', () => removeSquare(square), { once: true });
    if (squares.size > 26) removeSquare(squares.keys().next().value);
  };

  const onPointerMove = (event) => {
    pendingPoint = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!enabled || !pendingPoint) return;
      const now = performance.now();
      const { x, y } = pendingPoint;
      const distance = Math.hypot(x - lastX, y - lastY);
      if (distance >= 30 || (now - lastTime > 55 && distance >= 14)) {
        lastX = x;
        lastY = y;
        lastTime = now;
        spawnSquare(x, y);
      }
    });
  };

  const onPointerDown = (event) => {
    if (!enabled || event.isPrimary === false) return;
    for (let index = 0; index < 4; index += 1) {
      spawnSquare(event.clientX, event.clientY, true, index * Math.PI / 2 + Math.random() * 0.4 - 0.2, 18 + Math.random() * 18);
    }
  };

  const sync = () => {
    const next = pointer.matches && !reduced.matches && !document.hidden && !destroyed;
    if (next === enabled) return;
    enabled = next;
    if (enabled) {
      container = document.createElement('div');
      container.id = 'cursor-squares-layer';
      container.setAttribute('aria-hidden', 'true');
      document.body.appendChild(container);
      lastX = lastY = -999;
      lastTime = 0;
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });
    } else {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      clearEffects();
    }
  };

  pointer.addEventListener('change', sync);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();

  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    sync();
    clearEffects();
    pointer.removeEventListener('change', sync);
    reduced.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    if (activeCleanup === cleanup) activeCleanup = null;
  };
  activeCleanup = cleanup;
  return cleanup;
}