# Launch and hosting

## Current outputs

- Private ChatGPT Site: https://design-notes-studio-portfolio.beaminggoat2.chatgpt.site
- Source: https://github.com/leobattiste/Portfolio-
- Optional automatic public hosting: GitHub Pages at https://leobattiste.github.io/Portfolio-/

The GitHub Actions workflow always builds, tests, and uploads a preview artifact. Public Pages deployment runs only when the repository variable `PAGES_ENABLED` is `true` and Pages is configured to use GitHub Actions. The private ChatGPT Site's audience is independent and stays private.

## Enable public GitHub Pages

In repository Settings → Pages, choose GitHub Actions as the build source. In Settings → Secrets and variables → Actions → Variables, add `PAGES_ENABLED` with value `true`. Run the Portfolio checks and publishing workflow, or push to main. No deployment tokens are needed: GitHub's scoped Actions token and OIDC handle it.

## Domain

No domain was provided or purchased. To connect one, add it in the hosting provider's domain settings and configure its DNS. Update `SITE_ORIGIN` to the exact HTTPS origin and `BASE_PATH` to an empty string for a root domain. Update `content/site.json`'s origin for private-site builds if its URL changes. GitHub Pages custom domains also need a `CNAME` file in the build output; add that only after selecting and configuring the real domain. Do not use Pheelm.com for the portfolio: it hosts the project itself.

## Before promoting the portfolio

- Review the published bio and Journal introduction.
- Add an email or professional contact URL if GitHub is not your preferred contact.
- Add a real résumé if you want a download link.
- Expand Pheelm's process story with your own research, iterations, and results.
- Review the unverified Toolbox links when useful.

## Verification

`npm run check` tests search, URL state, sorting, favorite export/import compatibility, collection rules, draft exclusion, metadata, unique headings and IDs, image alt attributes, and internal route/asset resolution across the entire generated site. `python3 scripts/check-built.py` parses HTML and validates XML feeds. A second build using `/Portfolio-` verifies subdirectory hosting.

Browser QA requires the managed preview/browser tools. If those are unavailable, desktop/mobile visual checks and screen-reader behavior remain unverified; static validation is not a substitute.
