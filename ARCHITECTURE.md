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
| Images | `images[0]` is the main image (home card, sidebar, link previews). Further entries form a gallery under the post. Inline `![](file.png)` can go anywhere in the text; `![alt](file.png "Caption")` adds a captioned frame |
| `style.css` | Loaded on that page only, after `styles.css`, so it can restyle the post without changing its HTML |
| `*.html`, `*.js`, models… | Copied as they are. Embed with `<iframe src="scene.html" loading="lazy" …>`. Put `<meta name="robots" content="noindex, indexifembedded">` in the embedded file so Google doesn't list it on its own |
| `index.html` | Not allowed. That's the generated page |

Site-wide assets live in `assets/`: the avatar, the favicon and the site font
(see "Fonts" below). `assets/` is published as it is, so put only files there
that visitors should be able to download. Design references live in
`_materials/`, which is gitignored: they stay on your computer only.

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
4. Replaces `{{icon:name}}` (in the layout and `pages/*.html`) with an inline
   SVG. See "Icons" below.
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

- `js/main.js`: opens and closes the mobile menu (every page). See "Mobile menu" below
- `js/home.js`: masonry layout of the post cards (home and category pages).
  Column and gutter widths come from CSS: Masonry measures the first card
  and the empty `.ak-post-grid-gutter` sizer that the build puts in the grid
