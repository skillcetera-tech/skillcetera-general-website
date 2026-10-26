
function parseMetricValue(str) {
  if (!str) return { num: 0, suf: '', dec: 0 };
  const match = String(str).trim().match(/^([0-9]+(?:\.[0-9]+)?)\s*(.*)$/);
  if (match) {
    const num = parseFloat(match[1]);
    const suf = match[2];
    const dec = match[1].includes('.') ? match[1].split('.')[1].length : 0;
    return { num, suf, dec };
  }
  return { num: parseFloat(str) || 0, suf: '', dec: 0 };
}
import { FULL_CONTENT } from './content/site-data.js';

const DRAFT_STORAGE_KEY = 'skillcetera_studio_draft';

const BUILTIN_HQ_ASSETS = [
  {
    title: 'ESC 2025 — Break The Norm',
    webpUrl: '/assets/esc.webp',
    originalUrl: '/assets/esc.png',
    dimensions: '2048 × 1538 px · PNG gốc',
    caption: 'Sân khấu đêm chung kết ESC 2025 (Break The Norm)'
  },
  {
    title: 'TEDxFPTUniversityHCMC — Start Small',
    webpUrl: '/assets/tedx.webp',
    originalUrl: '/assets/tedx.jpg',
    dimensions: '2048 × 1638 px · JPG gốc',
    caption: 'Sân khấu TEDxFPTUniversityHCMC Season 04 (2024)'
  },
  {
    title: 'Scavenger Hunt — Hành trình thực địa',
    webpUrl: '/assets/scavenger-hunt.webp',
    originalUrl: '/assets/scavenger-hunt.png',
    dimensions: '1637 × 1091 px · PNG gốc',
    caption: 'Ảnh tư liệu gốc hành trình Scavenger Hunt'
  },
  {
    title: 'The MoneyVerse — Vũ trụ Đồng tiền',
    webpUrl: '/assets/moneyverse.webp',
    originalUrl: '/assets/moneyverse.png',
    dimensions: '2048 × 1365 px · PNG gốc',
    caption: 'Sự kiện hợp tác truyền thông VTV Times'
  },
  {
    title: 'Meditation Retreat — Kỳ nghỉ Thiền định',
    webpUrl: '/assets/meditation-retreat.webp',
    originalUrl: '/assets/meditation-retreat.jpg',
    dimensions: '2048 × 1536 px · JPG gốc',
    caption: 'Không gian tĩnh tâm và kết nối tại Meditation Retreat'
  },
  {
    title: 'Discussion Forum — Diễn đàn Học thuật',
    webpUrl: '/assets/discussion-forum.webp',
    originalUrl: '/assets/discussion-forum.png',
    dimensions: '940 × 788 px · PNG gốc',
    caption: 'Diễn đàn thảo luận chuyên đề cùng diễn giả'
  },
  {
    title: 'S-Store — Merchandise & Gây quỹ',
    webpUrl: '/assets/s-store.webp',
    originalUrl: '/assets/s-store.jpg',
    dimensions: '1200 × 1200 px · JPG gốc',
    caption: 'Sản phẩm hợp tác S-Store'
  }
];

let state = structuredClone(FULL_CONTENT);
if (!Array.isArray(state.hqGallery)) {
  state.hqGallery = [];
}

let selectedFile = null;
let selectedDimensions = '';

function showToast(message) {
  const toast = document.getElementById('studio-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function setStatus(text, color = '#16a34a', isDirty = false) {
  const statusText = document.getElementById('studio-status-text');
  const statusDot = document.getElementById('studio-status-dot');
  if (statusText) statusText.textContent = text;
  if (statusDot) {
    statusDot.style.background = color;
    statusDot.classList.toggle('dirty', isDirty);
  }
}

function updateStatsStrip() {
  const hqCount = (state.hqGallery?.length || 0) + BUILTIN_HQ_ASSETS.length;
  const missionCount = state.missions?.length || 3;
  const projCount = Object.keys(state.otherProjects || {}).length || 5;
  const deptCount = state.siteMeta?.recruitment?.departments?.length || 0;
  const isOpen = state.siteMeta?.recruitment?.status === 'open';
  const recStatus = isOpen ? 'Tuyển quân: ĐANG MỞ' : 'Tuyển quân: ĐÃ ĐÓNG';

  const statHq = document.getElementById('stat-hq-val');
  if (statHq) statHq.textContent = hqCount;
  const statMission = document.getElementById('stat-mission-val');
  if (statMission) statMission.textContent = missionCount;
  const statProj = document.getElementById('stat-proj-val');
  if (statProj) statProj.textContent = projCount;
  const statDept = document.getElementById('stat-dept-val');
  if (statDept) statDept.textContent = deptCount;
  const statRec = document.getElementById('stat-rec-status');
  if (statRec) {
    statRec.textContent = recStatus;
    statRec.style.color = isOpen ? '#16a34a' : 'var(--ink-soft)';
  }
  const badgeDept = document.getElementById('badge-dept-count');
  if (badgeDept) badgeDept.textContent = `${deptCount} ban`;
  const badgeMedia = document.getElementById('badge-media-count');
  if (badgeMedia) badgeMedia.textContent = `${hqCount} ảnh`;
}

async function fetchInitialContent() {
  let loadedContent = null;
  let manifestAssets = [];

  try {
    const res = await fetch('/api/content', { cache: 'no-store' });
    if (res.ok) {
      const serverData = await res.json();
      loadedContent = serverData.content || serverData;
      manifestAssets = serverData.manifest?.assets || [];
    }
  } catch {
    try {
      const res = await fetch('/data/content.json', { cache: 'no-store' });
      if (res.ok) {
        loadedContent = await res.json();
      }
    } catch {
      // Keep FULL_CONTENT
    }
  }

  if (loadedContent) {
    state = { ...structuredClone(FULL_CONTENT), ...loadedContent };
  }

  try {
    const draftRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draftRaw) {
      const draft = JSON.parse(draftRaw);
      if (draft && draft._isSynced === false) {
        state = { ...state, ...draft };
        setStatus('Đang mở bản nháp có thay đổi chưa lưu trên máy chủ (Nhấn Lưu lên máy chủ)', '#d97706', true);
      } else if (loadedContent) {
        state = { ...state, ...loadedContent };
      }
    }
  } catch {
    // Ignore invalid draft
  }

  if (!Array.isArray(state.hqGallery)) {
    state.hqGallery = [];
  }

  // Luôn nạp toàn bộ ảnh đã upload từ manifest vào hqGallery để không bao giờ bị mất khi refresh!
  if (Array.isArray(manifestAssets)) {
    manifestAssets.forEach((asset) => {
      if (asset.webpPath) {
        const alreadyExists = state.hqGallery.some(
          (item) => item.webpUrl === asset.webpPath || item.originalUrl === asset.originalUrl
        );
        if (!alreadyExists) {
          state.hqGallery.push({
            id: `hq-${asset.slug || Math.random().toString(36).slice(2)}`,
            title: asset.description || asset.file || 'Ảnh tư liệu chất lượng cao',
            alt: asset.description || 'Ảnh tư liệu Skillcetera',
            caption: `${asset.width || ''} × ${asset.height || ''} px · Đã lưu trên máy chủ`,
            webpUrl: asset.webpPath,
            originalUrl: asset.originalUrl || asset.path || asset.webpPath,
            dimensions: asset.width && asset.height ? `${asset.width} × ${asset.height} px` : 'Full-Res'
          });
        }
      }
    });
  }
}

function switchTab(target) {
  const tabBtns = Array.from(document.querySelectorAll('.studio-tab-btn[data-tab]'));
  const panels = {
    media: document.getElementById('panel-media'),
    about: document.getElementById('panel-about'),
    esc: document.getElementById('panel-esc'),
    tedx: document.getElementById('panel-tedx'),
    projects: document.getElementById('panel-projects'),
    contact: document.getElementById('panel-contact')
  };

  tabBtns.forEach((b) => {
    const active = b.dataset.tab === target;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  Object.entries(panels).forEach(([key, panel]) => {
    if (panel) panel.hidden = key !== target;
  });
}

function setupTabs() {
  const tabBtns = Array.from(document.querySelectorAll('.studio-tab-btn[data-tab]'));
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // KPI widgets jump to corresponding tab on click
  document.querySelectorAll('.studio-stat-widget[data-jump-tab]').forEach((widget) => {
    widget.addEventListener('click', () => {
      const tabKey = widget.dataset.jumpTab;
      switchTab(tabKey);
      document.querySelector(`.studio-tab-btn[data-tab="${tabKey}"]`)?.focus();
    });
  });
}

function getAllAvailableImages() {
  const list = [];
  const seen = new Set();
  [...state.hqGallery, ...BUILTIN_HQ_ASSETS].forEach((item) => {
    const key = item.webpUrl || item.originalUrl;
    if (key && !seen.has(key)) {
      seen.add(key);
      list.push(item);
    }
  });
  return list;
}

let currentPickerCallback = null;

function openMediaPicker({ title = 'Chọn ảnh từ kho tư liệu có sẵn', onSelect }) {
  const modal = document.getElementById('studio-picker-modal');
  const grid = document.getElementById('studio-picker-grid');
  const titleEl = document.getElementById('studio-picker-title');
  if (!modal || !grid) return;

  if (titleEl) titleEl.textContent = title;
  currentPickerCallback = onSelect;

  const images = getAllAvailableImages();
  if (images.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--gray)">Kho ảnh hiện đang trống. Hãy tải ảnh lên ở mục 01 trước.</div>';
  } else {
    grid.innerHTML = images
      .map(
        (item, idx) => `
        <article class="studio-picker-card" data-picker-idx="${idx}">
          <div class="studio-picker-card-thumb">
            <img src="${item.webpUrl || item.originalUrl}" alt="${item.alt || item.title}" loading="lazy" />
          </div>
          <div class="studio-picker-card-info">
            <strong>${item.title || 'Ảnh tư liệu'}</strong>
            <span>${item.dimensions || 'Full-Res'}</span>
            <button type="button" class="studio-picker-card-btn">Chọn ảnh này</button>
          </div>
        </article>
      `
      )
      .join('');

    grid.querySelectorAll('.studio-picker-card').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = Number(card.dataset.pickerIdx);
        const chosen = images[idx];
        if (chosen && currentPickerCallback) {
          currentPickerCallback(chosen);
        }
        closeMediaPicker();
      });
    });
  }

  modal.hidden = false;
}

function closeMediaPicker() {
  const modal = document.getElementById('studio-picker-modal');
  if (modal) modal.hidden = true;
  currentPickerCallback = null;
}

