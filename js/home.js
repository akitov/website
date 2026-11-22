/* home.js — home and category pages. Lays out the post cards as a masonry
 * grid on wide screens. Without it (or if the CDN script fails) the CSS
 * two-column grid is used, so the page always works.
 */

// Must match the `max-width: 760px` media query in styles.css.
const MOBILE_QUERY = '(max-width: 760px)';
const grid = document.querySelector('[data-post-grid]');

if (grid && window.Masonry && !window.matchMedia(MOBILE_QUERY).matches) {
  grid.classList.add('is-masonry');
  const masonry = new window.Masonry(grid, {
    itemSelector: '.ak-post-grid-item',
    columnWidth: '.ak-post-grid-item',
    percentPosition: true,
    gutter: 40,
    transitionDuration: 0,
  });
  if (window.imagesLoaded) window.imagesLoaded(grid, () => masonry.layout());
  // Text reflows when the web font swaps in; re-measure the cards then.
  document.fonts?.ready.then(() => masonry.layout());
}
