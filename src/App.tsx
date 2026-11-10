import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { FavoritesProvider } from "@/lib/favorites";
import { projects, articles, resources } from "@/lib/site";
import { Shell } from "@/components/Shell";
import {
  Home,
  About,
  Work,
  ProjectPage,
  Journal,
  ArticlePage,
  ResourcePage,
  Contact,
  Privacy,
  NotFound,
} from "@/components/Pages";
import Toolbox from "@/components/Toolbox";
export function App({ path }: { path: string }) {
  const project = projects.find((p) => path === `/work/${p.slug}/`),
    article = articles.find((a) => path === `/journal/${a.slug}/`),
    resource = resources.find((r) => path === `/toolbox/${r.id}/`);
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
  else if (resource) page = <ResourcePage resource={resource} />;
  else page = <NotFound />;
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="leo-appearance"
    >
      <TooltipProvider>
        <FavoritesProvider>
          <Shell path={path}>{page}</Shell>
          <Toaster position="bottom-right" richColors closeButton />
        </FavoritesProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
