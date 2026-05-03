/* scripts/regenerate.mjs
 *
 * Regenerate static manifests + per-slug HTML pages for the site.
 * Uses ONLY the Node.js standard library (fs, path) — no dependencies,
 * no package.json, runnable with `node scripts/regenerate.mjs` from the
 * artifact root.
 *
 * What it does:
 *   1. Walks `blog/` and `projects/` for *.md files.
 *   2. Parses each file's frontmatter (same tiny format as js/md.js).
 *   3. Writes `<dir>/manifest.json` with a sorted list of slugs and a
 *      digest of frontmatter for each entry.
 *   4. Writes per-slug HTML files at:
 *        /<slug>.html               (mirrors /post.html?slug=<slug>)
 *        /work/<slug>.html          (mirrors /project.html?slug=<slug>)
 *      so users (and search engines) can land on clean URLs.
 *   5. Writes /feed.xml (RSS 2.0) listing all blog posts and
 *      /sitemap.xml listing every public URL on the site.
 *      Site origin is taken from $SITE_URL (default: https://alexanderkitov.com).
 *
 * The per-slug HTML files are thin shims: they include the same scripts
 * as post.html / project.html but inject the correct ?slug= via
 * <script>window.__slug=...</script>, falling back to the same JS
 * renderers. This keeps the static site purely static while supporting
 * pretty URLs.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { frontmatter: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: {}, body: raw };
  const fmText = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\r?\n/, '');
  const fm = {};
  let key = null;
  let buf = [];
  const unquote = (s) => {
    s = s.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
    return s;
  };
  const flush = () => {
    if (key === null) return;
    let v = buf.join('\n').trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map((x) => unquote(x)).filter(Boolean);
    } else if (v.includes('\n') || v.startsWith('- ')) {
      // YAML block-list: each non-empty line begins with "- ".
      const lines = v.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0 && lines.every((l) => l.startsWith('- '))) {
        v = lines.map((l) => unquote(l.slice(2)));
      } else {
        v = unquote(v);
      }
    } else {
      v = unquote(v);
    }
    fm[key] = v;
    key = null;
    buf = [];
  };
  for (const line of fmText.split(/\r?\n/)) {
    const m = /^([A-Za-z][A-Za-z0-9_]*):\s?(.*)$/.exec(line);
    if (m) {
      flush();
      key = m[1];
      buf = [m[2]];
    } else {
      buf.push(line);
    }
  }
  flush();
  return { frontmatter: fm, body };
}

function dateMs(s) {
  if (!s) return -Infinity;
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
  if (!m) return -Infinity;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();
}

async function listMarkdown(dir) {
  const abs = path.join(ROOT, dir);
  let names;
  try {
    names = await fs.readdir(abs);
  } catch {
    return [];
  }
  return names
    .filter((n) => n.endsWith('.md'))
    .filter((n) => n !== 'README.md' && !n.startsWith('_'))
    .map((n) => n.replace(/\.md$/, ''));
}

async function buildManifest(dir, sort) {
  const slugs = await listMarkdown(dir);
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const raw = await fs.readFile(path.join(ROOT, dir, `${slug}.md`), 'utf8');
      const { frontmatter } = parseFrontmatter(raw);
      return { slug, frontmatter };
    })
  );
  items.sort(sort);
  // No `generatedAt` — keep manifest output byte-deterministic so re-running
  // the script with no content change produces zero diff. This prevents the
  // GitHub Action that runs regenerate from churning commits in a loop.
  const manifest = {
    slugs: items.map((i) => i.slug),
    items: items.map((i) => {
      const fm = i.frontmatter;
      const images = Array.isArray(fm.images)
        ? fm.images
        : (fm.image ? [fm.image] : []);
      return {
        slug: i.slug,
        title: fm.title || '',
        type: fm.type || '',
        category: fm.category || '',
        updated: fm.updated || fm.date || '',
        subtitle: fm.subtitle || fm.slug || fm.excerpt || '',
        client: fm.client || '',
        images,
      };
    }),
  };
  // Write only when the content actually changes, so timestamp-free output
  // and unchanged manifest content together guarantee idempotency.
  const target = path.join(ROOT, dir, 'manifest.json');
  const next = JSON.stringify(manifest, null, 2) + '\n';
  let prev = '';
  try { prev = await fs.readFile(target, 'utf8'); } catch {}
  if (prev !== next) {
    await fs.writeFile(target, next, 'utf8');
  }
  return items;
}

// Same write-only-on-change helper for per-slug HTML files.
async function writeIfChanged(filePath, content) {
  let prev = '';
  try { prev = await fs.readFile(filePath, 'utf8'); } catch {}
  if (prev !== content) {
    await fs.writeFile(filePath, content, 'utf8');
  }
}

// ---------------------------------------------------------------------------
// Tiny markdown renderer (Node stdlib only).
//
// Mirrors the subset of CommonMark used in our content: ATX headings,
// paragraphs, blockquotes, ordered/unordered lists, fenced code blocks,
// horizontal rules, inline emphasis (* and **), inline code (`…`), images
// `![alt](src)` and links `[text](href)`. Produced HTML is what bots and
// link-preview crawlers see in View Source; once the runtime JS boots in a
// real browser it overwrites the same containers via `marked`, so any minor
// formatting drift between the two renderers is invisible to end users.
// ---------------------------------------------------------------------------
function renderInline(s) {
  // Pull out code spans, images, and links first so their contents are not
  // mutated by emphasis or HTML escaping.
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000C${codes.length - 1}\u0000`;
  });
  const imgs = [];
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    imgs.push({ alt, src });
    return `\u0000I${imgs.length - 1}\u0000`;
  });
  const links = [];
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    links.push({ text, href });
    return `\u0000L${links.length - 1}\u0000`;
  });
  s = escapeHtml(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/\u0000L(\d+)\u0000/g, (_, n) => {
    const { text, href } = links[+n];
    return `<a href="${escapeAttr(href)}">${escapeHtml(text)}</a>`;
  });
  s = s.replace(/\u0000I(\d+)\u0000/g, (_, n) => {
    const { alt, src } = imgs[+n];
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" />`;
  });
  s = s.replace(/\u0000C(\d+)\u0000/g, (_, n) => `<code>${escapeHtml(codes[+n])}</code>`);
  return s;
}

function renderMarkdown(src) {
  const lines = String(src || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const blockStart = /^(#{1,6}\s|>\s?|[-*]\s|\d+\.\s|```|---+\s*$)/;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      out.push(`<h${h[1].length}>${renderInline(h[2])}</h${h[1].length}>`);
      i++; continue;
    }
    if (/^---+\s*$/.test(line)) { out.push('<hr />'); i++; continue; }
    if (/^```/.test(line)) {
      i++;
      const buf = [];
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      if (i < lines.length) i++;
      out.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      // Recursively render so nested lists/quotes inside blockquotes work.
      out.push(`<blockquote>\n${renderMarkdown(buf.join('\n'))}\n</blockquote>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      out.push('<ul>\n' + items.map((it) => `<li>${renderInline(it)}</li>`).join('\n') + '\n</ul>');
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      out.push('<ol>\n' + items.map((it) => `<li>${renderInline(it)}</li>`).join('\n') + '\n</ol>');
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !blockStart.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    out.push(`<p>${renderInline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Render helpers — these mirror the runtime renderers in js/post.js and
// js/project.js, so the static HTML in the shim looks identical to what JS
// would produce. Any future change to the runtime renderers needs a matching
// update here (and vice versa) to keep View Source and the live page aligned.
// ---------------------------------------------------------------------------
const TYPE_LABELS = { quote: 'A Quote', lesson: 'A Lesson', event: 'An Event' };

function fmDate(fm) { return fm.updated || fm.date || ''; }
function fmSubtitle(fm) { return fm.subtitle || fm.slug || fm.excerpt || ''; }
function fmHeroImage(fm) {
  if (Array.isArray(fm.images) && fm.images.length > 0) return fm.images[0];
  return fm.image || '';
}

function renderPostNav(prev, next) {
  const link = (item, dir) => {
    if (!item) return '<span></span>';
    const fm = item.frontmatter;
    const label = `${TYPE_LABELS[fm.type] || 'A Note'} in ${escapeHtml(fm.category || 'Notes')}`;
    const href = `/post.html?slug=${encodeURIComponent(item.slug)}`;
    return dir === 'prev'
      ? `<a class="ak-arrow-link ak-arrow-prev" href="${href}"><span class="ak-arrow">‹</span> ${label}</a>`
      : `<a class="ak-arrow-link" href="${href}">${label} <span class="ak-arrow">›</span></a>`;
  };
  return `${link(prev, 'prev')}\n${link(next, 'next')}`;
}

function renderPostHead(slug, fm) {
  const date = fmDate(fm);
  if (fm.type === 'quote') {
    return `<h1>${escapeHtml(fm.author || 'A Quote')}</h1>\n<p>${fm.category ? `In ${escapeHtml(fm.category)}` : ''}${date ? ` — ${escapeHtml(date)}` : ''}</p>`;
  }
  const subtitle = fmSubtitle(fm);
  return `<h1>${escapeHtml(fm.title || slug)}</h1>\n${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}`;
}

function renderPostSide(fm) {
  const typeLabel = `${TYPE_LABELS[fm.type] || 'A Note'} in ${escapeHtml(fm.category || 'Notes')}`;
  const hero = fmHeroImage(fm);
  const date = fmDate(fm);
  return `${hero ? `<img src="${escapeAttr(hero)}" alt="${escapeAttr(fm.title || '')}" />` : ''}
<div style="margin-bottom:12px"><span class="ak-arrow-link">${typeLabel} <span class="ak-arrow">›</span></span></div>
${date ? `<div class="ak-side-date">${escapeHtml(date)}</div>` : ''}
<hr />`;
}

function renderPostBody(item) {
  const fm = item.frontmatter;
  if (fm.type === 'quote') {
    return `<div class="ak-quote" style="margin-top:8px">
  <div class="ak-quote-text">${escapeHtml(fm.quote || '')}</div>
  <div class="ak-quote-author">
    <span class="ak-feather">🪶</span>
    <span>${escapeHtml(fm.author || '')}${fm.source ? `, <a href="${escapeAttr(fm.source)}">Source</a>` : ''}</span>
  </div>
</div>`;
  }
  const main = renderMarkdown(item.body || '');
  const extra = Array.isArray(fm.images) ? fm.images.slice(1) : [];
  const gallery = extra
    .map((src) => `<img src="${escapeAttr(src)}" alt="${escapeAttr(fm.title || '')}" />`)
    .join('');
  return main + (gallery ? `\n<div class="ak-post-gallery">${gallery}</div>` : '');
}

function renderProjectTopnav(next) {
  if (!next) return '';
  const href = `/project.html?slug=${encodeURIComponent(next.slug)}`;
  return `<a class="ak-arrow-link" href="${href}">${escapeHtml(next.frontmatter.title || next.slug)} <span class="ak-arrow">›</span></a>`;
}

function renderProjectHead(slug, fm) {
  return `<h1>${escapeHtml(fm.title || slug)}</h1>\n${(fm.subtitle || fm.slug) ? `<p>${escapeHtml(fm.subtitle || fm.slug)}</p>` : ''}`;
}

function renderProjectMain(item) {
  const fm = item.frontmatter;
  const hero = fmHeroImage(fm);
  const heroHtml = hero ? `<img src="${escapeAttr(hero)}" alt="${escapeAttr(fm.title || '')}" />` : '';
  const body = renderMarkdown(item.body || '');
  const gallery = (Array.isArray(fm.images) ? fm.images.slice(1) : [])
    .map((src) => `<img src="${escapeAttr(src)}" alt="${escapeAttr(fm.title || '')}" />`)
    .join('');
  return `${heroHtml}
<div class="ak-project-body">${body}</div>
${gallery ? `<div class="ak-project-gallery">${gallery}</div>` : ''}`;
}

function renderProjectSide(fm) {
  const subtitleish = String(fm.title || '').toLowerCase();
  const dl = [];
  if (fm.client) dl.push(`<dt>Client:</dt><dd>${escapeHtml(fm.client)}</dd>`);
  if (fm.position) dl.push(`<dt>Position:</dt><dd>${escapeHtml(fm.position)}</dd>`);
  if (fm.achievements) dl.push(`<dt>Achievements:</dt><dd>${escapeHtml(fm.achievements)}</dd>`);
  const dateField = fm.updated || fm.date;
  if (dateField) dl.push(`<dt>Date:</dt><dd>${escapeHtml(dateField)}</dd>`);
  const link = fm.link
    ? `<a class="ak-project-link" href="${escapeAttr(fm.link)}" target="_blank" rel="noopener">View Project</a>`
    : '';
  return `<h3>${escapeHtml(subtitleish)}</h3>\n<dl>${dl.join('')}</dl>\n${link}`;
}

const POST_SHIM = (item, prev, next) => {
  const { slug, frontmatter: fm } = item;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(fm.title || slug)} — Alexander Kitov</title>
    ${(fm.subtitle || fm.slug || fm.excerpt) ? `<meta name="description" content="${escapeAttr(fm.subtitle || fm.slug || fm.excerpt)}" />` : ''}
    <link rel="stylesheet" href="/styles.css" />
    <link rel="icon" type="image/svg+xml" href="/assets/avatar.svg" />
    <link rel="canonical" href="/${slug}.html" />
  </head>
  <body data-active-nav="home" data-page-title="BLOG">
    <div data-header></div>
    <main class="ak-post-page" data-post-page>
      <div class="ak-postnav" data-postnav>${renderPostNav(prev, next)}</div>
      <div class="ak-post-head" data-post-head>${renderPostHead(slug, fm)}</div>
      <div class="ak-post-body-wrap" data-post-body-wrap>
        <aside class="ak-post-side" data-post-side>${renderPostSide(fm)}</aside>
        <article class="ak-post-body" data-post-body>${renderPostBody(item)}</article>
      </div>
    </main>
    <div data-footer></div>
    <script>window.__slug = ${JSON.stringify(slug)};</script>
    <script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
    <script type="module" src="/js/main.js"></script>
    <script type="module" src="/js/post.js"></script>
  </body>
</html>
`;
};

const PROJECT_SHIM = (item, next) => {
  const { slug, frontmatter: fm } = item;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(fm.title || slug)} — Alexander Kitov</title>
    ${(fm.subtitle || fm.slug) ? `<meta name="description" content="${escapeAttr(fm.subtitle || fm.slug)}" />` : ''}
    <link rel="stylesheet" href="/styles.css" />
    <link rel="icon" type="image/svg+xml" href="/assets/avatar.svg" />
    <link rel="canonical" href="/work/${slug}.html" />
  </head>
  <body data-active-nav="work" data-page-title="WORK">
    <div data-header></div>
    <main class="ak-project-page" data-project-page>
      <div class="ak-project-topnav" data-project-topnav>${renderProjectTopnav(next)}</div>
      <div class="ak-project-head" data-project-head>${renderProjectHead(slug, fm)}</div>
      <div class="ak-project-body-wrap">
        <div class="ak-project-main" data-project-main>${renderProjectMain(item)}</div>
        <aside class="ak-project-side" data-project-side>${renderProjectSide(fm)}</aside>
      </div>
    </main>
    <div data-footer></div>
    <script>window.__slug = ${JSON.stringify(slug)};</script>
    <script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
    <script type="module" src="/js/main.js"></script>
    <script type="module" src="/js/project.js"></script>
  </body>
</html>
`;
};

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

async function clearGenerated(dirAbs, predicate) {
  let entries;
  try {
    entries = await fs.readdir(dirAbs);
  } catch {
    return;
  }
  for (const name of entries) {
    if (predicate(name)) {
      await fs.unlink(path.join(dirAbs, name));
    }
  }
}

function dateOf(fm) {
  return fm.updated || fm.date || '';
}

const SITE_URL = (process.env.SITE_URL || 'https://alexanderkitov.com').replace(/\/+$/, '');

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr) {
  const ms = dateMs(dateStr);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toUTCString();
}

function toIsoDate(dateStr) {
  const ms = dateMs(dateStr);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toISOString().slice(0, 10);
}

function postDescription(fm) {
  if (fm.type === 'quote' && fm.quote) {
    const author = fm.author ? ` — ${fm.author}` : '';
    return `"${fm.quote}"${author}`;
  }
  return fm.subtitle || fm.excerpt || '';
}

function postTitle(slug, fm) {
  if (fm.title) return fm.title;
  if (fm.type === 'quote' && fm.quote) {
    const truncated = fm.quote.length > 80 ? fm.quote.slice(0, 77) + '…' : fm.quote;
    return truncated;
  }
  return slug;
}

function buildFeed(blogItems) {
  // Keep output deterministic: derive lastBuildDate from the latest post date,
  // never from `Date.now()`, so re-running the script with no content change
  // produces zero diff (matches the same idempotency contract as manifests).
  const latestMs = blogItems.reduce(
    (max, i) => Math.max(max, dateMs(dateOf(i.frontmatter))),
    -Infinity
  );
  const lastBuild = Number.isFinite(latestMs)
    ? new Date(latestMs).toUTCString()
    : 'Thu, 01 Jan 1970 00:00:00 GMT';

  const items = blogItems
    .map((i) => {
      const fm = i.frontmatter;
      const url = `${SITE_URL}/${i.slug}.html`;
      const pubDate = toRfc822(dateOf(fm));
      return [
        '    <item>',
        `      <title>${escapeXml(postTitle(i.slug, fm))}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : '',
        fm.category ? `      <category>${escapeXml(fm.category)}</category>` : '',
        `      <description>${escapeXml(postDescription(fm))}</description>`,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Alexander Kitov</title>
    <link>${escapeXml(SITE_URL)}/</link>
    <atom:link href="${escapeXml(SITE_URL)}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on product, life, and people.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

function buildSitemap(blogItems, projectItems) {
  // Keep output deterministic: only emit <lastmod> when we have a real date
  // from frontmatter. Static pages (home, work, about) intentionally omit it
  // so that running the script on a different day doesn't churn the file.
  const urls = [];

  urls.push({ loc: `${SITE_URL}/` });
  urls.push({ loc: `${SITE_URL}/work/` });
  urls.push({ loc: `${SITE_URL}/about.html` });

  for (const i of blogItems) {
    urls.push({
      loc: `${SITE_URL}/${i.slug}.html`,
      lastmod: toIsoDate(dateOf(i.frontmatter)),
    });
  }
  for (const i of projectItems) {
    urls.push({
      loc: `${SITE_URL}/work/${i.slug}.html`,
      lastmod: toIsoDate(dateOf(i.frontmatter)),
    });
  }

  const body = urls
    .map((u) => {
      const parts = [`    <loc>${escapeXml(u.loc)}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function main() {
  const blogItems = await buildManifest('blog', (a, b) => dateMs(dateOf(b.frontmatter)) - dateMs(dateOf(a.frontmatter)));
  const projectItems = await buildManifest('projects', (a, b) => {
    const ao = Number(a.frontmatter.order ?? 999);
    const bo = Number(b.frontmatter.order ?? 999);
    if (ao !== bo) return ao - bo;
    return (a.frontmatter.title || a.slug).localeCompare(b.frontmatter.title || b.slug);
  });

  // For each post, we need its full markdown body so the shim can include the
  // rendered HTML inline (View Source must show the post body even without JS).
  const blogFull = await Promise.all(blogItems.map(async (i) => {
    const raw = await fs.readFile(path.join(ROOT, 'blog', `${i.slug}.md`), 'utf8');
    const { body } = parseFrontmatter(raw);
    return { ...i, body };
  }));
  const projectFull = await Promise.all(projectItems.map(async (i) => {
    const raw = await fs.readFile(path.join(ROOT, 'projects', `${i.slug}.md`), 'utf8');
    const { body } = parseFrontmatter(raw);
    return { ...i, body };
  }));

  // Per-slug HTML for posts in repo root. Prev/next mirror post.js: blogItems
  // is already sorted date-desc, so prev = older-listed neighbour at idx-1,
  // next = newer-listed neighbour at idx+1.
  const blogSlugs = new Set(blogFull.map((i) => i.slug));
  await clearGenerated(ROOT, (n) => /^[\w.-]+\.html$/.test(n) && !RESERVED_ROOT_HTML.has(n) && !blogSlugs.has(n.replace(/\.html$/, '')));
  for (let idx = 0; idx < blogFull.length; idx++) {
    const item = blogFull[idx];
    const prev = idx > 0 ? blogFull[idx - 1] : null;
    const next = idx < blogFull.length - 1 ? blogFull[idx + 1] : null;
    await writeIfChanged(path.join(ROOT, `${item.slug}.html`), POST_SHIM(item, prev, next));
  }

  // Per-slug HTML for projects under /work/. project.js shows only a "next"
  // link, wrapping back to the first project when at the end of the list.
  const projSlugs = new Set(projectFull.map((i) => i.slug));
  const workDir = path.join(ROOT, 'work');
  await clearGenerated(workDir, (n) => /^[\w.-]+\.html$/.test(n) && n !== 'index.html' && !projSlugs.has(n.replace(/\.html$/, '')));
  for (let idx = 0; idx < projectFull.length; idx++) {
    const item = projectFull[idx];
    let next = idx < projectFull.length - 1 ? projectFull[idx + 1] : null;
    if (!next && projectFull.length > 1) next = projectFull[0];
    await writeIfChanged(path.join(workDir, `${item.slug}.html`), PROJECT_SHIM(item, next));
  }

  // RSS feed of blog posts and sitemap of every public URL. Both are
  // deterministic (no `Date.now()`), so unchanged content yields zero diff.
  await writeIfChanged(path.join(ROOT, 'feed.xml'), buildFeed(blogItems));
  await writeIfChanged(path.join(ROOT, 'sitemap.xml'), buildSitemap(blogItems, projectItems));

  console.log(`Wrote blog/manifest.json (${blogItems.length} posts) and projects/manifest.json (${projectItems.length} projects).`);
  console.log(`Wrote ${blogItems.length} per-post HTML pages and ${projectItems.length} per-project HTML pages.`);
  console.log(`Wrote feed.xml and sitemap.xml (site: ${SITE_URL}).`);
}

const RESERVED_ROOT_HTML = new Set(['index.html', 'post.html', 'project.html', 'about.html', '404.html']);

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
