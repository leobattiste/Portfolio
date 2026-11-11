import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import raw from "../../.build/content.json";
import type { Resource, Project, Article, About, Content } from "@/types";
import { fetchContent } from "../content-model.mjs";

export const site = raw.site;
export const backend = site.backend as { url: string; key: string };
// The content the site was built with. Live content replaces it once loaded.
export const initial: Content = {
  projects: raw.projects as Project[],
  articles: raw.articles as Article[],
  resources: raw.resources as Resource[],
  about: raw.about as About,
};

const ContentContext = createContext<Content & { settled: boolean }>({
  ...initial,
  settled: false,
});
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState(initial);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let active = true;
    fetchContent(backend)
      .then((live: (Omit<Content, "about"> & { about: About | null }) | null) => {
        if (active && live)
          setContent({ ...live, about: { ...initial.about, ...(live.about || {}) } });
      })
      .catch(() => {})
      .finally(() => active && setSettled(true));
    return () => {
      active = false;
    };
  }, []);
  return createElement(
    ContentContext.Provider,
    { value: { ...content, settled } },
    children,
  );
}
export const useContent = () => useContext(ContentContext);

export const prefix = import.meta.env.BASE_URL.replace(/\/$/, "");
export const href = (path: string) => prefix + path;
export const asset = (name: string) => href("/assets/" + name);
// Images are either files shipped with the site or uploads with a full address.
export const media = (source: string) =>
  /^https?:\/\//.test(source) ? source : asset(source);
export const prettyDate = (date: string) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
export const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
export const categoriesOf = (resources: Resource[]) =>
  [...new Set(resources.map((r) => r.category))].sort();

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

export function getPage(path: string, content: Content = initial) {
  const project = content.projects.find((p) => path === `/work/${p.slug}/`),
    article = content.articles.find((a) => path === `/journal/${a.slug}/`);
  if (project)
    return {
      title: `${project.title}: ${project.subtitle}`,
      description: project.description,
      image: /^https?:/.test(project.cover) ? undefined : "/assets/" + project.cover,
    };
  if (article)
    return {
      title: article.title,
      description: article.description,
      type: "article",
    };
  const pages: Record<
    string,
    { title: string; description: string; noindex?: boolean }
  > = {
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
      description: `${content.resources.length} design and development links saved over the years, searchable and sorted by category.`,
    },
    "/contact/": {
      title: `Contact | ${site.name}`,
      description: `Send ${site.name} a message, or find the email and Instagram.`,
    },
    "/privacy/": {
      title: `Privacy | ${site.name}`,
      description: "What this site stores in your browser, and what it counts.",
    },
    "/admin/": {
      title: `Admin | ${site.name}`,
      description: "Sign in to manage this site.",
      noindex: true,
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
