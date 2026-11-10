import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { resources } from "./site";
import { migrateFavorites } from "../resource-model.mjs";
const key = "leo-toolbox-favorites-v1";
const Favorites = createContext<{
  saved: Set<string>;
  toggle: (id: string) => void;
  merge: (ids: string[]) => void;
}>({ saved: new Set(), toggle: () => {}, merge: () => {} });
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    try {
      setSaved(
        migrateFavorites(
          JSON.parse(
            localStorage.getItem(key) ??
              localStorage.getItem("design-practice-saved") ??
              "[]",
          ),
          resources,
        ),
      );
    } catch {}
    const sync = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        try {
          setSaved(
            migrateFavorites(JSON.parse(event.newValue || "[]"), resources),
          );
        } catch {}
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function persist(next: Set<string>) {
    setSaved(next);
    try {
      localStorage.setItem(key, JSON.stringify([...next]));
      return true;
    } catch {
      toast.info(
        "Saved for this visit only. Export your favorites to keep a copy.",
      );
      return false;
    }
  }
  function toggle(id: string) {
    const next = new Set(saved),
      adding = !next.has(id);
    adding ? next.add(id) : next.delete(id);
    if (persist(next))
      toast.success(
        adding ? "Added to your favorites" : "Removed from favorites",
      );
  }
  function merge(ids: string[]) {
    const next = new Set([...saved, ...ids]);
    const added = next.size - saved.size;
    if (persist(next)) toast.success(`${added} new favorites imported`);
  }
  return (
    <Favorites.Provider value={{ saved, toggle, merge }}>
      {children}
    </Favorites.Provider>
  );
}
export const useFavorites = () => useContext(Favorites);
