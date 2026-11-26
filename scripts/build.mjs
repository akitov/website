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
 *   + home = work (/), notes = all posts (/blog/), feed.xml, sitemap.xml
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

/* Left edge (styles.css, TYPE REFINEMENTS): a heading's and a drop cap's
 * first glyph is pulled left by its own left side bearing, the heading's
 * ink onto the text column's edge, the drop cap's to where the paragraph's
 * capital stems start. The build sets the bearing inline (--lsb on headings,
 * --dc-lsb on the drop cap's paragraph) from About Beige's bearings at the
 * weight the element is set in, read from the weight tokens in styles.css.
 * scripts/font-metrics.py writes the table. */
const SIDE_BEARINGS = JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'vendor', 'about-beige', 'side-bearings.json'), 'utf8'));
const STYLES = readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
function bearingsAt(token) {
  const m = STYLES.match(new RegExp(`--w-${token}:\\s*([^;]+);`));
  if (!m) throw new Error(`styles.css has no --w-${token}`);
  const ref = m[1].trim().match(/^var\(--w-([\w-]+)\)$/);
  if (ref) return bearingsAt(ref[1]);
  const table = SIDE_BEARINGS[m[1].trim()];
  if (!table) throw new Error(`No side bearings at weight ${m[1].trim()} (--w-${token}); run scripts/font-metrics.py`);
  return table;
}
const BEARINGS = { bold: bearingsAt('bold'), heavy: bearingsAt('heavy'), normal: bearingsAt('normal') };
// The drop cap lines up with the capitals' stem bearing in body text
// (--lsb-text in styles.css), which has to match the font at --w-normal.
{
  const css = Number((STYLES.match(/--lsb-text:\s*([\d.]+)/) || [])[1]);
  const font = bearingsAt('normal').H / 1000;
  if (css !== font) throw new Error(`styles.css --lsb-text is ${css}; About Beige's H at --w-normal is ${font}. Update --lsb-text.`);
}
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENTITIES[e.toLowerCase()] ?? m);
// The first visible character of an HTML fragment.
function firstGlyph(html) {
  for (const m of html.matchAll(/<[^>]*>|([^<]+)/g)) {
    const ch = m[1] !== undefined && [...decode(m[1]).trimStart()][0];
    if (ch) return ch;
  }
  return undefined;
}
// A character's bearing in em (0 if the font has no glyph for it).
const bearing = (table, ch) => (ch && table[ch] != null ? table[ch] / 1000 : 0);
const VOID = new Set(['img', 'br', 'hr', 'input', 'source', 'wbr']);
// Offsets of the <p>s that are direct children of the fragment.
function topLevelPs(html) {
  const at = [];
  let depth = 0;
  for (const m of html.matchAll(/<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi)) {
    const tag = m[2].toLowerCase();
    if (VOID.has(tag) || m[0].endsWith('/>')) continue;
    if (m[1]) depth--;
    else if (depth++ === 0 && tag === 'p') at.push(m.index);
  }
  return at;
}
/* Headings get --lsb at --w-bold, their weight. The drop cap's paragraph (a
 * post's first child, a project's first <p>, as the CSS selects them) gets
 * --dc-lsb at the drop cap weight. */
