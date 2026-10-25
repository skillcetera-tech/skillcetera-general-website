import { initMotion, splitWords } from './motion.js';
import { SITE_META, ANNUAL_EVENTS, ESC_SEASONS, TEDX_SEASONS, OTHER_PROJECTS } from './content/site-data.js';
import { initCursorSquares } from './cursor-squares.js';
import { initAmbientMotion } from './ambient-motion.js';

// Bind dynamic Hero Image from site-data if configured
const heroPic = document.querySelector('.hero-media picture');
if (heroPic && SITE_META?.heroImage) {
  const source = heroPic.querySelector('source');
  const img = heroPic.querySelector('img');
  if (source) source.srcset = SITE_META.heroImage;
  if (img) {
    img.src = SITE_META.heroOriginalImage || SITE_META.heroImage;
    if (SITE_META.heroImageAlt) img.alt = SITE_META.heroImageAlt;
    if (SITE_META.heroImagePosition) img.style.objectPosition = SITE_META.heroImagePosition;
    if (SITE_META.heroImageFit) img.style.objectFit = SITE_META.heroImageFit;
  }
}

// Bind ESC & TEDx stage image alignment
if (ANNUAL_EVENTS?.esc?.image) {
  const escImg = document.querySelector('#esc .tree-wrap img');
  if (escImg) {
    escImg.src = ANNUAL_EVENTS.esc.image;
    if (ANNUAL_EVENTS.esc.imagePosition) escImg.style.objectPosition = ANNUAL_EVENTS.esc.imagePosition;
    if (ANNUAL_EVENTS.esc.imageFit) escImg.style.objectFit = ANNUAL_EVENTS.esc.imageFit;
  }
}
if (ANNUAL_EVENTS?.tedx?.image) {
  const tedxImg = document.querySelector('#tedx .tree-wrap img');
  if (tedxImg) {
    tedxImg.src = ANNUAL_EVENTS.tedx.image;
    if (ANNUAL_EVENTS.tedx.imagePosition) tedxImg.style.objectPosition = ANNUAL_EVENTS.tedx.imagePosition;
    if (ANNUAL_EVENTS.tedx.imageFit) tedxImg.style.objectFit = ANNUAL_EVENTS.tedx.imageFit;
  }
}

let motion = initMotion();
let stopAmbient = initAmbientMotion();
let stopCursor = initCursorSquares();
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');
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

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !menu.hidden) {
    closeMenu();
    menuButton.focus();
  }
});

document.addEventListener('click', (event) => {
  if (!menu.hidden && !event.target.closest('.site-header')) closeMenu();
});
document.querySelector('.site-header').addEventListener('focusout', (event) => {
  if (!menu.hidden && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) closeMenu();
});
window.matchMedia('(max-width: 760px)').addEventListener('change', event => {
  if (!event.matches) closeMenu();
});

document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href').slice(1);
    if (!document.getElementById(id)) return;
    event.preventDefault();
    closeMenu();
    if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    motion.scrollToSection(id, { focus: event.detail === 0 });
  }),
);

window.addEventListener('popstate', () => {
  if (location.hash) motion.scrollToSection(location.hash.slice(1), { behavior: 'auto', focus: false });
});

// 3-panel Mission Hover/Focus/Click Accordion (Petalyx #loop pattern)
const missionPanels = [...document.querySelectorAll('#about .panel')];
const activateMission = (panel) => {
  if (window.innerWidth <= 760) return;
  missionPanels.forEach((item) => item.classList.toggle('is-active', item === panel));
};
missionPanels.forEach((panel) => {
  panel.addEventListener('mouseenter', () => activateMission(panel));
  panel.addEventListener('focus', () => activateMission(panel));
  panel.addEventListener('click', () => activateMission(panel));
});

// Scope each season selector to its own event and content collection.
const seasonCollections = { esc: ESC_SEASONS, tedx: TEDX_SEASONS };
document.querySelectorAll('[data-seasons]').forEach((panel) => {
  const collection = seasonCollections[panel.dataset.seasons];
  if (!collection) return;
  const buttons = [...panel.querySelectorAll('[data-year]')];
  const showSeason = button => {
    const season = collection[button.dataset.year];
    if (!season) return;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    for (const [selector, key] of [
      ['.season-year', 'year'], ['.season-edition', 'editionLabel'],
      ['.season-theme', 'theme'], ['.season-description', 'description'], ['.season-status', 'statusNote'],
    ]) {
      const element = panel.querySelector(selector);
      if (element) element.textContent = season[key] || '';
    }
  };
  buttons.forEach(button => button.addEventListener('click', () => showSeason(button)));
  const selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true');
  if (selected) showSeason(selected);
});

// 5 Projects selector + preview frame
const previewImage = document.querySelector('#project-preview-image');
const previewTitle = document.querySelector('#project-preview-title');
const previewMeta = document.querySelector('#project-preview-meta');
const previewLink = document.querySelector('#project-preview-link');

