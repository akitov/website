# Alexander Kitov — personal site

This is a static website built with plain HTML, CSS, and browser JavaScript.
It has no framework, package installation, or build step.

## Run the preview

Use the Replit **Run** button. It starts a small Python server for local
preview; the server uses only Python's standard library.

## Publish

The project is configured as a Replit Static Deployment. It serves the files
in `artifacts/personal-site` directly, without running a server in production.

## Site content

The site's pages, styles, JavaScript, images, and Markdown content are in
`artifacts/personal-site`. To regenerate content manifests, clean URLs, the
RSS feed, and the sitemap after editing Markdown, run:

```sh
cd artifacts/personal-site
node scripts/regenerate.mjs
```

The GitHub Actions workflow also regenerates these files when blog or project
content changes.
