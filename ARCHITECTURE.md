# Architecture

A static site: plain HTML pages, one CSS file, a little JS, and Markdown for
content. A small Node script (standard library only, nothing to install)
turns the Markdown into finished HTML pages in `_site/`.

```
  WRITE                      PREVIEW                          PUBLISH
  blog/my-post/        ──▶   node scripts/serve.mjs     ──▶   git push (main)
    my-post.md + images      localhost:8000/blog/my-post/          │
                             (rebuilds _site/ on every             ▼
                              page load)                    GitHub Actions:
                                                            build.mjs → _site/ → host
```

The preview and the deploy run the same script and serve the same `_site/`
folder. What you see locally is what goes live.

## URLs

| URL                      | Comes from                              |
|--------------------------|-----------------------------------------|
| `/`                      | all posts, newest first                 |
| `/blog/<category>/`      | the posts with that `category:`         |
| `/blog/<slug>/`          | the folder `blog/<slug>/`               |
| `/work/`                 | all projects, by `order:`               |
| `/work/<slug>/`          | the folder `projects/<slug>/`           |
| `/about/`                | `pages/about.html`                      |
| `/feed.xml`, `/sitemap.xml` | generated                            |
| old URLs (`/resume`, `/ux/slack-ux`, …) | `redirects.txt`          |

Each page is a folder holding an `index.html`, so URLs have no `.html`
ending and work on any static host without extra setup.

The `<category>` part of the URL is the category name in lowercase with
dashes (`Product Management` → `/blog/product-management/`). A post's URL
doesn't include its category, so you can recategorize a post without
breaking its link.

## 1. Write

Each post is a folder. The folder name is the URL. The `.md` file inside can
have any name, but there can be only one:

```
blog/my-post/
  my-post.md        the post
  hero.jpg          images, referenced by filename
  style.css         optional: this post's own look
  scene.html        optional: interactive piece, embedded with an <iframe>
  _notes.md         starts with _ → never published
```

```markdown
---
title: My post title
subtitle: One-line summary (home card + Google description)
updated: 18.11.2026          # DD.MM.YYYY
type: lesson                 # lesson | event | quote
category: UX
images: [hero.jpg]
---

Regular **Markdown**. An inline image from the same folder:

![Alt text](diagram.png)
```

Projects work the same way in `projects/<slug>/` and are served at
`/work/<slug>/`. Full field lists are in `blog/README.md` and
`projects/README.md`. A folder starting with `_` is a draft. The frontmatter
parser is small, not full YAML. Use one `key: value` per line and put any
value that contains a colon in quotes.

## 2. Files in a post folder

Everything in the folder except the `.md` file and `_` files is published
next to the page. `blog/slack-ux/argyle.png` becomes
`/blog/slack-ux/argyle.png`.

| File | What happens |
|------|--------------|
| Images | `images[0]` is the main image (home card, sidebar, link previews). Further entries form a gallery under the post. Inline `![](file.png)` can go anywhere in the text |
| `style.css` | Loaded on that page only, after `styles.css`, so it can restyle the post without changing its HTML |
| `*.html`, `*.js`, models… | Copied as they are. Embed with `<iframe src="scene.html" loading="lazy" …>`. Put `<meta name="robots" content="noindex, indexifembedded">` in the embedded file so Google doesn't list it on its own |
| `index.html` | Not allowed. That's the generated page |

Site-wide assets (avatar, favicon) live in `assets/`. The site font, About Beige
(a commercial variable font by Krista Radoeva, abouttype.com, used under the site
owner's license and not covered by the repo's other licenses), is
`assets/fonts/AboutBeige.woff2`, declared with `@font-face` in `styles.css`. Design references live
in `_materials/`, which is gitignored: they stay on your computer only.

## 3. Build: `scripts/build.mjs`

1. Reads every post and project folder and converts the Markdown with
   `marked` (a copy is saved in `scripts/vendor/marked.js`, so nothing is
   downloaded or installed).
2. Wraps each page in **`templates/layout.html`**, which holds the shared
   `<head>`, header, menu and footer. To change the header or footer, edit
   this one file.
3. Writes complete HTML for every page in the URL table above. Each page
   gets its title, description, canonical URL and link-preview tags. Posts
   also get structured data (`BlogPosting`) for Google.
4. Replaces `{{icon:name}}` (in the layout and `pages/*.html`) with the inline
   SVG `scripts/vendor/fontawesome/<name>.svg` from Font Awesome Free 7.3.1
   (CC BY 4.0; the license comment inside each SVG must stay). To add an
   icon, copy its SVG from the `@fortawesome/fontawesome-free` package
   (`npm pack @fortawesome/fontawesome-free@7.3.1`, then `package/svgs/`)
   into that folder. An unknown name stops the build with `Unknown icon`.
5. Writes `feed.xml`, `sitemap.xml`, `404.html`, and a redirect page for each
   line in `redirects.txt`.
6. Copies `styles.css`, `js/`, `assets/` and each folder's own files as they
   are.

The build stops with a plain-English message if:

- two things would share a URL (e.g. a post folder `blog/ux/` and the
  category UX)
- a folder name has capitals or spaces
- a folder has two `.md` files or an `index.html`
- a `.md` file sits directly in `blog/` instead of in its own folder

The preview shows that message in the browser.

## 4. In the browser

The pages are complete without JavaScript. Three small scripts add
behaviour:

- `js/main.js`: opens and closes the mobile menu (every page)
- `js/home.js`: masonry layout of the post cards (home and category pages)
- `js/work.js`: the project pills on `/work/`, which filter without leaving
  the page

All styling is in `styles.css`.

## 5. Redirects: `redirects.txt`

```
/resume        /about/
/ux/slack-ux   /blog/slack-ux/
```

For each line the build writes a small page at the old address. It sends
visitors to the new one and tells Google the new one is the real page
(canonical link plus an instant meta refresh, which Google treats as a
permanent redirect). Add a line for every old URL that might still be linked
from somewhere.

## 6. Preview: `scripts/serve.mjs`

`node scripts/serve.mjs` (port 8000, or `PORT=…`), from any folder. On
macOS it opens the browser (`NO_OPEN=1` skips that). Every page load reruns
the build. Edit, refresh, and you see the result. It behaves like a static
host: `/blog/ux` redirects to `/blog/ux/`, and unknown URLs show the 404 page.

## 7. Publish: `.github/workflows/deploy.yml`

On every push to `main`: build → upload `_site/` → deploy to GitHub Pages.
Any other static host (Netlify, Cloudflare Pages, …) works the same way:
build command `node scripts/build.mjs`, output folder `_site`.

The site must be served from the root of its domain (`alexkitov.com/`),
because all links start with `/`.

## File map

```
templates/layout.html          shared <head>, header, menu, footer
pages/about.html  404.html     hand-written pages (just the <main> part)
blog/<slug>/                   one folder per post (.md + its files)
projects/<slug>/               one folder per project
redirects.txt                  old URL → new URL
styles.css                     all styles
js/main.js home.js work.js     small browser scripts
assets/                        avatar / favicon / fonts/AboutBeige.woff2
scripts/build.mjs              builds _site/
scripts/serve.mjs              local preview
scripts/vendor/marked.js       Markdown converter (saved copy, MIT)
scripts/vendor/fontawesome/    icon SVGs + LICENSE.txt (Font Awesome Free 7.3.1)
.github/workflows/deploy.yml   build + deploy on push
_materials/                    design references (gitignored, local only)
_site/                         build output (not committed)
```
