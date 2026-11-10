# Leo Battiste — Product designer

A complete static portfolio with About, Work, Journal, Contact, and a searchable Toolbox. Pheelm is the first published project, covering naming, identity, product design, and development.

## Build and check

Requires Node.js 22+. No dependency installation is needed.

```sh
npm run check
python3 scripts/check-built.py
python3 -m http.server 8000 --directory dist
```

## Content

- `content/site.json`: profile and contact settings.
- `content/projects/*.json`: project pages; unpublished templates stay hidden.
- `content/journal/*.md`: Markdown stories with JSON frontmatter and draft control.
- `content/resources.json`: curated resources with stable IDs and link status.
- `src/`: design system, progressive enhancement, search, filters, local favorites, import/export, and local assets.
- `scripts/build.mjs`: static generator, metadata, RSS, sitemap, and resource permalinks.
- `tests/`: behavior and generated-site checks.

See [Content guide](docs/CONTENT.md) for editing and [Launch guide](docs/LAUNCH.md) for deployment and remaining personal details.

## Deploy

`dist/` works on static hosts. GitHub Actions builds and tests pushes and PRs, then uploads downloadable preview artifacts. Automatic GitHub Pages publishing is available through the `PAGES_ENABLED` repository variable. GitHub Pages builds support `/Portfolio-` as a base path. The private ChatGPT Site is published separately and its hosting manifest lives in `.openai/hosting.json`.

Favorites stay in each visitor's browser. Export/import transfers them without accounts. Fonts and imagery are served locally; no analytics or advertising scripts are loaded.
