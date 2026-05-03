/* home.js — render the homepage post grid + category pill filter.
 *
 * Filtering is fully in-place: clicking a pill toggles a `data-active-cat`
 * attribute on the grid, hides cards that don't match, and re-runs
 * Masonry's layout() so the remaining cards reflow without a page navigation.
 */

import { fetchAll, sortByDateDesc, esc } from '/js/md.js';

const TYPE_LABELS = {
  quote: 'a Quote in',
  lesson: 'a Lesson in',
  event: 'an Event in',
};

let masonryInstance = null;

function fmDate(fm) {
  return fm.updated || fm.date || '';
}

function fmSubtitle(fm) {
  return fm.subtitle || fm.slug || fm.excerpt || '';
}

function fmHeroImage(fm) {
  if (Array.isArray(fm.images) && fm.images.length > 0) return fm.images[0];
  return fm.image || '';
}

function postCardHtml(item) {
  const fm = item.frontmatter;
  const date = esc(fmDate(fm));
  const type = esc(TYPE_LABELS[fm.type] || `a ${fm.type || 'Note'} in`);
  const category = esc(fm.category || 'Notes');
  const slug = esc(item.slug);

  const meta = `
    <div class="ak-post-meta">
      <span class="ak-date">${date}</span>
      <span class="ak-type">${type}</span>
      <button type="button" class="ak-pill" data-cat-pill="${esc(fm.category || '')}">${category}</button>
    </div>
  `;

  if (fm.type === 'quote') {
    const quote = esc(fm.quote || '');
    const author = esc(fm.author || '');
    const source = fm.source ? esc(fm.source) : '';
    return `
      <article class="ak-post-grid-item" data-cat="${esc(fm.category || '')}" data-slug="${slug}">
        ${meta}
        <div class="ak-quote">
          <div class="ak-quote-text">${quote}</div>
          <div class="ak-quote-author">
            <span class="ak-feather">🪶</span>
            <span>${author}${source ? `, <a href="${source}">Source</a>` : ''}</span>
          </div>
        </div>
      </article>
    `;
  }

  const title = esc(fm.title || item.slug);
  const subtitle = esc(fmSubtitle(fm));
  const hero = fmHeroImage(fm);
  const image = hero
    ? `<a href="/post.html?slug=${encodeURIComponent(item.slug)}"><img class="ak-post-image" src="${esc(hero)}" alt="${title}" /></a>`
    : '';

  return `
    <article class="ak-post-grid-item" data-cat="${esc(fm.category || '')}" data-slug="${slug}">
      ${meta}
      ${image}
      <h2 class="ak-post-title"><a href="/post.html?slug=${encodeURIComponent(item.slug)}">${title}</a></h2>
      <p class="ak-post-excerpt">${subtitle}</p>
      <a class="ak-arrow-link" href="/post.html?slug=${encodeURIComponent(item.slug)}">
        Read More <span class="ak-arrow">›</span>
      </a>
    </article>
  `;
}

function renderPills(posts) {
  const counts = new Map();
  for (const p of posts) {
    const cat = p.frontmatter.category || 'Notes';
    counts.set(cat, (counts.get(cat) || 0) + 1);
  }
  const cats = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const all = `<button type="button" class="ak-pill is-active" data-cat-pill="">All (${posts.length})</button>`;
  const pills = cats
    .map(([name, n]) => `<button type="button" class="ak-pill" data-cat-pill="${esc(name)}">${esc(name)} (${n})</button>`)
    .join('');
  return all + pills;
}

function applyFilter(grid, pillsEl, activeCat) {
  // Toggle pill highlight
  pillsEl.querySelectorAll('.ak-pill').forEach((p) => {
    p.classList.toggle('is-active', (p.getAttribute('data-cat-pill') || '') === activeCat);
  });
  // Show/hide cards
  grid.querySelectorAll('.ak-post-grid-item').forEach((card) => {
    const cat = card.getAttribute('data-cat') || '';
    const match = !activeCat || cat === activeCat;
    card.style.display = match ? '' : 'none';
  });
  // Re-layout masonry against the now-visible items
  if (masonryInstance) {
    masonryInstance.reloadItems();
    masonryInstance.layout();
  }
}

// Mobile breakpoint for the homepage post grid. Must match the
// `max-width: 760px` media query in styles.css so there is no width range
// where Masonry runs against a single-column CSS layout.
const MOBILE_QUERY = '(max-width: 760px)';

function initMasonry(grid) {
  if (typeof window.Masonry === 'undefined') return;
  if (window.matchMedia(MOBILE_QUERY).matches) return;
  // Switch the container off CSS grid so Masonry's absolute positioning
  // wins. The fallback CSS keeps a plain two-column grid for the case
  // where the Masonry CDN script can't load.
  grid.classList.add('is-masonry');
  masonryInstance = new window.Masonry(grid, {
    itemSelector: '.ak-post-grid-item',
    columnWidth: '.ak-post-grid-item',
    percentPosition: true,
    gutter: 40,
    transitionDuration: 0,
  });
  if (typeof window.imagesLoaded !== 'undefined') {
    window.imagesLoaded(grid, () => masonryInstance && masonryInstance.layout());
  }
}

async function init() {
  const grid = document.querySelector('[data-post-grid]');
  const pillsEl = document.querySelector('[data-pills]');
  if (!grid || !pillsEl) return;

  const all = sortByDateDesc(await fetchAll('blog'));

  pillsEl.innerHTML = renderPills(all);

  if (all.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; width: 100%; padding: 60px 0; text-align: center; color: #888; font-family: var(--sans); font-size: 13px;">
        No posts yet.
      </div>`;
    return;
  }

  grid.innerHTML = all.map(postCardHtml).join('');
  initMasonry(grid);

  // Pills (in pillsEl) and category badges inside cards both filter in place.
  const onClick = (e) => {
    const btn = e.target.closest('[data-cat-pill]');
    if (!btn) return;
    e.preventDefault();
    const cat = btn.getAttribute('data-cat-pill') || '';
    applyFilter(grid, pillsEl, cat);
  };
  pillsEl.addEventListener('click', onClick);
  grid.addEventListener('click', onClick);
}

init();
