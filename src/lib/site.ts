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
export function getPage(path: string) {
  const project = projects.find((p) => path === `/work/${p.slug}/`),
    article = articles.find((a) => path === `/journal/${a.slug}/`),
    resource = resources.find((r) => path === `/toolbox/${r.id}/`);
  if (project)
    return {
      title: project.title + " — " + project.subtitle,
      description: project.description,
      image: "/assets/" + project.cover,
    };
  if (article)
    return {
      title: article.title,
      description: article.description,
      type: "article",
    };
  if (resource)
    return { title: resource.title, description: resource.description };
  const pages: Record<string, { title: string; description: string }> = {
    "/": { title: site.name + " — Product designer", description: site.intro },
    "/about/": { title: "About — " + site.name, description: site.bio },
    "/work/": {
      title: "Selected work — " + site.name,
      description:
        "Brand and product design by Leo Battiste. Explore Pheelm and the ideas behind the experience.",
    },
    "/journal/": {
      title: "Journal — " + site.name,
      description:
        "Notes on design, useful resources, and things worth sharing.",
    },
    "/toolbox/": {
      title: "Toolbox — " + site.name,
      description: `${resources.length} useful tools and resources, collected over the years and organized for your next project.`,
    },
    "/contact/": {
      title: "Contact — " + site.name,
      description: "Connect with Leo Battiste about brand and product design.",
    },
    "/privacy/": {
      title: "Privacy — " + site.name,
      description:
        "How this portfolio handles your saved resources and browser storage.",
    },
  };
  return (
    pages[path] || {
      title: "Page not found — " + site.name,
      description: "Find your way back to Leo Battiste’s portfolio.",
      noindex: true,
    }
  );
}
