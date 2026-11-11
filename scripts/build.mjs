import { readFile, writeFile, mkdir, cp, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import {
  html as e,
  markdown,
  parseArticle,
  readingTime,
  validateContent,
} from "./lib.mjs";
import {
  fetchContent,
  sectionsToHtml,
  defaultAbout,
} from "../src/content-model.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (p) =>
  JSON.parse(await readFile(path.join(root, p), "utf8"));
const site = await read("content/site.json");
const origin = (
  process.env.SITE_ORIGIN ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : site.origin)
).replace(/\/$/, "");
const prefix = (process.env.BASE_PATH || "").replace(/\/$/, "");
const u = (p) => prefix + p,
  absolute = (p) => origin + u(p);
const allProjects = await Promise.all(
  (await readdir(path.join(root, "content/projects")))
    .filter((f) => f.endsWith(".json"))
    .map((f) => read("content/projects/" + f)),
);
const allArticles = await Promise.all(
  (await readdir(path.join(root, "content/journal")))
    .filter((f) => f.endsWith(".md"))
    .map(async (f) =>
      parseArticle(
        await readFile(path.join(root, "content/journal", f), "utf8"),
      ),
    ),
);
const allResources = await read("content/resources.json");
validateContent({ ...site, origin }, allProjects, allArticles, allResources);
// The files in /content are the starting content and the offline fallback.
const fromFiles = {
  resources: allResources.filter((r) => r.linkStatus !== "broken"),
  projects: allProjects
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order)
    .map(({ sections, closing, sources, ...p }) => ({
      ...p,
      html: sectionsToHtml({ sections, closing }),
    })),
  articles: allArticles
    .filter((a) => a.published)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ body, ...a }) => ({
      ...a,
      html: markdown(body, u),
      minutes: readingTime(body),
    })),
};
fromFiles.about = defaultAbout(site, fromFiles.projects);
// Once content has been imported in the admin, the database is the source.
let live = null;
if (site.backend?.url && !process.env.CONTENT_FROM_FILES) {
  try {
    live = await fetchContent(site.backend, { signal: AbortSignal.timeout(10000) });
  } catch (error) {
    console.warn(`Database not reachable (${error.message}); building from /content.`);
  }
}
const { resources, projects, articles } = live || fromFiles;
const about = { ...fromFiles.about, ...(live?.about || {}) };
console.log(`Content source: ${live ? "database" : "files in /content"}.`);
await mkdir(path.join(root, ".build"), { recursive: true });
await writeFile(
  path.join(root, ".build/content.json"),
  JSON.stringify({ site, resources, projects, articles, about }),
);
execFileSync(path.join(root, "node_modules/.bin/tsc"), ["--noEmit"], {
  cwd: root,
  stdio: "inherit",
});
await build({ root });
const manifest = JSON.parse(
    await readFile(path.join(root, "dist/.vite/manifest.json"), "utf8"),
  ),
  entry = manifest["index.html"];
await build({
  root,
  build: {
    ssr: "src/entry-server.tsx",
    outDir: ".build/server",
    emptyOutDir: true,
    manifest: false,
    rollupOptions: { output: { entryFileNames: "entry-server.mjs" } },
  },
});
const { render } = await import(
  path.join(root, ".build/server/entry-server.mjs")
);
const out = path.join(root, "dist");
await cp(path.join(root, "src/assets"), path.join(out, "assets"), {
  recursive: true,
});
await cp(
  path.join(root, "src/resource-model.mjs"),
  path.join(out, "resource-model.mjs"),
);
await writeFile(path.join(out, "resources.json"), JSON.stringify(resources));
await writeFile(path.join(out, ".nojekyll"), "");
const routes = [
  "/",
  "/about/",
  "/work/",
  "/journal/",
  "/toolbox/",
  "/contact/",
  "/privacy/",
  ...projects.map((p) => "/work/" + p.slug + "/"),
  ...articles.map((a) => "/journal/" + a.slug + "/"),
];
for (const route of [...routes, "/admin/", "/404.html"]) {
  const { html, meta } = render(route),
    canonical = absolute(route),
    image = absolute(meta.image || "/assets/portrait.jpg");
  const structured = {
    "@context": "https://schema.org",
    "@type": meta.type === "article" ? "Article" : "WebPage",
    name: meta.title,
    url: canonical,
    description: meta.description,
    author: { "@type": "Person", name: site.name, url: absolute("/") },
  };
  const document = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><noscript><style>.pending{visibility:visible!important}</style></noscript><meta name="theme-color" content="#fafafb"/><script>try{var t=localStorage.getItem("leo-appearance");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;if(t==="dark")document.querySelector('meta[name="theme-color"]').content="#131417"}catch(e){}</script><title>${e(meta.title)}</title><meta name="description" content="${e(meta.description)}"/><meta name="robots" content="${meta.noindex ? "noindex,follow" : "index,follow"}"/><link rel="canonical" href="${e(canonical)}"/><meta property="og:title" content="${e(meta.title)}"/><meta property="og:description" content="${e(meta.description)}"/><meta property="og:type" content="${meta.type || "website"}"/><meta property="og:url" content="${e(canonical)}"/><meta property="og:image" content="${e(image)}"/><meta name="twitter:card" content="summary_large_image"/><link rel="icon" type="image/svg+xml" href="${u("/assets/favicon.svg")}"/>${(entry.css || []).map((file) => `<link rel="stylesheet" href="${u("/" + file)}"/>`).join("")}<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, "\\u003c")}</script><script type="module" crossorigin src="${u("/" + entry.file)}"></script></head><body><div id="root">${html}</div></body></html>`;
  const file =
    route === "/"
      ? "index.html"
      : route === "/404.html"
        ? "404.html"
        : route.slice(1) + "index.html";
  await mkdir(path.dirname(path.join(out, file)), { recursive: true });
  await writeFile(path.join(out, file), document);
}
await writeFile(
  path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((p) => `<url><loc>${e(absolute(p))}</loc><lastmod>${site.updated}</lastmod></url>`).join("")}</urlset>`,
);
await writeFile(
  path.join(out, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${absolute("/sitemap.xml")}\n`,
);
await writeFile(
  path.join(out, "build-info.json"),
  JSON.stringify({
    name: site.name,
    projects: projects.length,
    articles: articles.length,
    resources: resources.length,
    categories: new Set(resources.map((r) => r.category)).size,
    pages: routes.length,
    origin,
    basePath: prefix,
  }),
);
console.log(
  `Built ${routes.length} pages: ${projects.length} project, ${articles.length} article, ${resources.length} resources.`,
);
