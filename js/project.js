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
  if (fm.position) dl.push(`<dt>Position:</dt><dd>${esc(fm.position)}</dd>`);
  if (fm.achievements) dl.push(`<dt>Achievements:</dt><dd>${esc(fm.achievements)}</dd>`);
  if (fm.date) dl.push(`<dt>Date:</dt><dd>${esc(fm.date)}</dd>`);

  const link = fm.link
    ? `<a class="ak-project-link" href="${esc(fm.link)}" target="_blank" rel="noopener">View Project</a>`
    : '';

  return `
    <h3>${esc(subtitleish)}</h3>
    <dl>${dl.join('')}</dl>
    ${link}
  `;
}

function renderMain(item) {
  const fm = item.frontmatter;
  const image = fm.image
    ? `<img src="${esc(fm.image)}" alt="${esc(fm.title || '')}" />`
    : '';
  const body =
    typeof window.marked !== 'undefined'
      ? window.marked.parse(item.body || '')
      : `<pre style="white-space:pre-wrap;font-family:var(--serif)">${esc(item.body)}</pre>`;
  return `
    ${image}
    <div class="ak-project-body">${body}</div>
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
    ${fm.subtitle ? `<p>${esc(fm.subtitle)}</p>` : ''}
  `;
  document.querySelector('[data-project-main]').innerHTML = renderMain(item);
  document.querySelector('[data-project-side]').innerHTML = renderSide(fm);

  document.title = `${fm.title || slug} — Alexander Kitov`;
}

init();
