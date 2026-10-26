import { initMotion, splitWords } from './motion.js';
import { SITE_META, ANNUAL_EVENTS, ESC_SEASONS, TEDX_SEASONS, OTHER_PROJECTS } from './content/site-data.js';
import { initCursorSquares } from './cursor-squares.js';
import { initAmbientMotion } from './ambient-motion.js';

// Bind dynamic Hero Image from site-data if configured
const heroPic = document.querySelector('.hero-media picture');
if (heroPic && SITE_META?.heroImage) {
  const source = heroPic.querySelector('source');
  const img = heroPic.querySelector('img');
  if (source && source.getAttribute('srcset') !== SITE_META.heroImage) {
    source.srcset = SITE_META.heroImage;
  }
  if (img) {
    const targetSrc = SITE_META.heroOriginalImage || SITE_META.heroImage;
    if (img.getAttribute('src') !== targetSrc) img.src = targetSrc;
    if (SITE_META.heroImageAlt && img.alt !== SITE_META.heroImageAlt) img.alt = SITE_META.heroImageAlt;
    if (SITE_META.heroImagePosition && img.style.objectPosition !== SITE_META.heroImagePosition) img.style.objectPosition = SITE_META.heroImagePosition;
    if (SITE_META.heroImageFit && img.style.objectFit !== SITE_META.heroImageFit) img.style.objectFit = SITE_META.heroImageFit;
  }
}

// Bind dynamic ESC & TEDx stage content from site-data if configured
if (ANNUAL_EVENTS?.esc) {
  const esc = ANNUAL_EVENTS.esc;
  const escSection = document.getElementById('esc');
  if (escSection) {
    if (esc.image) {
      const escImg = escSection.querySelector('.tree-wrap img');
      if (escImg) {
        escImg.src = esc.image;
        if (esc.imagePosition) escImg.style.objectPosition = esc.imagePosition;
        if (esc.imageFit) escImg.style.objectFit = esc.imageFit;
      }
    }
    if (esc.pill) {
      const pill = escSection.querySelector('.pill.pill-esc');
      if (pill) pill.textContent = esc.pill;
    }
    if (esc.title) {
      const title = document.getElementById('esc-title');
      if (title) title.innerHTML = esc.title;
    }
    if (esc.description) {
      const desc = escSection.querySelector('.event-description');
      if (desc) desc.textContent = esc.description;
    }
    if (esc.logoTag) {
      const tag = escSection.querySelector('.logos.event-bottom .logo-tag');
      if (tag) tag.textContent = esc.logoTag;
    }
    if (Array.isArray(esc.metrics)) {
      const cards = escSection.querySelectorAll('.cards.event-metrics .card');
      esc.metrics.forEach((m, i) => {
        const card = cards[i];
        if (card && m) {
          const small = card.querySelector('small');
          if (small && m.label) small.textContent = m.label;
          const b = card.querySelector('b');
          if (b && m.num !== undefined) {
            b.dataset.to = m.num;
            if (m.dec !== undefined) b.dataset.dec = m.dec;
            if (m.suf !== undefined) b.dataset.suf = m.suf;
            b.textContent = `${m.num}${m.suf || ''}`;
          }
        }
      });
    }
    if (esc.editionMilestone) {
      const card4 = escSection.querySelector('.cards.event-metrics .card.card-edition');
      if (card4) {
        const small = card4.querySelector('small');
        if (small && esc.editionMilestone.label) small.textContent = esc.editionMilestone.label;
        const strong = card4.querySelector('strong');
        if (strong && esc.editionMilestone.edition) strong.textContent = esc.editionMilestone.edition;
        const sub = card4.querySelector('.card-sub');
        if (sub && esc.editionMilestone.theme) sub.textContent = esc.editionMilestone.theme;
      }
    }
  }
}

