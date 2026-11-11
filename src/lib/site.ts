import raw from "../../.build/content.json";
import type { Resource, Project, Article } from "@/types";

export const site = raw.site;
export const resources = raw.resources as Resource[];
export const projects = raw.projects as Project[];
export const articles = raw.articles as Article[];
export const categories = [...new Set(resources.map((r) => r.category))].sort();
export const prefix = import.meta.env.BASE_URL.replace(/\/$/, "");
export const href = (path: string) => prefix + path;
export const asset = (name: string) => href("/assets/" + name);
export const prettyDate = (date: string) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
export const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/* Many saved links carry a description that only repeats the page title.
   Show a description only when it adds something. */
export function blurb(r: Resource) {
  const flat = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const text = r.description
    .replace(/\s*A saved reference for [^.]+\.\s*$/i, "")
    .trim();
  const a = flat(text),
    b = flat(r.title);
  return !a || a.startsWith(b) || b.startsWith(a) ? "" : text;
}

export function getPage(path: string) {
  const project = projects.find((p) => path === `/work/${p.slug}/`),
    article = articles.find((a) => path === `/journal/${a.slug}/`);
  if (project)
    return {
      title: `${project.title}: ${project.subtitle}`,
      description: project.description,
      image: "/assets/" + project.cover,
    };
  if (article)
    return {
      title: article.title,
      description: article.description,
      type: "article",
    };
  const pages: Record<string, { title: string; description: string }> = {
    "/": { title: `${site.name}, ${site.role.toLowerCase()}`, description: site.intro },
    "/about/": { title: `About | ${site.name}`, description: site.bio },
    "/work/": {
      title: `Work | ${site.name}`,
      description: `Products designed and built by ${site.name}.`,
    },
    "/journal/": {
      title: `Journal | ${site.name}`,
      description: "Notes on what I’m making and what I’m learning from it.",
    },
    "/toolbox/": {
      title: `Toolbox | ${site.name}`,
      description: `${resources.length} design and development links saved over the years, searchable and sorted by category.`,
    },
    "/privacy/": {
      title: `Privacy | ${site.name}`,
      description: "What this site stores in your browser, and what it doesn’t collect.",
    },
  };
  return (
    pages[path] || {
      title: `Page not found | ${site.name}`,
      description: `This page doesn’t exist on ${site.name}’s site.`,
      noindex: true,
    }
  );
}
