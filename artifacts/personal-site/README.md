# Alexander Kitov — personal site

A pure-static personal website. **No build step**, no React, no bundler, no
package.json. Just `.html`, `.css`, `.js`, and `.md` files served directly.

## Local development

On Replit the workflow runs:

```bash
python3 -m http.server $PORT --bind 0.0.0.0 --directory artifacts/personal-site
```

Anywhere else, `cd` into this folder and run any static server you like — for
example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Adding content

Drop a markdown file into `blog/` (for posts) or `projects/` (for portfolio
items). Filename = URL slug. Frontmatter schemas are documented in
[`blog/README.md`](blog/README.md) and [`projects/README.md`](projects/README.md).

## Deploy

Push to GitHub. The `.github/workflows/reindex.yml` action regenerates
`manifest.json` files and per-slug HTML pages on every push to `blog/**` or
`projects/**`. Then point any static host (GitHub Pages, Netlify, Vercel,
Cloudflare Pages, S3) at the repo root.

## Files

```
artifacts/personal-site/
├── index.html              Home (post grid)
├── post.html               Single blog post template (?slug=)
├── about.html              Resumé / about page
├── project.html            Single project template (?slug=)
├── work/index.html         Portfolio index
├── styles.css              All site styles
├── partials/
│   ├── header.html         Shared chrome — fetched by main.js
│   └── footer.html
├── js/
│   ├── main.js             Loads partials, drawer, active nav
│   ├── md.js               Frontmatter parser, content discovery
│   ├── home.js             Renders home post grid + pills
│   ├── post.js             Renders a single blog post
│   ├── work.js             Renders the work tile grid
│   └── project.js          Renders a single project
├── blog/                   Markdown posts (+ images/)
├── projects/               Markdown projects (+ images/)
├── assets/                 Static assets (avatar, etc.)
├── scripts/regenerate.mjs  Stdlib-only Node script (manifests + per-slug HTML)
└── .github/workflows/reindex.yml
```
