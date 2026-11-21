# Alexander Kitov — personal site

Plain HTML, CSS and a little JS. Posts and projects are Markdown files.
No framework and no dependencies to install. You only need Node 22+.

```bash
node scripts/serve.mjs     # preview at http://localhost:8000 (refresh to see edits)
node scripts/build.mjs     # build the site into _site/ (the deploy does this)
```

**Write:** make a folder `blog/my-post/` with one `.md` file and its images.
**Preview:** `node scripts/serve.mjs` → http://localhost:8000/blog/my-post/
**Publish:** push to `main`. GitHub Actions builds the site and deploys it.

Frontmatter: [`blog/README.md`](blog/README.md), [`projects/README.md`](projects/README.md).
How it works: [`ARCHITECTURE.md`](ARCHITECTURE.md).
