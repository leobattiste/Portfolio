# Publishing content

The site builds from structured files. There is no database, paid service, or runtime secret.

## Your profile

Edit `content/site.json` for your name, introduction, bio, email, Instagram URL, and optional location, availability, or résumé. Empty optional fields are hidden. Add a real résumé to `src/assets` and set `resume` to `/assets/your-resume.pdf` to show a download link. No résumé or employment history has been invented.

## Projects

Copy `content/projects/_template.json` to a new filename. Set a unique lowercase `slug`, title, description, order, and `published: true` when ready. Add a cover to `src/assets` with descriptive `coverAlt`. Add sections with unique IDs, titles, and body text. Only published projects appear in Work; every published project gets `/work/slug/`. Each section's `id` is shown as its label in the left rail, so keep it to one plain word.

Pheelm is the first published project. Its copy is based on Leo's confirmed ownership, the public product, and the repository. Add research, iterations, screenshots, and verified outcomes as they become available. The `sources` field is editorial provenance and is not rendered.

## Journal

Create `content/journal/your-story.md`. Start with JSON metadata between `---` lines, followed by Markdown. See `art-of-simplicity.md` for a published example. Required metadata: slug, title, description, topic, date (YYYY-MM-DD), published.

Supported Markdown: paragraphs, `##` headings, `###` headings, lists starting with `-`, blockquotes starting with `>`, links, bold text, and inline code. Raw HTML is escaped. Drafts (`published: false`) are omitted from the website and sitemap. They remain visible in this public GitHub repository: keep confidential drafts outside it.

## Check and publish

1. Edit content or assets.
2. Run `pnpm run check` and `python3 scripts/check-built.py`.
3. Push to a branch and open a pull request. GitHub Actions checks all pages and uploads a downloadable preview artifact.
4. Merge to `main`. When Pages is enabled, checks and deployment run automatically.

For a preview artifact, download and extract it, then run `python3 -m http.server 8000` in the extracted folder and open localhost:8000. This is a local preview, not a hosted PR deployment.

The ChatGPT Site is a separate private publication. Update it through the Sites workflow using the same source commit and a freshly built archive.

The redesigned build installs dependencies first (`pnpm install --frozen-lockfile`), validates content, compiles TypeScript, builds Vite assets, then renders React to every static route. Generated content and server bundles stay in ignored `.build/`.
