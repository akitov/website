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
  const flush = () => {
    if (key === null) return;
    let v = buf.join('\n').trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
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
  const manifest = {
    generatedAt: new Date().toISOString(),
    slugs: items.map((i) => i.slug),
    items: items.map((i) => ({
      slug: i.slug,
      title: i.frontmatter.title || '',
      type: i.frontmatter.type || '',
      category: i.frontmatter.category || '',
      date: i.frontmatter.date || '',
      excerpt: i.frontmatter.excerpt || '',
      image: i.frontmatter.image || '',
    })),
  };
  await fs.writeFile(
    path.join(ROOT, dir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8'
  );
  return items;
}

const POST_SHIM = (slug, fm) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(fm.title || slug)} — Alexander Kitov</title>
    ${fm.excerpt ? `<meta name="description" content="${escapeAttr(fm.excerpt)}" />` : ''}
    <link rel="stylesheet" href="/styles.css" />
    <link rel="icon" type="image/svg+xml" href="/assets/avatar.svg" />
    <link rel="canonical" href="/${slug}.html" />
  </head>
  <body data-active-nav="home" data-page-title="BLOG">
    <div data-header></div>
    <main class="ak-post-page" data-post-page>
      <div class="ak-postnav" data-postnav></div>
      <div class="ak-post-head" data-post-head></div>
      <div class="ak-post-body-wrap" data-post-body-wrap>
        <aside class="ak-post-side" data-post-side></aside>
        <article class="ak-post-body" data-post-body>
          <p style="text-align:center;color:#888;font-family:var(--sans);font-size:13px;padding:40px 0;">Loading…</p>
        </article>
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

const PROJECT_SHIM = (slug, fm) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(fm.title || slug)} — Alexander Kitov</title>
    ${fm.subtitle ? `<meta name="description" content="${escapeAttr(fm.subtitle)}" />` : ''}
    <link rel="stylesheet" href="/styles.css" />
    <link rel="icon" type="image/svg+xml" href="/assets/avatar.svg" />
    <link rel="canonical" href="/work/${slug}.html" />
  </head>
  <body data-active-nav="work" data-page-title="WORK">
    <div data-header></div>
    <main class="ak-project-page" data-project-page>
      <div class="ak-project-topnav" data-project-topnav></div>
      <div class="ak-project-head" data-project-head></div>
      <div class="ak-project-body-wrap">
        <div class="ak-project-main" data-project-main>
          <p style="text-align:center;color:#888;font-family:var(--sans);font-size:13px;padding:40px 0;">Loading…</p>
        </div>
        <aside class="ak-project-side" data-project-side></aside>
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

async function main() {
  const blogItems = await buildManifest('blog', (a, b) => dateMs(b.frontmatter.date) - dateMs(a.frontmatter.date));
  const projectItems = await buildManifest('projects', (a, b) => {
    const ao = Number(a.frontmatter.order ?? 999);
    const bo = Number(b.frontmatter.order ?? 999);
    if (ao !== bo) return ao - bo;
    return (a.frontmatter.title || a.slug).localeCompare(b.frontmatter.title || b.slug);
  });

  // Per-slug HTML for posts in repo root.
  const blogSlugs = new Set(blogItems.map((i) => i.slug));
  await clearGenerated(ROOT, (n) => /^[\w.-]+\.html$/.test(n) && !RESERVED_ROOT_HTML.has(n) && !blogSlugs.has(n.replace(/\.html$/, '')));
  for (const item of blogItems) {
    await fs.writeFile(path.join(ROOT, `${item.slug}.html`), POST_SHIM(item.slug, item.frontmatter), 'utf8');
  }

  // Per-slug HTML for projects under /work/.
  const projSlugs = new Set(projectItems.map((i) => i.slug));
  const workDir = path.join(ROOT, 'work');
  await clearGenerated(workDir, (n) => /^[\w.-]+\.html$/.test(n) && n !== 'index.html' && !projSlugs.has(n.replace(/\.html$/, '')));
  for (const item of projectItems) {
    await fs.writeFile(path.join(workDir, `${item.slug}.html`), PROJECT_SHIM(item.slug, item.frontmatter), 'utf8');
  }

  console.log(`Wrote blog/manifest.json (${blogItems.length} posts) and projects/manifest.json (${projectItems.length} projects).`);
  console.log(`Wrote ${blogItems.length} per-post HTML pages and ${projectItems.length} per-project HTML pages.`);
}

const RESERVED_ROOT_HTML = new Set(['index.html', 'post.html', 'project.html', 'about.html', '404.html']);

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