if (ANNUAL_EVENTS?.tedx) {
  const tedx = ANNUAL_EVENTS.tedx;
  const tedxSection = document.getElementById('tedx');
  if (tedxSection) {
    if (tedx.image) {
      const tedxImg = tedxSection.querySelector('.tree-wrap img');
      if (tedxImg) {
        tedxImg.src = tedx.image;
        if (tedx.imagePosition) tedxImg.style.objectPosition = tedx.imagePosition;
        if (tedx.imageFit) tedxImg.style.objectFit = tedx.imageFit;
      }
    }
    if (tedx.pill) {
      const pill = tedxSection.querySelector('.pill.pill-tedx');
      if (pill) {
        if (tedx.pill.includes('<')) pill.innerHTML = tedx.pill;
        else pill.textContent = tedx.pill;
      }
    }
    if (tedx.title) {
      const title = document.getElementById('tedx-title');
      if (title) title.innerHTML = tedx.title;
    }
    if (tedx.description) {
      const desc = tedxSection.querySelector('.event-description');
      if (desc) desc.textContent = tedx.description;
    }
    if (tedx.logoTag) {
      const tag = tedxSection.querySelector('.logos.event-bottom .logo-tag');
      if (tag) tag.textContent = tedx.logoTag;
    }
    if (Array.isArray(tedx.metrics)) {
      const cards = tedxSection.querySelectorAll('.cards.event-metrics .card');
      tedx.metrics.forEach((m, i) => {
        const card = cards[i];
        if (card && m) {
          const small = card.querySelector('small');
          if (small && m.label) small.textContent = m.label;
          const b = card.querySelector('b');
          if (b && m.num !== undefined) {
            b.dataset.to = m.num;
            if (m.dec !== undefined) b.dataset.dec = m.dec;
            if (m.suf !== undefined) b.dataset.suf = m.suf;
            b.textContent = `${m.num}${m.suf || ''}`;
          }
        }
      });
    }
  }
}

