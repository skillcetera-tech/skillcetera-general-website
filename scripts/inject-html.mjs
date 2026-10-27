/**
 * Static Site Generation (SSG) HTML Injector
 * Đọc public/data/content.json và bơm trực tiếp dữ liệu mới nhất vào index.html và các subpage
 * để triệt tiêu hoàn toàn hiện tượng Flash of Outdated Content (FOOC).
 */

export function injectContentIntoHtml(html, content) {
  if (!content) return html;

  const meta = content.siteMeta || {};
  const esc = content.annualEvents?.esc || {};
  const tedx = content.annualEvents?.tedx || {};

  // 1. Hero Section
  if (meta.heroTitle) {
    html = html.replace(
      /(<h1 id="hero-title"[^>]*>)([\s\S]*?)(<\/h1>)/,
      `$1${meta.heroTitle}$3`
    );
  }
  if (meta.heroPill) {
    html = html.replace(
      /(<div class="hero-pills"[^>]*>\s*<span class="pill"[^>]*>)([\s\S]*?)(<\/span>)/,
      `$1${meta.heroPill}$3`
    );
  }
  if (meta.heroImageCaption) {
    html = html.replace(
      /(<div class="hero-photo-overlay"[^>]*>\s*<span>)([\s\S]*?)(<\/span>)/,
      `$1${meta.heroImageCaption}$3`
    );
  }
  if (meta.heroImageCredit) {
    html = html.replace(
      /(<span class="image-credit"[^>]*>)([\s\S]*?)(<\/span>)/,
      `$1${meta.heroImageCredit}$3`
    );
  }
  if (meta.heroCtaPrimaryText) {
    html = html.replace(
      /(<div class="hero-actions"[^>]*>[\s\S]*?<a class="btn"[^>]*href=")([^"]*)(">\s*)([\s\S]*?)(\s*<span aria-hidden="true">↘<\/span><\/a>)/,
      `$1${meta.heroCtaPrimaryLink || '$2'}$3${meta.heroCtaPrimaryText}$5`
    );
  }
  if (meta.heroCtaSecondaryText) {
    html = html.replace(
      /(<div class="hero-actions"[^>]*>[\s\S]*?<a class="text-link"[^>]*href=")([^"]*)(">\s*)([\s\S]*?)(\s*<span aria-hidden="true">→<\/span><\/a>)/,
      `$1${meta.heroCtaSecondaryLink || '$2'}$3${meta.heroCtaSecondaryText}$5`
    );
  }
  if (meta.heroImage) {
    html = html.replace(
      /(<div class="hero-media"[^>]*>[\s\S]*?<source srcset=")([^"]*)(")/,
      `$1${meta.heroImage}$3`
    );
    html = html.replace(
      /(<div class="hero-media"[^>]*>[\s\S]*?<img src=")([^"]*)(")/,
      `$1${meta.heroOriginalImage || meta.heroImage}$3`
    );
    if (meta.heroImagePosition || meta.heroImageFit) {
      const pos = meta.heroImagePosition ? `object-position:${meta.heroImagePosition};` : '';
      const fit = meta.heroImageFit ? `object-fit:${meta.heroImageFit};` : '';
      html = html.replace(
        /(<div class="hero-media"[^>]*>[\s\S]*?<img [^>]*style=")([^"]*)(")/,
        `$1${pos}${fit}$3`
      );
    }
  }

  // 2. About Section
  if (meta.aboutPill) {
    html = html.replace(
      /(<div class="loop-head"[^>]*>\s*<span class="pill"[^>]*>)([\s\S]*?)(<\/span>)/,
      `$1${meta.aboutPill}$3`
    );
  }
  if (meta.aboutTitle) {
    html = html.replace(
      /(<h2 id="about-title"[^>]*>)([\s\S]*?)(<\/h2>)/,
      `$1${meta.aboutTitle}$3`
    );
  }
  if (meta.aboutLead) {
    html = html.replace(
      /(<p class="about-lead"[^>]*>)([\s\S]*?)(<\/p>)/,
      `$1${meta.aboutLead}$3`
    );
  }

  const sisc = content.annualEvents?.stepInto || {};

  // 2.5 Step Into Skillcetera Section (#step-into)
  if (sisc.pill) {
    html = html.replace(
      /(<section class="event-scene stats event-step-into"[^>]*>[\s\S]*?<span class="pill pill-sisc reveal">)([\s\S]*?)(<\/span>)/,
      `$1${sisc.pill}$3`
    );
  }
  if (sisc.headline) {
    html = html.replace(
      /(<h2 id="step-into-title"[^>]*>)([\s\S]*?)(<\/h2>)/,
      `$1${sisc.headline}$3`
    );
  }
  if (sisc.description) {
    html = html.replace(
      /(<section class="event-scene stats event-step-into"[^>]*>[\s\S]*?<p class="event-description reveal">)([\s\S]*?)(<\/p>)/,
      `$1${sisc.description}$3`
    );
  }
  if (sisc.image) {
    html = html.replace(
      /(<section class="event-scene stats event-step-into"[^>]*>[\s\S]*?<div class="tree-wrap event-photo">\s*<img src=")([^"]*)(")/,
      `$1${sisc.image}$3`
    );
  }

  // 3. ESC Stage Section (#esc)
  if (esc.pill) {
    html = html.replace(
      /(<section class="event-scene stats event-esc"[^>]*>[\s\S]*?<span class="pill pill-esc reveal">)([\s\S]*?)(<\/span>)/,
      `$1${esc.pill}$3`
    );
  }
  if (esc.title) {
    html = html.replace(
      /(<h2 id="esc-title"[^>]*>)([\s\S]*?)(<\/h2>)/,
      `$1${esc.title}$3`
    );
  }
  if (esc.description) {
    html = html.replace(
      /(<section class="event-scene stats event-esc"[^>]*>[\s\S]*?<p class="event-description reveal">)([\s\S]*?)(<\/p>)/,
      `$1${esc.description}$3`
    );
  }
  if (esc.logoTag) {
    html = html.replace(
      /(<section class="event-scene stats event-esc"[^>]*>[\s\S]*?<span class="logo-tag">)([\s\S]*?)(<\/span>)/,
      `$1${esc.logoTag}$3`
    );
  }
  if (esc.image) {
    html = html.replace(
      /(<section class="event-scene stats event-esc"[^>]*>[\s\S]*?<div class="tree-wrap event-photo">\s*<img src=")([^"]*)(")/,
      `$1${esc.image}$3`
    );
  }
  if (Array.isArray(esc.metrics) && esc.metrics.length >= 3) {
    const m0 = esc.metrics[0];
    const m1 = esc.metrics[1];
    const m2 = esc.metrics[2];
    const m3 = esc.editionMilestone || { label: 'Latest Edition Milestone', edition: 'ESC 2025', theme: 'BREAK THE NORM' };

    const calcDec = (m) => m?.dec ?? (String(m?.num ?? '').includes('.') ? 1 : 0);

    const escCardsHtml = `
            <div class="cards event-metrics">
              <div class="card card-esc">
                <small>${m0.label}</small>
                <b data-to="${m0.num ?? 200}" data-dec="${calcDec(m0)}" data-suf="${m0.suf ?? '+'}">${m0.value || `${m0.num ?? 200}${m0.suf ?? '+'}`}</b>
              </div>
              <div class="card card-esc">
                <small>${m1.label}</small>
                <b data-to="${m1.num ?? 20}" data-dec="${calcDec(m1)}" data-suf="${m1.suf ?? '+'}">${m1.value || `${m1.num ?? 20}${m1.suf ?? '+'}`}</b>
              </div>
              <div class="card card-esc">
                <small>${m2.label}</small>
                <b data-to="${m2.num ?? 50}" data-dec="${calcDec(m2)}" data-suf="${m2.suf ?? '+ Million'}">${m2.value || `${m2.num ?? 50}${m2.suf ?? '+ Million'}`}</b>
              </div>
              <div class="card card-esc card-edition">
                <small>${m3.label || 'Latest Edition Milestone'}</small>
                <strong>${m3.edition || 'ESC 2025'}</strong>
                <span class="card-sub">${m3.theme || 'BREAK THE NORM'}</span>
              </div>
            </div>`;

    html = html.replace(
      /(<section class="event-scene stats event-esc"[^>]*>[\s\S]*?<p class="event-description reveal">[\s\S]*?<\/p>\s*)(<div class="cards event-metrics">[\s\S]*?<\/div>\s*<\/div>)/,
      `$1${escCardsHtml}`
    );
  }
  if (esc.cta) {
    const url = esc.cta.url || esc.cta.externalUrl || 'https://www.facebook.com/share/p/1Frf2ebFwQ/';
    const label = esc.cta.label || 'View on Facebook';
    const isExt = url.startsWith('http');
    const targetAttrs = isExt ? ' target="_blank" rel="noopener noreferrer"' : '';
    html = html.replace(
      /(<section class="event-scene stats event-esc"[^>]*>[\s\S]*?<div class="logos event-bottom">[\s\S]*?<a class="btn btn-esc event-link"[^>]*href=")([^"]*)(")([^>]*>)([\s\S]*?)(<\/a>)/,
      `$1${url}"${targetAttrs}>${label} <span aria-hidden="true">↗</span>$6`
    );
  }

  // 4. TEDx Stage Section (#tedx)
  if (tedx.pill) {
    html = html.replace(
      /(<section class="event-scene stats event-tedx"[^>]*>[\s\S]*?<span class="pill pill-tedx reveal">)([\s\S]*?)(<\/span>)/,
      `$1${tedx.pill}$3`
    );
  }
  if (tedx.title) {
    html = html.replace(
      /(<h2 id="tedx-title"[^>]*>)([\s\S]*?)(<\/h2>)/,
      `$1${tedx.title}$3`
    );
  }
  if (tedx.description) {
    html = html.replace(
      /(<section class="event-scene stats event-tedx"[^>]*>[\s\S]*?<p class="event-description reveal">)([\s\S]*?)(<\/p>)/,
      `$1${tedx.description}$3`
    );
  }
  if (tedx.logoTag) {
    html = html.replace(
      /(<section class="event-scene stats event-tedx"[^>]*>[\s\S]*?<span class="logo-tag">)([\s\S]*?)(<\/span>)/,
      `$1${tedx.logoTag}$3`
    );
  }
  if (tedx.image) {
    html = html.replace(
      /(<section class="event-scene stats event-tedx"[^>]*>[\s\S]*?<div class="tree-wrap event-photo">\s*<img src=")([^"]*)(")/,
      `$1${tedx.image}$3`
    );
  }
  if (Array.isArray(tedx.metrics) && tedx.metrics.length >= 4) {
    const t0 = tedx.metrics[0];
    const t1 = tedx.metrics[1];
    const t2 = tedx.metrics[2];
    const t3 = tedx.metrics[3];

    const calcDec = (m) => m?.dec ?? (String(m?.num ?? '').includes('.') ? 1 : 0);

    const tedxCardsHtml = `
            <div class="cards event-metrics">
              <div class="card card-tedx">
                <small>${t0.label}</small>
                <b data-to="${t0.num ?? 100}" data-dec="${calcDec(t0)}" data-suf="${t0.suf ?? '+'}">${t0.value || `${t0.num ?? 100}${t0.suf ?? '+'}`}</b>
              </div>
              <div class="card card-tedx">
                <small>${t1.label}</small>
                <b data-to="${t1.num ?? 2.5}" data-dec="${calcDec(t1)}" data-suf="${t1.suf ?? 'M+'}">${t1.value || `${t1.num ?? 2.5}${t1.suf ?? 'M+'}`}</b>
              </div>
              <div class="card card-tedx">
                <small>${t2.label}</small>
                <b data-to="${t2.num ?? 19}" data-dec="${calcDec(t2)}" data-suf="${t2.suf ?? ''}">${t2.value || `${t2.num ?? 19}${t2.suf ?? ''}`}</b>
              </div>
              <div class="card card-tedx">
                <small>${t3.label}</small>
                <b data-to="${t3.num ?? 50}" data-dec="${calcDec(t3)}" data-suf="${t3.suf ?? '+'}">${t3.value || `${t3.num ?? 50}${t3.suf ?? '+'}`}</b>
              </div>
            </div>`;

    html = html.replace(
      /(<section class="event-scene stats event-tedx"[^>]*>[\s\S]*?<p class="event-description reveal">[\s\S]*?<\/p>\s*)(<div class="cards event-metrics">[\s\S]*?<\/div>\s*<\/div>)/,
      `$1${tedxCardsHtml}`
    );
  }
  if (tedx.cta) {
    const url = tedx.cta.url || tedx.cta.externalUrl || 'https://www.facebook.com/tedxfptuniversityhcmc';
    const label = tedx.cta.label || 'View on Facebook';
    const isExt = url.startsWith('http');
    const targetAttrs = isExt ? ' target="_blank" rel="noopener noreferrer"' : '';
    html = html.replace(
      /(<section class="event-scene stats event-tedx"[^>]*>[\s\S]*?<div class="logos event-bottom">[\s\S]*?<a class="btn btn-tedx event-link"[^>]*href=")([^"]*)(")([^>]*>)([\s\S]*?)(<\/a>)/,
      `$1${url}"${targetAttrs}>${label} <span aria-hidden="true">↗</span>$6`
    );
  }

  return html;
}

