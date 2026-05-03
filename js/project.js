/* project.js — render a single project page. */

import { fetchAll, fetchPost, esc } from '/js/md.js';

function getSlug() {
  // See post.js for the resolution order.
  if (typeof window.__slug === 'string' && window.__slug) return window.__slug;
  const u = new URL(window.location.href);
  const q = u.searchParams.get('slug');
  if (q) return q;
  const m = /\/([^/]+)\.html$/.exec(u.pathname);
  if (m && m[1] !== 'project' && m[1] !== 'index') return m[1];
  return null;
}

function navLinkHtml(item) {
  if (!item) return '';
  const href = `/project.html?slug=${encodeURIComponent(item.slug)}`;
  return `<a class="ak-arrow-link" href="${href}">${esc(item.frontmatter.title || item.slug)} <span class="ak-arrow">›</span></a>`;
}

function renderSide(fm) {
  const title = esc(fm.title || '');
  const subtitleish = title.toLowerCase();
  const dl = [];
  if (fm.client) dl.push(`<dt>Client:</dt><dd>${esc(fm.client)}</dd>`);
  if (fm.position) dl.push(`<dt>Position:</dt><dd>${esc(fm.position)}</dd>`);
  if (fm.achievements) dl.push(`<dt>Achievements:</dt><dd>${esc(fm.achievements)}</dd>`);
  const dateField = fm.updated || fm.date;
  if (dateField) dl.push(`<dt>Date:</dt><dd>${esc(dateField)}</dd>`);

  const link = fm.link
    ? `<a class="ak-project-link" href="${esc(fm.link)}" target="_blank" rel="noopener">View Project</a>`
    : '';

  return `
    <h3>${esc(subtitleish)}</h3>
    <dl>${dl.join('')}</dl>
    ${link}
  `;
}

function fmHero(fm) {
  if (Array.isArray(fm.images) && fm.images.length > 0) return fm.images[0];
  return fm.image || '';
}

function fmGallery(fm) {
  if (!Array.isArray(fm.images)) return [];
  return fm.images.slice(1);
}

function renderMain(item) {
  const fm = item.frontmatter;
  const hero = fmHero(fm);
  const heroHtml = hero
    ? `<img src="${esc(hero)}" alt="${esc(fm.title || '')}" />`
    : '';
  // Render markdown via marked, then sanitize through DOMPurify before it
  // hits the DOM so any raw HTML in the markdown source can never execute
  // scripts (defense in depth for future guest authors / external sources).
  const rawBody =
    typeof window.marked !== 'undefined'
      ? window.marked.parse(item.body || '')
      : `<pre style="white-space:pre-wrap;font-family:var(--serif)">${esc(item.body)}</pre>`;
  const body = typeof window.DOMPurify !== 'undefined'
    ? window.DOMPurify.sanitize(rawBody)
    : rawBody;
  const gallery = fmGallery(fm)
    .map((src) => `<img src="${esc(src)}" alt="${esc(fm.title || '')}" />`)
    .join('');
  return `
    ${heroHtml}
    <div class="ak-project-body">${body}</div>
    ${gallery ? `<div class="ak-project-gallery">${gallery}</div>` : ''}
  `;
}

async function init() {
  const slug = getSlug();
  if (!slug) {
    document.querySelector('[data-project-main]').innerHTML = `
      <p style="text-align:center;color:#c33;font-family:var(--sans)">
        Missing <code>?slug=</code> parameter.
      </p>`;
    return;
  }

  const allPromise = fetchAll('projects');
  let item;
  try {
    item = await fetchPost('projects', slug);
  } catch (err) {
    document.querySelector('[data-project-main]').innerHTML = `
      <p style="text-align:center;color:#c33;font-family:var(--sans)">
        Could not load project “${esc(slug)}”.
      </p>`;
    return;
  }
  const fm = item.frontmatter;

  const all = await allPromise;
  const sorted = all.slice().sort((a, b) => {
    const ao = Number(a.frontmatter.order ?? 999);
    const bo = Number(b.frontmatter.order ?? 999);
    return ao - bo;
  });
  const idx = sorted.findIndex((p) => p.slug === slug);
  const next = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : sorted[0] !== item ? sorted[0] : null;

  document.querySelector('[data-project-topnav]').innerHTML = navLinkHtml(next);
  document.querySelector('[data-project-head]').innerHTML = `
    <h1>${esc(fm.title || slug)}</h1>
    ${(fm.subtitle || fm.slug) ? `<p>${esc(fm.subtitle || fm.slug)}</p>` : ''}
  `;
  document.querySelector('[data-project-main]').innerHTML = renderMain(item);
  document.querySelector('[data-project-side]').innerHTML = renderSide(fm);

  document.title = `${fm.title || slug} — Alexander Kitov`;
}

init();
