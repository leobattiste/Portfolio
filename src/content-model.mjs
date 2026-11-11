// One shape for content, whether it comes from the database or the files in /content.
// Used by the build script (Node), the public site, and the admin.

const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
const text = (html) => String(html || "").replace(/<[^>]+>/g, " ");
export const minutes = (html) =>
  Math.max(1, Math.ceil(text(html).split(/\s+/).filter(Boolean).length / 200));
export const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

export const toProject = (r) => ({
  slug: r.slug,
  title: r.title,
  subtitle: r.subtitle,
  description: r.description,
  published: r.published,
  cover: r.cover,
  coverAlt: r.cover_alt,
  disciplines: r.disciplines || [],
  role: r.role,
  platform: r.platform,
  status: r.status,
  liveUrl: r.live_url,
  sourceUrl: r.source_url,
  html: r.content,
  order: r.sort,
});
export const fromProject = (p) => ({
  slug: p.slug,
  title: p.title,
  subtitle: p.subtitle,
  description: p.description,
  published: p.published,
  cover: p.cover,
  cover_alt: p.coverAlt,
  disciplines: p.disciplines,
  role: p.role,
  platform: p.platform,
  status: p.status,
  live_url: p.liveUrl,
  source_url: p.sourceUrl,
  content: p.html,
  sort: p.order ?? 0,
});
export const toArticle = (r) => ({
  slug: r.slug,
  title: r.title,
  description: r.description,
  topic: r.topic,
  date: r.date,
  published: r.published,
  html: r.content,
  minutes: minutes(r.content),
});
export const fromArticle = (a) => ({
  slug: a.slug,
  title: a.title,
  description: a.description,
  topic: a.topic,
  date: a.date,
  published: a.published,
  content: a.html,
});
export const toResource = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  url: r.url,
  domain: host(r.url),
  category: r.category,
  tags: [],
  featured: r.featured,
  order: r.sort,
  linkStatus: "available",
});
export const fromResource = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  url: r.url,
  category: r.category,
  featured: r.featured,
  sort: r.order ?? 0,
});

// A project file lists sections; the site and the editor work with one HTML body.
export const sectionsToHtml = (project) =>
  [
    ...(project.sections || []).map(
      (s) => `<h2>${escape(s.title)}</h2><p>${escape(s.body)}</p>`,
    ),
    project.closing ? `<p>${escape(project.closing)}</p>` : "",
  ].join("");

export const defaultAbout = (site, projects) => ({
  statement:
    "I work across brand and product, so how something looks and how it works come from the same place.",
  html: [
    `<p>I’m ${escape(site.name)}, a ${escape(site.role.toLowerCase())}${site.location ? ` based in ${escape(site.location)}` : ""}. I like owning a product from the first idea to the shipped code, because the decisions that matter most tend to fall between disciplines.</p>`,
    projects[0]
      ? `<p>${escape(projects[0].title)} is the clearest example. It started as a name, became a logo and an identity, and then a product I designed and built myself.</p>`
      : "",
    "<p>I’m also a collector. The toolbox holds the tools and references I’ve saved over the years, shared in case they’re useful to you too.</p>",
  ].join(""),
  portrait: "portrait.jpg",
  disciplines: [...new Set(projects.flatMap((p) => p.disciplines || []))],
});

// Reads published content from the database. Returns null until the admin has
// imported content, so the site keeps showing the content it was built with.
export async function fetchContent({ url, key }, { signal } = {}) {
  const get = async (query) => {
    const response = await fetch(`${url}/rest/v1/${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal,
    });
    if (!response.ok) throw new Error(`${query}: ${response.status}`);
    return response.json();
  };
  const stored = Object.fromEntries(
    (await get("site_content?select=key,value")).map((row) => [row.key, row.value]),
  );
  if (!stored.seeded) return null;
  const [projects, articles, resources] = await Promise.all([
    get("projects?select=*&published=eq.true&order=sort.asc,created_at.asc"),
    get("articles?select=*&published=eq.true&order=date.desc,created_at.desc"),
    get("resources?select=*&order=sort.asc,created_at.asc&limit=2000"),
  ]);
  return {
    projects: projects.map(toProject),
    articles: articles.map(toArticle),
    resources: resources.map(toResource),
    about: stored.about || null,
  };
}
