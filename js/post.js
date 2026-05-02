/* post.js — render a single blog post page. */

import { fetchAll, fetchPost, sortByDateDesc, esc } from '/js/md.js';

const TYPE_LABELS = {
  quote: 'A Quote',
  lesson: 'A Lesson',
  event: 'An Event',
};

function getSlug() {
  // Three sources in priority order:
  //   1. window.__slug (set by per-slug pre-rendered shims at /<slug>.html).
  //   2. ?slug=... query string (the canonical post.html template URL).
  //   3. Last path segment (e.g. /<slug>.html → "<slug>") so a clean URL
  //      that loads post.html directly via host rewrites also works.
  if (typeof window.__slug === 'string' && window.__slug) return window.__slug;
  const u = new URL(window.location.href);
  const q = u.searchParams.get('slug');
  if (q) return q;
  const m = /\/([^/]+)\.html$/.exec(u.pathname);
  if (m && m[1] !== 'post' && m[1] !== 'index') return m[1];
  return null;
}

function navLinkHtml(item, direction) {
  if (!item) return '<span></span>';
  const fm = item.frontmatter;
  const label = `${TYPE_LABELS[fm.type] || 'A Note'} in ${esc(fm.category || 'Notes')}`;
  const href = `/post.html?slug=${encodeURIComponent(item.slug)}`;
  if (direction === 'prev') {
    return `<a class="ak-arrow-link ak-arrow-prev" href="${href}"><span class="ak-arrow">‹</span> ${label}</a>`;
  }
  return `<a class="ak-arrow-link" href="${href}">${label} <span class="ak-arrow">›</span></a>`;
}

function renderHead(item) {
  const fm = item.frontmatter;
  if (fm.type === 'quote') {
    return `
      <h1>${esc(fm.author || 'A Quote')}</h1>
      <p>${fm.category ? `In ${esc(fm.category)}` : ''}${fm.date ? ` — ${esc(fm.date)}` : ''}</p>
    `;
  }
  return `
    <h1>${esc(fm.title || item.slug)}</h1>
    ${fm.excerpt ? `<p>${esc(fm.excerpt)}</p>` : ''}
  `;
}

function renderSide(item) {
  const fm = item.frontmatter;
  const typeLabel = `${TYPE_LABELS[fm.type] || 'A Note'} in ${esc(fm.category || 'Notes')}`;
  return `
    ${fm.image ? `<img src="${esc(fm.image)}" alt="${esc(fm.title || '')}" />` : ''}
    <div style="margin-bottom:12px">
      <span class="ak-arrow-link">${typeLabel} <span class="ak-arrow">›</span></span>
    </div>
    ${fm.date ? `<div class="ak-side-date">${esc(fm.date)}</div>` : ''}
    <hr />
  `;
}

function renderBody(item) {
  const fm = item.frontmatter;
  if (fm.type === 'quote') {
    return `
      <div class="ak-quote" style="margin-top:8px">
        <div class="ak-quote-text">${esc(fm.quote || '')}</div>
        <div class="ak-quote-author">
          <span class="ak-feather">🪶</span>
          <span>${esc(fm.author || '')}${fm.source ? `, <a href="${esc(fm.source)}">Source</a>` : ''}</span>
        </div>
      </div>
    `;
  }
  if (typeof window.marked === 'undefined') {
    return `<pre style="white-space:pre-wrap;font-family:var(--serif)">${esc(item.body)}</pre>`;
  }
  return window.marked.parse(item.body || '');
}

async function init() {
  const slug = getSlug();
  if (!slug) {
    document.querySelector('[data-post-body]').innerHTML = `
      <p style="text-align:center;color:#c33;font-family:var(--sans)">
        Missing <code>?slug=</code> parameter.
      </p>`;
    return;
  }

  const allPromise = fetchAll('blog').then(sortByDateDesc);
  let item;
  try {
    item = await fetchPost('blog', slug);
  } catch (err) {
    document.querySelector('[data-post-body]').innerHTML = `
      <p style="text-align:center;color:#c33;font-family:var(--sans)">
        Could not load post “${esc(slug)}”.
      </p>`;
    return;
  }

  const all = await allPromise;
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  document.querySelector('[data-postnav]').innerHTML = `
    ${navLinkHtml(prev, 'prev')}
    ${navLinkHtml(next, 'next')}
  `;
  document.querySelector('[data-post-head]').innerHTML = renderHead(item);
  document.querySelector('[data-post-side]').innerHTML = renderSide(item);
  document.querySelector('[data-post-body]').innerHTML = renderBody(item);

  const fm = item.frontmatter;
  const titleText = fm.type === 'quote' ? fm.author || 'Quote' : fm.title || slug;
  document.title = `${titleText} — Alexander Kitov`;
}

init();
