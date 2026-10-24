import { FULL_CONTENT } from './content/site-data.js';

const DRAFT_STORAGE_KEY = 'skillcetera_studio_draft';

function setupMobileDrawer() {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  if (!menuButton || !menu) return;

  const closeMenu = () => {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Mở menu');
  };

  menuButton.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Đóng menu' : 'Mở menu');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!menu.hidden && !event.target.closest('.site-header')) closeMenu();
  });
}

function setupSqFields() {
  document.querySelectorAll('.sq-field').forEach((field) => {
    if (field.children.length > 0) return;
    const count = Number(field.dataset.count || 16);
    for (let i = 0; i < count; i += 1) {
      const sq = document.createElement('span');
      sq.className = 'grid-sq';
      const size = 28 + ((i * 17) % 36);
      sq.style.width = `${size}px`;
      sq.style.height = `${size}px`;
      sq.style.left = `${(i * 19 + 5) % 92}%`;
      sq.style.top = `${(i * 29 + 7) % 78}%`;
      field.appendChild(sq);
    }
  });
}

function setupHQLightbox() {
  let modal = document.getElementById('hq-lightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'hq-lightbox';
    modal.className = 'hq-lightbox';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Trình xem ảnh chất lượng cao');
    modal.innerHTML = `
      <div class="hq-lightbox-top">
        <div class="hq-lightbox-meta">
          <span class="hq-lightbox-badge" id="hq-lightbox-res">ORIGINAL HQ</span>
          <strong id="hq-lightbox-title" style="font-size:14px">Ảnh tư liệu gốc Skillcetera</strong>
        </div>
        <div class="hq-lightbox-actions">
          <button type="button" class="hq-trigger" id="hq-lightbox-zoom">Phóng to 1:1</button>
          <a class="hq-trigger" id="hq-lightbox-download" href="#" download>Tải ảnh gốc (Full-Res)</a>
          <button type="button" class="hq-trigger" id="hq-lightbox-close" aria-label="Đóng">Đóng ✕</button>
        </div>
      </div>
      <div class="hq-lightbox-stage" id="hq-lightbox-stage">
        <img id="hq-lightbox-img" src="" alt="" />
      </div>
      <div class="hq-lightbox-bottom" id="hq-lightbox-caption"></div>
    `;
    document.body.appendChild(modal);
  }

  const img = document.getElementById('hq-lightbox-img');
  const titleEl = document.getElementById('hq-lightbox-title');
  const captionEl = document.getElementById('hq-lightbox-caption');
  const resBadge = document.getElementById('hq-lightbox-res');
  const downloadBtn = document.getElementById('hq-lightbox-download');
  const zoomBtn = document.getElementById('hq-lightbox-zoom');
  const closeBtn = document.getElementById('hq-lightbox-close');
  const stage = document.getElementById('hq-lightbox-stage');

  const closeModal = () => {
    modal.classList.remove('open', 'zoomed');
    zoomBtn.textContent = 'Phóng to 1:1';
  };

  const toggleZoom = () => {
    const isZoomed = modal.classList.toggle('zoomed');
    zoomBtn.textContent = isZoomed ? 'Thu nhỏ vừa khung' : 'Phóng to 1:1';
  };

  const openModal = ({ src, title, caption }) => {
    if (!src) return;
    resBadge.textContent = 'ĐANG TẢI ẢNH GỐC...';
    img.src = src;
    img.alt = title || caption || 'Ảnh tư liệu gốc Skillcetera';
    titleEl.textContent = title || 'Tư liệu gốc chất lượng cao';
    captionEl.textContent = caption || src;
    downloadBtn.href = src;
    modal.classList.add('open');
    modal.classList.remove('zoomed');
    zoomBtn.textContent = 'Phóng to 1:1';
  };

  img.addEventListener('load', () => {
    if (img.naturalWidth && img.naturalHeight) {
      const ext = (img.currentSrc || img.src).split('.').pop().toUpperCase().split('?')[0];
      resBadge.textContent = `${img.naturalWidth} × ${img.naturalHeight} px · ${ext}`;
    } else {
      resBadge.textContent = 'ORIGINAL HQ';
    }
  });

  zoomBtn.addEventListener('click', toggleZoom);
  img.addEventListener('click', toggleZoom);
  closeBtn.addEventListener('click', closeModal);
  stage.addEventListener('click', (e) => {
    if (e.target === stage) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-hq-src]');
    if (!trigger) return;
    e.preventDefault();
    openModal({
      src: trigger.getAttribute('data-hq-src'),
      title: trigger.getAttribute('data-hq-title') || trigger.getAttribute('alt') || 'Tư liệu gốc Skillcetera',
      caption: trigger.getAttribute('data-hq-caption') || ''
    });
  });
}

