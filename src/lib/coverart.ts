/*
 * Real sleeves from the Cover Art Archive.
 *
 * The archive is keyed by MusicBrainz release-group IDs, so we ask
 * MusicBrainz for each album's ID once (two requests for the whole
 * collection, a second apart, as its rate limit asks) and keep the
 * answers in local storage. Until an image has loaded, and whenever one
 * is missing, the bundled cover is shown instead.
 */
import { useEffect, useState } from "react";

type Album = { id: string; title: string; artist: string };
type Group = {
  id: string;
  score?: number;
  title: string;
  "primary-type"?: string;
  "secondary-types"?: string[];
  "artist-credit"?: { name: string }[];
};

const KEY = "leo-coverart-v1";
const MONTH = 30 * 24 * 60 * 60 * 1000;

export const coverArt = (mbid: string, size: 250 | 500 | 1200) =>
  `https://coverartarchive.org/release-group/${mbid}/front-${size}`;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/* The best MusicBrainz match for one album: same title and artist, an
   original studio album rather than a live record or compilation. */
export function pick(album: Album, groups: Group[]) {
  const title = norm(album.title);
  const artist = norm(album.artist);
  const matches = groups.filter(
    (g) =>
      norm(g.title) === title &&
      norm((g["artist-credit"] ?? []).map((c) => c.name).join(" ")).includes(artist) &&
      (g["primary-type"] ?? "").toLowerCase() === "album",
  );
  matches.sort(
    (a, b) =>
      (a["secondary-types"]?.length ?? 0) - (b["secondary-types"]?.length ?? 0) ||
      (b.score ?? 0) - (a.score ?? 0),
  );
  return matches[0]?.id ?? "";
}

function read(): { at: number; ids: Record<string, string> } | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return saved && Date.now() - saved.at < MONTH ? saved : null;
  } catch {
    return null;
  }
}

async function lookup(albums: Album[]) {
  const ids: Record<string, string> = {};
  for (let i = 0; i < albums.length; i += 10) {
    if (i) await new Promise((r) => setTimeout(r, 1100));
    const batch = albums.slice(i, i + 10);
    const clause = batch
      .map((a) => `(releasegroup:"${a.title.replace(/"/g, "")}" AND artist:"${a.artist}")`)
      .join(" OR ");
    const url =
      "https://musicbrainz.org/ws/2/release-group/?fmt=json&limit=100&query=" +
      encodeURIComponent(`primarytype:album AND (${clause})`);
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`MusicBrainz ${response.status}`);
    const { "release-groups": groups = [] } = (await response.json()) as {
      "release-groups"?: Group[];
    };
    for (const a of batch) ids[a.id] = pick(a, groups);
  }
  return ids;
}

/* Album id -> MusicBrainz release-group id ("" when there is none). */
export function useCoverArtIds(albums: Album[]) {
  const [ids, setIds] = useState<Record<string, string>>({});
  useEffect(() => {
    const saved = read();
    if (saved && albums.every((a) => a.id in saved.ids)) {
      setIds(saved.ids);
      return;
    }
    let live = true;
    lookup(albums)
      .then((found) => {
        if (!live) return;
        setIds(found);
        try {
          localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), ids: found }));
        } catch {
          /* storage can be full or blocked; the lookup just runs again */
        }
      })
      .catch(() => {
        /* offline or rate limited: the bundled covers stay */
      });
    return () => {
      live = false;
    };
  }, [albums]);
  return ids;
}

/* Show the archive's image once it has fully loaded, the fallback until then. */
export function useLoadedImage(src: string | null, fallback: string) {
  const [shown, setShown] = useState(fallback);
  useEffect(() => {
    setShown(fallback);
    if (!src) return;
    let live = true;
    const img = new Image();
    img.onload = () => live && setShown(src);
    img.src = src;
    return () => {
      live = false;
    };
  }, [src, fallback]);
  return shown;
}
