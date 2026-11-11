import { FavoritesProvider } from "@/lib/favorites";
import { projects, articles } from "@/lib/site";
import { Layout } from "@/components/Layout";
import {
  Home,
  About,
  Work,
  ProjectPage,
  Journal,
  ArticlePage,
  Contact,
  Privacy,
  NotFound,
} from "@/components/Pages";
import Toolbox from "@/components/Toolbox";

export function App({ path }: { path: string }) {
  const project = projects.find((p) => path === `/work/${p.slug}/`),
    article = articles.find((a) => path === `/journal/${a.slug}/`);
  let page;
  if (path === "/") page = <Home />;
  else if (path === "/about/") page = <About />;
  else if (path === "/work/") page = <Work />;
  else if (path === "/journal/") page = <Journal />;
  else if (path === "/toolbox/") page = <Toolbox />;
  else if (path === "/contact/") page = <Contact />;
  else if (path === "/privacy/") page = <Privacy />;
  else if (project) page = <ProjectPage project={project} />;
  else if (article) page = <ArticlePage article={article} />;
  else page = <NotFound />;
  return (
    <FavoritesProvider>
      <Layout path={path}>{page}</Layout>
    </FavoritesProvider>
  );
}
