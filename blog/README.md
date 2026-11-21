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
quote: "..."                   # quotes only
author: Author name            # quotes only
source: https://...            # quotes only, optional
---

Markdown text. Images in the folder are referenced by filename:

![Alt text](diagram.png)
```

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

- Preview: `node scripts/serve.mjs`, then open http://localhost:8000/blog/my-post/
- Publish: commit and push the folder to `main`.
