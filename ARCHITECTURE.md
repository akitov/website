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

Icons are Phosphor (MIT, `@phosphor-icons/web` 2.1.2), the official web fonts
in three styles: Fill, Regular and Light. `scripts/subset-icons.py` trims each
font to the icons listed in `scripts/vendor/phosphor/icons.json` and writes
`assets/fonts/phosphor-{fill,regular,light}.woff2`, about 3 KB in all; the
full fonts are 130-155 KB each. The glyphs are Phosphor's, unchanged.

The icons are font glyphs rather than inline SVG. Chrome on macOS draws SVG
with 4x multisampling, which leaves stepped edges; glyphs get the text's
antialiasing.

Write `{{icon:<name>}}` in `templates/layout.html` or `pages/*.html`, or call
`icon('<name>')` in `build.mjs`. Names follow Phosphor's classes: `users` is
Regular, `feather-fill` and `caret-left-light` are the other styles. The build
emits `<span class="ak-icon ak-icon-<name> ak-ph-<style>" aria-hidden="true">`.

Next to text every icon is 16px. At that size Phosphor's grid lands on whole
device pixels on 2x screens. `--yb` (`inkBottom` in `icons.json`) lowers each
glyph so its ink sits on the text's baseline.

To add an icon:

1. Find it on phosphoricons.com. Its codepoint is in the package's
   `src/<style>/style.css`, and its ink bottom is the glyph's yMin / 1024.
2. Add it to `icons.json`.
3. Trim the fonts again. This needs fonttools and brotli:
   `npm pack @phosphor-icons/web@2.1.2 && tar xzf phosphor-icons-web-2.1.2.tgz`, then
   `python3 -m venv /tmp/iv && /tmp/iv/bin/pip install fonttools brotli && /tmp/iv/bin/python scripts/subset-icons.py package/src`.
   Commit the new `.woff2` files.
4. If its `inkBottom` isn't 0, set `.ak-icon-<name> { --yb: <inkBottom> }`.

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
assets/                        profile.jpg (header + about photo) / avatar.svg (favicon) / fonts/
scripts/build.mjs              builds _site/
scripts/serve.mjs              local preview
scripts/vendor/marked.js       Markdown converter (saved copy, MIT)
scripts/subset-icons.py        trims the Phosphor fonts to the icons used
scripts/vendor/phosphor/       icons.json (name, style, codepoint) + LICENSE (MIT)
.github/workflows/deploy.yml   build + deploy on push
_materials/                    design references (gitignored, local only)
_site/                         build output (not committed)
```