function parsePosition(posStr) {
  if (!posStr || typeof posStr !== 'string') return { x: 50, y: 50 };
  const str = posStr.trim().toLowerCase();

  // Named keywords
  if (str === 'center top' || str === 'top center') return { x: 50, y: 0 };
  if (str === 'center bottom' || str === 'bottom center') return { x: 50, y: 100 };
  if (str === 'left center' || str === 'center left') return { x: 0, y: 50 };
  if (str === 'right center' || str === 'center right') return { x: 100, y: 50 };
  if (str === 'left top' || str === 'top left') return { x: 0, y: 0 };
  if (str === 'right top' || str === 'top right') return { x: 100, y: 0 };
  if (str === 'left bottom' || str === 'bottom left') return { x: 0, y: 100 };
  if (str === 'right bottom' || str === 'bottom right') return { x: 100, y: 100 };
  if (str === 'center' || str === 'center center') return { x: 50, y: 50 };

  // Percentage or numbers
  const parts = str.split(/\s+/);
  let x = 50;
  let y = 50;
  if (parts.length >= 1) {
    if (parts[0] === 'left') x = 0;
    else if (parts[0] === 'right') x = 100;
    else if (parts[0] === 'center') x = 50;
    else {
      const match = parts[0].match(/(\d+)%/);
      if (match) x = Number(match[1]);
    }
  }
  if (parts.length >= 2) {
    if (parts[1] === 'top') y = 0;
    else if (parts[1] === 'bottom') y = 100;
    else if (parts[1] === 'center') y = 50;
    else {
      const match = parts[1].match(/(\d+)%/);
      if (match) y = Number(match[1]);
    }
  }
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

let currentAdjusterCallback = null;

function openAdjusterModal({
  title = 'Căn chỉnh khung hình & Tiêu điểm ảnh',
  subtitle = 'Nhấp chuột trực tiếp lên ảnh hoặc dùng thanh trượt để căn chỉnh điểm nhìn.',
  aspectRatio = '16 / 9',
  imageUrl,
  currentPosition = '50% 50%',
  currentFit = 'cover',
  onSave
}) {
  const modal = document.getElementById('studio-adjuster-modal');
  const titleEl = document.getElementById('studio-adjuster-title');
  const subtitleEl = document.getElementById('studio-adjuster-subtitle');
  const frame = document.getElementById('adjuster-frame');
  const img = document.getElementById('adjuster-preview-img');
  const crosshair = document.getElementById('adjuster-crosshair');
  const rangeX = document.getElementById('range-adjuster-x');
  const rangeY = document.getElementById('range-adjuster-y');
  const valX = document.getElementById('val-adjuster-x');
  const valY = document.getElementById('val-adjuster-y');
  const saveBtn = document.getElementById('btn-save-adjuster');

  if (!modal || !frame || !img) return;

  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
  frame.style.aspectRatio = aspectRatio;
  img.src = imageUrl;

  const parsed = parsePosition(currentPosition);
  let curX = parsed.x;
  let curY = parsed.y;
  let curFit = currentFit || 'cover';

  function applyState() {
    img.style.objectPosition = `${curX}% ${curY}%`;
    img.style.objectFit = curFit;
    if (crosshair) {
      crosshair.style.left = `${curX}%`;
      crosshair.style.top = `${curY}%`;
    }
    if (rangeX) rangeX.value = curX;
    if (rangeY) rangeY.value = curY;
    if (valX) valX.textContent = `${curX}%`;
    if (valY) valY.textContent = `${curY}%`;

    document.querySelectorAll('.adjuster-grid-btn').forEach((b) => {
      const bx = Number(b.dataset.x);
      const by = Number(b.dataset.y);
      b.classList.toggle('active', bx === curX && by === curY);
    });
  }

  document.querySelectorAll('input[name="adjuster-fit"]').forEach((radio) => {
    radio.checked = radio.value === curFit;
    radio.onchange = () => {
      curFit = radio.value;
      applyState();
    };
  });

  if (rangeX) rangeX.oninput = (e) => { curX = Number(e.target.value); applyState(); };
  if (rangeY) rangeY.oninput = (e) => { curY = Number(e.target.value); applyState(); };

  document.querySelectorAll('.adjuster-grid-btn').forEach((btn) => {
    btn.onclick = () => {
      curX = Number(btn.dataset.x);
      curY = Number(btn.dataset.y);
      applyState();
    };
  });

  let isDragging = false;
  const setFocalFromEvent = (e) => {
    const rect = frame.getBoundingClientRect();
    curX = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    curY = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
    applyState();
  };

  frame.onpointerdown = (e) => {
    isDragging = true;
    frame.setPointerCapture?.(e.pointerId);
    setFocalFromEvent(e);
  };
  frame.onpointermove = (e) => {
    if (isDragging) setFocalFromEvent(e);
  };
  frame.onpointerup = (e) => {
    isDragging = false;
    frame.releasePointerCapture?.(e.pointerId);
  };
  frame.onpointercancel = () => {
    isDragging = false;
  };

  if (saveBtn) {
    saveBtn.onclick = async () => {
      if (onSave) {
        await onSave({
          position: `${curX}% ${curY}%`,
          fit: curFit,
        });
      }
      closeAdjusterModal();
    };
  }

  applyState();
  modal.hidden = false;
}

function closeAdjusterModal() {
  const modal = document.getElementById('studio-adjuster-modal');
  if (modal) modal.hidden = true;
  currentAdjusterCallback = null;
}

function renderMediaLibrary() {
  const container = document.getElementById('studio-media-library');
  if (!container) return;

  const combined = getAllAvailableImages();
  container.innerHTML = combined
    .map(
      (item) => `
      <article class="hq-gallery-item">
        <div class="hq-gallery-thumb">
          <img
            src="${item.webpUrl || item.originalUrl}"
            alt="${item.alt || item.title}"
            data-hq-src="${item.originalUrl || item.webpUrl}"
            data-hq-title="${item.title}"
            data-hq-caption="${item.caption || ''}"
          />
        </div>
        <div class="hq-gallery-caption" style="flex-direction:column;align-items:stretch;gap:10px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${item.title}</strong>
            <span>${item.dimensions || 'Full-Res Original'}</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <button
              type="button"
              class="hq-trigger-light"
              data-hq-src="${item.originalUrl || item.webpUrl}"
              data-hq-title="${item.title}"
              data-hq-caption="${item.caption || ''}"
            >
              Xem Full-Res
            </button>
            <button
              type="button"
              class="hq-trigger-light btn-media-pdf"
              data-pdf-src="${item.originalUrl || item.webpUrl}"
              data-pdf-title="${item.title}"
              title="Lưu ảnh này dưới dạng tài liệu PDF"
            >
              📄 Lưu dạng PDF
            </button>
            <select class="gallery-apply-select" data-apply-webp="${item.webpUrl || item.originalUrl}" data-apply-orig="${item.originalUrl || item.webpUrl}" data-apply-title="${item.title || ''}" data-apply-alt="${item.alt || item.title || ''}">
              <option value="">Áp dụng ảnh này vào...</option>
              <option value="hero">Ảnh Hero trang chủ (#hero)</option>
              <option value="esc">Sân khấu chính ESC (#esc)</option>
              <option value="tedx">Sân khấu chính TEDx (#tedx)</option>
              <option value="project:discussion">Dự án Discussion Forum</option>
              <option value="project:scavenger">Dự án Scavenger Hunt</option>
              <option value="project:retreat">Dự án Meditation Retreat</option>
              <option value="project:store">Dự án S-Store</option>
              <option value="project:moneyverse">Dự án The MoneyVerse</option>
            </select>
          </div>
        </div>
      </article>
    `
    )
    .join('');

  container.querySelectorAll('.gallery-apply-select').forEach((sel) => {
    sel.addEventListener('change', async (e) => {
      const val = e.target.value;
      if (!val) return;
      const webpUrl = e.target.dataset.applyWebp;
      const origUrl = e.target.dataset.applyOrig;
      const alt = e.target.dataset.applyAlt;

      if (val === 'hero') {
        if (!state.siteMeta) state.siteMeta = {};
        state.siteMeta.heroImage = webpUrl;
        state.siteMeta.heroOriginalImage = origUrl;
        state.siteMeta.heroImageAlt = alt;
        showToast('Đã áp dụng ảnh vào phần Hero trang chủ!');
      } else if (val === 'esc' && state.annualEvents?.esc) {
        state.annualEvents.esc.image = webpUrl;
        state.annualEvents.esc.originalImage = origUrl;
        state.annualEvents.esc.imageAlt = alt;
        showToast('Đã áp dụng ảnh vào Sân khấu chính ESC!');
      } else if (val === 'tedx' && state.annualEvents?.tedx) {
        state.annualEvents.tedx.image = webpUrl;
        state.annualEvents.tedx.originalImage = origUrl;
        state.annualEvents.tedx.imageAlt = alt;
        showToast('Đã áp dụng ảnh vào Sân khấu chính TEDx!');
      } else if (val.startsWith('project:')) {
        const pKey = val.split(':')[1];
        if (state.otherProjects?.[pKey]) {
          state.otherProjects[pKey].image = webpUrl;
          state.otherProjects[pKey].originalImage = origUrl;
          state.otherProjects[pKey].alt = alt;
          showToast(`Đã áp dụng ảnh vào dự án ${state.otherProjects[pKey].title}!`);
        }
      }
      e.target.value = '';
      await saveToServer(false);
      renderAboutEditor();
      renderEscEditor();
      renderTedxEditor();
      renderProjectsEditor();
    });
  });

  container.querySelectorAll('.btn-media-pdf').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const src = e.currentTarget.dataset.pdfSrc;
      const title = e.currentTarget.dataset.pdfTitle;
      if (src) downloadImageAsPdf(src, title);
    });
  });
}

/**
 * Convert any image URL (or loaded Image element) into a standalone, downloadable PDF file
 * Zero external libraries needed, runs entirely in the browser.
 */
async function downloadImageAsPdf(imageUrl, title = 'Skillcetera-Asset') {
  showToast('Đang tạo tệp PDF từ ảnh chất lượng cao...');
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Không thể tải ảnh để xuất PDF'));
      img.src = imageUrl;
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error('Kích thước ảnh không hợp lệ');

    // Draw to canvas to get high quality JPEG bytes
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    // White background for transparency safety
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const base64Data = jpegDataUrl.split(',')[1];
    const binaryStr = atob(base64Data);
    const jpegBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      jpegBytes[i] = binaryStr.charCodeAt(i);
    }

    // Determine A4 layout: landscape or portrait based on aspect ratio
    const isLandscape = w >= h;
    const pageWidth = isLandscape ? 842 : 595;
    const pageHeight = isLandscape ? 595 : 842;
    const margin = 28;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;
    const scale = Math.min(maxW / w, maxH / h);
    const imgW = Math.round(w * scale);
    const imgH = Math.round(h * scale);
    const imgX = Math.round((pageWidth - imgW) / 2);
    const imgY = Math.round((pageHeight - imgH) / 2);

    // Build valid PDF-1.4 binary structure
    const enc = new TextEncoder();
    const parts = [];
    const offsets = [];

    const addPart = (strOrBytes) => {
      const bytes = typeof strOrBytes === 'string' ? enc.encode(strOrBytes) : strOrBytes;
      parts.push(bytes);
      return bytes.length;
    };

    let currentPos = 0;
    const writeObj = (objNum, contentBytes) => {
      offsets[objNum] = currentPos;
      currentPos += addPart(`${objNum} 0 obj\n`);
      currentPos += addPart(contentBytes);
      currentPos += addPart('\nendobj\n');
    };

    // Header
    currentPos += addPart('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

    // Obj 1: Catalog
    writeObj(1, '<< /Type /Catalog /Pages 2 0 R >>');

    // Obj 2: Pages
    writeObj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

    // Obj 3: Page
    writeObj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>`);

    // Obj 4: Image XObject
    offsets[4] = currentPos;
    currentPos += addPart(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
    currentPos += addPart(jpegBytes);
    currentPos += addPart('\nendstream\nendobj\n');

    // Obj 5: Page Content stream (placement)
    const streamOps = `q\n${imgW} 0 0 ${imgH} ${imgX} ${imgY} cm\n/Im1 Do\nQ\n`;
    const streamBytes = enc.encode(streamOps);
    writeObj(5, `<< /Length ${streamBytes.length} >>\nstream\n${streamOps}endstream`);

    // Cross-reference table (xref)
    const xrefStart = currentPos;
    let xref = `xref\n0 6\n0000000000 65535 f \n`;
    for (let i = 1; i <= 5; i++) {
      xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    addPart(xref);

    // Merge into single Blob
    const pdfBlob = new Blob(parts, { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    const safeTitle = (title || 'skillcetera-media')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    a.href = downloadUrl;
    a.download = `${safeTitle || 'skillcetera-asset'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);

    showToast(`Đã xuất và tải xuống tệp PDF (${a.download}) thành công!`);
  } catch (err) {
    console.error('PDF export error:', err);
    showToast(`Không thể tạo PDF: ${err.message}`);
  }
}

