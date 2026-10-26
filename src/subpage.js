import { FULL_CONTENT } from './content/site-data.js';
import { initCursorSquares } from './cursor-squares.js';
import { initAmbientMotion } from './ambient-motion.js';

const DRAFT_STORAGE_KEY = 'skillcetera_studio_draft';

function setupMobileDrawer() {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  if (!menuButton || !menu) return;

  const closeMenu = () => {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  };

  menuButton.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
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

function setupHQLightbox() {
  let modal = document.getElementById('hq-lightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'hq-lightbox';
    modal.className = 'hq-lightbox';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'High-Resolution Image Viewer');
    modal.innerHTML = `
      <div class="hq-lightbox-top">
        <div class="hq-lightbox-meta">
          <span class="hq-lightbox-badge" id="hq-lightbox-res">ORIGINAL HQ</span>
          <strong id="hq-lightbox-title" style="font-size:14px">Skillcetera Archival Photo</strong>
        </div>
        <div class="hq-lightbox-actions">
          <button type="button" class="hq-trigger" id="hq-lightbox-zoom">Zoom 1:1</button>
          <a class="hq-trigger" id="hq-lightbox-download" href="#" download>Download Original (Full-Res)</a>
          <button type="button" class="hq-trigger" id="hq-lightbox-close" aria-label="Close">Close ✕</button>
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
    zoomBtn.textContent = 'Zoom 1:1';
  };

  const toggleZoom = () => {
    const isZoomed = modal.classList.toggle('zoomed');
    zoomBtn.textContent = isZoomed ? 'Fit to Screen' : 'Zoom 1:1';
  };

  const openModal = ({ src, title, caption }) => {
    if (!src) return;
    resBadge.textContent = 'LOADING ORIGINAL IMAGE...';
    img.src = src;
    img.alt = title || caption || 'Skillcetera Archival Photo';
    titleEl.textContent = title || 'High-Resolution Archive Photo';
    captionEl.textContent = caption || src;
    downloadBtn.href = src;
    modal.classList.add('open');
    modal.classList.remove('zoomed');
    zoomBtn.textContent = 'Zoom 1:1';
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
      title: trigger.getAttribute('data-hq-title') || trigger.getAttribute('alt') || 'Skillcetera Archival Photo',
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
      card.style.display = match ? '' : 'none';
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

function setupSeasonShowcase(tabsId, spotlightId, seasonsData, accent) {
  const tabsContainer = document.getElementById(tabsId);
  const spotlightContainer = document.getElementById(spotlightId);
  if (!tabsContainer || !spotlightContainer || !seasonsData) return;

  const entries = typeof seasonsData === 'object' && !Array.isArray(seasonsData)
    ? Object.values(seasonsData)
    : (Array.isArray(seasonsData) ? seasonsData : []);

  if (entries.length === 0) return;

  // Sort newest year to top as default
  entries.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

  let activeYear = entries[0].year;

  const renderSpotlight = (year) => {
    const s = entries.find((item) => String(item.year) === String(year)) || entries[0];
    const metrics = Array.isArray(s.metrics) && s.metrics.length === 4
      ? s.metrics
      : [
          { label: 'Metric 01', value: '100+' },
          { label: 'Metric 02', value: '1M+' },
          { label: 'Metric 03', value: '19' },
          { label: 'Metric 04', value: '50+' }
        ];

    const fallbackImg = accent === 'tedx' ? '/assets/tedx.webp' : '/assets/esc.webp';
    const fallbackOrig = accent === 'tedx' ? '/assets/tedx.jpg' : '/assets/esc.png';
    const displayImg = s.webpUrl || s.image || fallbackImg;
    const displayOrig = s.originalUrl || s.originalImage || s.image || fallbackOrig;

    spotlightContainer.innerHTML = `
      <div class="season-spotlight-photo">
        <img
          src="${displayImg}"
          alt="Documentation ${s.editionLabel || `Season ${s.year}`}"
          data-hq-src="${displayOrig}"
          data-hq-title="${s.editionLabel || `Season ${s.year} — ${s.theme}`}"
          data-hq-caption="Original high-resolution archive photo from season ${s.year}."
        />
      </div>
      <div class="season-spotlight-info">
        <div>
          <span class="pill ${accent === 'tedx' ? 'pill-tedx' : 'pill-esc'}">SEASON ${s.year} · ${s.editionLabel || `Season ${s.year}`}</span>
          <h3 style="margin-top:10px">${s.theme || 'ALL THE WAY'}</h3>
          <p style="margin-top:8px">${s.description || ''}</p>
          ${s.statusNote ? `<small style="display:block;margin-top:6px;color:var(--gray)">${s.statusNote}</small>` : ''}
        </div>
        <div class="season-metrics-grid">
          ${metrics.map((m) => `
            <div class="season-metric-box" data-accent="${accent}">
              <small>${m.label}</small>
              <strong>${m.value}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  tabsContainer.innerHTML = entries.map((s, idx) => `
    <button
      type="button"
      class="season-tab-btn ${idx === 0 ? 'is-active' : ''}"
      data-accent="${accent}"
      data-season-year="${s.year}"
      aria-pressed="${idx === 0 ? 'true' : 'false'}"
    >
      ${s.year} ${idx === 0 ? '★ Latest' : ''}
    </button>
  `).join('');

  tabsContainer.querySelectorAll('[data-season-year]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeYear = btn.dataset.seasonYear;
      tabsContainer.querySelectorAll('[data-season-year]').forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle('is-active', isCurrent);
        b.setAttribute('aria-pressed', String(isCurrent));
      });
      renderSpotlight(activeYear);
    });
  });

  renderSpotlight(activeYear);
}

function applyContentOverrides(content) {
  if (!content) return;

  setupSeasonShowcase('tedx-season-tabs', 'tedx-season-spotlight', content.tedxSeasons, 'tedx');
  setupSeasonShowcase('esc-season-tabs', 'esc-season-spotlight', content.escSeasons, 'esc');

  // Render dynamic missions on /about if container exists
  const missionsGrid = document.getElementById('about-missions-grid');
  if (missionsGrid && Array.isArray(content.missions) && content.missions.length > 0) {
    missionsGrid.innerHTML = content.missions
      .map(
        (m, idx) => `
        <article class="editorial-card"${idx === 1 ? ' data-accent="esc"' : idx === 2 ? ' data-accent="tedx"' : ''}>
          <div class="editorial-card-top">
            <span class="editorial-idx">MISSION ${m.index || `0${idx + 1}`}</span>
            <span class="pill${idx === 1 ? ' pill-esc' : idx === 2 ? ' pill-tedx' : ''}">${m.titleEn || m.titleVi || ''}</span>
          </div>
          <div>
            <h3>${m.titleEn || m.titleVi || ''}</h3>
            <p style="margin-top:8px">${m.detailVi || m.descriptionVi || ''}</p>
          </div>
          <div class="editorial-meta">
            <span>${idx === 0 ? 'Consistent in Standards' : idx === 1 ? '2 Annual Flagships' : 'Multidimensional Dialogue'}</span>
            <span>${idx === 0 ? 'Flexible in Creativity' : idx === 1 ? '5 Multidisciplinary Projects' : 'Empathetic Culture'}</span>
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
      .map((d, idx) => {
        const isWide = d.roles && d.roles.length > 0;
        const respsHtml = Array.isArray(d.responsibilities) && d.responsibilities.length > 0
          ? `
            <div class="jd-block">
              <h4 class="jd-subtitle">📋 Nội dung công việc:</h4>
              <ul class="jd-list">
                ${d.responsibilities.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          `
          : '';

        const reqsHtml = Array.isArray(d.requirements) && d.requirements.length > 0
          ? `
            <div class="jd-block">
              <h4 class="jd-subtitle">🎯 Yêu cầu ứng viên:</h4>
              <ul class="jd-list req">
                ${d.requirements.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          `
          : '';

        const rolesHtml = Array.isArray(d.roles) && d.roles.length > 0
          ? `
            <div class="jd-roles-grid">
              ${d.roles.map(role => `
                <div class="jd-role-card">
                  <div class="jd-role-header">
                    <span class="jd-role-title">${role.title}</span>
                    <span class="jd-role-tag">${role.tag || ''}</span>
                  </div>
                  ${Array.isArray(role.duties) && role.duties.length > 0 ? `
                    <div>
                      <strong style="font-size:12px;color:var(--ink);display:block;margin-bottom:4px">Nội dung công việc:</strong>
                      <ul class="jd-list">
                        ${role.duties.map(dt => `<li>${dt}</li>`).join('')}
                      </ul>
                    </div>
                  ` : ''}
                  ${Array.isArray(role.requirements) && role.requirements.length > 0 ? `
                    <div style="margin-top:6px">
                      <strong style="font-size:12px;color:var(--ink);display:block;margin-bottom:4px">Yêu cầu:</strong>
                      <ul class="jd-list req">
                        ${role.requirements.map(rq => `<li>${rq}</li>`).join('')}
                      </ul>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `
          : '';

        return `
        <article class="editorial-card ${isWide ? 'card-wide' : ''}">
          <div class="editorial-card-top">
            <span class="editorial-idx">DEPARTMENT 0${idx + 1}</span>
            <span class="pill">${d.tag || `Department 0${idx + 1}`}</span>
          </div>
          <div>
            <h3>${d.name || ''}</h3>
            <p style="margin-top:8px">${d.desc || ''}</p>
          </div>
          ${respsHtml}
          ${reqsHtml}
          ${rolesHtml}
          <div class="editorial-meta">
            <span><b>Skills:</b> ${d.skills || 'Teamwork'}</span>
            <span><b>Focus:</b> ${d.focus || 'Key Focus'}</span>
          </div>
        </article>
      `;
      })
      .join('');
  }
  const deptCountBadge = document.getElementById('departments-count-badge');
  if (deptCountBadge && Array.isArray(depts)) {
    deptCountBadge.textContent = `${String(depts.length).padStart(2, '0')} DEPARTMENTS`;
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
              alt="${photo.alt || photo.title || 'Skillcetera Archival Photo'}"
              data-hq-src="${photo.originalUrl || photo.webpUrl}"
              data-hq-title="${photo.title || 'High-Resolution Archive Photo'}"
              data-hq-caption="${photo.caption || ''}"
            />
          </div>
          <div class="hq-gallery-caption">
            <div>
              <strong>${photo.title || 'Skillcetera Archive'}</strong>
              <span>${photo.dimensions || 'HQ Original'}</span>
            </div>
          </div>
        </article>
      `
      )
      .join('');
  }

  // Hydrate ESC subpage (/esc)
  const escSub = document.querySelector('.sub-section[data-accent="esc"]');
  if (escSub && content.annualEvents?.esc) {
    const esc = content.annualEvents.esc;
    if (esc.description) {
      const lead = document.querySelector('.sub-lead');
      if (lead) lead.textContent = esc.description;
    }
    if (esc.image) {
      const showcaseImg = document.querySelector('.sub-showcase img');
      if (showcaseImg) {
        showcaseImg.src = esc.image;
        if (esc.originalImage) showcaseImg.setAttribute('data-hq-src', esc.originalImage);
      }
    }
    if (Array.isArray(esc.metrics)) {
      const cards = escSub.querySelectorAll('.cards .card-esc');
      esc.metrics.forEach((m, idx) => {
        const c = cards[idx];
        if (!c || !m) return;
        const s = c.querySelector('small');
        if (s && m.label) s.textContent = m.label;
        const b = c.querySelector('b');
        if (b && (m.value || m.num !== undefined)) b.textContent = m.value || `${m.num}${m.suf || ''}`;
      });
    }
  }

  // Hydrate TEDx subpage (/tedx)
  const tedxSub = document.querySelector('.sub-section[data-accent="tedx"]');
  if (tedxSub && content.annualEvents?.tedx) {
    const tedx = content.annualEvents.tedx;
    if (tedx.description) {
      const lead = document.querySelector('.sub-lead');
      if (lead) lead.textContent = tedx.description;
    }
    if (tedx.image) {
      const showcaseImg = document.querySelector('.sub-showcase img');
      if (showcaseImg) {
        showcaseImg.src = tedx.image;
        if (tedx.originalImage) showcaseImg.setAttribute('data-hq-src', tedx.originalImage);
      }
    }
    if (Array.isArray(tedx.metrics)) {
      const cards = tedxSub.querySelectorAll('.cards .card-tedx');
      tedx.metrics.forEach((m, idx) => {
        const c = cards[idx];
        if (!c || !m) return;
        const s = c.querySelector('small');
        if (s && m.label) s.textContent = m.label;
        const b = c.querySelector('b');
        if (b && (m.value || m.num !== undefined)) b.textContent = m.value || `${m.num}${m.suf || ''}`;
      });
    }
  }
}

let stopAmbientMotion = null;
let stopCursorSquares = null;

function startMotion() {
  if (stopAmbientMotion) return;
  stopAmbientMotion = initAmbientMotion();
  stopCursorSquares = initCursorSquares();
}

function stopMotion() {
  stopAmbientMotion?.();
  stopCursorSquares?.();
  stopAmbientMotion = null;
  stopCursorSquares = null;
}

window.addEventListener('pagehide', stopMotion);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) startMotion();
});

async function initSubpage() {
  setupMobileDrawer();
  setupHQLightbox();
  setupProjectFilters();
  startMotion();
  const content = await loadLatestContent();
  applyContentOverrides(content);
}

initSubpage();

