# Leo Battiste — Product designer

A responsive portfolio built with React, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui (Radix Nova). Every public page is rendered to static HTML and hydrated with React. Pheelm is the first featured project.

## Develop

Node.js 22 and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm dev
```

The initial build prepares structured content for the development server. After content changes, rebuild to refresh that content. CSS and React component changes update through Vite while developing.

## Build and test

```sh
pnpm run check
python3 scripts/check-built.py
```

The output is `dist/`, including all project, article, and resource URLs, metadata, RSS, sitemap, and 404 page. Vercel is configured to install with pnpm and serve `dist`.

## Content and source

- `content/site.json`: profile and optional contact details.
- `content/projects/*.json`: projects, with unpublished template support.
- `content/journal/*.md`: stories with draft control.
- `content/resources.json`: curated resources with stable IDs and link status.
- `src/components/ui`: generated shadcn components.
- `src/components`: site shell, page designs, and interactive Toolbox.
- `src/lib`: content helpers, styles, and favorites state.
- `scripts/build.mjs`: validation, React prerendering, feeds, and static output.
- `.codex/config.toml`: requested shadcn MCP configuration.

See [Design system and MCP](docs/DESIGN-SYSTEM.md), [Content guide](docs/CONTENT.md), and [Hosting guide](docs/LAUNCH.md).

Favorites and appearance stay in the visitor's browser. Fonts and imagery are served locally. No analytics, advertising scripts, or portfolio accounts are required.