function setupHQUploader() {
  const dropzone = document.getElementById('hq-dropzone');
  const fileInput = document.getElementById('hq-file-input');
  const inspector = document.getElementById('hq-inspector');
  const previewImg = document.getElementById('hq-preview-img');
  const specDim = document.getElementById('hq-spec-dim');
  const specSize = document.getElementById('hq-spec-size');
  const specTier = document.getElementById('hq-spec-tier');
  const titleInput = document.getElementById('hq-input-title');
  const altInput = document.getElementById('hq-input-alt');
  const captionInput = document.getElementById('hq-input-caption');
  const targetSelect = document.getElementById('hq-input-target');
  const uploadBtn = document.getElementById('btn-upload-hq');

  if (!dropzone || !fileInput) return;

  const inspectFile = (file) => {
    if (!file) return;
    selectedFile = file;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileType = file.type ? file.type.replace('image/', '').toUpperCase() : 'UNKNOWN';
    specSize.textContent = `${sizeMB} MB · ${fileType}`;

    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    if (!titleInput.value) titleInput.value = baseName;
    if (!altInput.value) altInput.value = `Ảnh tư liệu Skillcetera: ${baseName}`;

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      selectedDimensions = 'PDF Document (Vector)';
      specDim.textContent = selectedDimensions;
      specTier.textContent = 'Tài liệu PDF gốc (Vector / In ấn)';
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 420);
      ctx.fillStyle = '#eb0028';
      ctx.fillRect(40, 40, 110, 140);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText('PDF', 55, 126);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(file.name.slice(0, 32), 175, 80);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText(`Dung lượng: ${sizeMB} MB`, 175, 118);
      ctx.fillText('Định dạng tài liệu PDF chất lượng cao', 175, 148);
      previewImg.onload = null;
      previewImg.src = canvas.toDataURL('image/png');
      inspector.hidden = false;
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewImg.onload = () => {
      const w = previewImg.naturalWidth;
      const h = previewImg.naturalHeight;
      selectedDimensions = `${w} × ${h} px`;
      specDim.textContent = selectedDimensions;
      const maxEdge = Math.max(w, h);
      if (maxEdge >= 2000) {
        specTier.textContent = 'Chuẩn Ultra-HQ (≥ 2000px)';
      } else if (maxEdge >= 1400) {
        specTier.textContent = 'Chuẩn Full-HD (≥ 1400px)';
      } else {
        specTier.textContent = 'Độ phân giải tiêu chuẩn';
      }
      inspector.hidden = false;
    };
    previewImg.src = objectUrl;
  };

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.[0]) inspectFile(fileInput.files[0]);
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer?.files?.[0]) inspectFile(e.dataTransfer.files[0]);
  });

  uploadBtn?.addEventListener('click', async () => {
    if (!selectedFile) {
      showToast('Vui lòng chọn một tệp ảnh trước khi tải lên.');
      return;
    }
    const title = titleInput.value.trim() || selectedFile.name;
    const alt = altInput.value.trim() || title;
    const caption = captionInput.value.trim() || `${selectedDimensions} · Bản gốc chất lượng cao`;
    const target = targetSelect.value;

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Đang tải lên & tối ưu WebP chất lượng cao...';

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': selectedFile.type || 'application/octet-stream',
          'X-File-Name': encodeURIComponent(selectedFile.name)
        },
        body: selectedFile
      });

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }

      const result = await res.json();
      const asset = result.asset || result;
      const dimLabel =
        (asset.width && asset.height) ? `${asset.width} × ${asset.height} px` : selectedDimensions || 'Full-Res';

      const newPhoto = {
        id: `hq-${Date.now()}`,
        title,
        alt,
        caption,
        webpUrl: asset.webpUrl || asset.originalUrl || result.webpUrl || result.originalUrl,
        originalUrl: asset.originalUrl || result.originalUrl,
        dimensions: dimLabel
      };

      state.hqGallery.unshift(newPhoto);

      if (target === 'hero') {
        if (!state.siteMeta) state.siteMeta = {};
        state.siteMeta.heroImage = newPhoto.webpUrl;
        state.siteMeta.heroOriginalImage = newPhoto.originalUrl;
        state.siteMeta.heroImageAlt = alt;
      } else if (target === 'esc' && state.annualEvents?.esc) {
        state.annualEvents.esc.image = newPhoto.webpUrl;
        state.annualEvents.esc.originalImage = newPhoto.originalUrl;
        state.annualEvents.esc.imageAlt = alt;
      } else if (target === 'tedx' && state.annualEvents?.tedx) {
        state.annualEvents.tedx.image = newPhoto.webpUrl;
        state.annualEvents.tedx.originalImage = newPhoto.originalUrl;
        state.annualEvents.tedx.imageAlt = alt;
      } else if (target.startsWith('project:')) {
        const projId = target.split(':')[1];
        if (state.otherProjects?.[projId]) {
          state.otherProjects[projId].image = newPhoto.webpUrl;
          state.otherProjects[projId].originalImage = newPhoto.originalUrl;
          state.otherProjects[projId].alt = alt;
        }
      }

      await saveToServer(false);
      renderMediaLibrary();
      showToast(`Đã tải lên ảnh gốc (${dimLabel}) & tạo WebP chất lượng cao thành công!`);
    } catch (err) {
      showToast(`Không thể kết nối /api/upload (${err.message}). Đã lưu cấu hình vào bản nháp.`);
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Tải lên & Xử lý Ảnh Chất lượng cao (POST /api/upload)';
    }
  });

  const exportPdfBtn = document.getElementById('btn-export-pdf');
  exportPdfBtn?.addEventListener('click', () => {
    if (!selectedFile && !previewImg.src) {
      showToast('Vui lòng chọn ảnh trước khi lưu PDF.');
      return;
    }
    const title = titleInput?.value?.trim() || selectedFile?.name || 'skillcetera-media';
    downloadImageAsPdf(previewImg.src, title);
  });
}

function renderAboutEditor() {
  const container = document.getElementById('about-editor-fields');
  if (!container) return;

  const meta = state.siteMeta || {};
  const missionsHtml = (state.missions || [])
    .map(
      (m, idx) => `
      <div class="editor-repeater-item">
        <div class="editor-repeater-head">
          <strong>Sứ mệnh ${m.index} — ${m.titleEn}</strong>
          <span class="pill">${m.titleVi}</span>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Tiêu đề tiếng Anh</label>
            <input type="text" class="form-input" data-mission-idx="${idx}" data-field="titleEn" value="${m.titleEn || ''}" />
          </div>
          <div class="form-group">
            <label>Tiêu đề tiếng Việt</label>
            <input type="text" class="form-input" data-mission-idx="${idx}" data-field="titleVi" value="${m.titleVi || ''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Nhãn Pill sứ mệnh (Hiển thị góc trên thẻ)</label>
          <input type="text" class="form-input" data-mission-idx="${idx}" data-field="pill" value="${m.pill || `MISSION ${m.index || `0${idx + 1}`} · ${(m.titleEn || '').toUpperCase()}`}" />
        </div>
        <div class="form-group">
          <label>Tóm tắt hiển thị ở Accordion trang chủ</label>
          <textarea class="form-textarea" data-mission-idx="${idx}" data-field="descriptionVi">${m.descriptionVi || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Nội dung chi tiết trên trang /about</label>
          <textarea class="form-textarea" data-mission-idx="${idx}" data-field="detailVi">${m.detailVi || ''}</textarea>
        </div>
      </div>
    `
    )
    .join('');

  container.innerHTML = `
    <!-- Hero Image Manager -->
    <div class="editor-repeater-item" style="border: 2px solid rgba(36,87,255,0.24); background: linear-gradient(180deg, rgba(36,87,255,0.04) 0%, #ffffff 100%); margin-bottom: 24px;">
      <div class="editor-repeater-head">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="pill pill-esc">Trang chủ</span>
          <strong>Ảnh Hero trang chủ (#hero)</strong>
          <span class="adjust-badge" id="hero-adjust-badge">Vị trí: ${meta.heroImagePosition || 'center 45%'} · ${meta.heroImageFit || 'cover'}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button type="button" class="btn btn-esc" id="btn-pick-hero-img">🖼️ Chọn từ kho ảnh</button>
          <button type="button" class="hq-trigger-light" id="btn-adjust-hero-img">📐 Căn chỉnh khung ảnh</button>
        </div>
      </div>
      <div class="form-grid-2" style="align-items: center; gap: 20px;">
        <div>
          <div class="form-group">
            <label>Đường dẫn ảnh hiển thị WebP</label>
            <input type="text" class="form-input" id="meta-hero-image" value="${meta.heroImage || '/assets/discussion-forum.webp'}" />
          </div>
          <div class="form-group">
            <label>Đường dẫn ảnh gốc Full-Res</label>
            <input type="text" class="form-input" id="meta-hero-orig" value="${meta.heroOriginalImage || '/assets/discussion-forum.png'}" />
          </div>
          <div class="form-group">
            <label>Mô tả ảnh trợ năng (Alt text)</label>
            <input type="text" class="form-input" id="meta-hero-alt" value="${meta.heroImageAlt || 'Hoạt động giao lưu và chia sẻ học thuật của Skillcetera'}" />
          </div>
        </div>
        <div style="text-align:center">
          <label style="display:block;margin-bottom:8px;font-size:12px;font-weight:600;color:var(--ink-soft)">Xem trước ảnh Hero hiện tại</label>
          <div style="border-radius:14px;overflow:hidden;border:1px solid var(--line);aspect-ratio:16/8.5;background:#111;max-width:320px;margin:0 auto;box-shadow:0 8px 24px rgba(0,0,0,0.08)">
            <img id="hero-img-preview" src="${meta.heroImage || '/assets/discussion-forum.webp'}" alt="Preview" style="width:100%;height:100%;object-fit:${meta.heroImageFit || 'cover'};object-position:${meta.heroImagePosition || 'center 45%'}" />
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Text Content Editor (#home / .hero) -->
    <div class="editor-repeater-item" style="border: 2px solid rgba(36,87,255,0.24); background: #ffffff; margin-bottom: 24px; padding: 22px; border-radius: 14px;">
      <div class="editor-repeater-head" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="pill pill-esc">Trang chủ #home</span>
          <strong>Nội dung chữ Hero Trang chủ (Headline, Pill, Nút bấm &amp; Caption)</strong>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Nhãn Pill nhỏ trên đầu (Pill Badge)</label>
          <input type="text" class="form-input" id="meta-hero-pill" value="${meta.heroPill || 'SKILLS &amp; LANGUAGES CLUB · FPTU HCMC'}" placeholder="e.g. SKILLS &amp; LANGUAGES CLUB · FPTU HCMC" />
        </div>
        <div class="form-group">
          <label>Dòng Credit dưới ảnh (Photo Credit)</label>
          <input type="text" class="form-input" id="meta-hero-credit" value="${meta.heroImageCredit || 'IDEAS WORTH SPREADING · KNOWLEDGE WORTH SHARING'}" placeholder="e.g. IDEAS WORTH SPREADING · KNOWLEDGE WORTH SHARING" />
        </div>
      </div>

      <div class="form-group">
        <label>Tiêu đề chính Hero (H1) — <em>Hỗ trợ thẻ &lt;br&gt; xuống dòng và &lt;em&gt; in nghiêng chữ có màu</em></label>
        <input type="text" class="form-input" id="meta-hero-title" value="${meta.heroTitle || 'Ideas worth spreading.<br>Knowledge <em>worth sharing.</em>'}" style="font-weight:600;font-size:15px" />
      </div>

      <div class="form-group">
        <label>Dòng Caption đè trên ảnh Hero (Photo Caption)</label>
        <input type="text" class="form-input" id="meta-hero-caption" value="${meta.heroImageCaption || 'skillcetera. — Learn together, make an impact.'}" />
      </div>

      <div class="form-grid-2" style="background:#f8fafc;padding:16px;border-radius:12px;border:1px solid var(--line);margin-top:10px">
        <div class="form-group">
          <label>Nút chính (Primary CTA): Chữ hiển thị</label>
          <input type="text" class="form-input" id="meta-hero-cta-primary-text" value="${meta.heroCtaPrimaryText || 'Explore Events'}" />
          <label style="margin-top:8px">Nút chính: Đường dẫn liên kết (Href)</label>
          <input type="text" class="form-input" id="meta-hero-cta-primary-link" value="${meta.heroCtaPrimaryLink || '#esc'}" />
        </div>
        <div class="form-group">
          <label>Nút phụ (Secondary CTA): Chữ hiển thị</label>
          <input type="text" class="form-input" id="meta-hero-cta-secondary-text" value="${meta.heroCtaSecondaryText || 'About Skillcetera'}" />
          <label style="margin-top:8px">Nút phụ: Đường dẫn liên kết (Href)</label>
          <input type="text" class="form-input" id="meta-hero-cta-secondary-link" value="${meta.heroCtaSecondaryLink || '#about'}" />
        </div>
      </div>
    </div>

    <div class="editor-repeater-item" style="border: 1px solid var(--line); background: #fafafa; margin-bottom: 24px; padding: 20px; border-radius: 12px;">
      <div class="editor-repeater-head" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="pill">Trang chủ #about</span>
          <strong>Nội dung tiêu đề &amp; mô tả About Us trên Homepage</strong>
        </div>
      </div>
      <div class="form-group">
        <label>Nhãn Pill (Mặc định: ABOUT US · THREE CORE MISSIONS)</label>
        <input type="text" class="form-input" id="meta-about-pill" value="${meta.aboutPill || 'ABOUT US · THREE CORE MISSIONS'}" />
      </div>
      <div class="form-group">
        <label>Tiêu đề chính About Us (Hỗ trợ định dạng HTML như &lt;br&gt;, &lt;em&gt;)</label>
        <input type="text" class="form-input" id="meta-about-title" value="${meta.aboutTitle || 'Learn. Connect.<br><em>Make an impact.</em>'}" />
      </div>
      <div class="form-group">
        <label>Đoạn giới thiệu ngắn About Us (About Lead)</label>
        <textarea class="form-textarea" id="meta-about-lead">${meta.aboutLead || 'Skills and Languages Club at FPT University Ho Chi Minh City — where ideas are heard and large-scale experiences are created together.'}</textarea>
      </div>
    </div>

    <div class="form-grid-2">
      <div class="form-group">
        <label>Tên câu lạc bộ</label>
        <input type="text" class="form-input" id="meta-name" value="${meta.clubName || ''}" />
      </div>
      <div class="form-group">
        <label>Năm thành lập</label>
        <input type="text" class="form-input" id="meta-founded" value="${meta.foundedYear || ''}" />
      </div>
    </div>
    <div class="form-group">
      <label>Thông điệp định vị (Tagline Tiếng Việt)</label>
      <input type="text" class="form-input" id="meta-tagline" value="${meta.taglineVi || ''}" />
    </div>
    <h3 style="font-size:16px;margin:22px 0 12px">03 Sứ mệnh cốt lõi</h3>
    ${missionsHtml}
  `;

  document.getElementById('btn-pick-hero-img')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Chọn ảnh cho phần Hero trang chủ',
      onSelect: async (chosen) => {
        if (!state.siteMeta) state.siteMeta = {};
        state.siteMeta.heroImage = chosen.webpUrl;
        state.siteMeta.heroOriginalImage = chosen.originalUrl || chosen.webpUrl;
        state.siteMeta.heroImageAlt = chosen.alt || chosen.title;
        await saveToServer(false);
        renderAboutEditor();
        showToast('Đã đổi ảnh Hero và lưu lên máy chủ thành công!');
      }
    });
  });

  document.getElementById('btn-adjust-hero-img')?.addEventListener('click', () => {
    openAdjusterModal({
      title: 'Căn chỉnh khung ảnh Hero trang chủ',
      subtitle: 'Kéo thả tiêu điểm hoặc điều chỉnh trục Y/X để định vị đối tượng chính trên banner Hero.',
      aspectRatio: '16 / 8.5',
      imageUrl: state.siteMeta?.heroImage || '/assets/discussion-forum.webp',
      currentPosition: state.siteMeta?.heroImagePosition || 'center 45%',
      currentFit: state.siteMeta?.heroImageFit || 'cover',
      onSave: async ({ position, fit }) => {
        if (!state.siteMeta) state.siteMeta = {};
        state.siteMeta.heroImagePosition = position;
        state.siteMeta.heroImageFit = fit;
        await saveToServer(false);
        renderAboutEditor();
        showToast('Đã lưu căn chỉnh ảnh Hero lên máy chủ!');
      }
    });
  });

  container.oninput = (e) => {
    const target = e.target;
    if (target.id === 'meta-about-pill') state.siteMeta.aboutPill = target.value;
    if (target.id === 'meta-about-title') state.siteMeta.aboutTitle = target.value;
    if (target.id === 'meta-about-lead') state.siteMeta.aboutLead = target.value;
    if (target.id === 'meta-hero-pill') state.siteMeta.heroPill = target.value;
    if (target.id === 'meta-hero-title') state.siteMeta.heroTitle = target.value;
    if (target.id === 'meta-hero-caption') state.siteMeta.heroImageCaption = target.value;
    if (target.id === 'meta-hero-credit') state.siteMeta.heroImageCredit = target.value;
    if (target.id === 'meta-hero-cta-primary-text') state.siteMeta.heroCtaPrimaryText = target.value;
    if (target.id === 'meta-hero-cta-primary-link') state.siteMeta.heroCtaPrimaryLink = target.value;
    if (target.id === 'meta-hero-cta-secondary-text') state.siteMeta.heroCtaSecondaryText = target.value;
    if (target.id === 'meta-hero-cta-secondary-link') state.siteMeta.heroCtaSecondaryLink = target.value;
    if (target.id === 'meta-name') state.siteMeta.clubName = target.value;
    if (target.id === 'meta-founded') state.siteMeta.foundedYear = target.value;
    if (target.id === 'meta-tagline') state.siteMeta.taglineVi = target.value;
    if (target.id === 'meta-hero-image') {
      state.siteMeta.heroImage = target.value;
      const prev = document.getElementById('hero-img-preview');
      if (prev) prev.src = target.value;
    }
    if (target.id === 'meta-hero-orig') state.siteMeta.heroOriginalImage = target.value;
    if (target.id === 'meta-hero-alt') state.siteMeta.heroImageAlt = target.value;
    if (target.dataset.missionIdx !== undefined) {
      const idx = Number(target.dataset.missionIdx);
      const field = target.dataset.field;
      if (state.missions[idx]) {
        state.missions[idx][field] = target.value;
      }
    }
    setStatus('Có thay đổi chưa lưu — Nhấn Lưu lên máy chủ hoặc Lưu nháp', '#d97706');
  };
}

