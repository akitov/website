/* scripts/build.mjs — build the whole site into _site/.
 *
 *   node scripts/build.mjs
 *
 * Node 22+, standard library only. Markdown is converted with the copy of
 * `marked` in scripts/vendor/, so there's nothing to install. The deploy
 * workflow and the local preview (scripts/serve.mjs) both run this script.
 *
 * Every page comes out as finished HTML (text, links, meta tags), so search
 * engines and link previews see the full content without running any JS.
 *
 *   blog/<slug>/<any>.md       →  /blog/<slug>/   (+ the folder's other files)
 *   category: UX               →  /blog/ux/       (list of posts in that category)
 *   projects/<slug>/<any>.md   →  /work/<slug>/   (+ the folder's other files)
 *   pages/about.html       →  /about/
 *   pages/404.html         →  /404.html
 *   redirects.txt          →  old URL → new URL
 *   + home (/), work (/work/), feed.xml, sitemap.xml
 */

import { promises as fs, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from './vendor/marked.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const OUT = path.join(ROOT, '_site');
const SITE_URL = (process.env.SITE_URL || 'https://alexkitov.com').replace(/\/+$/, '');
const SITE_NAME = 'Alexander Kitov';
const SITE_DESCRIPTION = 'Alexander Kitov — Product Manager and Entrepreneur. Notes on product, life, and people.';

// Copied into _site/ as they are.
const STATIC = ['styles.css', 'js', 'assets'];

const TYPE_LABELS = { quote: 'A Quote', lesson: 'A Lesson', event: 'An Event' };

// ================================================================ helpers

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const slugify = (s) =>
  String(s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function dateMs(s) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s || '');
  return m ? Date.UTC(+m[3], +m[2] - 1, +m[1]) : NaN;
}
const isoDate = (s) => (Number.isFinite(dateMs(s)) ? new Date(dateMs(s)).toISOString().slice(0, 10) : '');

/* Frontmatter: the block between the two `---` lines at the top of a .md
 * file. One `key: value` per line; lists as `[a, b]` or `- item` lines;
 * values may be wrapped in quotes. */
