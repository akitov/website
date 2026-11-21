/* work.js — /work/ page. The pills above the grid show one project (or all)
 * without leaving the page.
 */

const pills = document.querySelector('[data-pills]');
const grid = document.querySelector('[data-work-grid]');

pills?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-slug-pill]');
  if (!btn) return;
  const active = btn.dataset.slugPill;
  pills.querySelectorAll('[data-slug-pill]').forEach((p) => {
    p.classList.toggle('is-active', p.dataset.slugPill === active);
  });
  grid.querySelectorAll('[data-slug]').forEach((tile) => {
    tile.style.display = !active || tile.dataset.slug === active ? '' : 'none';
  });
});
