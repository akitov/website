/* main.js — every page. Opens and closes the mobile menu. */

const menu = document.querySelector('[data-menu]');
const toggle = document.querySelector('[data-menu-toggle]');

if (menu && toggle) {
  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(menu.hidden));
  // Close when a menu link is tapped (also covers links to the current page).
  menu.addEventListener('click', (e) => e.target.closest('a') && setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || menu.hidden) return;
    setOpen(false);
    toggle.focus();
  });
  // The menu only exists on mobile; close it when the inline nav returns.
  matchMedia('(min-width: 761px)').addEventListener('change', (e) => e.matches && setOpen(false));
}