function parseFrontmatter(raw) {
  raw = raw.replace(/\r\n/g, '\n');
  if (!raw.startsWith('---')) return { fm: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { fm: {}, body: raw };
  const fm = {};
  const unquote = (s) => {
    s = s.trim();
    return /^(".*"|'.*')$/.test(s) ? s.slice(1, -1) : s;
  };
  let key = null;
  let buf = [];
  const flush = () => {
    if (key === null) return;
    let v = buf.join('\n').trim();
    const lines = v.split('\n').map((l) => l.trim()).filter(Boolean);
    if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(unquote).filter(Boolean);
    else if (lines.length && lines.every((l) => l.startsWith('- '))) v = lines.map((l) => unquote(l.slice(2)));
    else v = unquote(v);
    fm[key] = v;
  };
  for (const line of raw.slice(3, end).split('\n')) {
    const m = /^([A-Za-z][A-Za-z0-9_]*):\s?(.*)$/.exec(line);
    if (m) {
      flush();
      key = m[1];
      buf = [m[2]];
    } else buf.push(line);
  }
  flush();
  return { fm, body: raw.slice(end + 4).replace(/^\n/, '') };
}

/* Each post / project is a folder, <dir>/<slug>/, holding one .md file (any
 * name) plus its images and any other files (CSS, scenes, diagrams…).
 * The folder name is the URL. Anything starting with _ is skipped, so
 * _draft-folder/ and _notes.md stay private. */
const skipName = (n) => n.startsWith('.') || n.startsWith('_');
const isRelative = (src) => !/^(\/|[a-z][a-z0-9+.-]*:)/i.test(src);

async function readContent(dir, urlBase) {
  const items = [];
  for (const entry of await fs.readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const name = entry.name;
    if (skipName(name) || name === 'README.md') continue;
    if (!entry.isDirectory()) {
      if (name.endsWith('.md')) {
        throw new Error(`${dir}/${name}: each one needs its own folder, e.g. ${dir}/${name.replace(/\.md$/, '')}/${name}`);
      }
      continue;
    }
    const slug = name;
    if (slug !== slugify(slug)) {
      throw new Error(`${dir}/${slug}/: folder names use lowercase letters, numbers and dashes only (e.g. "${slugify(slug)}")`);
    }
    const folder = path.join(ROOT, dir, slug);
    const files = (await fs.readdir(folder)).filter((n) => !skipName(n));
    const mds = files.filter((n) => n.endsWith('.md'));
    if (mds.length === 0) continue; // nothing to publish yet (e.g. only _draft.md)
    if (mds.length > 1) {
      throw new Error(`${dir}/${slug}/ has more than one .md file (${mds.join(', ')}). Keep one, or start the others with _ (e.g. _notes.md).`);
    }
    if (files.includes('index.html')) {
      throw new Error(`${dir}/${slug}/index.html: that name is used by the generated page. Rename it (e.g. scene.html).`);
    }
    const { fm, body } = parseFrontmatter(await fs.readFile(path.join(folder, mds[0]), 'utf8'));
    const url = `${urlBase}${slug}/`;
    // `images: [hero.jpg]` means the file in this folder.
    const raw = Array.isArray(fm.images) ? fm.images : fm.images || fm.image ? [fm.images || fm.image] : [];
    const images = raw.map((src) => (isRelative(src) ? url + src.replace(/^\.\//, '') : src));
    items.push({
      slug,
      folder,
      source: `${dir}/${slug}/${mds[0]}`,
      stylesheet: files.includes('style.css') ? `${url}style.css` : '',
      fm,
      body,
      title: fm.title || '',
      subtitle: fm.subtitle || fm.excerpt || '',
      date: fm.updated || fm.date || '',
      category: fm.category || 'Notes',
      images,
    });
  }
  return items;
}

const postUrl = (p) => `/blog/${p.slug}/`;
const categoryUrl = (cat) => `/blog/${slugify(cat)}/`;
const projectUrl = (p) => `/work/${p.slug}/`;
const absUrl = (p) => (/^https?:/.test(p) ? p : SITE_URL + p);
const typeLabel = (p) => `${TYPE_LABELS[p.fm.type] || 'A Note'} in ${esc(p.category)}`;

function postTitle(p) {
  if (p.title) return p.title;
  if (p.fm.type === 'quote') return p.fm.author ? `A quote by ${p.fm.author}` : 'A quote';
  return p.slug;
}
function postDescription(p) {
  if (p.fm.type === 'quote' && p.fm.quote) return `"${quotePlain(p.fm.quote)}"${p.fm.author ? ` — ${p.fm.author}` : ''}`;
  return p.subtitle;
}

/* `quote:` may mark its emphasised part with *stars*: shown semibold on the
 * post page, stripped in plain-text places (meta description, feed). */
const quoteHtml = (q) => esc(q).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const quotePlain = (q) => String(q ?? '').replace(/\*([^*]+)\*/g, '$1');

const img = (src, alt) => `<img src="${esc(src)}" alt="${esc(alt)}" />`;

/* Markdown images with a title, ![alt](x.png "Caption"), become a captioned
 * frame. Images without a title stay plain <img>. */
marked.use({
  renderer: {
    image(href, title, text) {
      if (!title) return false;
      const tag = marked.Renderer.prototype.image.call(this, href, null, text);
      return `<figure class="ak-figure">${tag}<figcaption>${title}</figcaption></figure>`;
    },
  },
});
// marked wraps a lone image in <p>; a <figure> can't sit inside a <p>.
const markdown = (src) => marked.parse(src).replace(/<p>\s*(<figure class="ak-figure">[\s\S]*?<\/figure>)\s*<\/p>/g, '$1');

// ================================================================ layout

let LAYOUT = '';

// Font Awesome Free icons: {{icon:name}} becomes the inline SVG from
// scripts/vendor/fontawesome/<name>.svg (the license comment inside stays).
const ICON_DIR = path.join(ROOT, 'scripts', 'vendor', 'fontawesome');
const iconCache = new Map();
function icon(name) {
  if (!iconCache.has(name)) {
    let svg;
    try {
      svg = readFileSync(path.join(ICON_DIR, `${name}.svg`), 'utf8').trim();
    } catch (err) {
      if (err.code === 'ENOENT') throw new Error(`Unknown icon: ${name}`);
      throw err;
    }
    if (!svg.startsWith('<svg ')) throw new Error(`Icon ${name}.svg does not start with "<svg "`);
    iconCache.set(name, svg.replace('<svg ', '<svg class="ak-icon" aria-hidden="true" focusable="false" '));
  }
  return iconCache.get(name);
}
const withIcons = (html) => html.replace(/\{\{icon:([\w-]+)\}\}/g, (_, name) => icon(name));

/* Wrap a page's <main> in templates/layout.html. */
function page({ url, title, description, image, section, nav, main, scripts = '', stylesheet = '', extraMeta = [], noindex = false }) {
  const meta = [
    description && `<meta name="description" content="${esc(description)}" />`,
    noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${esc(absUrl(url))}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    description && `<meta property="og:description" content="${esc(description)}" />`,
    !noindex && `<meta property="og:url" content="${esc(absUrl(url))}" />`,
    image && `<meta property="og:image" content="${esc(absUrl(image))}" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    ...extraMeta,
  ]
    .filter(Boolean)
    .map((l) => `    ${l}`)
    .join('\n');
  const values = {
    title: esc(title === SITE_NAME ? title : `${title} — ${SITE_NAME}`),
    meta,
    // A post's own style.css loads after styles.css, so it can override anything.
    styles: stylesheet ? `    <link rel="stylesheet" href="${esc(stylesheet)}" />` : '',
    section: esc(section),
    main,
    scripts,
    active_home: nav === 'home' ? ' is-active' : '',
    active_work: nav === 'work' ? ' is-active' : '',
    active_about: nav === 'about' ? ' is-active' : '',
    current_home: nav === 'home' ? ' aria-current="page"' : '',
    current_work: nav === 'work' ? ' aria-current="page"' : '',
    current_about: nav === 'about' ? ' aria-current="page"' : '',
    // Footer ©: the build year; js/main.js updates it in the browser.
    year: String(new Date().getFullYear()),
  };
  return LAYOUT.replace(/\{\{(\w+)\}\}/g, (_, k) => values[k] ?? '');
}

// ================================================================ blog

function postCard(p) {
  const meta = `
        <div class="ak-post-meta">
          <span class="ak-date">${esc(p.date)}</span>
          <span class="ak-type">${esc((TYPE_LABELS[p.fm.type] || 'A Note').replace(/^A/, 'a').replace(/^An/, 'an'))} in</span>
          <a class="ak-pill" href="${categoryUrl(p.category)}">${esc(p.category)}</a>
        </div>`;
  if (p.fm.type === 'quote') {
    return `
      <article class="ak-post-grid-item">${meta}
        <div class="ak-quote">
          <div class="ak-quote-text"><a href="${postUrl(p)}" style="color:inherit;text-decoration:none">${quoteHtml(p.fm.quote)}</a></div>
          <div class="ak-quote-author">
            <span class="ak-feather">${icon('feather')}</span>
            <span>${esc(p.fm.author)}${p.fm.source ? `, <a href="${esc(p.fm.source)}">Source</a>` : ''}</span>
          </div>
        </div>
      </article>`;
  }
  const title = postTitle(p);
  return `
      <article class="ak-post-grid-item">${meta}
        ${p.images[0] ? `<a href="${postUrl(p)}"><img class="ak-post-image" src="${esc(p.images[0])}" alt="${esc(title)}" /></a>` : ''}
        <h2 class="ak-post-title"><a href="${postUrl(p)}">${esc(title)}</a></h2>
        <p class="ak-post-excerpt">${esc(p.subtitle)}</p>
        <a class="ak-arrow-link" href="${postUrl(p)}">Read More...</a>
      </article>`;
}

/* Home (all posts) and each category page share this listing. */
function listingPage({ posts, allPosts, categories, activeCategory }) {
  const pill = (href, label, active) =>
    `<a class="ak-pill${active ? ' is-active' : ''}" href="${href}">${esc(label)}</a>`;
  const pills = [
    pill('/', `All (${allPosts.length})`, !activeCategory),
    ...categories.map((c) => pill(categoryUrl(c.name), `${c.name} (${c.posts.length})`, c.name === activeCategory)),
  ].join('\n        ');
  const main = `    <main class="ak-content">
      <h1 class="ak-page-h1">${esc(activeCategory || SITE_NAME)}</h1>
      <nav class="ak-pills" aria-label="Categories">
        ${pills}
      </nav>
      <div class="ak-post-grid" data-post-grid>
        <div class="ak-post-grid-gutter" aria-hidden="true"></div>${posts.map(postCard).join('')}
      </div>
    </main>`;
  return page({
    url: activeCategory ? categoryUrl(activeCategory) : '/',
    title: activeCategory || SITE_NAME,
    description: activeCategory ? `Posts about ${activeCategory} by ${SITE_NAME}.` : SITE_DESCRIPTION,
    section: activeCategory ? 'BLOG' : 'HOME',
    nav: 'home',
    main,
    scripts: [
      '<script src="https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js"></script>',
      '<script src="https://cdn.jsdelivr.net/npm/imagesloaded@5.0.0/imagesloaded.pkgd.min.js"></script>',
      '<script type="module" src="/js/home.js"></script>',
    ].map((l) => `    ${l}`).join('\n'),
  });
}

/* Prev / next chevron: Font Awesome's angle (the original's was 15 x 28). */
const chevron = (dir) => icon(dir === 'prev' ? 'angle-left' : 'angle-right');

function postPage(p, prev, next, categories) {
  const navLink = (item, dir) => {
    if (!item) return '<span></span>';
    return dir === 'prev'
      ? `<a class="ak-postnav-link" href="${postUrl(item)}">${chevron('prev')}${typeLabel(item)}</a>`
      : `<a class="ak-postnav-link is-next" href="${postUrl(item)}">${typeLabel(item)}${chevron('next')}</a>`;
  };
  const type = p.fm.type;
  const isQuote = type === 'quote';
  const title = postTitle(p);
  const head = isQuote
    ? `<div class="ak-post-head is-quote">
        <h1><span class="ak-qm ak-qm-open">“</span>${quoteHtml(p.fm.quote)}<span class="ak-qm ak-qm-close">”</span></h1>${p.fm.author ? `
        <div class="ak-quote-attrib"><span class="ak-feather">${icon('feather')}</span> ${esc(p.fm.author)}</div>` : ''}
      </div>`
    : `<div class="ak-post-head">
        <h1>${esc(title)}</h1>${p.subtitle ? `\n        <p>${esc(p.subtitle)}</p>` : ''}
      </div>`;
  const body = isQuote
    ? (p.body.trim() ? markdown(p.body) : '')
    : markdown(p.body) +
      (p.images.length > 1 ? `<div class="ak-post-gallery">${p.images.slice(1).map((s) => img(s, title)).join('')}</div>` : '');

  // Sidebar: the items each post type shows, in the original's order.
  const typeWord = (TYPE_LABELS[type] || 'A Note').replace(/^An?/, (m) => m.toLowerCase());
  const side = {
    author: !isQuote && p.fm.author
      ? `<div class="ak-side-author"><span class="ak-feather">${icon('feather')}</span> ${esc(p.fm.author)}</div>` : '',
    link: p.fm.source
      ? `<div class="ak-side-link"><a href="${esc(p.fm.source)}" target="_blank" rel="noopener">Read more here</a></div>` : '',
    type: `<div class="ak-side-type">${esc(typeWord)} in <a class="ak-side-chip" href="${categoryUrl(p.category)}">${esc(p.category)}</a></div>`,
    date: p.date ? `<time class="ak-side-date" datetime="${isoDate(p.date)}">${esc(p.date)}</time>` : '',
    loc: p.fm.location
      ? `<div class="ak-side-loc"><a href="${esc(p.fm.location)}" target="_blank" rel="noopener">${icon('location-dot')} Location</a></div>` : '',
  };
  const order = { quote: ['link', 'type', 'date'], event: ['date', 'type', 'link', 'loc'] }[type] || ['author', 'link', 'type', 'date', 'loc'];
  const sideMeta = order.map((k) => side[k]).filter(Boolean).join('\n              ');

  const cats = categories
    .map((c) => `<a class="ak-pill" href="${categoryUrl(c.name)}">${esc(`${c.name} (${c.posts.length})`)}</a>`)
    .join('\n              ');

  const main = `    <main class="ak-post-page">
      <nav class="ak-postnav">
        ${navLink(prev, 'prev')}
        ${navLink(next, 'next')}
      </nav>
      ${head}
      <div class="ak-post-body-wrap">
        <aside class="ak-post-side">
          <div class="ak-side-box">
            ${p.images[0] ? img(p.images[0], title) : ''}
            <div class="ak-side-meta">
              ${sideMeta}
            </div>
          </div>
        </aside>
        <div class="ak-post-main">${body ? `
          <article class="ak-post-body">
            ${body}
          </article>` : ''}
          <section class="ak-post-cats">
            <h2 class="ak-post-cats-h">Categories</h2>
            <nav class="ak-pills" aria-label="Categories">
              ${cats}
            </nav>
          </section>
        </div>
      </div>
    </main>`;

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: postDescription(p) || undefined,
    datePublished: isoDate(p.date) || undefined,
    image: p.images[0] ? absUrl(p.images[0]) : undefined,
    author: { '@type': 'Person', name: SITE_NAME, url: SITE_URL + '/about/' },
    mainEntityOfPage: absUrl(postUrl(p)),
  };
  return page({
    url: postUrl(p),
    title,
    description: postDescription(p),
    image: p.images[0],
    section: 'BLOG',
    nav: '', // the original marks no nav link on a post
    main,
    stylesheet: p.stylesheet,
    extraMeta: [
      `<meta property="og:type" content="article" />`,
      p.date && `<meta property="article:published_time" content="${isoDate(p.date)}" />`,
      `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
    ],
  });
}

// ================================================================ work

function workPage(projects) {
  const pills = [
    `<button type="button" class="ak-pill is-active" data-slug-pill="">All (${projects.length})</button>`,
    ...projects.map((p) => `<button type="button" class="ak-pill" data-slug-pill="${p.slug}">${esc(p.title || p.slug)}</button>`),
  ].join('\n        ');
  const tiles = projects
    .map(
      (p) => `
        <div class="ak-work-tile" data-slug="${p.slug}">
          <a href="${projectUrl(p)}">
            ${p.images[0] ? img(p.images[0], p.title) : ''}
            <div class="ak-work-tile-title">${esc(p.title || p.slug)}</div>
          </a>
        </div>`
    )
    .join('');
  const main = `    <main class="ak-work-page">
      <h1 class="ak-work-h1">Building products people love</h1>
      <div class="ak-pills" data-pills>
        ${pills}
      </div>
      <div class="ak-work-grid" data-work-grid>${tiles}
      </div>
    </main>`;
  return page({
    url: '/work/',
    title: 'Work',
    description: `Selected work by ${SITE_NAME}.`,
    section: 'WORK',
    nav: 'work',
    main,
    scripts: '    <script type="module" src="/js/work.js"></script>',
  });
}

function projectPage(p, next) {
  const fm = p.fm;
  const dl = [
    fm.client && `<dt>Client:</dt><dd>${esc(fm.client)}</dd>`,
    fm.position && `<dt>Position:</dt><dd>${esc(fm.position)}</dd>`,
    fm.achievements && `<dt>Achievements:</dt><dd>${esc(fm.achievements)}</dd>`,
    p.date && `<dt>Date:</dt><dd>${esc(p.date)}</dd>`,
  ].filter(Boolean).join('');
  const title = p.title || p.slug;
  const main = `    <main class="ak-project-page">
      <nav class="ak-project-topnav">
        ${next ? `<a class="ak-arrow-link" href="${projectUrl(next)}">${esc(next.title || next.slug)} <span class="ak-arrow">›</span></a>` : ''}
      </nav>
      <div class="ak-project-head">
        <h1>${esc(title)}</h1>${p.subtitle ? `\n        <p>${esc(p.subtitle)}</p>` : ''}
      </div>
      <div class="ak-project-body-wrap">
        <div class="ak-project-main">
          ${p.images[0] ? img(p.images[0], title) : ''}
          <div class="ak-project-body">${marked.parse(p.body)}</div>
          ${p.images.length > 1 ? `<div class="ak-project-gallery">${p.images.slice(1).map((s) => img(s, title)).join('')}</div>` : ''}
        </div>
        <aside class="ak-project-side">
          <h3>${esc(title.toLowerCase())}</h3>
          <dl>${dl}</dl>
          ${fm.link ? `<a class="ak-project-link" href="${esc(fm.link)}" target="_blank" rel="noopener">View Project</a>` : ''}
        </aside>
      </div>
    </main>`;
  return page({
    url: projectUrl(p),
    title,
    description: p.subtitle,
    image: p.images[0],
    section: 'WORK',
    nav: 'work',
    main,
    stylesheet: p.stylesheet,
  });
}

// ================================================================ other

async function readFragment(name) {
  const html = await fs.readFile(path.join(ROOT, 'pages', name), 'utf8');
  return withIcons(html.replace(/^\s*<!--[\s\S]*?-->\s*\n/, '').replace(/\s+$/, ''));
}

function redirectPage(to) {
  const target = esc(to);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Moved</title>
    <link rel="canonical" href="${esc(absUrl(to))}" />
    <meta http-equiv="refresh" content="0; url=${target}" />
  </head>
  <body>
    <p>This page has moved to <a href="${target}">${esc(absUrl(to))}</a>.</p>
  </body>
</html>
`;
}

async function readRedirects() {
  let text = '';
  try {
    text = await fs.readFile(path.join(ROOT, 'redirects.txt'), 'utf8');
  } catch {
    return [];
  }
  return text
    .split('\n')
    .map((l) => l.replace(/#.*/, '').trim())
    .filter(Boolean)
    .map((l, i) => {
      const [from, to, extra] = l.split(/\s+/);
      if (!to || extra || !from.startsWith('/')) throw new Error(`redirects.txt: can't read "${l}". Use: /old-path /new-path/`);
      return { from: from.replace(/\/+$/, '') || '/', to };
    });
}

