# Projects

Drop a new `.md` file in this folder to publish a project. Filename = URL slug.

## Frontmatter

```yaml
---
title: Project name
subtitle: One-line description shown under the title
image: /projects/images/cover.png       # main hero image
position: Co-Founder                    # sidebar metadata
achievements: Free-form text            # sidebar metadata
date: 03.2011 - present                 # sidebar metadata
link: https://example.com               # "View Project" button URL
order: 10                               # lower = earlier in the work grid
---

Markdown body goes here.
```

Discovery rules are identical to the blog: manifest first, directory listing as
fallback. See `../blog/README.md`.
