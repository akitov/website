# Alexander Kitov — personal site

Plain HTML, CSS and a little JS. Posts and projects are Markdown files.
No framework and no dependencies to install. You only need Node 22+.

```bash
node scripts/serve.mjs     # preview: opens http://localhost:8000 (refresh to see edits)
node scripts/build.mjs     # build the site into _site/ (the deploy does this)
```

**Write:** make a folder `blog/my-post/` with one `.md` file and its images.
**Preview:** `node scripts/serve.mjs` opens the site in your browser. Go to `/blog/my-post/`.
**Publish:** push to `main`. GitHub Actions builds the site and deploys it.

Frontmatter: [`blog/README.md`](blog/README.md), [`projects/README.md`](projects/README.md).
How it works: [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Look and feel

- **Font:** all text is About Beige, a variable font in `assets/fonts/AboutBeige.woff2`. It is a commercial font by Krista Radoeva (abouttype.com), used under the site owner's license and not covered by the repo's other licenses.
- **Icons:** Phosphor's web fonts, trimmed to the icons in `scripts/vendor/phosphor/icons.json` by `scripts/subset-icons.py`. Write `{{icon:name}}` in `templates/layout.html` or `pages/*.html`. Steps to add one are in `ARCHITECTURE.md`.
- **Sizes:** they scale smoothly with the window using the `--t` token in `styles.css`. To change a size, change its 390px value. Don't add breakpoints.
- **Mobile menu:** `js/main.js` opens and closes it below 761px.

Details: [`ARCHITECTURE.md`](ARCHITECTURE.md), section 8.