function setupProjectFilters() {
  const filterBar = document.getElementById('project-filter-bar');
  const cards = Array.from(document.querySelectorAll('.project-detail-card[data-category]'));
  if (!filterBar || !cards.length) return;

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    const filter = btn.getAttribute('data-filter');
    filterBar.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.classList.toggle('active', chip === btn);
    });
    cards.forEach((card) => {
      const cat = card.getAttribute('data-category');
      const match = filter === 'all' || cat === filter;
      card.hidden = !match;
    });
  });
}

async function loadLatestContent() {
  let base = structuredClone(FULL_CONTENT);
  try {
    const res = await fetch('/data/content.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      base = { ...base, ...data };
    }
  } catch {
    // Use fallback FULL_CONTENT
  }

  try {
    const draftRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draftRaw) {
      const draft = JSON.parse(draftRaw);
      if (draft && typeof draft === 'object') {
        base = { ...base, ...draft };
      }
    }
  } catch {
    // Ignore invalid localStorage draft
  }
  return base;
}

function applyContentOverrides(content) {
  if (!content) return;

  // Render dynamic TEDx seasons on /tedx if container exists
  const tedxContainer = document.getElementById('tedx-seasons-grid');
  if (tedxContainer && content.tedxSeasons) {
    const seasonsList = Array.isArray(content.tedxSeasons)
      ? content.tedxSeasons
      : Object.values(content.tedxSeasons);

    tedxContainer.innerHTML = seasonsList
      .map(
        (item, idx) => `
        <article class="editorial-card" data-accent="tedx">
          <div class="editorial-card-top">
            <span class="editorial-idx">${item.editionLabel || `SEASON 0${idx + 1}`}</span>
            <span class="pill pill-tedx">${item.year}</span>
          </div>
          <div>
            <h3>${item.theme}</h3>
            <p style="margin-top:8px">${item.description || item.summary || ''}</p>
          </div>
          <div class="editorial-meta">
            <span>Vai trò: Đơn vị tổ chức</span>
            <span>${item.statusNote || 'Tư liệu CLB'}</span>
          </div>
        </article>
      `
      )
      .join('');
  }

  // Render dynamic departments on /join if container exists
  const deptGrid = document.getElementById('departments-grid');
  const depts = content.siteMeta?.recruitment?.departments;
  if (deptGrid && Array.isArray(depts)) {
    deptGrid.innerHTML = depts
      .map(
        (d, idx) => `
        <article class="editorial-card">
          <div class="editorial-card-top">
            <span class="editorial-idx">DEPARTMENT 0${idx + 1}</span>
            <span class="pill">${d.tag || `Department 0${idx + 1}`}</span>
          </div>
          <div>
            <h3>${d.name || ''}</h3>
            <p style="margin-top:8px">${d.desc || ''}</p>
          </div>
          <div class="editorial-meta">
            <span>Kỹ năng: ${d.skills || 'Làm việc nhóm'}</span>
            <span>${d.focus || 'Trọng tâm ban'}</span>
          </div>
        </article>
      `
      )
      .join('');
  }
  const deptCountBadge = document.getElementById('departments-count-badge');
  if (deptCountBadge && Array.isArray(depts)) {
    deptCountBadge.textContent = `${String(depts.length).padStart(2, '0')} BAN CHUYÊN MÔN`;
  }

  // Render custom HQ gallery uploads if present
  const customGallery = document.getElementById('custom-hq-gallery');
  if (customGallery && Array.isArray(content.hqGallery) && content.hqGallery.length > 0) {
    customGallery.innerHTML = content.hqGallery
      .map(
        (photo) => `
        <article class="hq-gallery-item">
          <div class="hq-gallery-thumb">
            <img
              src="${photo.webpUrl || photo.originalUrl}"
              alt="${photo.alt || photo.title || 'Ảnh tư liệu Skillcetera'}"
              data-hq-src="${photo.originalUrl || photo.webpUrl}"
              data-hq-title="${photo.title || 'Ảnh tư liệu chất lượng cao'}"
              data-hq-caption="${photo.caption || ''}"
            />
          </div>
          <div class="hq-gallery-caption">
            <div>
              <strong>${photo.title || 'Tư liệu Skillcetera'}</strong>
              <span>${photo.dimensions || 'HQ Original'}</span>
            </div>
            <button
              type="button"
              class="hq-trigger-light"
              data-hq-src="${photo.originalUrl || photo.webpUrl}"
              data-hq-title="${photo.title || 'Ảnh tư liệu chất lượng cao'}"
              data-hq-caption="${photo.caption || ''}"
            >
              Xem gốc
            </button>
          </div>
        </article>
      `
      )
      .join('');
  }
}

async function initSubpage() {
  setupMobileDrawer();
  setupSqFields();
  setupHQLightbox();
  setupProjectFilters();
  const content = await loadLatestContent();
  applyContentOverrides(content);
}

initSubpage();

