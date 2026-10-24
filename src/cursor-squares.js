/**
 * Hiệu ứng chuyển động các ô vuông frosted glass xuất hiện theo con trỏ chuột.
 * Nhận diện Petalyx: Các khối vuông bán trong suốt (frosted glass) trôi nhẹ và mờ dần,
 * điểm xuyết tinh tế màu xanh ESC (#2457FF) và đỏ TEDx (#EB0028).
 */

export function initCursorSquares() {
  if (typeof window === 'undefined') return () => {};
  // Chỉ chạy trên thiết bị có chuột/trackpad chính xác (không chạy trên điện thoại cảm ứng)
  if (!window.matchMedia('(pointer: fine)').matches) return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  let container = document.getElementById('cursor-squares-layer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'cursor-squares-layer';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
  }

  let lastX = -999;
  let lastY = -999;
  let lastTime = 0;
  let counter = 0;
  const activeSquares = [];
  const MAX_ACTIVE = 26;

  const removeSquare = (el) => {
    const idx = activeSquares.indexOf(el);
    if (idx !== -1) activeSquares.splice(idx, 1);
    if (el.parentNode) el.parentNode.removeChild(el);
  };

  const spawnSquare = (x, y, isBurst = false, burstAngle = 0, burstDist = 0) => {
    counter += 1;
    const sq = document.createElement('span');
    sq.className = 'cursor-sq';

    // Điểm xuyết nhận diện: mỗi 7 ô có 1 ô xanh ESC, mỗi 14 ô có 1 ô đỏ TEDx
    if (counter % 14 === 0) {
      sq.classList.add('accent-tedx');
    } else if (counter % 7 === 0) {
      sq.classList.add('accent-esc');
    }

    const baseSize = isBurst ? 16 + Math.floor(Math.random() * 16) : 22 + Math.floor(Math.random() * 18);
    sq.style.width = `${baseSize}px`;
    sq.style.height = `${baseSize}px`;

    const offsetX = isBurst ? Math.cos(burstAngle) * burstDist : (Math.random() * 16 - 8);
    const offsetY = isBurst ? Math.sin(burstAngle) * burstDist : (Math.random() * 16 - 8);

    sq.style.left = `${x + offsetX}px`;
    sq.style.top = `${y + offsetY}px`;

    sq.style.setProperty('--rot-start', `${Math.round(Math.random() * 32 - 16)}deg`);
    sq.style.setProperty('--rot-mid', `${Math.round(Math.random() * 12 - 6)}deg`);
    sq.style.setProperty('--rot-end', `${Math.round(Math.random() * 44 - 22)}deg`);
    sq.style.setProperty('--dx', `${Math.round(Math.random() * 26 - 13)}px`);

    container.appendChild(sq);
    activeSquares.push(sq);

    if (activeSquares.length > MAX_ACTIVE) {
      const oldest = activeSquares.shift();
      if (oldest && oldest.parentNode) oldest.parentNode.removeChild(oldest);
    }

    sq.addEventListener('animationend', () => removeSquare(sq), { once: true });
    setTimeout(() => removeSquare(sq), 950);
  };

  let ticking = false;
  let pendingEvent = null;

  const onPointerMove = (e) => {
    pendingEvent = e;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!pendingEvent) return;
        const now = performance.now();
        const x = pendingEvent.clientX;
        const y = pendingEvent.clientY;
        const dist = Math.hypot(x - lastX, y - lastY);

        // Khoảng cách tối thiểu giữa 2 ô để tạo vệt mượt mà, không giật lag
        if (dist >= 30 || (now - lastTime > 55 && dist >= 14)) {
          lastX = x;
          lastY = y;
          lastTime = now;
          spawnSquare(x, y);
        }
      });
    }
  };

  const onPointerDown = (e) => {
    // Khi click chuột: bung tỏa nhẹ 4 ô vuông tạo cảm giác phản hồi xúc giác
    const x = e.clientX;
    const y = e.clientY;
    for (let i = 0; i < 4; i += 1) {
      const angle = (i * (Math.PI / 2)) + (Math.random() * 0.4 - 0.2);
      const dist = 18 + Math.random() * 18;
      spawnSquare(x, y, true, angle, dist);
    }
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });

  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    if (container && container.parentNode) container.parentNode.removeChild(container);
  };
}