function renderSeasonsListHtml(eventType, seasonsObj) {
  const entries = Object.entries(seasonsObj || {});
  entries.sort(([k1, s1], [k2, s2]) => Number(s2.year || k2 || 0) - Number(s1.year || k1 || 0));

  if (entries.length === 0) {
    return `<div style="padding:24px;text-align:center;color:var(--gray)">Chưa có mùa nào. Bấm nút "+ Thêm mùa mới" ở trên để tạo.</div>`;
  }

  return entries.map(([key, s], idx) => {
    const isNewest = idx === 0;
    const metrics = Array.isArray(s.metrics) && s.metrics.length === 4
      ? s.metrics
      : [
          { label: 'Số liệu 01', value: '100+' },
          { label: 'Số liệu 02', value: '1M+' },
          { label: 'Số liệu 03', value: '19' },
          { label: 'Số liệu 04', value: '50+' }
        ];

    return `
      <div class="editor-repeater-item" data-season-box="${key}">
        <div class="editor-repeater-head">
          <div style="display:flex;align-items:center;gap:10px">
            <span class="pill ${eventType === 'tedx' ? 'pill-tedx' : 'pill-esc'}">${s.year || key} ${isNewest ? '★ Mới nhất (Mặc định)' : ''}</span>
            <strong>${s.editionLabel || `Mùa ${s.year}`} — ${s.theme || 'Chưa đặt chủ đề'}</strong>
          </div>
          <button type="button" class="hq-trigger-light" data-remove-season="${key}" data-season-event="${eventType}">Xóa mùa này</button>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Năm tổ chức</label>
            <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-season-field="year" value="${s.year || key}" />
          </div>
          <div class="form-group">
            <label>Tên chủ đề (Theme)</label>
            <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-season-field="theme" value="${s.theme || ''}" />
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Nhãn phiên bản (Edition label)</label>
            <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-season-field="editionLabel" value="${s.editionLabel || ''}" />
          </div>
          <div class="form-group">
            <label>Ghi chú trạng thái / lưu trữ</label>
            <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-season-field="statusNote" value="${s.statusNote || ''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Mô tả chi tiết mùa sự kiện</label>
          <textarea class="form-textarea" data-season-event="${eventType}" data-season-key="${key}" data-season-field="description">${s.description || ''}</textarea>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <label style="margin:0">Đường dẫn ảnh hiển thị WebP</label>
              <div style="display:flex;gap:6px">
                <button type="button" class="hq-trigger-light btn-pick-season-img" data-season-event="${eventType}" data-season-key="${key}">🖼️ Chọn ảnh</button>
                <button type="button" class="hq-trigger-light btn-adjust-season-img" data-season-event="${eventType}" data-season-key="${key}">📐 Căn chỉnh</button>
              </div>
            </div>
            <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-season-field="image" value="${s.image || ''}" />
            <div style="margin-top:4px">
              <span class="adjust-badge">Vị trí: ${s.imagePosition || '50% 50%'} · ${s.imageFit || 'cover'}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Đường dẫn ảnh gốc Full-Res</label>
            <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-season-field="originalImage" value="${s.originalImage || ''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Tải ảnh tư liệu mới cho mùa ${s.year} (Tự động nén WebP &amp; lưu bản gốc HQ):</label>
          <input type="file" accept="image/*" class="season-file-upload form-input" data-season-event="${eventType}" data-season-key="${key}" />
        </div>

        <div style="margin-top:16px;padding:14px;background:var(--soft);border-radius:12px;border:1px dashed var(--line)">
          <strong style="display:block;font-size:13px;margin-bottom:10px">4 Số liệu quy mô tương ứng của mùa ${s.year} (hiển thị trên thẻ Notched Ticket):</strong>
          <div class="form-grid-2">
            <div class="form-group">
              <label>Số liệu 01 (Nhãn)</label>
              <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-metric-idx="0" data-metric-prop="label" value="${metrics[0]?.label || ''}" />
              <label style="margin-top:6px">Số liệu 01 (Giá trị)</label>
              <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-metric-idx="0" data-metric-prop="value" value="${metrics[0]?.value || ''}" />
            </div>
            <div class="form-group">
              <label>Số liệu 02 (Nhãn)</label>
              <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-metric-idx="1" data-metric-prop="label" value="${metrics[1]?.label || ''}" />
              <label style="margin-top:6px">Số liệu 02 (Giá trị)</label>
              <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-metric-idx="1" data-metric-prop="value" value="${metrics[1]?.value || ''}" />
            </div>
            <div class="form-group">
              <label>Số liệu 03 (Nhãn)</label>
              <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-metric-idx="2" data-metric-prop="label" value="${metrics[2]?.label || ''}" />
              <label style="margin-top:6px">Số liệu 03 (Giá trị)</label>
              <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-metric-idx="2" data-metric-prop="value" value="${metrics[2]?.value || ''}" />
            </div>
            <div class="form-group">
              <label>Số liệu 04 (Nhãn)</label>
              <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-metric-idx="3" data-metric-prop="label" value="${metrics[3]?.label || ''}" />
              <label style="margin-top:6px">Số liệu 04 (Giá trị)</label>
              <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-metric-idx="3" data-metric-prop="value" value="${metrics[3]?.value || ''}" />
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function bindSeasonInputs(container, eventType) {
  const getObj = () => (eventType === 'tedx' ? state.tedxSeasons : state.escSeasons);

  container.querySelectorAll('[data-season-field]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const key = e.target.dataset.seasonKey;
      const field = e.target.dataset.seasonField;
      const obj = getObj();
      if (obj && obj[key]) {
        obj[key][field] = e.target.value;
        setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu lên máy chủ', '#d97706', true);
      }
    });
  });

  container.querySelectorAll('[data-metric-prop]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const key = e.target.dataset.seasonKey;
      const idx = Number(e.target.dataset.metricIdx);
      const prop = e.target.dataset.metricProp;
      const obj = getObj();
      if (obj && obj[key]) {
        if (!Array.isArray(obj[key].metrics)) {
          obj[key].metrics = [
            { label: 'Số liệu 01', value: '100+' },
            { label: 'Số liệu 02', value: '1M+' },
            { label: 'Số liệu 03', value: '19' },
            { label: 'Số liệu 04', value: '50+' }
          ];
        }
        if (!obj[key].metrics[idx]) obj[key].metrics[idx] = { label: '', value: '' };
        obj[key].metrics[idx][prop] = e.target.value;
        // Tự động đồng bộ số liệu mùa mới nhất sang các thẻ hiển thị trên trang chủ
        const allKeys = Object.keys(obj).sort((a,b) => Number(a)-Number(b));
        const latestKey = allKeys[allKeys.length - 1];
        if (key === latestKey && state.annualEvents?.[eventType]?.metrics) {
          const mainMetrics = state.annualEvents[eventType].metrics;
          if (mainMetrics[idx]) {
            if (prop === 'label') mainMetrics[idx].label = e.target.value;
            if (prop === 'value') {
              const p = parseMetricValue(e.target.value);
              mainMetrics[idx].value = e.target.value;
              mainMetrics[idx].num = p.num;
              mainMetrics[idx].suf = p.suf;
              mainMetrics[idx].dec = p.dec;
            }
          }
        }
        state._isSynced = false;
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
        setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu lên máy chủ', '#d97706', true);
      }
    });
  });

  container.querySelectorAll('.btn-pick-season-img').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.seasonKey;
      openMediaPicker({
        title: `Chọn ảnh từ kho cho mùa ${key} (${eventType.toUpperCase()})`,
        onSelect: async (chosen) => {
          const obj = getObj();
          if (obj && obj[key]) {
            obj[key].image = chosen.webpUrl;
            obj[key].originalImage = chosen.originalUrl || chosen.webpUrl;
            await saveToServer(false);
            if (eventType === 'tedx') renderTedxEditor();
            else renderEscEditor();
            showToast(`Đã chọn ảnh cho mùa ${key} và lưu lên máy chủ!`);
          }
        }
      });
    });
  });

  container.querySelectorAll('.btn-adjust-season-img').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.seasonKey;
      const obj = getObj();
      const season = obj?.[key];
      if (!season?.image) {
        showToast('Mùa này chưa có ảnh. Hãy chọn ảnh trước!');
        return;
      }
      openAdjusterModal({
        title: `Căn chỉnh ảnh mùa ${key} (${eventType.toUpperCase()})`,
        subtitle: `Định vị tiêu điểm và căn chỉnh khung ảnh của mùa ${key}.`,
        aspectRatio: '16 / 9',
        imageUrl: season.image,
        currentPosition: season.imagePosition || '50% 50%',
        currentFit: season.imageFit || 'cover',
        onSave: async ({ position, fit }) => {
          season.imagePosition = position;
          season.imageFit = fit;
          await saveToServer(false);
          if (eventType === 'tedx') renderTedxEditor();
          else renderEscEditor();
          showToast(`Đã lưu căn chỉnh ảnh mùa ${key}!`);
        }
      });
    });
  });

  container.querySelectorAll('.season-file-upload').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const key = e.target.dataset.seasonKey;
      showToast(`Đang tải ảnh tư liệu cho mùa ${key}...`);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'X-File-Name': encodeURIComponent(file.name)
          },
          body: file
        });
        if (!res.ok) throw new Error(`Lỗi tải (${res.status})`);
        const data = await res.json();
        const obj = getObj();
        if (obj && obj[key]) {
          obj[key].image = data.webpUrl || data.originalUrl;
          obj[key].originalImage = data.originalUrl;
        }

        // Tự động đồng bộ vào kho hqGallery của Studio
        const photoId = `hq-${data.slug || Date.now()}`;
        if (!state.hqGallery.some((item) => item.webpUrl === data.webpUrl || item.originalUrl === data.originalUrl)) {
          state.hqGallery.unshift({
            id: photoId,
            title: `Ảnh mùa ${key} (${eventType.toUpperCase()})`,
            alt: `Ảnh tư liệu mùa ${key} ${eventType.toUpperCase()}`,
            caption: `${data.dimensions || 'Full-Res'} · Mùa ${key}`,
            webpUrl: data.webpUrl,
            originalUrl: data.originalUrl,
            dimensions: data.dimensions || 'Full-Res'
          });
        }

        // Tự động lưu trực tiếp lên máy chủ ngay sau khi upload để refresh không bao giờ bị mất!
        await saveToServer(false);

        if (eventType === 'tedx') renderTedxEditor();
        else renderEscEditor();
        renderMediaLibrary();
        updateStatsStrip();

        showToast(`Đã tải ảnh lên, gán vào mùa ${key} và lưu lên máy chủ thành công!`);
        setStatus('Đã tự động lưu ảnh mới vào máy chủ!', '#16a34a', false);
      } catch (err) {
        showToast(`Lỗi upload ảnh: ${err.message}`);
      }
    });
  });

  container.querySelectorAll('[data-remove-season]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.removeSeason;
      const obj = getObj();
      const theme = obj?.[key]?.theme || key;
      if (confirm(`Bạn có chắc muốn xóa mùa: "${theme}"?`)) {
        if (obj) delete obj[key];
        await saveToServer(false);
        if (eventType === 'tedx') renderTedxEditor();
        else renderEscEditor();
        updateStatsStrip();
        setStatus('Đã xóa mùa sự kiện và lưu lên máy chủ', '#16a34a', false);
      }
    });
  });
}

function renderEscEditor() {
  const container = document.getElementById('esc-editor-fields');
  if (!container || !state.annualEvents?.esc) return;
  const esc = state.annualEvents.esc;
  state.escSeasons = state.escSeasons || {};

  if (!Array.isArray(esc.metrics) || esc.metrics.length < 3) {
    esc.metrics = [
      { label: 'Contestants', value: '200+', num: 200, dec: 0, suf: '+' },
      { label: 'Universities & Colleges', value: '20+', num: 20, dec: 0, suf: '+' },
      { label: 'Total Prize Pool', value: '50+ Million', num: 50, dec: 0, suf: '+ Million' }
    ];
  }
  esc.editionMilestone = esc.editionMilestone || {
    label: 'Latest Edition Milestone',
    edition: 'ESC 2025',
    theme: 'BREAK THE NORM'
  };

  container.innerHTML = `
    <!-- Khối 1: Nội dung hiển thị trên ảnh sân khấu chính ESC (#esc trên Trang chủ) -->
    <div class="editor-repeater-item" style="border: 2px solid rgba(36,87,255,0.28); background: #ffffff; margin-bottom: 24px; padding: 22px; border-radius: 16px; box-shadow: 0 4px 20px rgba(36,87,255,0.04);">
      <div class="editor-repeater-head" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="pill pill-esc">Trang chủ #esc</span>
          <strong style="font-size:15px">Nội dung hiển thị trên ảnh sân khấu chính ESC</strong>
          <span class="adjust-badge" id="esc-adjust-badge">Vị trí: ${esc.imagePosition || 'center 30%'} · ${esc.imageFit || 'cover'}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button type="button" class="btn btn-esc" id="btn-pick-esc-stage">🖼️ Chọn từ kho ảnh</button>
          <button type="button" class="hq-trigger-light" id="btn-adjust-esc-stage">📐 Căn chỉnh khung ảnh</button>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Nhãn Pill trên sân khấu (Pill Badge)</label>
          <input type="text" class="form-input" id="esc-pill" value="${esc.pill || 'ANNUAL EVENT 01 · ENGLISH SPEAKING COMPETITION'}" />
        </div>
        <div class="form-group">
          <label>Dải Tag chân trang (Bottom Strip Tagline)</label>
          <input type="text" class="form-input" id="esc-logo-tag" value="${esc.logoTag || 'ENGLISH · CRITICAL THINKING · CONVICTION'}" />
        </div>
      </div>

      <div class="form-group" style="margin-top:10px">
        <label>Tiêu đề chính trên ảnh (H2) — <em>Hỗ trợ thẻ &lt;br&gt; xuống dòng và &lt;em&gt; in nghiêng nghệ thuật</em></label>
        <input type="text" class="form-input" id="esc-title-input" value="${esc.title || 'Your voice.<br><em>Your impact.</em>'}" style="font-weight:600;font-size:15px" />
      </div>

      <div class="form-group" style="margin-top:10px">
        <label>Đoạn văn mô tả ngắn hiển thị trên ảnh sân khấu</label>
        <textarea class="form-textarea" id="esc-desc-input">${esc.description || 'An academic arena for university and college students nationwide to confidently express critical thinking, stage presence, and personal voice in English.'}</textarea>
      </div>
      <div class="form-grid-2" style="margin-top:14px;padding:12px;background:#fff;border-radius:10px;border:1px solid var(--line)">
        <div class="form-group">
          <label>Nhãn nút bấm ESC (CTA Label)</label>
          <input type="text" class="form-input" id="esc-cta-label" value="${esc.cta?.label || 'View on Facebook'}" />
        </div>
        <div class="form-group">
          <label>Link nút bấm ESC (Facebook / URL)</label>
          <input type="text" class="form-input" id="esc-cta-url" value="${esc.cta?.url || 'https://www.facebook.com/share/p/1Frf2ebFwQ/'}" />
        </div>
      </div>

      <!-- 4 Thẻ chỉ số hiển thị đè trên ảnh sân khấu ESC -->
      <div style="margin-top:20px;padding:18px;background:var(--soft);border-radius:14px;border:1px solid var(--line)">
        <strong style="display:block;font-size:14px;margin-bottom:12px;color:var(--ink)">04 Thẻ chỉ số đục lỗ (Notched Cards) đè trên ảnh sân khấu ESC:</strong>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
          <!-- Card 1 -->
          <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid var(--line)">
            <span class="pill pill-esc" style="font-size:10px;margin-bottom:8px">Thẻ 01 · Thí sinh</span>
            <div class="form-group" style="margin-top:6px">
              <label>Nhãn (Label)</label>
              <input type="text" class="form-input" data-esc-metric-idx="0" data-esc-metric-field="label" value="${esc.metrics[0]?.label || 'Contestants'}" />
            </div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <div style="flex:1">
                <label>Số đếm</label>
                <input type="number" step="any" class="form-input" data-esc-metric-idx="0" data-esc-metric-field="num" value="${esc.metrics[0]?.num ?? 200}" />
              </div>
              <div style="width:70px">
                <label>Hậu tố</label>
                <input type="text" class="form-input" data-esc-metric-idx="0" data-esc-metric-field="suf" value="${esc.metrics[0]?.suf ?? '+'}" />
              </div>
            </div>
          </div>

          <!-- Card 2 -->
          <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid var(--line)">
            <span class="pill pill-esc" style="font-size:10px;margin-bottom:8px">Thẻ 02 · ĐH &amp; CĐ</span>
            <div class="form-group" style="margin-top:6px">
              <label>Nhãn (Label)</label>
              <input type="text" class="form-input" data-esc-metric-idx="1" data-esc-metric-field="label" value="${esc.metrics[1]?.label || 'Universities & Colleges'}" />
            </div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <div style="flex:1">
                <label>Số đếm</label>
                <input type="number" step="any" class="form-input" data-esc-metric-idx="1" data-esc-metric-field="num" value="${esc.metrics[1]?.num ?? 20}" />
              </div>
              <div style="width:70px">
                <label>Hậu tố</label>
                <input type="text" class="form-input" data-esc-metric-idx="1" data-esc-metric-field="suf" value="${esc.metrics[1]?.suf ?? '+'}" />
              </div>
            </div>
          </div>

          <!-- Card 3 -->
          <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid var(--line)">
            <span class="pill pill-esc" style="font-size:10px;margin-bottom:8px">Thẻ 03 · Giải thưởng</span>
            <div class="form-group" style="margin-top:6px">
              <label>Nhãn (Label)</label>
              <input type="text" class="form-input" data-esc-metric-idx="2" data-esc-metric-field="label" value="${esc.metrics[2]?.label || 'Total Prize Pool'}" />
            </div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <div style="flex:1">
                <label>Số đếm</label>
                <input type="number" step="any" class="form-input" data-esc-metric-idx="2" data-esc-metric-field="num" value="${esc.metrics[2]?.num ?? 50}" />
              </div>
              <div style="width:110px">
                <label>Hậu tố</label>
                <input type="text" class="form-input" data-esc-metric-idx="2" data-esc-metric-field="suf" value="${esc.metrics[2]?.suf ?? '+ Million'}" />
              </div>
            </div>
          </div>

          <!-- Card 4 (Milestone) -->
          <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid var(--line)">
            <span class="pill pill-esc" style="font-size:10px;margin-bottom:8px">Thẻ 04 · Cột mốc mùa</span>
            <div class="form-group" style="margin-top:6px">
              <label>Nhãn (Label)</label>
              <input type="text" class="form-input" id="esc-milestone-label" value="${esc.editionMilestone?.label || 'Latest Edition Milestone'}" />
            </div>
            <div class="form-group" style="margin-top:6px">
              <label>Tên mùa (Edition)</label>
              <input type="text" class="form-input" id="esc-milestone-edition" value="${esc.editionMilestone?.edition || 'ESC 2025'}" />
            </div>
            <div class="form-group" style="margin-top:6px">
              <label>Chủ đề (Theme)</label>
              <input type="text" class="form-input" id="esc-milestone-theme" value="${esc.editionMilestone?.theme || 'BREAK THE NORM'}" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Khối 2: Cấu hình mùa giải & Subpage ESC (/esc) -->
    <div style="margin-bottom:24px;padding:20px;background:var(--soft);border-radius:16px;border:1px solid var(--line)">
      <strong style="display:block;font-size:15px;margin-bottom:12px">Thông tin chung &amp; Trạng thái cuộc thi ESC (/esc)</strong>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Nhãn mùa giải gần nhất</label>
          <input type="text" class="form-input" id="esc-season" value="${esc.latestObservedEdition || ''}" />
        </div>
        <div class="form-group">
          <label>Trạng thái đăng ký (past / closed / open)</label>
          <select class="form-select" id="esc-status">
            <option value="past" ${esc.status === 'past' ? 'selected' : ''}>past — Mùa thi đã diễn ra (Hiển thị tư liệu)</option>
            <option value="closed" ${esc.status === 'closed' ? 'selected' : ''}>closed — Đã đóng đơn đăng ký</option>
            <option value="open" ${esc.status === 'open' ? 'selected' : ''}>open — Đang mở đăng ký chính thức</option>
          </select>
        </div>
      </div>
      <div class="form-group" style="margin-top:12px">
        <label>Mô tả tổng quan cuộc thi ESC trên subpage /esc</label>
        <textarea class="form-textarea" id="esc-summary">${esc.detailOverview || esc.description || ''}</textarea>
      </div>
    </div>

    <!-- Khối 3: Danh sách các mùa giải ESC -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <h3 style="font-size:16px">Danh sách các mùa giải ESC (Mặc định hiển thị năm mới nhất)</h3>
      <span class="pill pill-esc">${Object.keys(state.escSeasons).length} mùa trong hồ sơ</span>
    </div>
    <div id="esc-seasons-list">
      ${renderSeasonsListHtml('esc', state.escSeasons)}
    </div>
  `;

  container.querySelector('#btn-pick-esc-stage')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Chọn ảnh cho Sân khấu chính ESC',
      onSelect: async (chosen) => {
        if (!state.annualEvents) state.annualEvents = {};
        if (!state.annualEvents.esc) state.annualEvents.esc = {};
        state.annualEvents.esc.image = chosen.webpUrl;
        state.annualEvents.esc.originalImage = chosen.originalUrl || chosen.webpUrl;
        await saveToServer(false);
        renderEscEditor();
        showToast('Đã đổi ảnh sân khấu chính ESC!');
      }
    });
  });

  container.querySelector('#btn-adjust-esc-stage')?.addEventListener('click', () => {
    openAdjusterModal({
      title: 'Căn chỉnh ảnh sân khấu chính ESC (#esc)',
      subtitle: 'Định vị tiêu điểm để sân khấu và thí sinh hiển thị đẹp nhất trong khung toàn màn hình.',
      aspectRatio: '16 / 9',
      imageUrl: esc.image || '/assets/esc.webp',
      currentPosition: esc.imagePosition || 'center 30%',
      currentFit: esc.imageFit || 'cover',
      onSave: async ({ position, fit }) => {
        esc.imagePosition = position;
        esc.imageFit = fit;
        await saveToServer(false);
        renderEscEditor();
        showToast('Đã lưu căn chỉnh ảnh sân khấu chính ESC!');
      }
    });
  });

  container.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'esc-pill') esc.pill = t.value;
    if (t.id === 'esc-logo-tag') esc.logoTag = t.value;
    if (t.id === 'esc-title-input') esc.title = t.value;
    if (t.id === 'esc-desc-input') esc.description = t.value;
    if (t.id === 'esc-season') esc.latestObservedEdition = t.value;
    if (t.id === 'esc-summary') esc.detailOverview = t.value;
    if (t.id === 'esc-cta-label') {
      esc.cta = esc.cta || {};
      esc.cta.label = t.value;
    }
    if (t.id === 'esc-cta-url') {
      esc.cta = esc.cta || {};
      esc.cta.url = t.value;
      esc.cta.externalUrl = t.value;
    }

    if (t.id === 'esc-milestone-label') {
      esc.editionMilestone = esc.editionMilestone || {};
      esc.editionMilestone.label = t.value;
    }
    if (t.id === 'esc-milestone-edition') {
      esc.editionMilestone = esc.editionMilestone || {};
      esc.editionMilestone.edition = t.value;
    }
    if (t.id === 'esc-milestone-theme') {
      esc.editionMilestone = esc.editionMilestone || {};
      esc.editionMilestone.theme = t.value;
    }

    if (t.dataset.escMetricIdx !== undefined) {
      const idx = Number(t.dataset.escMetricIdx);
      const field = t.dataset.escMetricField;
      if (!esc.metrics[idx]) esc.metrics[idx] = {};
      if (field === 'num') {
        esc.metrics[idx].num = Number(t.value);
        esc.metrics[idx].value = `${t.value}${esc.metrics[idx].suf || ''}`;
      } else if (field === 'suf') {
        esc.metrics[idx].suf = t.value;
        esc.metrics[idx].value = `${esc.metrics[idx].num ?? ''}${t.value}`;
      } else if (field === 'label') {
        esc.metrics[idx].label = t.value;
      }
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
    setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu lên máy chủ', '#d97706', true);
  });

  const statusInput = container.querySelector('#esc-status');
  if (statusInput) {
    statusInput.onchange = (e) => {
      esc.status = e.target.value;
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
      setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu lên máy chủ', '#d97706', true);
    };
  }

  bindSeasonInputs(container, 'esc');
}

function renderTedxEditor() {
  const container = document.getElementById('tedx-editor-fields');
  if (!container || !state.tedxSeasons) return;

  const tedxEvent = state.annualEvents?.tedx || {};
  if (!Array.isArray(tedxEvent.metrics) || tedxEvent.metrics.length < 4) {
    tedxEvent.metrics = [
      { label: 'Tickets Sold Per Season', value: '100+', num: 100, dec: 0, suf: '+' },
      { label: 'YouTube Channel Views', value: '1M+', num: 1, dec: 0, suf: 'M+' },
      { label: 'Featured Speakers', value: '19', num: 19, dec: 0, suf: '' },
      { label: 'Sponsoring Partners', value: '50+', num: 50, dec: 0, suf: '+' }
    ];
  }

  container.innerHTML = `
    <!-- Khối 1: Nội dung hiển thị trên ảnh sân khấu chính TEDx (#tedx trên Trang chủ) -->
    <div class="editor-repeater-item" style="border: 2px solid rgba(235,0,40,0.28); background: #ffffff; margin-bottom: 24px; padding: 22px; border-radius: 16px; box-shadow: 0 4px 20px rgba(235,0,40,0.04);">
      <div class="editor-repeater-head" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="pill pill-tedx">Trang chủ #tedx</span>
          <strong style="font-size:15px">Nội dung hiển thị trên ảnh sân khấu chính TEDx</strong>
          <span class="adjust-badge" id="tedx-adjust-badge">Vị trí: ${tedxEvent.imagePosition || 'center 30%'} · ${tedxEvent.imageFit || 'cover'}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button type="button" class="btn btn-tedx" id="btn-pick-tedx-stage">🖼️ Chọn từ kho ảnh</button>
          <button type="button" class="hq-trigger-light" id="btn-adjust-tedx-stage">📐 Căn chỉnh khung ảnh</button>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label>Nhãn Pill trên sân khấu (Pill Badge)</label>
          <input type="text" class="form-input" id="tedx-pill" value="${tedxEvent.pill || 'ANNUAL EVENT 02 · TEDxFPTUniversityHCMC'}" />
        </div>
        <div class="form-group">
          <label>Dải Tag chân trang (Bottom Strip Tagline)</label>
          <input type="text" class="form-input" id="tedx-logo-tag" value="${tedxEvent.logoTag || 'TIKTOK 55K+ · FACEBOOK 14K+ · IG 3.5K+'}" />
        </div>
      </div>

      <div class="form-group" style="margin-top:10px">
        <label>Tiêu đề chính trên ảnh (H2) — <em>Hỗ trợ thẻ &lt;br&gt; xuống dòng và &lt;em&gt; in nghiêng nghệ thuật</em></label>
        <input type="text" class="form-input" id="tedx-title-input" value="${tedxEvent.title || 'Ideas worth<br><em>spreading.</em>'}" style="font-weight:600;font-size:15px" />
      </div>

      <div class="form-group" style="margin-top:10px">
        <label>Đoạn văn mô tả ngắn hiển thị trên ảnh sân khấu</label>
        <textarea class="form-textarea" id="tedx-desc-input">${tedxEvent.description || 'Stories that spark fresh perspectives. Skillcetera serves as the primary organizing unit of TEDxFPTUniversityHCMC across seasons from 2021 to 2025.'}</textarea>
      </div>
      <div class="form-grid-2" style="margin-top:14px;padding:12px;background:#fff;border-radius:10px;border:1px solid var(--line)">
        <div class="form-group">
          <label>Nhãn nút bấm TEDx (CTA Label)</label>
          <input type="text" class="form-input" id="tedx-cta-label" value="${tedxEvent.cta?.label || 'View on Facebook'}" />
        </div>
        <div class="form-group">
          <label>Link nút bấm TEDx (Facebook / URL)</label>
          <input type="text" class="form-input" id="tedx-cta-url" value="${tedxEvent.cta?.url || 'https://www.facebook.com/tedxfptuniversityhcmc'}" />
        </div>
      </div>

      <!-- 4 Thẻ chỉ số hiển thị đè trên ảnh sân khấu TEDx -->
      <div style="margin-top:20px;padding:18px;background:var(--soft);border-radius:14px;border:1px solid var(--line)">
        <strong style="display:block;font-size:14px;margin-bottom:12px;color:var(--ink)">04 Thẻ chỉ số đục lỗ (Notched Cards) đè trên ảnh sân khấu TEDx:</strong>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">
          <!-- Card 1 -->
          <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid var(--line)">
            <span class="pill pill-tedx" style="font-size:10px;margin-bottom:8px">Thẻ 01 · Vé bán ra</span>
            <div class="form-group" style="margin-top:6px">
              <label>Nhãn (Label)</label>
              <input type="text" class="form-input" data-tedx-metric-idx="0" data-tedx-metric-field="label" value="${tedxEvent.metrics[0]?.label || 'Tickets Sold Per Season'}" />
            </div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <div style="flex:1">
                <label>Số đếm</label>
                <input type="number" step="any" class="form-input" data-tedx-metric-idx="0" data-tedx-metric-field="num" value="${tedxEvent.metrics[0]?.num ?? 100}" />
              </div>
              <div style="width:70px">
                <label>Hậu tố</label>
                <input type="text" class="form-input" data-tedx-metric-idx="0" data-tedx-metric-field="suf" value="${tedxEvent.metrics[0]?.suf ?? '+'}" />
              </div>
            </div>
          </div>

          <!-- Card 2 -->
          <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid var(--line)">
            <span class="pill pill-tedx" style="font-size:10px;margin-bottom:8px">Thẻ 02 · Lượt xem YT</span>
            <div class="form-group" style="margin-top:6px">
              <label>Nhãn (Label)</label>
              <input type="text" class="form-input" data-tedx-metric-idx="1" data-tedx-metric-field="label" value="${tedxEvent.metrics[1]?.label || 'YouTube Channel Views'}" />
            </div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <div style="flex:1">
                <label>Số đếm</label>
                <input type="number" step="any" class="form-input" data-tedx-metric-idx="1" data-tedx-metric-field="num" value="${tedxEvent.metrics[1]?.num ?? 1}" />
              </div>
              <div style="width:70px">
                <label>Hậu tố</label>
                <input type="text" class="form-input" data-tedx-metric-idx="1" data-tedx-metric-field="suf" value="${tedxEvent.metrics[1]?.suf ?? 'M+'}" />
              </div>
            </div>
          </div>

          <!-- Card 3 -->
          <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid var(--line)">
            <span class="pill pill-tedx" style="font-size:10px;margin-bottom:8px">Thẻ 03 · Diễn giả</span>
            <div class="form-group" style="margin-top:6px">
              <label>Nhãn (Label)</label>
              <input type="text" class="form-input" data-tedx-metric-idx="2" data-tedx-metric-field="label" value="${tedxEvent.metrics[2]?.label || 'Featured Speakers'}" />
            </div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <div style="flex:1">
                <label>Số đếm</label>
                <input type="number" step="any" class="form-input" data-tedx-metric-idx="2" data-tedx-metric-field="num" value="${tedxEvent.metrics[2]?.num ?? 19}" />
              </div>
              <div style="width:70px">
                <label>Hậu tố</label>
                <input type="text" class="form-input" data-tedx-metric-idx="2" data-tedx-metric-field="suf" value="${tedxEvent.metrics[2]?.suf ?? ''}" />
              </div>
            </div>
          </div>

          <!-- Card 4 -->
          <div style="background:#fff;padding:12px;border-radius:10px;border:1px solid var(--line)">
            <span class="pill pill-tedx" style="font-size:10px;margin-bottom:8px">Thẻ 04 · Đối tác</span>
            <div class="form-group" style="margin-top:6px">
              <label>Nhãn (Label)</label>
              <input type="text" class="form-input" data-tedx-metric-idx="3" data-tedx-metric-field="label" value="${tedxEvent.metrics[3]?.label || 'Sponsoring Partners'}" />
            </div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <div style="flex:1">
                <label>Số đếm</label>
                <input type="number" step="any" class="form-input" data-tedx-metric-idx="3" data-tedx-metric-field="num" value="${tedxEvent.metrics[3]?.num ?? 50}" />
              </div>
              <div style="width:70px">
                <label>Hậu tố</label>
                <input type="text" class="form-input" data-tedx-metric-idx="3" data-tedx-metric-field="suf" value="${tedxEvent.metrics[3]?.suf ?? '+'}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Khối 2: Cấu hình subpage TEDx (/tedx) -->
    <div style="margin-bottom:24px;padding:20px;background:var(--soft);border-radius:16px;border:1px solid var(--line)">
      <strong style="display:block;font-size:15px;margin-bottom:12px">Thông tin chung cuộc thi TEDx trên subpage /tedx</strong>
      <div class="form-group">
        <label>Mô tả chi tiết tổng quan TEDx trên /tedx</label>
        <textarea class="form-textarea" id="tedx-summary">${tedxEvent.detailOverview || tedxEvent.description || ''}</textarea>
      </div>
    </div>

    <!-- Khối 3: Danh sách các mùa TEDx -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <h3 style="font-size:16px">Danh sách các mùa TEDxFPTUniversityHCMC (Mặc định hiển thị năm mới nhất)</h3>
      <span class="pill pill-tedx">${Object.keys(state.tedxSeasons).length} mùa trong hồ sơ</span>
    </div>
    <div id="tedx-seasons-list">
      ${renderSeasonsListHtml('tedx', state.tedxSeasons)}
    </div>
  `;

  container.querySelector('#btn-pick-tedx-stage')?.addEventListener('click', () => {
    openMediaPicker({
      title: 'Chọn ảnh cho Sân khấu chính TEDx',
      onSelect: async (chosen) => {
        if (!state.annualEvents) state.annualEvents = {};
        if (!state.annualEvents.tedx) state.annualEvents.tedx = {};
        state.annualEvents.tedx.image = chosen.webpUrl;
        state.annualEvents.tedx.originalImage = chosen.originalUrl || chosen.webpUrl;
        await saveToServer(false);
        renderTedxEditor();
        showToast('Đã đổi ảnh sân khấu chính TEDx!');
      }
    });
  });

  container.querySelector('#btn-adjust-tedx-stage')?.addEventListener('click', () => {
    openAdjusterModal({
      title: 'Căn chỉnh ảnh sân khấu chính TEDx (#tedx)',
      subtitle: 'Định vị tiêu điểm để thảm tròn đỏ và diễn giả hiển thị hoàn hảo nhất.',
      aspectRatio: '16 / 9',
      imageUrl: tedxEvent.image || '/assets/tedx.webp',
      currentPosition: tedxEvent.imagePosition || 'center 30%',
      currentFit: tedxEvent.imageFit || 'cover',
      onSave: async ({ position, fit }) => {
        tedxEvent.imagePosition = position;
        tedxEvent.imageFit = fit;
        await saveToServer(false);
        renderTedxEditor();
        showToast('Đã lưu căn chỉnh ảnh sân khấu chính TEDx!');
      }
    });
  });

  container.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'tedx-pill') tedxEvent.pill = t.value;
    if (t.id === 'tedx-logo-tag') tedxEvent.logoTag = t.value;
    if (t.id === 'tedx-title-input') tedxEvent.title = t.value;
    if (t.id === 'tedx-desc-input') tedxEvent.description = t.value;
    if (t.id === 'tedx-summary') tedxEvent.detailOverview = t.value;
    if (t.id === 'tedx-cta-label') {
      tedxEvent.cta = tedxEvent.cta || {};
      tedxEvent.cta.label = t.value;
    }
    if (t.id === 'tedx-cta-url') {
      tedxEvent.cta = tedxEvent.cta || {};
      tedxEvent.cta.url = t.value;
      tedxEvent.cta.externalUrl = t.value;
    }

    if (t.dataset.tedxMetricIdx !== undefined) {
      const idx = Number(t.dataset.tedxMetricIdx);
      const field = t.dataset.tedxMetricField;
      if (!tedxEvent.metrics[idx]) tedxEvent.metrics[idx] = {};
      if (field === 'num') {
        const val = parseFloat(t.value);
        tedxEvent.metrics[idx].num = isNaN(val) ? 0 : val;
        tedxEvent.metrics[idx].dec = String(t.value).includes('.') ? 1 : 0;
        tedxEvent.metrics[idx].value = `${t.value}${tedxEvent.metrics[idx].suf || ''}`;
      } else if (field === 'suf') {
        tedxEvent.metrics[idx].suf = t.value;
        tedxEvent.metrics[idx].value = `${tedxEvent.metrics[idx].num ?? ''}${t.value}`;
      } else if (field === 'label') {
        tedxEvent.metrics[idx].label = t.value;
      }
      // Đồng bộ sang mùa 2025 nếu có
      if (state.tedxSeasons?.['2025']?.metrics?.[idx]) {
        if (field === 'label') state.tedxSeasons['2025'].metrics[idx].label = t.value;
        else state.tedxSeasons['2025'].metrics[idx].value = tedxEvent.metrics[idx].value;
      }
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
    setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu lên máy chủ', '#d97706', true);
  });

  bindSeasonInputs(container, 'tedx');
}

function renderProjectsEditor() {
  const container = document.getElementById('projects-editor-fields');
  if (!container || !state.otherProjects) return;

  const entries = Object.entries(state.otherProjects);

  state.communityMilestones = state.communityMilestones || [
    {
      tag: 'S-STORE · MERCHANDISE',
      metric: '500+ lanyards · 100+ tees · 100+ totes',
      caption: 'Branded apparel & accessories designed by club members'
    },
    {
      tag: 'THE MONEYVERSE · VTV TIMES',
      metric: '10 Southern campuses',
      caption: 'Campus relations, student ambassador coordination & outreach'
    },
    {
      tag: 'SCAVENGER HUNT · SAIGON',
      metric: '6 seasons · 50+ members/season',
      caption: 'Exploration race across 10+ cultural & historical landmarks in Saigon'
    },
    {
      tag: 'DATA INTEGRITY PRINCIPLE',
      metric: 'Discrete Project Accounting',
      caption: 'Documented from source /2025 (Oct 24, 2026), never conflated'
    }
  ];

  const milestonesHtml = `
    <div class="editor-repeater-item" style="border: 2px solid rgba(0,0,0,0.12); background: #fafafa; margin-bottom: 28px; padding: 20px; border-radius: 14px;">
      <div class="editor-repeater-head" style="margin-bottom: 14px;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="pill">Trang chủ #community</span>
          <strong style="font-size:15px">4 Thẻ đục lỗ mốc dấu ấn dự án (Community Milestones)</strong>
        </div>
        <span class="pill pill-esc">${state.communityMilestones.length} thẻ dưới mục 5 dự án</span>
      </div>
      <p style="font-size:12.5px;color:var(--gray);margin-bottom:16px">
        Chỉnh sửa nhãn, số liệu nổi bật và mô tả của 4 thẻ đục lỗ hiển thị ngay dưới mục 5 Dự án trên Trang chủ (phần People &amp; Project Milestones).
      </p>

      <div style="display:flex;flex-direction:column;gap:14px">
        ${state.communityMilestones.map((ms, mIdx) => `
          <div style="border: 1px solid var(--line); border-radius: 10px; padding: 14px; background: #fff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <strong style="font-size:13px">Thẻ đục lỗ 0${mIdx + 1}</strong>
              <span class="pill">${ms.tag || `Thẻ 0${mIdx + 1}`}</span>
            </div>
            <div class="form-grid-2">
              <div class="form-group">
                <label>Nhãn thẻ phía trên (Tag)</label>
                <input type="text" class="form-input" data-milestone-idx="${mIdx}" data-milestone-field="tag" value="${ms.tag || ''}" />
              </div>
              <div class="form-group">
                <label>Số liệu nổi bật chính (Metric)</label>
                <input type="text" class="form-input" data-milestone-idx="${mIdx}" data-milestone-field="metric" value="${ms.metric || ''}" />
              </div>
            </div>
            <div class="form-group" style="margin-top:8px">
              <label>Mô tả chi tiết chân thẻ (Caption)</label>
              <input type="text" class="form-input" data-milestone-idx="${mIdx}" data-milestone-field="caption" value="${ms.caption || ''}" />
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const projectsHtml = entries
    .map(
      ([key, p], idx) => `
      <div class="editor-repeater-item">
        <div class="editor-repeater-head">
          <strong>0${idx + 1}. ${p.title}</strong>
          <span class="pill">${p.category}</span>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Tên dự án</label>
            <input type="text" class="form-input" data-proj-key="${key}" data-field="title" value="${p.title || ''}" />
          </div>
          <div class="form-group">
            <label>Danh mục</label>
            <input type="text" class="form-input" data-proj-key="${key}" data-field="category" value="${p.category || ''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Tóm tắt ngắn (Trang chủ)</label>
          <textarea class="form-textarea" data-proj-key="${key}" data-field="description">${p.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Nội dung chi tiết (Trang /projects)</label>
          <textarea class="form-textarea" data-proj-key="${key}" data-field="detailText">${p.detailText || ''}</textarea>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <label style="margin:0">Ảnh WebP hiển thị</label>
              <div style="display:flex;gap:6px">
                <button type="button" class="hq-trigger-light btn-pick-proj-img" data-proj-key="${key}">🖼️ Chọn ảnh</button>
                <button type="button" class="hq-trigger-light btn-adjust-proj-img" data-proj-key="${key}">📐 Căn chỉnh</button>
              </div>
            </div>
            <input type="text" class="form-input" data-proj-key="${key}" data-field="image" value="${p.image || ''}" />
            <div style="margin-top:4px">
              <span class="adjust-badge">Vị trí: ${p.imagePosition || '50% 50%'} · ${p.imageFit || 'cover'}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Ảnh gốc Full-Res (HQ Lightbox)</label>
            <input type="text" class="form-input" data-proj-key="${key}" data-field="originalImage" value="${p.originalImage || ''}" />
          </div>
        </div>
      </div>
    `
    )
    .join('');

  container.innerHTML = `
    ${milestonesHtml}
    <h3 style="font-size:16px;margin:22px 0 14px">Danh sách 5 Dự án &amp; Sáng kiến (/projects)</h3>
    ${projectsHtml}
  `;

  container.querySelectorAll('.btn-pick-proj-img').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.projKey;
      openMediaPicker({
        title: `Chọn ảnh cho dự án ${state.otherProjects[key]?.title || key}`,
        onSelect: async (chosen) => {
          if (state.otherProjects?.[key]) {
            state.otherProjects[key].image = chosen.webpUrl;
            state.otherProjects[key].originalImage = chosen.originalUrl || chosen.webpUrl;
            await saveToServer(false);
            renderProjectsEditor();
            showToast(`Đã chọn ảnh cho dự án ${state.otherProjects[key].title}!`);
          }
        }
      });
    });
  });

  container.querySelectorAll('.btn-adjust-proj-img').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.projKey;
      const proj = state.otherProjects?.[key];
      if (!proj?.image) {
        showToast('Dự án này chưa có ảnh. Hãy chọn ảnh trước!');
        return;
      }
      openAdjusterModal({
        title: `Căn chỉnh ảnh dự án ${proj.title || key}`,
        subtitle: 'Định vị tiêu điểm để thẻ dự án hiển thị trọng tâm đối tượng đẹp mắt.',
        aspectRatio: '16 / 10',
        imageUrl: proj.image,
        currentPosition: proj.imagePosition || '50% 50%',
        currentFit: proj.imageFit || 'cover',
        onSave: async ({ position, fit }) => {
          proj.imagePosition = position;
          proj.imageFit = fit;
          await saveToServer(false);
          renderProjectsEditor();
          showToast(`Đã lưu căn chỉnh ảnh dự án ${proj.title}!`);
        }
      });
    });
  });

  container.oninput = (e) => {
    const t = e.target;
    if (t.dataset.milestoneIdx !== undefined) {
      const idx = Number(t.dataset.milestoneIdx);
      const field = t.dataset.milestoneField;
      if (state.communityMilestones[idx]) {
        state.communityMilestones[idx][field] = t.value;
      }
      setStatus('Có thay đổi chưa lưu — Nhấn Lưu lên máy chủ hoặc Lưu nháp', '#d97706');
    }
    if (t.dataset.projKey) {
      const key = t.dataset.projKey;
      const field = t.dataset.field;
      if (state.otherProjects[key]) {
        state.otherProjects[key][field] = t.value;
      }
      setStatus('Có thay đổi chưa lưu — Nhấn Lưu lên máy chủ hoặc Lưu nháp', '#d97706');
    }
  };
}

function renderContactEditor() {
  const container = document.getElementById('contact-editor-fields');
  if (!container) return;

  const rec = state.siteMeta?.recruitment || {};
  const contact = state.siteMeta?.contact || {};
  const depts = rec.departments || [];

  const deptsHtml = depts
    .map(
      (d, idx) => `
      <div class="editor-repeater-item">
        <div class="editor-repeater-head">
          <div>
            <strong>DEPARTMENT 0${idx + 1} — ${d.name || 'Ban chuyên môn mới'}</strong>
            <span class="pill" style="margin-left:8px">${d.tag || `Department 0${idx + 1}`}</span>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            ${idx > 0 ? `<button type="button" class="hq-trigger-light" data-move-dept-up="${idx}" title="Chuyển lên trên">↑ Lên</button>` : ''}
            ${idx < depts.length - 1 ? `<button type="button" class="hq-trigger-light" data-move-dept-down="${idx}" title="Chuyển xuống dưới">↓ Xuống</button>` : ''}
            <button type="button" class="hq-trigger-light" data-remove-dept="${idx}">Xóa ban này</button>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Tên ban chuyên môn</label>
            <input type="text" class="form-input" data-dept-idx="${idx}" data-dept-field="name" value="${d.name || ''}" placeholder="VD: Ban Sự kiện (Event Organizing)" />
          </div>
          <div class="form-group">
            <label>Thẻ hiển thị / Tên tiếng Anh (Tag)</label>
            <input type="text" class="form-input" data-dept-idx="${idx}" data-dept-field="tag" value="${d.tag || ''}" placeholder="VD: Event Organizing" />
          </div>
        </div>
        <div class="form-group">
          <label>Mô tả nhiệm vụ &amp; công việc</label>
          <textarea class="form-textarea" data-dept-idx="${idx}" data-dept-field="desc" placeholder="Mô tả vai trò và hoạt động cụ thể của ban...">${d.desc || ''}</textarea>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Kỹ năng rèn luyện / yêu cầu</label>
            <input type="text" class="form-input" data-dept-idx="${idx}" data-dept-field="skills" value="${d.skills || ''}" placeholder="VD: Điều phối, Quản lý rủi ro" />
          </div>
          <div class="form-group">
            <label>Đặc trưng / Trọng tâm hoạt động</label>
            <input type="text" class="form-input" data-dept-idx="${idx}" data-dept-field="focus" value="${d.focus || ''}" placeholder="VD: Trực chiến sân khấu" />
          </div>
        </div>
      </div>
    `
    )
    .join('');

  const boardHtml = (contact.contacts || [])
    .map(
      (b, idx) => `
      <div class="editor-repeater-item">
        <div class="form-grid-2">
          <div class="form-group">
            <label>Họ tên (${b.role})</label>
            <input type="text" class="form-input" data-board-idx="${idx}" data-field="name" value="${b.name || ''}" />
          </div>
          <div class="form-group">
            <label>Email cá nhân</label>
            <input type="text" class="form-input" data-board-idx="${idx}" data-field="email" value="${b.email || ''}" />
          </div>
        </div>
      </div>
    `
    )
    .join('');

  container.innerHTML = `
    <div class="form-grid-2">
      <div class="form-group">
        <label>Trạng thái đợt tuyển thành viên (/join)</label>
        <select class="form-select" id="rec-status">
          <option value="closed" ${rec.status === 'closed' ? 'selected' : ''}>closed — Đã đóng đơn (Chỉ hiện thông báo & theo dõi Fanpage)</option>
          <option value="open" ${rec.status === 'open' ? 'selected' : ''}>open — Đang mở đơn tuyển chính thức</option>
        </select>
      </div>
      <div class="form-group">
        <label>Nhãn trạng thái tuyển quân</label>
        <input type="text" class="form-input" id="rec-label" value="${rec.badgeVi || ''}" />
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label>Email CLB chính thức</label>
        <input type="text" class="form-input" id="contact-email" value="${contact.clubEmail || ''}" />
      </div>
      <div class="form-group">
        <label>Email TEDxFPTUniversityHCMC riêng biệt</label>
        <input type="text" class="form-input" id="contact-tedx-email" value="${contact.tedxEmail || ''}" />
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin:28px 0 14px">
      <h3 style="font-size:16px;margin:0">Các ban chuyên môn đang hoạt động (/join) — Hiện có: ${depts.length} ban</h3>
      <button type="button" class="btn btn-esc" id="btn-add-dept-inline">+ Thêm ban chuyên môn</button>
    </div>
    ${deptsHtml || '<p style="color:var(--ink-soft);font-size:13.5px">Chưa có ban chuyên môn nào. Nhấn "+ Thêm ban chuyên môn" để tạo mới.</p>'}

    <h3 style="font-size:16px;margin:28px 0 12px">Đầu mối liên hệ Ban Chủ nhiệm CLB</h3>
    ${boardHtml}
  `;

  // Attach Department Actions (Delete & Move)
  container.querySelectorAll('[data-remove-dept]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-remove-dept'));
      if (confirm(`Bạn có chắc muốn xóa ban: "${depts[idx]?.name || 'này'}"?`)) {
        state.siteMeta.recruitment.departments.splice(idx, 1);
        renderContactEditor();
        setStatus('Đã xóa ban chuyên môn — Nhấn Lưu để áp dụng', '#d97706');
      }
    });
  });

  container.querySelectorAll('[data-move-dept-up]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-move-dept-up'));
      if (idx > 0) {
        const arr = state.siteMeta.recruitment.departments;
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        renderContactEditor();
        setStatus('Đã đổi thứ tự ban chuyên môn — Nhấn Lưu để áp dụng', '#d97706');
      }
    });
  });

  container.querySelectorAll('[data-move-dept-down]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-move-dept-down'));
      const arr = state.siteMeta.recruitment.departments;
      if (idx < arr.length - 1) {
        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
        renderContactEditor();
        setStatus('Đã đổi thứ tự ban chuyên môn — Nhấn Lưu để áp dụng', '#d97706');
      }
    });
  });

  const addDeptBtn = container.querySelector('#btn-add-dept-inline');
  if (addDeptBtn) {
    addDeptBtn.addEventListener('click', () => {
      if (!state.siteMeta.recruitment) state.siteMeta.recruitment = {};
      if (!Array.isArray(state.siteMeta.recruitment.departments)) {
        state.siteMeta.recruitment.departments = [];
      }
      const arr = state.siteMeta.recruitment.departments;
      const nextNum = arr.length + 1;
      arr.push({
        name: `Ban Chuyên môn Mới 0${nextNum}`,
        tag: `Department 0${nextNum}`,
        desc: 'Nhập mô tả vai trò, nhiệm vụ và công việc của ban chuyên môn tại đây.',
        skills: 'Làm việc nhóm, Kỹ năng chuyên môn',
        focus: 'Hoạt động CLB'
      });
      renderContactEditor();
      setStatus(`Đã thêm ban chuyên môn mới (Tổng: ${arr.length}) — Nhấn Lưu để áp dụng`, '#d97706');
    });
  }

  container.oninput = (e) => {
    const t = e.target;
    if (t.id === 'rec-status' && state.siteMeta?.recruitment) state.siteMeta.recruitment.status = t.value;
    if (t.id === 'rec-label' && state.siteMeta?.recruitment) state.siteMeta.recruitment.badgeVi = t.value;
    if (t.id === 'contact-email' && state.siteMeta?.contact) state.siteMeta.contact.clubEmail = t.value;
    if (t.id === 'contact-tedx-email' && state.siteMeta?.contact) state.siteMeta.contact.tedxEmail = t.value;
    if (t.dataset.boardIdx !== undefined) {
      const idx = Number(t.dataset.boardIdx);
      const field = t.dataset.field;
      if (state.siteMeta?.contact?.contacts?.[idx]) {
        state.siteMeta.contact.contacts[idx][field] = t.value;
      }
    }
    if (t.dataset.deptIdx !== undefined) {
      const idx = Number(t.dataset.deptIdx);
      const field = t.dataset.deptField;
      if (state.siteMeta?.recruitment?.departments?.[idx]) {
        state.siteMeta.recruitment.departments[idx][field] = t.value;
      }
    }
    setStatus('Có thay đổi chưa lưu — Nhấn Lưu lên máy chủ hoặc Lưu nháp', '#d97706');
  };
}

async function saveToServer(notify = true) {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
  try {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    const result = await res.json().catch(() => ({}));
    if (res.ok) {
      state._isSynced = true;
      state._lastSavedAt = Date.now();
      if (result.sha) state._sha = result.sha;
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
      if (result.syncedWithGitHub) {
        setStatus('Đã commit lên GitHub! Vercel đang deploy lại (20-30s)...', '#16a34a', false);
        if (notify) showToast('Đã lưu và commit lên GitHub thành công! Vercel sẽ tự cập nhật sau 20-30 giây.');
      } else {
        setStatus('Đã ghi trực tiếp vào public/data/content.json trên máy chủ!', '#16a34a', false);
        if (notify) showToast('Đã lưu toàn bộ nội dung lên máy chủ (/data/content.json)!');
      }
      updateStatsStrip();
      return;
    } else if (result.error === 'GITHUB_TOKEN_NOT_CONFIGURED') {
      setStatus('Cần cấu hình GITHUB_TOKEN trên Vercel', '#dc2626', false);
      if (notify) showToast('Cần thêm GITHUB_TOKEN trong Vercel Settings -> Environment Variables!');
      return;
    } else if (result.error) {
      setStatus(`Lỗi lưu: ${result.error}`, '#dc2626', false);
      if (notify) showToast(`Không thể lưu: ${result.error}`);
      return;
    }
  } catch {
    // Fallback to localStorage draft
  }
  setStatus('Đã lưu vào bộ nhớ trình duyệt (localStorage)', '#2563eb', false);
  updateStatsStrip();
  if (notify) showToast('Đã lưu bản nháp vào trình duyệt! Bạn cũng có thể Xuất content.json.');
}

function setupToolbarActions() {
  document.getElementById('btn-close-picker')?.addEventListener('click', closeMediaPicker);
  document.getElementById('studio-picker-backdrop')?.addEventListener('click', closeMediaPicker);
  document.getElementById('btn-close-adjuster')?.addEventListener('click', closeAdjusterModal);
  document.getElementById('studio-adjuster-backdrop')?.addEventListener('click', closeAdjusterModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMediaPicker();
      closeAdjusterModal();
    }
  });

  document.getElementById('btn-save-server')?.addEventListener('click', () => saveToServer(true));

  document.getElementById('btn-save-draft')?.addEventListener('click', () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
    setStatus('Đã lưu bản nháp vào trình duyệt (localStorage)', '#2563eb', false);
    updateStatsStrip();
    showToast('Đã lưu bản nháp thành công!');
  });

  // Global Ctrl + S / Cmd + S keyboard shortcut to save to server
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveToServer(true);
    }
  });

  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống tệp content.json!');
  });

  document.getElementById('input-import-json')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      state = { ...structuredClone(FULL_CONTENT), ...parsed };
      renderAllEditors();
      await saveToServer(true);
    } catch {
      showToast('Tệp JSON không hợp lệ.');
    }
  });

  document.getElementById('btn-reset-default')?.addEventListener('click', async () => {
    if (!confirm('Khôi phục toàn bộ nội dung về mặc định ban đầu từ hồ sơ CLB?')) return;
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    state = structuredClone(FULL_CONTENT);
    state.hqGallery = [];
    renderAllEditors();
    await saveToServer(false);
    showToast('Đã khôi phục dữ liệu chuẩn từ hồ sơ gốc của CLB!');
  });

  document.getElementById('btn-add-department')?.addEventListener('click', () => {
    if (!state.siteMeta.recruitment) state.siteMeta.recruitment = {};
    if (!Array.isArray(state.siteMeta.recruitment.departments)) {
      state.siteMeta.recruitment.departments = [];
    }
    const arr = state.siteMeta.recruitment.departments;
    const nextNum = arr.length + 1;
    arr.push({
      name: `Ban Chuyên môn Mới 0${nextNum}`,
      tag: `Department 0${nextNum}`,
      desc: 'Nhập mô tả vai trò, nhiệm vụ và công việc của ban chuyên môn tại đây.',
      skills: 'Làm việc nhóm, Kỹ năng chuyên môn',
      focus: 'Hoạt động CLB'
    });
    renderContactEditor();
    updateStatsStrip();
    setStatus(`Đã thêm ban chuyên môn mới (Tổng: ${arr.length}) — Bấm Ctrl + S để lưu`, '#d97706', true);
  });

  document.getElementById('btn-add-tedx-season')?.addEventListener('click', async () => {
    state.tedxSeasons = state.tedxSeasons || {};
    const keys = Object.keys(state.tedxSeasons);
    const maxYear = keys.reduce((acc, k) => Math.max(acc, Number(k) || 2025), 2025);
    const nextYear = String(maxYear + 1);
    const nextNum = keys.length + 1;
    state.tedxSeasons[nextYear] = {
      year: nextYear,
      theme: 'CHỦ ĐỀ MÙA MỚI',
      editionLabel: `Mùa ${nextYear} · Season ${String(nextNum).padStart(2, '0')}`,
      description: 'Nhập mô tả chủ đề mùa sự kiện TEDxFPTUniversityHCMC mới tại đây.',
      statusNote: 'Dự kiến / Mới cập nhật từ Studio.',
      image: '/assets/tedx.webp',
      originalImage: '/assets/tedx.jpg',
      metrics: [
        { label: 'Vé phát hành', value: '100+' },
        { label: 'Lượt xem YouTube', value: '1M+' },
        { label: 'Diễn giả', value: '18' },
        { label: 'Đối tác tài trợ', value: '50+' }
      ]
    };
    renderTedxEditor();
    updateStatsStrip();
    await saveToServer(false);
    setStatus(`Đã thêm mùa TEDx ${nextYear} và lưu lên máy chủ`, '#10b981', false);
  });

  document.getElementById('btn-add-esc-season')?.addEventListener('click', async () => {
    state.escSeasons = state.escSeasons || {};
    const keys = Object.keys(state.escSeasons);
    const maxYear = keys.reduce((acc, k) => Math.max(acc, Number(k) || 2025), 2025);
    const nextYear = String(maxYear + 1);
    state.escSeasons[nextYear] = {
      year: nextYear,
      theme: 'CHỦ ĐỀ MÙA THI MỚI',
      editionLabel: `ESC ${nextYear} · Grand Final`,
      description: 'Nhập mô tả cho mùa thi English Speaking Competition mới tại đây.',
      statusNote: 'Dự kiến / Mới cập nhật từ Studio.',
      image: '/assets/esc.webp',
      originalImage: '/assets/esc.png',
      metrics: [
        { label: 'Thí sinh tham dự', value: '200+' },
        { label: 'Trường ĐH, CĐ', value: '25+' },
        { label: 'Tổng giải thưởng', value: '60+ triệu' },
        { label: 'Dấu ấn mùa giải', value: 'CHỦ ĐỀ MỚI' }
      ]
    };
    renderEscEditor();
    updateStatsStrip();
    await saveToServer(false);
    setStatus(`Đã thêm mùa ESC ${nextYear} và lưu lên máy chủ`, '#10b981', false);
  });
}

function renderAllEditors() {
  renderMediaLibrary();
  renderAboutEditor();
  renderEscEditor();
  renderTedxEditor();
  renderProjectsEditor();
  renderContactEditor();
  updateStatsStrip();
}

const AUTH_KEY = 'skillcetera_admin_auth';

function checkAuth() {
  return sessionStorage.getItem(AUTH_KEY) === 'true' || localStorage.getItem(AUTH_KEY) === 'true';
}

function setupAuth() {
  const gate = document.getElementById('studio-auth-gate');
  const form = document.getElementById('studio-login-form');
  const userInp = document.getElementById('auth-username');
  const passInp = document.getElementById('auth-password');
  const remChk = document.getElementById('auth-remember');
  const errBox = document.getElementById('auth-error-msg');
  const card = document.getElementById('studio-auth-card');
  const logoutBtn = document.getElementById('btn-studio-logout');

  const updateUI = (isAuthed) => {
    if (isAuthed) {
      document.documentElement.classList.add('is-authenticated');
      if (gate) gate.style.display = 'none';
      const shell = document.getElementById('main-content');
      if (shell) shell.style.display = 'block';
    } else {
      document.documentElement.classList.remove('is-authenticated');
      if (gate) gate.style.display = 'flex';
      const shell = document.getElementById('main-content');
      if (shell) shell.style.display = 'none';
      if (userInp) {
        userInp.value = '';
        setTimeout(() => userInp.focus(), 150);
      }
      if (passInp) passInp.value = '';
      if (errBox) errBox.hidden = true;
    }
  };

  // Run initial state check
  updateUI(checkAuth());

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = (userInp?.value || '').trim();
      const p = (passInp?.value || '').trim();

      if (u.toLowerCase() === 'admin' && p === '321') {
        if (errBox) errBox.hidden = true;
        if (remChk?.checked) {
          localStorage.setItem(AUTH_KEY, 'true');
        } else {
          sessionStorage.setItem(AUTH_KEY, 'true');
        }
        showToast('Signed in successfully as Administrator.');
        updateUI(true);
      } else {
        if (errBox) {
          errBox.hidden = false;
          errBox.textContent = 'Invalid username or password. Please try again.';
        }
        if (card) {
          card.style.animation = 'none';
          void card.offsetWidth; // Trigger reflow
          card.style.animation = 'shake 0.35s ease';
        }
        if (passInp) {
          passInp.value = '';
          passInp.focus();
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_KEY);
      showToast('Signed out of Skillcetera Studio.');
      updateUI(false);
    });
  }
}

async function initStudio() {
  setupAuth();
  await fetchInitialContent();
  setupTabs();
  setupHQUploader();
  setupToolbarActions();
  renderAllEditors();
}

initStudio();

