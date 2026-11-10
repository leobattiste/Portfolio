import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowUp,
  House,
  UserRound,
  Layers3,
  NotebookPen,
  Shapes,
  Search,
  Command as CommandIcon,
  Menu,
  Sun,
  Moon,
  Code2 as Github,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { site, href, projects, articles, resources } from "@/lib/site";
const navigation = [
  { label: "Overview", path: "/", icon: House },
  { label: "About", path: "/about/", icon: UserRound },
  { label: "Work", path: "/work/", icon: Layers3 },
  { label: "Journal", path: "/journal/", icon: NotebookPen },
  { label: "Toolbox", path: "/toolbox/", icon: Shapes },
];
function Brand() {
  return (
    <a href={href("/")} className="brand-lockup">
      <span className="monogram">
        lb<span>.</span>
      </span>
      <span>
        <strong>Leo Battiste</strong>
        <small>Product designer</small>
      </span>
    </a>
  );
}
export function Shell({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState("");
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, []);
  const active =
    navigation.find((n) =>
      n.path === "/" ? path === "/" : path.startsWith(n.path),
    ) || navigation[0];
  const results = query.trim()
    ? resources
        .filter((r) =>
          `${r.title} ${r.category} ${r.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 8)
    : resources.filter((r) => r.featured).slice(0, 5);
  const go = (url: string) => {
    setOpen(false);
    window.location.assign(href(url));
  };
  const nav = (
    <nav aria-label="Main navigation">
      {navigation.map((n) => (
        <a
          key={n.path}
          className={`nav-link ${active.path === n.path ? "is-active" : ""}`}
          href={href(n.path)}
          aria-current={active.path === n.path ? "page" : undefined}
        >
          <n.icon size={17} />
          <span>{n.label}</span>
          {n.label === "Toolbox" ? (
            <span className="nav-count">{resources.length}</span>
          ) : null}
          {active.path === n.path ? <span className="nav-dot" /> : null}
        </a>
      ))}
    </nav>
  );
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="desktop-sidebar">
        <Brand />
        <div className="sidebar-label">THE PORTFOLIO</div>
        {nav}
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="little-star">✳</span>
            <p>
              A home for my work,
              <br />
              thoughts, and good finds.
            </p>
          </div>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-contact"
          >
            Find me on GitHub <ArrowUpRight size={14} />
          </a>
          <div className="sidebar-tools">
            <span>DESIGN & PRACTICE</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Switch color theme"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  <Sun className="dark:hidden" />
                  <Moon className="hidden dark:block" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Switch appearance</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
      <div className="site-stage">
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="breadcrumbs">
            <span>Portfolio</span>
            <span>/</span>
            <strong>{active.label}</strong>
          </div>
          <div className="topbar-actions">
            <Button
              variant="outline"
              className="search-launch"
              onClick={() => setOpen(true)}
            >
              <Search size={14} />
              <span>Quick search</span>
              <kbd>
                <CommandIcon size={11} /> K
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Switch color theme"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              <Sun className="dark:hidden" />
              <Moon className="hidden dark:block" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mobile-menu"
                  aria-label="Open navigation"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="mobile-sheet">
                <SheetHeader>
                  <SheetTitle>Leo Battiste</SheetTitle>
                  <SheetDescription>
                    Product designer. Work, thoughts, and good finds.
                  </SheetDescription>
                </SheetHeader>
                <div className="p-4">{nav}</div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="page-container">
          {children}
        </main>
        <footer className="site-footer">
          <div>
            <span className="footer-signature">
              Leo Battiste<span>↗</span>
            </span>
            <p>Thoughtfully made. Always evolving.</p>
          </div>
          <div className="footer-links">
            <a href={href("/privacy/")}>Privacy</a>
            <a href={href("/feed.xml")}>RSS</a>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Leo Battiste on GitHub"
            >
              <Github size={16} />
            </a>
            <Button variant="ghost" size="icon" asChild>
              <a href="#main" aria-label="Back to top">
                <ArrowUp size={16} />
              </a>
            </Button>
          </div>
          <span className="copyright">© 2026</span>
        </footer>
      </div>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Leo’s portfolio"
        description="Find pages, projects, writing, and resources."
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Where would you like to go?"
        />
        <CommandList>
          <CommandEmpty>No matches. Try a tool name or a topic.</CommandEmpty>
          <CommandGroup heading="Explore">
            {navigation.map((n) => (
              <CommandItem
                key={n.path}
                value={n.label}
                onSelect={() => go(n.path)}
              >
                <n.icon />
                <span>{n.label}</span>
                <ArrowRight className="ml-auto" />
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Work & writing">
            {projects.map((p) => (
              <CommandItem
                key={p.slug}
                onSelect={() => go("/work/" + p.slug + "/")}
              >
                <Layers3 />
                {p.title}
              </CommandItem>
            ))}
            {articles.map((a) => (
              <CommandItem
                key={a.slug}
                onSelect={() => go("/journal/" + a.slug + "/")}
              >
                <NotebookPen />
                {a.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="From the Toolbox">
            {results.map((r) => (
              <CommandItem
                key={r.id}
                value={`${r.title} ${query} ${r.category}`}
                onSelect={() => go("/toolbox/" + r.id + "/")}
              >
                <Shapes />
                <span>{r.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {r.category}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