function feedXml(posts) {
  const items = posts
    .map((p) => {
      const url = absUrl(postUrl(p));
      const ms = dateMs(p.date);
      return [
        '    <item>',
        `      <title>${esc(postTitle(p))}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        Number.isFinite(ms) && `      <pubDate>${new Date(ms).toUTCString()}</pubDate>`,
        `      <category>${esc(p.category)}</category>`,
        `      <description>${esc(postDescription(p))}</description>`,
        '    </item>',
      ].filter(Boolean).join('\n');
    })
    .join('\n');
  const latest = Math.max(0, ...posts.map((p) => dateMs(p.date)).filter(Number.isFinite));
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on product, life, and people.</description>
    <language>en</language>
    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

function sitemapXml(urls) {
  const body = urls
    .map((u) => `  <url>\n    <loc>${absUrl(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

// ================================================================ build

export async function build() {
  LAYOUT = withIcons(await fs.readFile(path.join(ROOT, 'templates', 'layout.html'), 'utf8'));

  const posts = (await readContent('blog', '/blog/')).sort((a, b) => (dateMs(b.date) || 0) - (dateMs(a.date) || 0));
  const projects = (await readContent('projects', '/work/')).sort(
    (a, b) => Number(a.fm.order ?? 999) - Number(b.fm.order ?? 999) || (a.title || a.slug).localeCompare(b.title || b.slug)
  );

  const categories = [];
  for (const p of posts) {
    let c = categories.find((c) => slugify(c.name) === slugify(p.category));
    if (!c) categories.push((c = { name: p.category, posts: [] }));
    c.posts.push(p);
  }
  categories.sort((a, b) => a.name.localeCompare(b.name));

  // Every page, keyed by its URL. Clashes are errors, not silent overwrites.
  const pages = new Map();
  const add = (url, html, source) => {
    if (pages.has(url)) throw new Error(`Two things want the URL ${url}: ${pages.get(url).source} and ${source}. Rename one of them.`);
    pages.set(url, { html, source });
  };

  add('/', listingPage({ posts, allPosts: posts, categories }), 'the home page');
  for (const c of categories) {
    add(categoryUrl(c.name), listingPage({ posts: c.posts, allPosts: posts, categories, activeCategory: c.name }), `category "${c.name}"`);
  }
  posts.forEach((p, i) => add(postUrl(p), postPage(p, posts[i - 1], posts[i + 1], categories), p.source));

  add('/work/', workPage(projects), 'the work page');
  projects.forEach((p, i) => {
    const next = projects[i + 1] || (projects.length > 1 ? projects[0] : null);
    add(projectUrl(p), projectPage(p, next), p.source);
  });

  add('/about/', page({
    url: '/about/',
    title: 'Resumé',
    description: 'Alexander Kitov — Product Manager and Entrepreneur.',
    image: '/assets/avatar.svg',
    section: 'RESUMÉ',
    nav: 'about',
    main: await readFragment('about.html'),
  }), 'pages/about.html');

  for (const r of await readRedirects()) {
    add(r.from === '/' ? '/' : `${r.from}/`, redirectPage(r.to), `redirects.txt (${r.from})`);
  }

  // ---- write _site/
  await fs.rm(OUT, { recursive: true, force: true });
  for (const item of STATIC) {
    await fs.cp(path.join(ROOT, item), path.join(OUT, item), {
      recursive: true,
      filter: (src) => !path.basename(src).startsWith('.'),
    }).catch((err) => { if (err.code !== 'ENOENT') throw err; });
  }
  // Each post's / project's own files (images, style.css, scene.html, …) go
  // next to its page. The .md source and anything starting with _ stay out.
  for (const [p, url] of [...posts.map((p) => [p, postUrl(p)]), ...projects.map((p) => [p, projectUrl(p)])]) {
    await fs.cp(p.folder, path.join(OUT, url), {
      recursive: true,
      filter: (src) => src === p.folder || !(skipName(path.basename(src)) || src.endsWith('.md')),
    });
  }
  for (const [url, { html }] of pages) {
    const file = path.join(OUT, url, 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, html);
  }
  await fs.writeFile(path.join(OUT, '404.html'), page({
    url: '/404.html',
    title: 'Page not found',
    section: '404',
    main: await readFragment('404.html'),
    noindex: true,
  }));
  await fs.writeFile(path.join(OUT, 'feed.xml'), feedXml(posts));
  await fs.writeFile(path.join(OUT, 'sitemap.xml'), sitemapXml([
    { loc: '/' },
    { loc: '/work/' },
    { loc: '/about/' },
    ...categories.map((c) => ({ loc: categoryUrl(c.name), lastmod: isoDate(c.posts[0].date) })),
    ...posts.map((p) => ({ loc: postUrl(p), lastmod: isoDate(p.date) })),
    ...projects.map((p) => ({ loc: projectUrl(p) })),
  ]));

  return { posts: posts.length, categories: categories.length, projects: projects.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  build()
    .then((n) => console.log(`Built _site/: ${n.posts} posts, ${n.categories} categories, ${n.projects} projects (${SITE_URL}).`))
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}
