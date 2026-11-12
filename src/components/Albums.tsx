import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { asset } from "@/lib/site";
import { coverArt, useCoverArtIds, useLoadedImage } from "@/lib/coverart";
import { createPlayer, type Player } from "@/lib/spotify";
import { ExperimentPage } from "./Experiments";
import albums from "../../content/albums.json";
import "./albums.css";

type Album = (typeof albums)[number];

const genres = ["All", ...new Set(albums.map((a) => a.genre))];
const local = (a: Album) => asset(`albums/${a.id}.jpg`);

/* Dark or light lettering, whichever reads on the label's color. */
const inkOn = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#17181c" : "#fafafb";
};

const RPM = 100 / 3;
const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function Cover({ album, mbid, size, alt = "" }: { album: Album; mbid?: string; size: 250 | 1200; alt?: string }) {
  const src = useLoadedImage(mbid ? coverArt(mbid, size) : null, local(album));
  return <img src={src} alt={alt} draggable={false} loading={size === 250 ? "lazy" : undefined} />;
}

export function AlbumCovers() {
  const [genre, setGenre] = useState("All");
  const [selected, setSelected] = useState(albums[0].id);
  const [onPlatter, setOnPlatter] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [arm, setArm] = useState<{ at: "rest" | "groove"; up: boolean }>({ at: "rest", up: false });
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [blocked, setBlocked] = useState<false | "tap" | "failed">(false);

  const deck = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const heard = useRef(false);
  const player = useRef<Player | null>(null);
  const stopRef = useRef<() => void>(() => {});

  const ids = useCoverArtIds(albums);
  const list = albums.filter((a) => genre === "All" || a.genre === genre);
  const index = Math.max(0, list.findIndex((a) => a.id === selected));
  const album = list[index];
  const ink = inkOn(album.color);

  /* Steps that happen one after another, like a hand on a real deck. */
  function run(steps: [number, () => void][]) {
    timers.current.forEach(clearTimeout);
    timers.current = steps.map(([ms, fn]) => window.setTimeout(fn, ms));
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function getPlayer() {
    player.current ??= createPlayer(
      () => host.current,
      (u) => {
        if (!u.isPaused) {
          heard.current = true;
          setBlocked(false);
        }
        if (u.duration > 0) setProgress(Math.min(1, u.position / u.duration));
        if (u.duration > 0 && u.isPaused && u.position >= u.duration - 400) stopRef.current();
      },
    );
    return player.current;
  }

  function play() {
    if (playing) return;
    setPlaying(true);
    setFlipped(false);
    setProgress(0);
    heard.current = false;
    const landed = onPlatter ? 0 : 900;
    setOnPlatter(true);
    const audio = getPlayer();
    /* Start loading and playing right here, inside the click, because
       browsers only let sound start from something the person just did. */
    audio.play(`spotify:album:${album.spotify}`).catch(() => setBlocked("failed"));
    run([
      [landed, () => setSpinning(true)],
      [landed + 150, () => setArm({ at: "rest", up: true })],
      [landed + 450, () => setArm({ at: "groove", up: true })],
      [
        landed + 1400,
        () => {
          setArm({ at: "groove", up: false });
        },
      ],
      [
        landed + 4000,
        () => {
          if (!heard.current) setBlocked(audio.loaded() ? "tap" : "failed");
        },
      ],
    ]);
  }

  function stop(then?: () => void) {
    setPlaying(false);
    setBlocked(false);
    player.current?.pause();
    run([
      [0, () => setArm((a) => ({ ...a, up: true }))],
      [300, () => setArm({ at: "rest", up: true })],
      [400, () => setSpinning(false)],
      [1250, () => setArm({ at: "rest", up: false })],
      ...(then ? ([[1250, then]] as [number, () => void][]) : []),
    ]);
  }
  stopRef.current = () => stop();

  function choose(id: string) {
    if (id === album.id) return;
    setFlipped(false);
    if (!onPlatter) {
      setSelected(id);
      return;
    }
    /* Lift the arm, put the record back in its sleeve, then swap. */
    setPlaying(false);
    setBlocked(false);
    player.current?.pause();
    setArm({ at: "rest", up: false });
    setSpinning(false);
    setOnPlatter(false);
    run([[700, () => setSelected(id)]]);
  }
  function step(n: number) {
    choose(list[(index + n + list.length) % list.length].id);
  }
  function key(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (playing) stop();
      else play();
    }
  }

  /* The platter speeds up and slows down instead of starting and stopping dead. */
  useEffect(() => {
    const el = deck.current;
    if (!el || reduced()) return;
    let angle = parseFloat(el.style.getPropertyValue("--spin")) || 0;
    let speed = Number(el.dataset.speed) || 0;
    const target = spinning ? (RPM * 360) / 60 : 0;
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      speed += (target - speed) * (1 - Math.exp(-dt / (spinning ? 0.35 : 0.7)));
      angle = (angle + speed * dt) % 360;
      el.style.setProperty("--spin", `${angle.toFixed(2)}deg`);
      el.dataset.speed = String(speed);
      if (spinning || speed > 0.5) frame = requestAnimationFrame(tick);
      else el.dataset.speed = "0";
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [spinning]);

  const status = playing
    ? `Playing ${album.title} by ${album.artist}`
    : onPlatter
      ? `${album.title} is on the turntable`
      : `${album.title} by ${album.artist}`;

  const style = useMemo(
    () =>
      ({
        "--label": album.color,
        "--label-ink": ink,
        "--progress": progress,
      }) as CSSProperties,
    [album.color, ink, progress],
  );

  return (
    <ExperimentPage
      number="001"
      title="Album covers"
      lead={
        <>
          Twenty favorite records.
          <br />
          Put one on and listen.
        </>
      }
      meta={`${albums.length} records`}
      notes={
        <>
          <p>
            Music used to be something you held. The sleeve was the first thing
            you saw, and the record came out of it. This is a small collection of
            covers I love, on a turntable you can actually play.
          </p>
          <p>
            A 12-inch LP turns at 33⅓ revolutions per minute, so the platter here
            spins at that speed, and like a real one it takes a moment to get up
            to speed and to wind down. The arm follows the song as it plays.
          </p>
          <p>
            Covers come from the Cover Art Archive, through MusicBrainz. The music
            plays through Spotify: a short preview, or the full album if you are
            signed in. Cover artwork belongs to its rights holders. The record
            labels and back sleeves are my own.
          </p>
        </>
      }
    >
      <section className="lab player" aria-label="Turntable">
        <div className="lab-toolbar">
          <div className="lab-tabs" role="group" aria-label="Genre">
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={genre === g}
                onClick={() => {
                  setGenre(g);
                  choose((g === "All" ? albums : albums.filter((a) => a.genre === g))[0].id);
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="player-stage">
          <div
            ref={deck}
            className="deck"
            data-on={onPlatter}
            data-playing={playing}
            data-arm-at={arm.at}
            data-arm-up={arm.up}
            data-flipped={flipped}
            style={style}
            tabIndex={0}
            role="group"
            aria-roledescription="turntable"
            aria-label={`${album.title} by ${album.artist}. Space plays or stops, arrow keys change the record.`}
            onKeyDown={key}
          >
            <div className="plinth">
              <div className="platter" aria-hidden="true">
                <div className="platter-spin">
                  <span className="strobe" />
                  <span className="mat" />
                </div>
                <span className="spindle" />
              </div>
              <span className="led" aria-hidden="true" />
              <span className="speeds" aria-hidden="true">
                <b>33</b>
                <span>45</span>
              </span>
              <button
                type="button"
                className="start"
                aria-label={playing ? "Stop the turntable" : "Start the turntable"}
                aria-pressed={playing}
                onClick={() => (playing ? stop() : play())}
              />
            </div>

            <div className="record" aria-hidden="true">
              <div className="record-spin">
                <div className="record-label">
                  <strong>{album.title}</strong>
                  <span>{album.artist}</span>
                  <small>
                    <span>Side A</span>
                    <span>33⅓</span>
                  </small>
                </div>
              </div>
              <span className="record-sheen" />
            </div>

            <div className="sleeve" onClick={() => !onPlatter && play()}>
              <div className="sleeve-face sleeve-front">
                <Cover album={album} mbid={ids[album.id]} size={1200} alt={`${album.title} cover`} />
                <span className="sleeve-wear" />
              </div>
              <div className="sleeve-face sleeve-back">
                <strong>{album.title}</strong>
                <span>
                  {album.artist}, {album.year}
                </span>
                <p>{album.note}</p>
                <small>12-inch LP, 33⅓ rpm</small>
              </div>
            </div>

            <div className="tonearm" aria-hidden="true">
              <span className="arm-base" />
              <span className="arm-rest" />
              <span className="arm">
                <span className="arm-weight" />
                <span className="arm-tube" />
                <span className="arm-head" />
              </span>
              <span className="arm-cap" />
            </div>
          </div>

          <div className="player-info">
            <div>
              <p className="player-count">
                {index + 1} of {list.length}
              </p>
              <h2>{album.title}</h2>
              <p className="player-artist">{album.artist}</p>
              <p className="player-note">{album.note}</p>
            </div>
            <div>
              <dl>
                <div>
                  <dt>Year</dt>
                  <dd>{album.year}</dd>
                </div>
                <div>
                  <dt>Genre</dt>
                  <dd>{album.genre}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>12-inch LP, 33⅓ rpm</dd>
                </div>
              </dl>
              <div className="player-actions">
                <button
                  type="button"
                  className="btn primary"
                  aria-pressed={playing}
                  onClick={() => (playing ? stop() : play())}
                >
                  {playing ? "Stop" : "Play record"}
                </button>
                <button
                  type="button"
                  className="btn"
                  aria-pressed={flipped}
                  onClick={() => setFlipped(!flipped)}
                >
                  {flipped ? "See the front" : "See the back"}
                </button>
                <span className="player-step">
                  <button type="button" className="btn icon" onClick={() => step(-1)} aria-label="Previous record">
                    ←
                  </button>
                  <button type="button" className="btn icon" onClick={() => step(1)} aria-label="Next record">
                    →
                  </button>
                </span>
              </div>
              <a className="link player-listen" href={album.source} target="_blank" rel="noopener noreferrer">
                Listen on Apple Music
              </a>
              <p className="sr-only" aria-live="polite">
                {status}
              </p>
            </div>
          </div>
        </div>

        <div className="crate" role="group" aria-label="Choose a record">
          {list.map((a) => (
            <button
              type="button"
              key={a.id}
              aria-label={`${a.title} by ${a.artist}`}
              aria-pressed={a.id === album.id}
              onClick={() => choose(a.id)}
            >
              <Cover album={a} mbid={ids[a.id]} size={250} />
            </button>
          ))}
        </div>
      </section>

      {/* Spotify's player, out of sight. Some browsers (Safari especially)
          won't start sound until the person taps inside the player itself,
          so if nothing is heard it comes forward with a note. */}
      <div className="spotify" data-visible={blocked !== false} data-failed={blocked === "failed"}>
        {blocked === "failed" ? (
          <p>
            Spotify could not load here.{" "}
            <a
              className="link"
              href={`https://open.spotify.com/album/${album.spotify}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open this album in Spotify
            </a>
          </p>
        ) : (
          <p>Your browser needs a tap to start the sound. Press play below.</p>
        )}
        <div ref={host} />
        <button type="button" className="btn" onClick={() => setBlocked(false)}>
          Hide
        </button>
      </div>
    </ExperimentPage>
  );
}

/* The Playground card: the same deck, small and still, spinning on hover. */
export function TurntableArt() {
  const album = albums[0];
  return (
    <div className="art-turntable">
      <div
        className="deck"
        data-on="true"
        data-playing="true"
        data-arm-at="groove"
        data-arm-up="false"
        style={{ "--label": album.color, "--label-ink": inkOn(album.color) } as CSSProperties}
      >
        <div className="plinth">
          <div className="platter">
            <div className="platter-spin">
              <span className="strobe" />
              <span className="mat" />
            </div>
            <span className="spindle" />
          </div>
          <span className="led" />
          <span className="start" />
        </div>
        <div className="record">
          <div className="record-spin">
            <div className="record-label" />
          </div>
          <span className="record-sheen" />
        </div>
        <div className="sleeve">
          <div className="sleeve-face sleeve-front">
            <img src={local(album)} alt="" draggable={false} />
            <span className="sleeve-wear" />
          </div>
        </div>
        <div className="tonearm">
          <span className="arm-base" />
          <span className="arm-rest" />
          <span className="arm">
            <span className="arm-weight" />
            <span className="arm-tube" />
            <span className="arm-head" />
          </span>
          <span className="arm-cap" />
        </div>
      </div>
    </div>
  );
}
