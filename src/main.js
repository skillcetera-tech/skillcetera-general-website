import { initMotion } from './motion.js';
import { TEDX_SEASONS, OTHER_PROJECTS } from './content/site-data.js';

const motion = initMotion();
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

document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href').slice(1);
    if (!document.getElementById(id)) return;
    event.preventDefault();
    closeMenu();
    history.pushState(null, '', `#${id}`);
    motion.scrollToSection(id, { focus: true });
  }),
);

window.addEventListener('popstate', () => {
  if (location.hash) motion.scrollToSection(location.hash.slice(1), { behavior: 'auto', focus: true });
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

// TEDx Season selector
document.querySelectorAll('[data-year]').forEach((button) =>
  button.addEventListener('click', () => {
    const year = button.dataset.year;
    const season = TEDX_SEASONS[year];
    if (!season) return;
    document.querySelectorAll('[data-year]').forEach((item) =>
      item.setAttribute('aria-pressed', String(item === button)),
    );
    const yearEl = document.querySelector('.season-year');
    const editionEl = document.querySelector('.season-edition');
    const themeEl = document.querySelector('.season-theme');
    const descEl = document.querySelector('.season-description');
    const statusEl = document.querySelector('.season-status');
    if (yearEl) yearEl.textContent = season.year;
    if (editionEl) editionEl.textContent = season.editionLabel;
    if (themeEl) themeEl.textContent = season.theme;
    if (descEl) descEl.textContent = season.description;
    if (statusEl) statusEl.textContent = season.statusNote;
  }),
);

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

const observer = new IntersectionObserver(
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
    motion.destroy();
  },
  { once: true },
);
