# Studio workspace redesign

The portfolio uses React, TypeScript, Vite, Tailwind CSS v4, and generated shadcn/ui components (Radix Nova). The visual language uses warm neutral surfaces, blue accents, Geist Variable served locally, and restrained motion. All primary pages and resource detail pages are rendered to static HTML before deployment; React hydrates them for interactions.

## shadcn MCP for Codex

The requested setup command was run:

```sh
pnpm dlx shadcn@latest mcp init --client codex
```

The configuration is included in `.codex/config.toml` and installed in this workspace's Codex user configuration:

```toml
[mcp_servers.shadcn]
command = "npx"
args = ["shadcn@latest", "mcp"]
```

Restart Codex to load the server as native chat tools. During this build, the server was used over its standard stdio protocol to list its tools, retrieve Command Dialog and Sheet examples, and run the audit checklist. `components.json` connects the source to the shadcn registry.

Add components with `pnpm exec shadcn add <component>`. Generated components live in `src/components/ui`; the portfolio layouts and composition live beside them in `src/components`.

## Main interactions

- Ctrl/Cmd + K opens global search; Escape closes it.
- On Toolbox, `/` focuses resource search.
- Radix Tabs, Select, Dropdown Menu, and Sheet provide keyboard-accessible filters, sorting, collection actions, and mobile navigation.
- Hearts preserve the existing `leo-toolbox-favorites-v1` storage format. JSON exports remain compatible with the previous portfolio.
- Appearance uses `leo-appearance` browser storage. No account or server is needed.
- Resource filters are reflected in the URL and respond to browser back/forward.

## Verification

`pnpm run check` builds the complete site and runs both data/route tests and DOM interaction tests against the actual React components. The DOM suite hydrates the actual prerendered Toolbox without mismatches, then exercises categories, search, favorites persistence, list view, appearance, and the command palette. DOM tests do not verify browser layout or replace visual QA.
