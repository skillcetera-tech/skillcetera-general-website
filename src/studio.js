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
  try {
    const res = await fetch('/api/content', { cache: 'no-store' });
    if (res.ok) {
      const serverData = await res.json();
      state = { ...structuredClone(FULL_CONTENT), ...serverData };
    }
  } catch {
    try {
      const res = await fetch('/data/content.json', { cache: 'no-store' });
      if (res.ok) {
        const staticData = await res.json();
        state = { ...structuredClone(FULL_CONTENT), ...staticData };
      }
    } catch {
      // Keep FULL_CONTENT
    }
  }

  try {
    const draftRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draftRaw) {
      const draft = JSON.parse(draftRaw);
      state = { ...state, ...draft };
      setStatus('Đang mở bản nháp lưu trong trình duyệt (Nhấn Lưu lên máy chủ để ghi vào /data/content.json)', '#d97706', true);
    }
  } catch {
    // Ignore invalid draft
  }

  if (!Array.isArray(state.hqGallery)) {
    state.hqGallery = [];
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

function renderMediaLibrary() {
  const container = document.getElementById('studio-media-library');
  if (!container) return;

  const combined = [...state.hqGallery, ...BUILTIN_HQ_ASSETS];
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
        <div class="hq-gallery-caption">
          <div>
            <strong>${item.title}</strong>
            <span>${item.dimensions || 'Full-Res Original'}</span>
          </div>
          <button
            type="button"
            class="hq-trigger-light"
            data-hq-src="${item.originalUrl || item.webpUrl}"
            data-hq-title="${item.title}"
            data-hq-caption="${item.caption || ''}"
          >
            Xem Full-Res
          </button>
        </div>
      </article>
    `
    )
    .join('');
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
    specSize.textContent = `${sizeMB} MB · ${file.type.replace('image/', '').toUpperCase()}`;

    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    if (!titleInput.value) titleInput.value = baseName;
    if (!altInput.value) altInput.value = `Ảnh tư liệu Skillcetera: ${baseName}`;

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

      if (target === 'esc' && state.annualEvents?.esc) {
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

  container.oninput = (e) => {
    const target = e.target;
    if (target.id === 'meta-name') state.siteMeta.clubName = target.value;
    if (target.id === 'meta-founded') state.siteMeta.foundedYear = target.value;
    if (target.id === 'meta-tagline') state.siteMeta.taglineVi = target.value;
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
            <label>Đường dẫn ảnh hiển thị WebP</label>
            <input type="text" class="form-input" data-season-event="${eventType}" data-season-key="${key}" data-season-field="image" value="${s.image || ''}" />
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
        setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu lên máy chủ', '#d97706', true);
      }
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
        if (eventType === 'tedx') renderTedxEditor();
        else renderEscEditor();
        showToast(`Đã tải ảnh lên và gán vào mùa ${key}! Bấm Ctrl + S để lưu.`);
        setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu lên máy chủ', '#d97706', true);
      } catch (err) {
        showToast(`Lỗi upload ảnh: ${err.message}`);
      }
    });
  });

  container.querySelectorAll('[data-remove-season]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.removeSeason;
      const obj = getObj();
      const theme = obj?.[key]?.theme || key;
      if (confirm(`Bạn có chắc muốn xóa mùa: "${theme}"?`)) {
        if (obj) delete obj[key];
        if (eventType === 'tedx') renderTedxEditor();
        else renderEscEditor();
        updateStatsStrip();
        setStatus('Đã xóa mùa sự kiện — Nhấn Lưu để áp dụng', '#d97706', true);
      }
    });
  });
}

function renderEscEditor() {
  const container = document.getElementById('esc-editor-fields');
  if (!container || !state.annualEvents?.esc) return;
  const esc = state.annualEvents.esc;
  state.escSeasons = state.escSeasons || {};

  container.innerHTML = `
    <div style="margin-bottom:24px;padding:20px;background:var(--soft);border-radius:16px;border:1px solid var(--line)">
      <strong style="display:block;font-size:15px;margin-bottom:12px">Thông tin chung &amp; Trạng thái cuộc thi ESC</strong>
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
        <label>Mô tả tổng quan cuộc thi ESC</label>
        <textarea class="form-textarea" id="esc-summary">${esc.detailOverview || esc.description || ''}</textarea>
      </div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <h3 style="font-size:16px">Danh sách các mùa giải ESC (Mặc định hiển thị năm mới nhất)</h3>
      <span class="pill pill-esc">${Object.keys(state.escSeasons).length} mùa trong hồ sơ</span>
    </div>
    <div id="esc-seasons-list">
      ${renderSeasonsListHtml('esc', state.escSeasons)}
    </div>
  `;

  const seasonInput = container.querySelector('#esc-season');
  const statusInput = container.querySelector('#esc-status');
  const summaryInput = container.querySelector('#esc-summary');
  if (seasonInput) seasonInput.oninput = (e) => { esc.latestObservedEdition = e.target.value; setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu', '#d97706', true); };
  if (statusInput) statusInput.onchange = (e) => { esc.status = e.target.value; setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu', '#d97706', true); };
  if (summaryInput) summaryInput.oninput = (e) => { esc.detailOverview = e.target.value; setStatus('Có thay đổi chưa lưu — Bấm Ctrl + S để lưu', '#d97706', true); };

  bindSeasonInputs(container, 'esc');
}

function renderTedxEditor() {
  const container = document.getElementById('tedx-editor-fields');
  if (!container || !state.tedxSeasons) return;

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <h3 style="font-size:16px">Danh sách các mùa TEDxFPTUniversityHCMC (Mặc định hiển thị năm mới nhất)</h3>
      <span class="pill pill-tedx">${Object.keys(state.tedxSeasons).length} mùa trong hồ sơ</span>
    </div>
    <div id="tedx-seasons-list">
      ${renderSeasonsListHtml('tedx', state.tedxSeasons)}
    </div>
  `;

  bindSeasonInputs(container, 'tedx');
}

function renderProjectsEditor() {
  const container = document.getElementById('projects-editor-fields');
  if (!container || !state.otherProjects) return;

  const entries = Object.entries(state.otherProjects);
  container.innerHTML = entries
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
            <label>Ảnh WebP hiển thị</label>
            <input type="text" class="form-input" data-proj-key="${key}" data-field="image" value="${p.image || ''}" />
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

  container.oninput = (e) => {
    const t = e.target;
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
    if (res.ok) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setStatus('Đã ghi trực tiếp vào public/data/content.json trên máy chủ!', '#16a34a', false);
      updateStatsStrip();
      if (notify) showToast('Đã lưu toàn bộ nội dung lên máy chủ (/data/content.json)!');
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

  document.getElementById('btn-add-tedx-season')?.addEventListener('click', () => {
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
    setStatus(`Đã thêm mùa TEDx ${nextYear} — Bấm Ctrl + S để lưu`, '#10b981', true);
  });

  document.getElementById('btn-add-esc-season')?.addEventListener('click', () => {
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
    setStatus(`Đã thêm mùa ESC ${nextYear} — Bấm Ctrl + S để lưu`, '#10b981', true);
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

async function initStudio() {
  await fetchInitialContent();
  setupTabs();
  setupHQUploader();
  setupToolbarActions();
  renderAllEditors();
}

initStudio();

