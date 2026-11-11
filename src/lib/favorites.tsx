import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { resources } from "./site";
import { migrateFavorites } from "../resource-model.mjs";

const key = "leo-toolbox-favorites-v1";
const Favorites = createContext<{
  saved: Set<string>;
  notice: string;
  say: (message: string) => void;
  toggle: (id: string) => void;
  merge: (ids: string[]) => void;
}>({
  saved: new Set(),
  notice: "",
  say: () => {},
  toggle: () => {},
  merge: () => {},
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [notice, say] = useState("");
  useEffect(() => {
    const read = (value: string | null) => {
      try {
        setSaved(migrateFavorites(JSON.parse(value || "[]"), resources));
      } catch {}
    };
    try {
      read(localStorage.getItem(key));
    } catch {}
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) read(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function persist(next: Set<string>, message: string) {
    setSaved(next);
    try {
      localStorage.setItem(key, JSON.stringify([...next]));
      say(message);
    } catch {
      say("Saved for this visit only. Export your saved links to keep a copy.");
    }
  }
  function toggle(id: string) {
    const next = new Set(saved),
      adding = !next.has(id);
    adding ? next.add(id) : next.delete(id);
    const title = resources.find((r) => r.id === id)?.title ?? "link";
    persist(next, adding ? `Saved ${title}` : `Removed ${title}`);
  }
  function merge(ids: string[]) {
    const next = new Set([...saved, ...ids]);
    const added = next.size - saved.size;
    persist(next, `Imported ${added} new ${added === 1 ? "link" : "links"}`);
  }
  return (
    <Favorites.Provider value={{ saved, notice, say, toggle, merge }}>
      {children}
    </Favorites.Provider>
  );
}
export const useFavorites = () => useContext(Favorites);