// Bind dynamic Hero Text from site-data if configured
if (SITE_META?.heroPill) {
  const pill = document.querySelector('.hero-pills > .pill');
  if (pill) pill.textContent = SITE_META.heroPill;
}
if (SITE_META?.heroTitle) {
  const title = document.getElementById('hero-title');
  if (title) title.innerHTML = SITE_META.heroTitle;
}
if (SITE_META?.heroCtaPrimaryText) {
  const btn = document.querySelector('.hero-actions .btn');
  if (btn) {
    btn.innerHTML = `${SITE_META.heroCtaPrimaryText} <span aria-hidden="true">↘</span>`;
    if (SITE_META.heroCtaPrimaryLink) btn.setAttribute('href', SITE_META.heroCtaPrimaryLink);
  }
}
if (SITE_META?.heroCtaSecondaryText) {
  const link = document.querySelector('.hero-actions .text-link');
  if (link) {
    link.innerHTML = `${SITE_META.heroCtaSecondaryText} <span aria-hidden="true">→</span>`;
    if (SITE_META.heroCtaSecondaryLink) link.setAttribute('href', SITE_META.heroCtaSecondaryLink);
  }
}
if (SITE_META?.heroImageCaption) {
  const cap = document.querySelector('.hero-photo-overlay > span:first-child');
  if (cap) cap.textContent = SITE_META.heroImageCaption;
}
if (SITE_META?.heroImageCredit) {
  const credit = document.querySelector('.hero-photo-overlay .image-credit');
  if (credit) credit.textContent = SITE_META.heroImageCredit;
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

    // 1. Hero Section on Homepage (#home)
    const heroSection = document.getElementById('home') || document.querySelector('.hero');
    if (heroSection) {
      // 1.1 Hero Image & Position/Fit
      const heroImg = heroSection.querySelector('.hero-media img');
      const heroSource = heroSection.querySelector('.hero-media source');
      if (meta.heroImage && heroImg) {
        const targetSrc = meta.heroOriginalImage || meta.heroImage;
        if (heroImg.getAttribute('src') !== targetSrc) {
          if (heroSource) heroSource.srcset = meta.heroImage;
          heroImg.src = targetSrc;
        }
        if (meta.heroImagePosition && heroImg.style.objectPosition !== meta.heroImagePosition) {
          heroImg.style.objectPosition = meta.heroImagePosition;
        }
        if (meta.heroImageFit && heroImg.style.objectFit !== meta.heroImageFit) {
          heroImg.style.objectFit = meta.heroImageFit;
        }
      }

      // 1.2 Hero Pill Badge
      if (meta.heroPill) {
        const pillEl = heroSection.querySelector('.hero-pills > .pill');
        if (pillEl && pillEl.textContent !== meta.heroPill) pillEl.textContent = meta.heroPill;
      }

      // 1.3 Hero Title (h1) with dynamic splitWords & GSAP refresh
      if (meta.heroTitle) {
        const heroTitleEl = document.getElementById('hero-title');
        if (heroTitleEl && heroTitleEl.innerHTML !== meta.heroTitle) {
          heroTitleEl.innerHTML = meta.heroTitle;
          delete heroTitleEl.dataset.splitDone;
          splitWords(heroTitleEl);
          motion?.refresh();
        }
      }

      // 1.4 Hero CTA Buttons & Links
      if (meta.heroCtaPrimaryText) {
        const btnPrimary = heroSection.querySelector('.hero-actions .btn');
        if (btnPrimary) {
          btnPrimary.innerHTML = `${meta.heroCtaPrimaryText} <span aria-hidden="true">↘</span>`;
          if (meta.heroCtaPrimaryLink) btnPrimary.setAttribute('href', meta.heroCtaPrimaryLink);
        }
      }
      if (meta.heroCtaSecondaryText) {
        const btnSecondary = heroSection.querySelector('.hero-actions .text-link');
        if (btnSecondary) {
          btnSecondary.innerHTML = `${meta.heroCtaSecondaryText} <span aria-hidden="true">→</span>`;
          if (meta.heroCtaSecondaryLink) btnSecondary.setAttribute('href', meta.heroCtaSecondaryLink);
        }
      }

      // 1.5 Hero Photo Overlay Captions
      if (meta.heroImageCaption) {
        const capEl = heroSection.querySelector('.hero-photo-overlay > span:first-child');
        if (capEl && capEl.textContent !== meta.heroImageCaption) capEl.textContent = meta.heroImageCaption;
      }
      if (meta.heroImageCredit) {
        const creditEl = heroSection.querySelector('.hero-photo-overlay .image-credit');
        if (creditEl && creditEl.textContent !== meta.heroImageCredit) creditEl.textContent = meta.heroImageCredit;
      }
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

    // 5. ESC Stage Section on Homepage (#esc)
    const escData = content.annualEvents?.esc;
    const escSec = document.getElementById('esc');
    if (escData && escSec) {
      if (escData.image) {
        const escImg = escSec.querySelector('.tree-wrap img');
        if (escImg) {
          if (escImg.getAttribute('src') !== escData.image) escImg.src = escData.image;
          if (escData.imagePosition) escImg.style.objectPosition = escData.imagePosition;
          if (escData.imageFit) escImg.style.objectFit = escData.imageFit;
        }
      }
      if (escData.pill) {
        const pillEl = escSec.querySelector('.pill.pill-esc');
        if (pillEl && pillEl.textContent !== escData.pill) pillEl.textContent = escData.pill;
      }
      if (escData.title) {
        const titleEl = document.getElementById('esc-title');
        if (titleEl && titleEl.innerHTML !== escData.title) {
          titleEl.innerHTML = escData.title;
          delete titleEl.dataset.splitDone;
          splitWords(titleEl);
          motion?.refresh();
        }
      }
      if (escData.description) {
        const descEl = escSec.querySelector('.event-description');
        if (descEl && descEl.textContent !== escData.description) descEl.textContent = escData.description;
      }
      if (escData.logoTag) {
        const tagEl = escSec.querySelector('.logos.event-bottom .logo-tag');
        if (tagEl && tagEl.textContent !== escData.logoTag) tagEl.textContent = escData.logoTag;
      }
      if (Array.isArray(escData.metrics)) {
        const cards = escSec.querySelectorAll('.cards.event-metrics .card');
        escData.metrics.forEach((m, idx) => {
          const card = cards[idx];
          if (!card || !m) return;
          const smallEl = card.querySelector('small');
          if (smallEl && m.label) smallEl.textContent = m.label;
          const bEl = card.querySelector('b');
          if (bEl && m.num !== undefined) {
            bEl.dataset.to = m.num;
            if (m.dec !== undefined) bEl.dataset.dec = m.dec;
            if (m.suf !== undefined) bEl.dataset.suf = m.suf;
            const finalVal = `${m.num}${m.suf || ''}`;
            const counterVal = bEl.querySelector('.event-counter-value');
            const counterAcc = bEl.querySelector('.event-counter-accessible');
            if (counterVal) counterVal.textContent = finalVal;
            if (counterAcc) counterAcc.textContent = finalVal;
            if (!counterVal && !counterAcc) bEl.textContent = finalVal;
          }
        });
      }
      if (escData.editionMilestone) {
        const card4 = escSec.querySelector('.cards.event-metrics .card.card-edition');
        if (card4) {
          const smallEl = card4.querySelector('small');
          if (smallEl && escData.editionMilestone.label) smallEl.textContent = escData.editionMilestone.label;
          const strongEl = card4.querySelector('strong');
          if (strongEl && escData.editionMilestone.edition) strongEl.textContent = escData.editionMilestone.edition;
          const subEl = card4.querySelector('.card-sub');
          if (subEl && escData.editionMilestone.theme) subEl.textContent = escData.editionMilestone.theme;
        }
      }
    }

    // 6. TEDx Stage Section on Homepage (#tedx)
    const tedxData = content.annualEvents?.tedx;
    const tedxSec = document.getElementById('tedx');
    if (tedxData && tedxSec) {
      if (tedxData.image) {
        const tedxImg = tedxSec.querySelector('.tree-wrap img');
        if (tedxImg) {
          if (tedxImg.getAttribute('src') !== tedxData.image) tedxImg.src = tedxData.image;
          if (tedxData.imagePosition) tedxImg.style.objectPosition = tedxData.imagePosition;
          if (tedxData.imageFit) tedxImg.style.objectFit = tedxData.imageFit;
        }
      }
      if (tedxData.pill) {
        const pillEl = tedxSec.querySelector('.pill.pill-tedx');
        if (pillEl) {
          if (tedxData.pill.includes('<')) {
            if (pillEl.innerHTML !== tedxData.pill) pillEl.innerHTML = tedxData.pill;
          } else {
            if (pillEl.textContent !== tedxData.pill) pillEl.textContent = tedxData.pill;
          }
        }
      }
      if (tedxData.title) {
        const titleEl = document.getElementById('tedx-title');
        if (titleEl && titleEl.innerHTML !== tedxData.title) {
          titleEl.innerHTML = tedxData.title;
          delete titleEl.dataset.splitDone;
          splitWords(titleEl);
          motion?.refresh();
        }
      }
      if (tedxData.description) {
        const descEl = tedxSec.querySelector('.event-description');
        if (descEl && descEl.textContent !== tedxData.description) descEl.textContent = tedxData.description;
      }
      if (tedxData.logoTag) {
        const tagEl = tedxSec.querySelector('.logos.event-bottom .logo-tag');
        if (tagEl && tagEl.textContent !== tedxData.logoTag) tagEl.textContent = tedxData.logoTag;
      }
      if (Array.isArray(tedxData.metrics)) {
        const cards = tedxSec.querySelectorAll('.cards.event-metrics .card');
        tedxData.metrics.forEach((m, idx) => {
          const card = cards[idx];
          if (!card || !m) return;
          const smallEl = card.querySelector('small');
          if (smallEl && m.label) smallEl.textContent = m.label;
          const bEl = card.querySelector('b');
          if (bEl && m.num !== undefined) {
            bEl.dataset.to = m.num;
            if (m.dec !== undefined) bEl.dataset.dec = m.dec;
            if (m.suf !== undefined) bEl.dataset.suf = m.suf;
            const finalVal = `${m.num}${m.suf || ''}`;
            const counterVal = bEl.querySelector('.event-counter-value');
            const counterAcc = bEl.querySelector('.event-counter-accessible');
            if (counterVal) counterVal.textContent = finalVal;
            if (counterAcc) counterAcc.textContent = finalVal;
            if (!counterVal && !counterAcc) bEl.textContent = finalVal;
          }
        });
      }
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
