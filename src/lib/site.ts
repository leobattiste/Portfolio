import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import raw from "../../.build/content.json";
import type { Project, Article, About, Content } from "@/types";
import { fetchContent } from "../content-model.mjs";

export const site = raw.site;
export const backend = site.backend as { url: string; key: string };
// The content the site was built with. Live content replaces it once loaded.
export const initial: Content = {
  projects: raw.projects as Project[],
  articles: raw.articles as Article[],
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
      .then(
        (live: (Omit<Content, "about"> & { about: About | null }) | null) => {
          if (active && live)
            setContent({
              ...live,
              about: { ...initial.about, ...(live.about || {}) },
            });
        },
      )
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
export function getPage(path: string, content: Content = initial) {
  const project = content.projects.find((p) => path === `/work/${p.slug}/`),
    article = content.articles.find((a) => path === `/journal/${a.slug}/`);
  if (project)
    return {
      title: `${project.title}: ${project.subtitle}`,
      description: project.description,
      image: /^https?:/.test(project.cover)
        ? undefined
        : "/assets/" + project.cover,
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
    "/": {
      title: `${site.name}, ${site.role.toLowerCase()}`,
      description: site.intro,
    },
    "/about/": { title: `About | ${site.name}`, description: site.bio },
    "/work/": {
      title: `Work | ${site.name}`,
      description: `Products designed and built by ${site.name}.`,
    },
    "/journal/": {
      title: `Journal | ${site.name}`,
      description: "Notes on what I’m making and what I’m learning from it.",
    },
    "/playground/": {
      title: `Playground | ${site.name}`,
      description:
        "Small experiments, loose ideas, and things made just to see what happens.",
    },
    "/playground/aspect-ratio/": {
      title: `Aspect ratio | ${site.name}`,
      description:
        "Six film aspect ratios, from 4:3 to Ultra Panavision, with a movie and a fun fact for each. Drag to see what each one leaves out.",
    },
    "/contact/": {
      title: `Contact | ${site.name}`,
      description: `Send ${site.name} a message, or find the email and Instagram.`,
    },
    "/privacy/": {
      title: `Privacy | ${site.name}`,
      description:
        "How this portfolio handles messages, visits, and browser preferences.",
    },
    "/terms/": {
      title: `Terms | ${site.name}`,
      description:
        "Terms for using this portfolio and its writing.",
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
