import { useEffect, useState, type ComponentType } from "react";
import { FavoritesProvider } from "@/lib/favorites";
import { ContentProvider, useContent, getPage, site, href } from "@/lib/site";
import { Layout } from "@/components/Layout";
import {
  Home,
  About,
  Work,
  ProjectPage,
  Journal,
  ArticlePage,
  Contact,
  NotFound,
} from "@/components/Pages";
import { Playground } from "@/components/Playground";
import { AlbumCovers } from "@/components/Albums";
import {
  AspectRatio,
  VariableType,
  MorphingButton,
} from "@/components/Experiments";
import Toolbox from "@/components/Toolbox";
import { Privacy, Terms } from "@/components/Legal";

function Site({ path }: { path: string }) {
  const content = useContent();
  const project = content.projects.find((p) => path === `/work/${p.slug}/`),
    article = content.articles.find((a) => path === `/journal/${a.slug}/`);
  // An entry published after the last build is found once live content loads.
  useEffect(() => {
    if (content.settled) document.title = getPage(path, content).title;
  }, [path, content]);
  let page;
  if (path === "/") page = <Home />;
  else if (path === "/about/") page = <About />;
  else if (path === "/work/") page = <Work />;
  else if (path === "/journal/") page = <Journal />;
  else if (path === "/playground/") page = <Playground />;
  else if (path === "/playground/album-covers/") page = <AlbumCovers />;
  else if (path === "/playground/aspect-ratio/") page = <AspectRatio />;
  else if (path === "/playground/variable-type/") page = <VariableType />;
  else if (path === "/playground/morphing-button/") page = <MorphingButton />;
  else if (path === "/toolbox/") page = <Toolbox />;
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
    <FavoritesProvider>
      <Layout path={path}>{page}</Layout>
    </FavoritesProvider>
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
