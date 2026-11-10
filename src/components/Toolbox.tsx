import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ArrowDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  LayoutGrid,
  List,
  Heart,
  SlidersHorizontal,
  RotateCcw,
  Shapes,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeading, ResourceCard } from "./Cards";
import { categories, resources } from "@/lib/site";
import { useFavorites } from "@/lib/favorites";
import type { Resource } from "@/types";
import {
  filterResources,
  parseState,
  serializeState,
  importFavorites,
  PAGE_SIZE,
} from "../resource-model.mjs";
const initial = {
  q: "",
  category: "all",
  sort: "curated",
  saved: false,
  featured: false,
};
export default function Toolbox() {
  const [state, setState] = useState(initial),
    [limit, setLimit] = useState(PAGE_SIZE),
    [view, setView] = useState("grid"),
    [ready, setReady] = useState(false);
  const { saved, merge } = useFavorites();
  const input = useRef<HTMLInputElement>(null),
    file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setState(parseState(location.search, categories) as typeof initial);
    setReady(true);
    const pop = () => {
      setState(parseState(location.search, categories) as typeof initial);
      setLimit(PAGE_SIZE);
    };
    const key = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target as HTMLElement).closest(
          "input,textarea,[contenteditable],select",
        )
      ) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("popstate", pop);
    document.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("popstate", pop);
      document.removeEventListener("keydown", key);
    };
  }, []);
  useEffect(() => {
    if (ready) {
      const query = serializeState(state);
      history.replaceState(
        null,
        "",
        location.pathname + (query ? "?" + query : "") + location.hash,
      );
    }
  }, [state, ready]);
  const results = useMemo<Resource[]>(
    () => filterResources(resources, state, saved),
    [state, saved],
  );
  const update = (patch: Partial<typeof initial>) => {
    setState((s) => ({ ...s, ...patch }));
    setLimit(PAGE_SIZE);
  };
  function exportSaved() {
    if (!saved.size) {
      toast.info("Save a resource first to export your favorites.");
      return;
    }
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            collection: "Leo Battiste — Toolbox",
            favorites: resources
              .filter((r) => saved.has(r.id))
              .map((r) => ({ id: r.id, title: r.title, url: r.url })),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "leo-toolbox-favorites.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Favorites exported");
  }
  async function importSaved(event: React.ChangeEvent<HTMLInputElement>) {
    const f = event.target.files?.[0];
    if (!f) return;
    try {
      if (f.size > 1024 * 1024)
        throw new Error("Please choose a file smaller than 1 MB.");
      const ids = importFavorites(JSON.parse(await f.text()), resources);
      if (!ids.length) toast.info("No matching resources in that export.");
      else merge(ids);
    } catch (error) {
      toast.error(
        error instanceof SyntaxError
          ? "That file is not valid JSON."
          : (error as Error).message,
      );
    } finally {
      event.target.value = "";
    }
  }
  const mode = state.saved ? "saved" : state.featured ? "highlights" : "all";
  return (
    <>
      <PageHeading
        eyebrow="THE TOOLBOX"
        title="Good finds. No gatekeeping."
        description="A collection of tools, inspiration, and resources I’ve saved over the years. Find something useful. Make something great."
      >
        <div className="collection-summary">
          <span className="summary-dot" />
          {resources.length} resources<span>/</span>
          {categories.length} categories<span>/</span>Always growing
        </div>
      </PageHeading>
      <section className="toolbox-surface">
        <div className="toolbox-toolbar">
          <Tabs
            value={mode}
            onValueChange={(v) =>
              update({ saved: v === "saved", featured: v === "highlights" })
            }
          >
            <TabsList>
              <TabsTrigger value="all">All resources</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
              <TabsTrigger value="saved">
                <Heart size={13} />
                Saved{saved.size ? " " + saved.size : ""}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Your collection
                <SlidersHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={exportSaved}>
                <ArrowDownToLine />
                Export favorites
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => file.current?.click()}>
                <ArrowUpFromLine />
                Import favorites
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={file}
            type="file"
            accept=".json,application/json"
            hidden
            aria-label="Import favorites"
            onChange={importSaved}
          />
        </div>
        <div className="toolbox-search-row">
          <div className="toolbox-search">
            <Search size={17} />
            <Input
              ref={input}
              id="resource-search"
              aria-label="Search resources"
              placeholder="Find your next favorite resource…"
              value={state.q}
              onChange={(e) => update({ q: e.target.value })}
            />
            <kbd>/</kbd>
          </div>
          <Select value={state.sort} onValueChange={(sort) => update({ sort })}>
            <SelectTrigger aria-label="Sort resources" className="sort-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="curated">Curated order</SelectItem>
              <SelectItem value="az">Name: A–Z</SelectItem>
              <SelectItem value="za">Name: Z–A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="category-pills" aria-label="Filter by category">
          {["all", ...categories].map((c) => (
            <button
              key={c}
              className={state.category === c ? "selected" : ""}
              onClick={() => update({ category: c })}
              aria-pressed={state.category === c}
            >
              {c === "all" ? "All categories" : c}
              <span>
                {c === "all"
                  ? resources.length
                  : resources.filter((r) => r.category === c).length}
              </span>
            </button>
          ))}
        </div>
        <div className="results-toolbar">
          <p role="status" aria-live="polite">
            Showing {Math.min(limit, results.length)} of {results.length}{" "}
            resources{state.category !== "all" ? ` in ${state.category}` : ""}
          </p>
          <div className="view-toggles">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid size={14} />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={15} />
            </Button>
          </div>
        </div>
        {results.length ? (
          <div
            className={`resource-grid ${view === "list" ? "list-view" : ""}`}
          >
            {results.slice(0, limit).map((r) => (
              <ResourceCard key={r.id} resource={r} list={view === "list"} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Shapes size={30} />
            <h2>
              {state.saved && !saved.size
                ? "Your next favorite is out there."
                : "No finds this time."}
            </h2>
            <p>
              {state.saved && !saved.size
                ? "Tap the heart on a resource to keep it in your collection."
                : "Try another search or clear your filters."}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setState(initial);
                input.current?.focus();
              }}
            >
              <RotateCcw size={14} />
              Reset filters
            </Button>
          </div>
        )}
        {results.length > limit ? (
          <div className="load-more">
            <Button
              variant="outline"
              onClick={() => setLimit((n) => n + PAGE_SIZE)}
            >
              More good finds
              <ArrowDown size={14} />
            </Button>
          </div>
        ) : null}
        <div className="toolbox-bottom-note">
          <Heart size={14} />
          <p>
            Your favorites stay in this browser. Export them to take them with
            you.
          </p>
        </div>
        <noscript>
          <p>
            Search and favorites need JavaScript. Individual resource pages
            remain available in the sitemap.
          </p>
        </noscript>
      </section>
      <div className="collection-disclaimer">
        Collected, not sponsored. Tools belong to their makers. Details and
        availability can change.
      </div>
    </>
  );
}
