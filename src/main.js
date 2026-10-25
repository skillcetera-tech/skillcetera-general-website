import { initMotion } from './motion.js';
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
  menuButton.setAttribute('aria-label', 'Mở menu');
};

menuButton.addEventListener('click', () => {
  const opening = menu.hidden;
  menu.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Đóng menu' : 'Mở menu');
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

document.querySelectorAll('.project-select').forEach((button) => {
  const activate = () => {
    const itemEl = button.closest('.project-item');
    const projectKey = itemEl?.dataset.project;
    const project = projectKey ? OTHER_PROJECTS[projectKey] : null;
    document.querySelectorAll('.project-select').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
      item.closest('.project-item').classList.toggle('active', item === button);
    });
    if (previewImage) {
      previewImage.src = project?.image || button.dataset.image;
      previewImage.alt = project?.alt || itemEl.querySelector('.mobile-project-image').alt;
      if (project?.imagePosition) previewImage.style.objectPosition = project.imagePosition;
      else previewImage.style.removeProperty('object-position');
      if (project?.imageFit) previewImage.style.objectFit = project.imageFit;
      else previewImage.style.removeProperty('object-fit');
    }
    if (previewTitle) {
      previewTitle.textContent = project?.title || button.querySelector('.project-title').textContent;
    }
    if (previewMeta && project) {
      previewMeta.textContent = project.metricsLabel;
    }
    if (previewLink && project) {
      previewLink.href = project.linkUrl;
      previewLink.setAttribute('aria-label', project.linkLabel);
    }
  };
  button.addEventListener('click', activate);
  button.addEventListener('focus', activate);
  button.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') activate();
  });
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

const hydrateHeroFromContent = async () => {
  try {
    let content = null;
    const local = localStorage.getItem('skillcetera_studio_draft');
    if (local) {
      content = JSON.parse(local);
    } else {
      const res = await fetch('/data/content.json');
      if (res.ok) content = await res.json();
    }
    if (content?.meta?.heroImage) {
      const heroImg = document.querySelector('.hero-media img');
      const heroSource = document.querySelector('.hero-media source');
      if (heroImg && heroImg.getAttribute('src') !== content.meta.heroImage) {
        if (heroSource) heroSource.srcset = content.meta.heroImage;
        heroImg.src = content.meta.heroOriginalImage || content.meta.heroImage;
      }
    }
  } catch (_) {}
};
hydrateHeroFromContent();

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
