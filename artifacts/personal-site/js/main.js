/* main.js — shared chrome bootstrap.
 * Loads partials, sets the active nav, applies the page title, wires the mobile drawer.
 * Vanilla JS, ES modules. No build step.
 */

const HEADER_SELECTOR = '[data-header]';
const FOOTER_SELECTOR = '[data-footer]';

async function injectPartial(slotSelector, partialUrl) {
  const slot = document.querySelector(slotSelector);
  if (!slot) return;
  const res = await fetch(partialUrl);
  if (!res.ok) {
    console.error(`Failed to load partial ${partialUrl}: ${res.status}`);
    return;
  }
  slot.innerHTML = await res.text();
}

function applyChrome() {
  const body = document.body;
  const activeNav = body.dataset.activeNav || '';
  const pageTitle = body.dataset.pageTitle || '';

  // Set active nav highlight on all nav-bearing elements (header + drawer).
  document.querySelectorAll('[data-nav]').forEach((el) => {
    if (el.dataset.nav === activeNav) {
      el.classList.add('is-active');
    }
  });

  // Page title in header center.
  const titleSlot = document.querySelector('[data-page-title-slot]');
  if (titleSlot) titleSlot.textContent = pageTitle;

  // Only set <title> here if the page hasn't already set its own (post.js /
  // project.js may set a content-specific title and we shouldn't overwrite
  // it because of an async race).
  const fallback = pageTitle ? `${pageTitle} — Alexander Kitov` : 'Alexander Kitov';
  if (!document.title || document.title === fallback || document.title.endsWith('— Alexander Kitov') === false) {
    if (!document.title.includes('—')) {
      document.title = fallback;
    }
  }
}

function wireDrawer() {
  const drawer = document.querySelector('[data-drawer]');
  const backdrop = document.querySelector('[data-drawer-backdrop]');
  const toggle = document.querySelector('[data-drawer-toggle]');
  if (!drawer || !backdrop || !toggle) return;

  const open = () => {
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggle.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggle.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) close();
    else open();
  });
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

export async function bootChrome() {
  await Promise.all([
    injectPartial(HEADER_SELECTOR, '/partials/header.html'),
    injectPartial(FOOTER_SELECTOR, '/partials/footer.html'),
  ]);
  applyChrome();
  wireDrawer();
}

// Auto-boot when included as a module on a page that has the slots.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootChrome);
} else {
  bootChrome();
}
