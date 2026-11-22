import { useEffect, useState, type ComponentType } from "react";
import { ContentProvider, useContent, getPage, site, href, studioPath } from "@/lib/site";
import { Layout } from "@/components/Layout";
import {
  Home,
  About,
  ProjectPage,
  Journal,
  ArticlePage,
  Contact,
  NotFound,
} from "@/components/Pages";
import { Studio } from "@/components/Studio";
import {
  AspectRatio,
} from "@/components/Experiments";
import { Privacy, Terms } from "@/components/Legal";

function Site({ path: requestedPath }: { path: string }) {
  const path = studioPath(requestedPath);
  useEffect(() => {
    if (requestedPath !== path)
      window.location.replace(href(path) + window.location.search + window.location.hash);
  }, [requestedPath, path]);
  const content = useContent();
  const project = content.projects.find((p) => path === `/studio/${p.slug}/`),
    article = content.articles.find((a) => path === `/journal/${a.slug}/`);
  // An entry published after the last build is found once live content loads.
  useEffect(() => {
    if (content.settled) document.title = getPage(path, content).title;
  }, [path, content]);
  let page;
  if (path === "/") page = <Home />;
  else if (path === "/about/") page = <About />;
  else if (path === "/studio/") page = <Studio />;
  else if (path === "/journal/") page = <Journal />;
  else if (path === "/studio/aspect-ratio/") page = <AspectRatio />;
  else if (path === "/contact/") page = <Contact />;
  else if (path === "/privacy/") page = <Privacy />;
  else if (path === "/terms/") page = <Terms />;
  else if (project) page = <ProjectPage project={project} />;
  else if (article) page = <ArticlePage article={article} />;
  else
    page = (
      <div className={content.settled ? undefined : "pending"}>
        <NotFound />
      </div>
    );
  return (
    <Layout path={path}>{page}</Layout>
  );
}

/* The admin is a separate bundle, loaded only on /admin/. */
function Admin() {
  const [Loaded, setLoaded] = useState<ComponentType | null>(null);
  useEffect(() => {
    import("./admin/Admin").then((module) => setLoaded(() => module.default));
  }, []);
  if (Loaded) return <Loaded />;
  return (
    <div className="page">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header row">
        <a className="site-name" href={href("/")}>
          {site.name}
        </a>
      </header>
      <main id="main" className="row intro">
        <div className="rail-empty" />
        <h1 className="statement">Admin</h1>
      </main>
    </div>
  );
}

export function App({ path }: { path: string }) {
  if (path === "/admin/") return <Admin />;
  return (
    <ContentProvider>
      <Site path={path} />
    </ContentProvider>
  );
}
