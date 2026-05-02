# Projects

Drop a new `.md` file in this folder to publish a project. Filename = URL slug.

## Frontmatter

```yaml
---
title: Project name
subtitle: One-line description shown under the title
client: Client or company name             # sidebar — shown first
position: Co-Founder                       # sidebar metadata
achievements: Free-form text               # sidebar metadata
updated: 03.2011 - present                 # sidebar — date / range
images:                                    # optional gallery; first = hero
  - /projects/images/cover.png
  - /projects/images/extra-1.png
link: https://example.com                  # "View Project" button URL
order: 10                                  # lower = earlier in the work grid
---

Markdown body goes here.
```

> Legacy field aliases (`date` → `updated`, `image` → first entry of
> `images[]`) are still honored by the renderer.

Discovery rules are identical to the blog: manifest first, directory
listing as fallback, the two unioned. See `../blog/README.md`.
