/* home.js — render the homepage post grid + category pill filter. */

import { fetchAll, sortByDateDesc, esc } from '/js/md.js';

const TYPE_LABELS = {
  quote: 'a Quote in',
  lesson: 'a Lesson in',
  event: 'an Event in',
};

function postCardHtml(item) {
  const fm = item.frontmatter;
  const date = esc(fm.date || '');
  const type = esc(TYPE_LABELS[fm.type] || `a ${fm.type || 'Note'} in`);
  const category = esc(fm.category || 'Notes');
  const slug = esc(item.slug);

  const meta = `
    <div class="ak-post-meta">
      <span class="ak-date">${date}</span>
      <span class="ak-type">${type}</span>
      <a class="ak-pill" href="/?cat=${encodeURIComponent(fm.category || '')}">${category}</a>
    </div>
  `;

  if (fm.type === 'quote') {
    const quote = esc(fm.quote || '');
    const author = esc(fm.author || '');
    const source = fm.source ? esc(fm.source) : '';
    return `
      <article class="ak-post-grid-item" data-cat="${esc(fm.category || '')}">
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
  const excerpt = esc(fm.excerpt || '');
  const image = fm.image
    ? `<a href="/post.html?slug=${encodeURIComponent(item.slug)}"><img class="ak-post-image" src="${esc(fm.image)}" alt="${title}" /></a>`
    : '';

  return `
    <article class="ak-post-grid-item" data-cat="${esc(fm.category || '')}">
      ${meta}
      ${image}
      <h2 class="ak-post-title"><a href="/post.html?slug=${encodeURIComponent(item.slug)}">${title}</a></h2>
      <p class="ak-post-excerpt">${excerpt}</p>
      <a class="ak-arrow-link" href="/post.html?slug=${encodeURIComponent(item.slug)}">
        Read More <span class="ak-arrow">›</span>
      </a>
    </article>
  `;
}

function renderPills(posts, activeCat) {
  const counts = new Map();
  for (const p of posts) {
    const cat = p.frontmatter.category || 'Notes';
    counts.set(cat, (counts.get(cat) || 0) + 1);
  }
  const cats = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const all = `<a class="ak-pill ${!activeCat ? 'is-active' : ''}" href="/">All (${posts.length})</a>`;
  const pills = cats
    .map(
      ([name, n]) =>
        `<a class="ak-pill ${activeCat === name ? 'is-active' : ''}" href="/?cat=${encodeURIComponent(name)}">${esc(name)} (${n})</a>`
    )
    .join('');
  return all + pills;
}

function splitColumns(items) {
  // Two columns rendered as a CSS grid via two .col wrappers, so order is
  // left/right/left/right matching the mockup's masonry feel without needing
  // an actual masonry layout library.
  const left = [];
  const right = [];
  items.forEach((it, i) => (i % 2 === 0 ? left : right).push(it));
  return { left, right };
}

async function init() {
  const grid = document.querySelector('[data-post-grid]');
  const pillsEl = document.querySelector('[data-pills]');
  if (!grid || !pillsEl) return;

  const url = new URL(window.location.href);
  const activeCat = url.searchParams.get('cat') || '';

  const all = sortByDateDesc(await fetchAll('blog'));
  pillsEl.innerHTML = renderPills(all, activeCat);

  const filtered = activeCat
    ? all.filter((p) => (p.frontmatter.category || '') === activeCat)
    : all;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 60px 0; text-align: center; color: #888; font-family: var(--sans); font-size: 13px;">
        No posts yet${activeCat ? ` in “${esc(activeCat)}”` : ''}.
      </div>
    `;
    return;
  }

  const { left, right } = splitColumns(filtered);
  grid.innerHTML = `
    <div>${left.map(postCardHtml).join('')}</div>
    <div>${right.map(postCardHtml).join('')}</div>
  `;
}

init();
