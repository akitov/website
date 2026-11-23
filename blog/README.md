# Blog posts

One folder per post. **The folder name is the URL**:
`blog/my-post/` → `/blog/my-post/`. Use lowercase letters, numbers and
dashes only.

```
blog/my-post/
  my-post.md        the post (any name, but only one .md per folder)
  hero.jpg          images and any other files the post uses
  style.css         optional: this post's own look
  scene.html        optional: an interactive piece to embed
  _notes.md         anything starting with _ is never published
```

A folder starting with `_` (e.g. `blog/_next-post/`) is a draft and isn't
published.

## Frontmatter

```yaml
---
title: Post title              # required (not used by quotes)
subtitle: Short summary        # home card, page intro, Google description
updated: 21.03.2013            # DD.MM.YYYY; newest posts first
type: lesson                   # lesson | event | quote
category: UX                   # → listed on /blog/ux/
images: [hero.jpg, extra.jpg]  # optional; first = main image, rest = gallery
quote: "..."                   # quotes only; *stars* mark the bold part
author: Author name            # optional; quotes: under the quote; lessons: sidebar
source: https://...            # optional; "Read more here" in the sidebar
location: https://maps...      # optional; events: "Location" map link in the sidebar
---

Markdown text. Images in the folder are referenced by filename:

![Alt text](diagram.png)

An image with a title in quotes gets a frame with that caption under it:

![Alt text](diagram.png "Caption text")
```

What each post type shows:

- **lesson**: title and subtitle on top; the sidebar has the main image,
  `author` (with a feather), `source` as "Read more here", the category and
  the date.
- **quote**: the `quote` is the headline (`*make it happen*` is shown bold)
  with `author` under it. The sidebar has `source`, the category and the
  date. The Markdown text is optional.
- **event**: like a lesson, but the sidebar starts with the date and ends
  with `source` and `location`.

Every field is optional except where marked; a missing one is simply left
out.

## Categories

Writing `category: UX` puts the post on `/blog/ux/` and adds a pill on the
home page. A new category creates its page automatically. A post folder
can't share a name with a category (e.g. `blog/ux/`). The build will tell
you if that happens.

## A post's own look: `style.css`

If the folder has a `style.css`, it's loaded on that post only, after the
main `styles.css`, so it can override anything. The HTML is the same for
every post. Only the styling changes.

## Interactive pieces (three.js, diagrams…)

Put them in their own HTML file in the folder and embed it:

```html
<iframe src="scene.html" loading="lazy" title="What the scene shows"
        style="width:100%;aspect-ratio:16/9;border:0"></iframe>
```

- Inside `scene.html`, add
  `<meta name="robots" content="noindex, indexifembedded">` so Google
  doesn't list it as a separate, near-empty page.
- Search engines and AI answer engines can't see what's drawn on a canvas.
  Explain anything important in the post text or a caption.
- Don't name a file `index.html`. That name is used by the post page itself.

## Preview and publish

- Preview: run `node scripts/serve.mjs` in Terminal. It opens
  http://localhost:8000 in your browser; go to `/blog/my-post/`. Save, refresh,
  see the change. Ctrl+C stops it.
- Publish: commit and push the folder to `main`.
