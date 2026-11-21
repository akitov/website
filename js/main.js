/* main.js — every page. Opens and closes the mobile menu. */

const drawer = document.querySelector('[data-drawer]');
const backdrop = document.querySelector('[data-drawer-backdrop]');
const toggle = document.querySelector('[data-drawer-toggle]');

if (drawer && backdrop && toggle) {
  const setOpen = (open) => {
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    toggle.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('is-open')));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
  // Close when a menu link is tapped (also covers links to the current page).
  drawer.addEventListener('click', (e) => e.target.closest('a') && setOpen(false));
}
