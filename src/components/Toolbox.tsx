import { useEffect, useMemo, useRef, useState } from "react";
import { resources, categories, host, blurb } from "@/lib/site";
import { useFavorites } from "@/lib/favorites";
import type { Resource } from "@/types";
import {
  filterResources,
  parseState,
  serializeState,
  importFavorites,
} from "../resource-model.mjs";
import { Intro } from "./Layout";

const counts = new Map(
  categories.map((c) => [c, resources.filter((r) => r.category === c).length]),
);
const typing = (target: EventTarget | null) =>
  target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

function Entry({ resource: r }: { resource: Resource }) {
  const { saved, toggle } = useFavorites();
  const on = saved.has(r.id);
  const note = blurb(r);
  return (
    <li className="entry">
      <a
        className="entry-link"
        id={r.id}
        data-entry={r.id}
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="entry-main">
          <span className="entry-title">{r.title}</span>
          {note ? <span className="entry-blurb">{note}</span> : null}
        </span>
        <span className="entry-domain">{host(r.url)}</span>
      </a>
      <button
        type="button"
        className="save"
        aria-pressed={on}
        aria-label={`${on ? "Remove" : "Save"} ${r.title}`}
        onClick={() => toggle(r.id)}
      >
        <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
          <path
            d="M2 1.75h10v12.5l-5-3.6-5 3.6z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </li>
  );
}

export default function Toolbox() {
  const { saved, notice, say, toggle, merge } = useFavorites();
  const [state, setState] = useState({ q: "", category: "all", saved: false });
  const [ready, setReady] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);

  // Filters live in the URL, so a filtered view can be shared or bookmarked.
  useEffect(() => {
    const { q, category, saved } = parseState(location.search, categories);
    setState({ q, category: category ?? "all", saved });
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const query = serializeState(state);
    history.replaceState(null, "", location.pathname + (query ? "?" + query : ""));
  }, [state, ready]);

  const results = useMemo(
    () => filterResources(resources, state, saved) as Resource[],
    [state, saved],
  );
  const groups = useMemo(
    () =>
      categories
        .map((c) => ({ name: c, items: results.filter((r) => r.category === c) }))
        .filter((g) => g.items.length),
    [results],
  );
  const filtered = state.q || state.saved || state.category !== "all";
  const reset = () => setState({ q: "", category: "all", saved: false });

  // Keyboard: / to filter, arrows or J K to move, S to save, Enter opens.
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const inField = typing(event.target);
      const active = document.activeElement as HTMLElement | null;
      const key = event.key;
      if (key === "/" && !inField) {
        event.preventDefault();
        search.current?.focus();
        search.current?.select();
        return;
      }
      const down = key === "ArrowDown" || (key === "j" && !inField);
      const up = key === "ArrowUp" || (key === "k" && !inField);
      if (down || up) {
        const entries = [
          ...document.querySelectorAll<HTMLElement>("[data-entry]"),
        ];
        if (inField && active !== search.current) return;
        const at = active ? entries.indexOf(active) : -1;
        event.preventDefault();
        if (up && at <= 0) search.current?.focus();
        else entries[down ? Math.min(at + 1, entries.length - 1) : at - 1]?.focus();
        return;
      }
      if (key === "s" && !inField && active?.dataset.entry) {
        event.preventDefault();
        toggle(active.dataset.entry);
        return;
      }
      if (key === "Enter" && active === search.current) {
        document.querySelector<HTMLElement>("[data-entry]")?.focus();
        return;
      }
      if (key === "Escape" && active === search.current) {
        if (state.q) setState((s) => ({ ...s, q: "" }));
        else search.current?.blur();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [toggle, state.q]);

  function exportSaved() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, favorites: [...saved] }, null, 2)],
      { type: "application/json" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "toolbox-saved-links.json";
    link.click();
    URL.revokeObjectURL(link.href);
    say(`Exported ${saved.size} saved ${saved.size === 1 ? "link" : "links"}`);
  }
  async function importSaved(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    try {
      const ids = importFavorites(JSON.parse(await chosen.text()), resources);
      if (ids.length) merge(ids);
      else say("That file has no links from this collection.");
    } catch {
      say("That file isn’t a Toolbox export. Choose a file exported from this page.");
    }
  }

  return (
    <>
      <Intro>
        <h1 className="statement">Toolbox</h1>
        <p className="statement">
          {resources.length} tools and references I’ve saved over the years.
          They belong to their makers. I only keep the list.
        </p>
        <div className="filter" role="search">
          <input
            ref={search}
            id="filter"
            type="search"
            value={state.q}
            onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
            placeholder={`Filter ${resources.length} links`}
            aria-label={`Filter ${resources.length} links`}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd aria-hidden="true">/</kbd>
        </div>
        <div className="cats" role="group" aria-label="Categories">
          <button
            type="button"
            aria-pressed={state.category === "all" && !state.saved}
            onClick={() => setState((s) => ({ ...s, category: "all", saved: false }))}
          >
            All<i>{resources.length}</i>
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={state.category === c}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  category: s.category === c ? "all" : c,
                }))
              }
            >
              {c}
              <i>{counts.get(c)}</i>
            </button>
          ))}
          <button
            type="button"
            aria-pressed={state.saved}
            onClick={() => setState((s) => ({ ...s, saved: !s.saved }))}
          >
            Saved<i>{saved.size}</i>
          </button>
        </div>
        <div className="status">
          <span aria-live="polite">
            {filtered
              ? `${results.length} ${results.length === 1 ? "link" : "links"}`
              : ""}
          </span>
          {filtered ? (
            <button type="button" className="link" onClick={reset}>
              Clear filters
            </button>
          ) : null}
          {state.saved ? (
            <>
              <button type="button" className="link" onClick={exportSaved} disabled={!saved.size}>
                Export
              </button>
              <button type="button" className="link" onClick={() => file.current?.click()}>
                Import
              </button>
              <input
                ref={file}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={importSaved}
                aria-label="Import saved links"
              />
            </>
          ) : null}
          <span role="status">{notice}</span>
          <span className="keys" aria-hidden="true">
            <kbd>↑</kbd> <kbd>↓</kbd> move, <kbd>S</kbd> save
          </span>
        </div>
      </Intro>
      {groups.map((g) => (
        <section className="row group" key={g.name}>
          <h2 className="label">
            {g.name}
            <span>{g.items.length}</span>
          </h2>
          <ul>
            {g.items.map((r) => (
              <Entry key={r.id} resource={r} />
            ))}
          </ul>
        </section>
      ))}
      {groups.length ? null : (
        <div className="row empty">
          <div className="rail-empty" />
          <p className="muted">
            {state.saved && !state.q && state.category === "all"
              ? "Nothing saved yet. Use the bookmark on any link, or press S while it’s highlighted."
              : "No links match these filters. Try a shorter search, or clear the filters."}
          </p>
        </div>
      )}
    </>
  );
}