function opticalEdges(html, dropcap) {
  html = html.replace(/<(h[2-6])((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/g, (_, tag, attrs, inner) =>
    `<${tag}${attrs} style="--lsb:${bearing(BEARINGS.bold, firstGlyph(inner))}">${inner}</${tag}>`);
  const [at] = topLevelPs(html);
  if (at === undefined || (dropcap === 'first-child' && html.slice(0, at).trim())) return html;
  const gt = html.indexOf('>', at);
  const ch = firstGlyph(html.slice(gt + 1, html.indexOf('</p>', gt)));
  return ch ? `${html.slice(0, gt)} style="--dc-lsb:${bearing(BEARINGS.heavy, ch)}"${html.slice(gt)}` : html;
}

// ================================================================ layout

let LAYOUT = '';

// Phosphor icons (MIT), as glyphs of Phosphor's own web fonts, trimmed to the
// icons used (assets/fonts/phosphor-<style>.woff2, see scripts/subset-icons.py).
// {{icon:name}} uses Phosphor's class names: "users" is Regular,
// "feather-fill" / "caret-left-light" the Fill / Light styles. The build
// emits <span class="ak-icon ak-icon-<name> ak-ph-<style>">&#x…;</span>.
// Glyphs, not inline SVG: Chrome on macOS draws SVG with 4x MSAA (stepped
// edges); glyphs get the text's antialiasing.
const ICONS = JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'vendor', 'phosphor', 'icons.json'), 'utf8'));
function icon(name) {
  const ic = ICONS[name];
  if (!ic || name.startsWith('_')) throw new Error(`Unknown icon: ${name} (add it to scripts/vendor/phosphor/icons.json and run scripts/subset-icons.py)`);
  return `<span class="ak-icon ak-icon-${name} ak-ph-${ic.style}" aria-hidden="true">&#x${ic.codepoint};</span>`;
}
const withIcons = (html) => html.replace(/\{\{icon:([\w-]+)\}\}/g, (_, name) => icon(name));

