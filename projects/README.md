# Projects

One folder per project. The folder name is the URL:
`projects/betahaus-sofia/` → `/work/betahaus-sofia/`. Folders work exactly
like blog posts (one `.md` file with any name, images next to it, optional
`style.css`, embeddable `.html` files, `_` = private). See
`../blog/README.md`.

## Frontmatter

```yaml
---
title: Project name
subtitle: One-line description shown under the title
client: Client or company name             # sidebar
position: Co-Founder                       # sidebar
achievements: Free-form text               # sidebar
updated: 03.2011 - present                 # sidebar, any text
images: [cover.png, extra-1.png]           # first = main image, rest = gallery
link: https://example.com                  # "View Project" button
order: 10                                  # lower = earlier on /work/
---

Markdown text goes here.
```