document.querySelectorAll('.project-item').forEach((itemEl) => {
  const activate = () => {
    const projectKey = itemEl.dataset.project;
    const project = projectKey ? OTHER_PROJECTS[projectKey] : null;
    document.querySelectorAll('.project-item').forEach((item) => {
      item.classList.toggle('active', item === itemEl);
    });
    if (previewImage) {
      previewImage.src = project?.image || itemEl.querySelector('.project-select')?.dataset.image;
      previewImage.alt = project?.alt || itemEl.querySelector('.mobile-project-image')?.alt || '';
      if (project?.imagePosition) previewImage.style.objectPosition = project.imagePosition;
      else previewImage.style.removeProperty('object-position');
      if (project?.imageFit) previewImage.style.objectFit = project.imageFit;
      else previewImage.style.removeProperty('object-fit');
    }
    if (previewTitle) {
      previewTitle.textContent = project?.title || itemEl.querySelector('.project-title')?.textContent || '';
    }
    if (previewMeta && project) {
      previewMeta.textContent = project.metricsLabel;
    }
    if (previewLink && project) {
      previewLink.href = project.linkUrl;
      previewLink.setAttribute('aria-label', project.linkLabel);
    }
  };

  itemEl.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') activate();
  });
  itemEl.addEventListener('focusin', activate);
});

let observer;
function observeSections() {
  observer?.disconnect();
  observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    document.querySelectorAll('.desktop-nav a').forEach((link) => {
      if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  },
  { rootMargin: '-15% 0px -50% 0px', threshold: [0, 0.2, 0.5] },
);

document.querySelectorAll('#about,#esc,#tedx,#projects,#community,#connect').forEach((section) =>
  observer.observe(section),
);
}
observeSections();

if (location.hash) {
  requestAnimationFrame(() => motion.scrollToSection(location.hash.slice(1), { behavior: 'auto', focus: false }));
}

const hydrateFromContent = async () => {
  try {
    let content = null;
    const local = localStorage.getItem('skillcetera_studio_draft');
    if (local) {
      content = JSON.parse(local);
    } else {
      const res = await fetch('/data/content.json');
      if (res.ok) content = await res.json();
    }
    if (!content) return;

    const meta = content.siteMeta || content.meta || {};

    // 1. Hero Image & Position/Fit
    const heroImg = document.querySelector('.hero-media img');
    const heroSource = document.querySelector('.hero-media source');
    if (meta.heroImage && heroImg) {
      if (heroImg.getAttribute('src') !== meta.heroImage) {
        if (heroSource) heroSource.srcset = meta.heroImage;
        heroImg.src = meta.heroOriginalImage || meta.heroImage;
      }
      if (meta.heroImagePosition) heroImg.style.objectPosition = meta.heroImagePosition;
      if (meta.heroImageFit) heroImg.style.objectFit = meta.heroImageFit;
    }

    // 2. About Us Section on Homepage (#about)
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      if (meta.aboutPill) {
        const pillEl = aboutSection.querySelector('.loop-head .pill');
        if (pillEl) pillEl.textContent = meta.aboutPill;
      }
      if (meta.aboutTitle) {
        const titleEl = document.getElementById('about-title');
        if (titleEl && titleEl.innerHTML !== meta.aboutTitle) {
          titleEl.innerHTML = meta.aboutTitle;
          delete titleEl.dataset.splitDone;
          splitWords(titleEl);
          motion?.refresh();
        }
      }
      if (meta.aboutLead) {
        const leadEl = aboutSection.querySelector('.about-lead');
        if (leadEl) leadEl.textContent = meta.aboutLead;
      }

      // 3. 3 Core Missions
      if (Array.isArray(content.missions) && content.missions.length > 0) {
        const panels = aboutSection.querySelectorAll('#track .panel.mission');
        content.missions.forEach((m, idx) => {
          const panel = panels[idx];
          if (!panel) return;
          const title = m.titleEn || m.titleVi || '';
          const desc = m.descriptionVi || m.description || '';
          const pill = m.pill || `MISSION ${m.index || `0${idx + 1}`} · ${title.toUpperCase()}`;

          panel.setAttribute('aria-label', `Mission ${m.index || `0${idx + 1}`}: ${title}`);
          const pillEl = panel.querySelector('.step .pill');
          if (pillEl) pillEl.textContent = pill;
          const h3El = panel.querySelector('.step h3');
          if (h3El) h3El.textContent = title;
          const pEl = panel.querySelector('.step p');
          if (pEl) pEl.textContent = desc;
        });
      }
    }

    // 4. Community Milestones Notched Ticket Cards below Projects
    if (Array.isArray(content.communityMilestones) && content.communityMilestones.length > 0) {
      const milestoneCards = document.querySelectorAll('.community-milestones .milestone-card');
      content.communityMilestones.forEach((item, idx) => {
        const card = milestoneCards[idx];
        if (!card) return;
        const smallEl = card.querySelector('small');
        if (smallEl && item.tag) smallEl.textContent = item.tag;
        const strongEl = card.querySelector('strong') || card.querySelector('b');
        if (strongEl && item.metric) strongEl.textContent = item.metric;
        const subEl = card.querySelector('.card-sub');
        if (subEl && item.caption) subEl.textContent = item.caption;
      });
    }
  } catch (_) {}
};
hydrateFromContent();

const warmDeferredImages = () => {
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    img.loading = 'eager';
  });
};
if (document.readyState === 'complete') {
  warmDeferredImages();
} else {
  window.addEventListener('load', warmDeferredImages, { once: true });
}

window.addEventListener(
  'pagehide',
  () => {
    observer.disconnect();
    stopAmbient();
    stopCursor();
    motion.destroy();
  },
);
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  motion = initMotion();
  stopAmbient = initAmbientMotion();
  stopCursor = initCursorSquares();
  observeSections();
  motion.refresh();
});
