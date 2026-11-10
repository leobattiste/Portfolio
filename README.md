# Design & practice

A minimal, responsive product design portfolio with About, Work, Journal, and Toolbox sections.

## Run locally

No build or dependencies required. Serve `dist` with any static web server:

```sh
python3 -m http.server 8000 --directory dist
```

## Edit

- `dist/index.html`: portfolio copy and layout, concept project previews, portrait, contact link.
- `dist/style.css`: responsive design and reduced-motion support.
- `dist/app.js`: searchable collection, category filters, local favorites, article and project dialogs.
- `dist/bookmarks.json`: 520 unique HTTP(S) bookmarks imported from the supplied export. Original categories and folder paths are preserved. Export icon data and non-web bookmark URLs are excluded.
- `dist/assets/portrait.jpg`: supplied portrait.

Work concepts and Journal essays are clearly labeled samples. Replace them with actual projects and writing before presenting the site as a professional record. The contact button uses the verified GitHub profile; update it to your preferred contact method.

Favorites are stored in the visitor's browser. Google Fonts is optional; system fonts provide fallback. External resources open in a new tab.

## Hosting

The `dist` directory is ready for static hosting, including GitHub Pages. `.openai/hosting.json` connects this checkout to its private ChatGPT Site. Publication of the Site is managed separately from GitHub; pushing to GitHub does not automatically update the ChatGPT Site.
