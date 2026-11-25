/* main.js — every page. Opens and closes the mobile menu, keeps the footer
 * year current (the build writes its own year; this covers later years
 * without a redeploy) and puts the email links together. */

for (const el of document.querySelectorAll('[data-year]')) el.textContent = String(new Date().getFullYear());

// Email links: the address is never whole in the HTML (spam bots read the
// HTML without running scripts). The link carries its two halves and gets
// its mailto: when someone points at, focuses, right-clicks or clicks it.
for (const a of document.querySelectorAll('[data-mail-user]')) {
  const set = () => { a.href = `mailto:${a.dataset.mailUser}@${a.dataset.mailDomain}`; };
  for (const type of ['pointerenter', 'focus', 'contextmenu', 'click']) a.addEventListener(type, set);
}

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
    const focusInMenu = menu.contains(document.activeElement) || document.activeElement === toggle;
    setOpen(false);
    // Return focus to the toggle only if it was inside the menu; never steal it from the page.
    if (focusInMenu) toggle.focus();
  });
  // The menu only exists on mobile; close it when the inline nav returns.
  matchMedia('(min-width: 761px)').addEventListener('change', (e) => e.matches && setOpen(false));
}
