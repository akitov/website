/* work.js — list projects as a 2-col tile grid with filter pills. */

import { fetchAll, esc } from '/js/md.js';

function sortByOrder(items) {
  return items.slice().sort((a, b) => {
    const ao = Number(a.frontmatter.order ?? 999);
    const bo = Number(b.frontmatter.order ?? 999);
    if (ao !== bo) return ao - bo;
    return (a.frontmatter.title || a.slug).localeCompare(b.frontmatter.title || b.slug);
  });
}

function tileHtml(item) {
  const fm = item.frontmatter;
  const title = esc(fm.title || item.slug);
  const image = esc(fm.image || '');
  const href = `/project.html?slug=${encodeURIComponent(item.slug)}`;
  return `
    <div class="ak-work-tile" data-slug="${esc(item.slug)}">
      <a href="${href}">
        ${image ? `<img src="${image}" alt="${title}" />` : ''}
        <div class="ak-work-tile-title">${title}</div>
      </a>
    </div>
  `;
}

function renderPills(items, activeSlug) {
  return items
    .map((it) => {
      const slug = esc(it.slug);
      const cls = activeSlug === it.slug ? 'is-active' : '';
      return `<a class="ak-pill ${cls}" href="/work/?slug=${encodeURIComponent(it.slug)}#tile-${slug}">${esc(it.frontmatter.title || it.slug)}</a>`;
    })
    .join('');
}

async function init() {
  const grid = document.querySelector('[data-work-grid]');
  const pillsEl = document.querySelector('[data-pills]');
  if (!grid || !pillsEl) return;

  const items = sortByOrder(await fetchAll('projects'));
  const url = new URL(window.location.href);
  const activeSlug = url.searchParams.get('slug') || '';

  pillsEl.innerHTML = renderPills(items, activeSlug);

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 60px 0; text-align: center; color: #888; font-family: var(--sans); font-size: 13px;">
        No projects yet.
      </div>`;
    return;
  }

  grid.innerHTML = items.map(tileHtml).join('');
}

init();