/* Wrap a page's <main> in templates/layout.html. */
function page({ url, title, description, image, nav, main, scripts = '', stylesheet = '', extraMeta = [], noindex = false }) {
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
    main,
    scripts,
    active_work: nav === 'work' ? ' is-active' : '',
    active_notes: nav === 'notes' ? ' is-active' : '',
    active_about: nav === 'about' ? ' is-active' : '',
    current_work: nav === 'work' ? ' aria-current="page"' : '',
    current_notes: nav === 'notes' ? ' aria-current="page"' : '',
    current_about: nav === 'about' ? ' aria-current="page"' : '',
    // Header title: the name, and on the home page also "Welcome 👋", shown
    // instead of it on the visit's first page (layout.html's inline script).
    page_title: url === '/'
      ? `<span class="ak-title-greet">Welcome 👋</span><span class="ak-title-name">${esc(SITE_NAME)}</span>`
      : esc(SITE_NAME),
    // Header right: the profile photo linking to /about/. On /about/ (which
    // shows the photo itself) the spot stays empty, at the photo's size so
    // the header keeps its height.
    avatar: nav === 'about'
      ? '<span class="ak-avatar" aria-hidden="true"></span>'
      : '<a href="/about/" class="ak-avatar" aria-label="About"><img src="/assets/profile.jpg" width="378" height="378" alt="Alexander Kitov" /></a>',
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
            <span class="ak-feather">${icon('feather-fill')}</span>
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

/* Notes (all posts, /blog/) and each category page share this listing. */
function listingPage({ posts, allPosts, categories, activeCategory }) {
  const pill = (href, label, active) =>
    `<a class="ak-pill${active ? ' is-active' : ''}" href="${href}">${esc(label)}</a>`;
  const pills = [
    pill('/blog/', `All (${allPosts.length})`, !activeCategory),
    ...categories.map((c) => pill(categoryUrl(c.name), `${c.name} (${c.posts.length})`, c.name === activeCategory)),
  ].join('\n        ');
  const main = `    <main class="ak-content">
      <h1 class="ak-listing-h1">${activeCategory ? `📓 / ${esc(activeCategory)}` : 'Notebook 📓'}</h1>
      <nav class="ak-pills" aria-label="Categories">
        ${pills}
      </nav>
      <div class="ak-post-grid" data-post-grid>
        <div class="ak-post-grid-gutter" aria-hidden="true"></div>${posts.map(postCard).join('')}
      </div>
    </main>`;
  return page({
    url: activeCategory ? categoryUrl(activeCategory) : '/blog/',
    title: activeCategory || 'Notebook',
    description: activeCategory ? `Posts about ${activeCategory} by ${SITE_NAME}.` : `Notes on product, life, and people by ${SITE_NAME}.`,
    nav: 'notes',
    main,
    scripts: [
      '<script src="https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js"></script>',
      '<script src="https://cdn.jsdelivr.net/npm/imagesloaded@5.0.0/imagesloaded.pkgd.min.js"></script>',
      '<script type="module" src="/js/home.js"></script>',
    ].map((l) => `    ${l}`).join('\n'),
  });
}

/* Prev / next, the one component blog posts and project pages share
 * (.ak-prevnext in styles.css). It goes between the header and <main>.
 * href(item) is the neighbour's URL, label(item) its link text as HTML.
 * Carets: Phosphor Light. */
function prevNext(prev, next, href, label) {
  const link = (item, dir) => {
    if (!item) return '';
    return dir === 'prev'
      ? `<a class="ak-prevnext-link is-prev" href="${href(item)}" rel="prev">${icon('caret-left-light')}${label(item)}</a>`
      : `<a class="ak-prevnext-link is-next" href="${href(item)}" rel="next">${label(item)}${icon('caret-right-light')}</a>`;
  };
  return `    <nav class="ak-prevnext" aria-label="Previous and next">
      ${[link(prev, 'prev'), link(next, 'next')].filter(Boolean).join('\n      ')}
    </nav>
`;
}

/* Hero: the title and the line under it, the one component blog posts and
 * project pages share (.ak-hero in styles.css), so both have the same sizes
 * and spacing. titleHtml and subHtml are HTML; subHtml may be empty. Quote
 * posts pass quote: true (the quote is the title, the author the line). */
function hero(titleHtml, subHtml, { quote = false } = {}) {
  return `<div class="ak-hero${quote ? ' is-quote' : ''}">
        <h1>${titleHtml}</h1>${subHtml ? `\n        <p>${subHtml}</p>` : ''}
      </div>`;
}

function postPage(p, prev, next, categories) {
  const type = p.fm.type;
  const isQuote = type === 'quote';
  const title = postTitle(p);
  const head = isQuote
    ? hero(
      `<span class="ak-qm ak-qm-open">“</span>${quoteHtml(p.fm.quote)}<span class="ak-qm ak-qm-close">”</span>`,
      p.fm.author ? `<span class="ak-feather">${icon('feather-fill')}</span> ${esc(p.fm.author)}` : '',
      { quote: true })
    : hero(esc(title), p.subtitle ? esc(p.subtitle) : '');
  const body = isQuote
    ? (p.body.trim() ? opticalEdges(markdown(p.body), 'first-child') : '')
    : opticalEdges(markdown(p.body), 'first-child') +
      (p.images.length > 1 ? `<div class="ak-post-gallery">${p.images.slice(1).map((s) => img(s, title)).join('')}</div>` : '');

  // Sidebar: the items each post type shows, in the original's order.
  const typeWord = (TYPE_LABELS[type] || 'A Note').replace(/^An?/, (m) => m.toLowerCase());
  const side = {
    author: !isQuote && p.fm.author
      ? `<div class="ak-side-author"><span class="ak-feather">${icon('feather-fill')}</span> ${esc(p.fm.author)}</div>` : '',
    link: p.fm.source
      ? `<div class="ak-side-link"><a href="${esc(p.fm.source)}" target="_blank" rel="noopener">Read more here</a></div>` : '',
    type: `<div class="ak-side-type">${esc(typeWord)} in <a class="ak-side-chip" href="${categoryUrl(p.category)}">${esc(p.category)}</a></div>`,
    date: p.date ? `<time class="ak-side-date" datetime="${isoDate(p.date)}">${esc(p.date)}</time>` : '',
    loc: p.fm.location
      ? `<div class="ak-side-loc"><a href="${esc(p.fm.location)}" target="_blank" rel="noopener">${icon('map-pin-fill')} Location</a></div>` : '',
  };
  const order = { quote: ['link', 'type', 'date'], event: ['date', 'type', 'link', 'loc'] }[type] || ['author', 'link', 'type', 'date', 'loc'];
  const sideMeta = order.map((k) => side[k]).filter(Boolean).join('\n              ');

  // "Read more ..." pills: All first (the Notebook page), then each category.
  const allCount = categories.reduce((n, c) => n + c.posts.length, 0);
  const cats = [
    `<a class="ak-pill" href="/blog/">${esc(`All (${allCount})`)}</a>`,
    ...categories.map((c) => `<a class="ak-pill" href="${categoryUrl(c.name)}">${esc(`${c.name} (${c.posts.length})`)}</a>`),
  ].join('\n              ');

  const main = `${prevNext(prev, next, postUrl, typeLabel)}    <main class="ak-post-page">
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
            <p class="ak-post-cats-label" style="--lsb:${bearing(BEARINGS.normal, 'R')}">Read more …</p>
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
    nav: 'notes', // NOTES is a post's section, as WORK is a project's
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
      <h1 class="ak-listing-h1">Building products people love</h1>
      <div class="ak-pills" data-pills>
        ${pills}
      </div>
      <div class="ak-work-grid" data-work-grid>${tiles}
      </div>
    </main>`;
  return page({
    url: '/',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    nav: 'work',
    main,
    scripts: '    <script type="module" src="/js/work.js"></script>',
  });
}

function projectPage(p, prev, next) {
  const fm = p.fm;
  const dl = [
    fm.client && `<dt>Client:</dt><dd>${esc(fm.client)}</dd>`,
    fm.position && `<dt>Position:</dt><dd>${esc(fm.position)}</dd>`,
    fm.achievements && `<dt>Achievements:</dt><dd>${esc(fm.achievements)}</dd>`,
    p.date && `<dt>Date:</dt><dd>${esc(p.date)}</dd>`,
  ].filter(Boolean).join('');
  const title = p.title || p.slug;
  const main = `${prevNext(prev, next, projectUrl, (item) => esc(item.title || item.slug))}    <main class="ak-project-page">
      <div class="ak-project-inner">
      ${hero(esc(title), p.subtitle ? esc(p.subtitle) : '')}
      <div class="ak-project-body-wrap">
        <div class="ak-project-main">
          ${p.images[0] ? img(p.images[0], title) : ''}
          <div class="ak-project-body">${opticalEdges(marked.parse(p.body), 'first-of-type')}</div>
          ${p.images.length > 1 ? `<div class="ak-project-gallery">${p.images.slice(1).map((s) => img(s, title)).join('')}</div>` : ''}
        </div>
        <aside class="ak-project-side">
          <h3>${esc(title.toLowerCase())}</h3>
          <dl>${dl}</dl>
          ${fm.link ? `<a class="ak-project-link" href="${esc(fm.link)}" target="_blank" rel="noopener">View Project</a>` : ''}
        </aside>
      </div>
      </div>
    </main>`;
  return page({
    url: projectUrl(p),
    title,
    description: p.subtitle,
    image: p.images[0],
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
    <link>${SITE_URL}/blog/</link>
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

  add('/', workPage(projects), 'the home page (work)');
  add('/blog/', listingPage({ posts, allPosts: posts, categories }), 'the notes page');
  for (const c of categories) {
    add(categoryUrl(c.name), listingPage({ posts: c.posts, allPosts: posts, categories, activeCategory: c.name }), `category "${c.name}"`);
  }
  posts.forEach((p, i) => add(postUrl(p), postPage(p, posts[i - 1], posts[i + 1], categories), p.source));

  projects.forEach((p, i) => {
    // Prev / next wrap around.
    const n = projects.length;
    const prev = n > 1 ? projects[(i - 1 + n) % n] : null;
    const next = n > 1 ? projects[(i + 1) % n] : null;
    add(projectUrl(p), projectPage(p, prev, next), p.source);
  });

  add('/about/', page({
    url: '/about/',
    title: 'About',
    description: 'Alexander Kitov — Product Manager and Entrepreneur.',
    image: '/assets/profile.jpg',
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
    main: await readFragment('404.html'),
    noindex: true,
  }));
  await fs.writeFile(path.join(OUT, 'feed.xml'), feedXml(posts));
  await fs.writeFile(path.join(OUT, 'sitemap.xml'), sitemapXml([
    { loc: '/' },
    { loc: '/blog/' },
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
