/* work.js — list projects as a 2-col tile grid with in-place filter pills.
 *
 * Pills filter visible tiles by slug without navigating away. The "All" pill
 * (default) shows every project. Each project pill shows just that one tile
 * — useful as a quick "jump to" affordance that matches the mockup.
 */

import { fetchAll, esc } from '/js/md.js';

function sortByOrder(items) {
  return items.slice().sort((a, b) => {
    const ao = Number(a.frontmatter.order ?? 999);
    const bo = Number(b.frontmatter.order ?? 999);
    if (ao !== bo) return ao - bo;
    return (a.frontmatter.title || a.slug).localeCompare(b.frontmatter.title || b.slug);
  });
}

function fmHeroImage(fm) {
  if (Array.isArray(fm.images) && fm.images.length > 0) return fm.images[0];
  return fm.image || '';
}

function tileHtml(item) {
  const fm = item.frontmatter;
  const title = esc(fm.title || item.slug);
  const image = esc(fmHeroImage(fm));
  const href = `/project.html?slug=${encodeURIComponent(item.slug)}`;
  const slug = esc(item.slug);
  return `
    <div class="ak-work-tile" data-slug="${slug}">
      <a href="${href}">
        ${image ? `<img src="${image}" alt="${title}" />` : ''}
        <div class="ak-work-tile-title">${title}</div>
      </a>
    </div>
  `;
}

function renderPills(items) {
  const all = `<button type="button" class="ak-pill is-active" data-slug-pill="">All (${items.length})</button>`;
  const rest = items
    .map((it) => {
      const slug = esc(it.slug);
      return `<button type="button" class="ak-pill" data-slug-pill="${slug}">${esc(it.frontmatter.title || it.slug)}</button>`;
    })
    .join('');
  return all + rest;
}

function applyFilter(grid, pillsEl, activeSlug) {
  pillsEl.querySelectorAll('.ak-pill').forEach((p) => {
    p.classList.toggle('is-active', (p.getAttribute('data-slug-pill') || '') === activeSlug);
  });
  grid.querySelectorAll('.ak-work-tile').forEach((tile) => {
    const slug = tile.getAttribute('data-slug') || '';
    const match = !activeSlug || slug === activeSlug;
    tile.style.display = match ? '' : 'none';
  });
}

async function init() {
  const grid = document.querySelector('[data-work-grid]');
  const pillsEl = document.querySelector('[data-pills]');
  if (!grid || !pillsEl) return;

  const items = sortByOrder(await fetchAll('projects'));

  pillsEl.innerHTML = renderPills(items);

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 60px 0; text-align: center; color: #888; font-family: var(--sans); font-size: 13px;">
        No projects yet.
      </div>`;
    return;
  }

  grid.innerHTML = items.map(tileHtml).join('');

  pillsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-slug-pill]');
    if (!btn) return;
    e.preventDefault();
    applyFilter(grid, pillsEl, btn.getAttribute('data-slug-pill') || '');
  });
}

init();
