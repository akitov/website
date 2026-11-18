# Personal site

This project is a static website in `artifacts/personal-site`, built with
plain HTML, CSS, and browser JavaScript.

- The Replit preview runs `artifacts/personal-site/server.py`, a small Python
  standard-library server.
- Replit publishing is configured as a Static Deployment serving that folder.
- `scripts/regenerate.mjs` uses only Node's standard library to update the
  generated manifests, post pages, RSS feed, and sitemap.
- There is no app framework, package manager, API, or database.