- `js/work.js`: the project pills on `/work/`, which filter without leaving
  the page (a filtered grid gets `is-filtered`, which drops the odd last
  tile's offset)

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

## 8. Look: fonts, icons, fluid sizes, mobile menu

### Fonts

All text uses one font, About Beige, a variable font. The file is
`assets/fonts/AboutBeige.woff2` and `styles.css` declares it with `@font-face`
(`font-weight: 100 1000`, because the font's default weight is hairline and a
narrower range would render it that way). `--serif`, `--sans` and
`--title-font` all resolve to the same stack, so changing the font means
changing those three variables.

**License:** About Beige is a commercial font by Krista Radoeva
(abouttype.com). It is used under the site owner's license and is not covered
by the repo's other licenses.

### Icons

Icons are Lucide (ISC), kept as SVG files in `scripts/vendor/lucide/` with
the license in `LICENSE`. Most come from `lucide-static` 1.70.0. LinkedIn and
Twitter come from 0.577.0, the last release with brand icons.

The site doesn't use the SVGs directly. `scripts/icon-font.py` converts them
into `assets/fonts/icons.woff2`, about 1.3 KB, and writes the name-to-codepoint
map to `scripts/vendor/lucide/icons.json`. Chrome on macOS draws SVG shapes
on the GPU with 4x multisampling, which leaves curved edges with 3 shades.
Font glyphs get the same antialiasing as text: 70+ shades.

The conversion is exact. It keeps fills, outlines strokes at their width,
caps and joins, and subtracts `<mask>` black shapes. Each glyph is the icon's
24-unit square on the baseline.

Write `{{icon:mail-filled}}` in `templates/layout.html` or `pages/*.html`, or
call `icon('map-pin')` in `build.mjs`. The build emits
`<span class="ak-icon ak-icon-<name>" aria-hidden="true">&#x…;</span>`.

`*-filled.svg` files are filled variants made from Lucide's own paths. Where
a fill would hide an inner line (the mail flap, the feather's shaft and barb),
a mask cuts that line out. No new geometry is drawn.

Next to text, an icon's font-size is 1.1em, and its ink bottom sits on the
text's baseline. `--ib` in `styles.css` is the space under the ink in the
icon's 24-unit grid, stroke included.

To add or change an icon:

1. Download the package: `npm pack lucide-static@1.70.0`, then unpack it.
2. Copy `package/icons/<name>.svg` into `scripts/vendor/lucide/`.
3. Rebuild the font. It needs fonttools, skia-pathops and brotli:
   `python3 -m venv /tmp/iv && /tmp/iv/bin/pip install fonttools skia-pathops brotli && /tmp/iv/bin/python scripts/icon-font.py`.
   Commit the new `icons.woff2` and `icons.json`.
4. Measure the icon's ink bottom in the 24-unit grid. If it isn't y 22, set
   `.ak-icon-<name> { --ib: <24 - y> }`.
5. Use `{{icon:<name>}}`. A name missing from `icons.json` stops the build
   with `Unknown icon`.

### Fluid sizes

There is one layout for all widths, not a set of breakpoints. `:root` in
`styles.css` defines `--t: calc((100vw - 390px) / 890)`, which is 0 at a 390px
viewport and 1px at 1280px. A value that is A at 390px and B at 1280px is:

```css
clamp(A, calc(A + (B - A) * var(--t)), B)
```

`--t` is itself a length (1px of `--t` is the whole 390 to 1280 range), so
write `(B - A)` as a plain number, not with a unit: for 14px to 24px that is
`clamp(14px, calc(14px + 10 * var(--t)), 24px)`. Writing `10px * var(--t)` is
length times length, which is invalid, and the declaration is silently dropped.

It stays A below 390px, grows evenly between, and stays B above 1280px. Where
the value is in `rem`, keep `rem` for A and B but use `px` inside the `calc()`
(the root font size is itself fluid). Shared values (`--gutter`,
`--gutter-frame`, `--space-*` and so on) are tokens at the top of
`styles.css`.

Values matched to the original site's screenshots use two more helpers,
anchored at the widths those were taken at (768 tablet, 1456 desktop):

- `--tp: calc((100vw - 390px) / 378)`: 0 at 390px, 1px at 768px.
- `--t2: calc((100vw - 768px) / 688)`: 0 at 768px, 1px at 1456px.

A value that is T at 768 and D at 1456 is
`clamp(T, calc(T + (D - T) * var(--t2)), D)`. One that is also P on phones
(390) adds the two ranges:

```css
calc(clamp(P, calc(P + (T - P) * var(--tp)), T) + clamp(0px, calc((D - T) * var(--t2)), D - T))
```

When a value shrinks over a range, swap that clamp's bounds so the smaller
one comes first (`clamp()` with min > max always returns min). Example: the
pill height is `calc(clamp(18px, calc(18px + 12.4 * var(--tp)), 30.4px) +
clamp(0px, calc(2 * var(--t2)), 2px))`, so 18 / 30.4 / 32.4px.

Other shared tokens:

- `--gutter-frame`: the header and footer card inset (14px on phones, 4vw at
  768–789, 8vw from 1456 up).
- `--gutter-page`: the page content inset (14px, 5vw, 9.5vw).
- `--footer-gap`: the space above the footer card (60px).
- `--w-heading: 650` for every bold heading, `--w-light: 350` for every
  light text.

Widths keep scaling above 1456px; font sizes and vertical spacing stop at
their 1456px values. Tablet-only grid percentages go in the one
`@media (min-width: 761px) and (max-width: 979px)` block.

To change a size, change the token's 390px value (and its 1280px value if the
desktop size changes too). Don't add breakpoints. The one `@media
(max-width: 760px)` query is for things that switch (the menu, one-column
grids); `MOBILE_QUERY` in `js/home.js` repeats it and must stay the same.

### Mobile menu

At 760px and below the inline nav is replaced by a hamburger button.
`templates/layout.html` holds both the button (`data-menu-toggle`) and a
`<nav data-menu hidden>` with HOME, WORK and RESUMÉ tiles inside the header
card, so opening it grows the card and pushes the page down. `js/main.js`
toggles the nav's `hidden` attribute and `aria-expanded` on the button. It
closes on a tap on a menu link, on Escape (focus returns to the button) and
when the viewport grows past 760px. Without JavaScript the menu stays closed.

## File map

```
templates/layout.html          shared <head>, header, menu, footer
pages/about.html  404.html     hand-written pages (just the <main> part)
blog/<slug>/                   one folder per post (.md + its files)
projects/<slug>/               one folder per project
redirects.txt                  old URL → new URL
styles.css                     all styles
js/main.js home.js work.js     small browser scripts
assets/                        avatar / favicon / fonts/AboutBeige.woff2, fonts/icons.woff2
scripts/build.mjs              builds _site/
scripts/serve.mjs              local preview
scripts/vendor/marked.js       Markdown converter (saved copy, MIT)
scripts/icon-font.py           builds assets/fonts/icons.woff2 from the icon SVGs
scripts/vendor/lucide/         icon SVGs + icons.json + LICENSE (Lucide, ISC)
.github/workflows/deploy.yml   build + deploy on push
_materials/                    design references (gitignored, local only)
_site/                         build output (not committed)
```
