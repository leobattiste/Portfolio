import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { asset } from "@/lib/site";
import { ExperimentPage } from "./Experiments";
import albums from "../../content/albums.json";
import "./albums.css";

type Album = (typeof albums)[number];
type Format = "vinyl" | "cd";

const genres = ["All", ...new Set(albums.map((a) => a.genre))];
const cover = (a: Album) => asset(`albums/${a.id}.jpg`);

/* Dark or light lettering, whichever reads on the album's color. */
const inkOn = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#17181c" : "#fafafb";
};

const formats: Record<Format, { name: string; spec: string; play: string }> = {
  vinyl: { name: "Vinyl", spec: "12-inch LP, 33⅓ rpm", play: "Play record" },
  cd: { name: "CD", spec: "Compact disc, 12 cm", play: "Play CD" },
};

function Disc({ album, format }: { album: Album; format: Format }) {
  const ink = inkOn(album.color);
  return (
    <div className={`disc disc-${format}`} aria-hidden="true">
      <div className="disc-spin">
        {format === "vinyl" ? (
          <div className="disc-label" style={{ background: album.color, color: ink }}>
            <span>{album.artist}</span>
            <span>{album.title}</span>
          </div>
        ) : (
          <span className="disc-print">
            {album.artist} / {album.title}
          </span>
        )}
      </div>
      <span className="disc-sheen" />
    </div>
  );
}

function Back({ album, format }: { album: Album; format: Format }) {
  const spine = (
    <span className="sleeve-back-spine" style={{ background: album.color, color: inkOn(album.color) }}>
      {album.artist} / {album.title}
    </span>
  );
  return (
    <div className={`sleeve-back sleeve-back-${format}`}>
      {format === "cd" ? spine : null}
      <div className="sleeve-back-body">
        <strong>{album.title}</strong>
        <span>
          {album.artist}, {album.year}
        </span>
        <p>{album.note}</p>
        <small>{formats[format].spec}</small>
      </div>
      {format === "cd" ? spine : null}
    </div>
  );
}

export function AlbumCovers() {
  const [genre, setGenre] = useState("All");
  const [selected, setSelected] = useState(albums[0].id);
  const [format, setFormat] = useState<Format>("vinyl");
  const [playing, setPlaying] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const list = albums.filter((a) => genre === "All" || a.genre === genre);
  const index = Math.max(0, list.findIndex((a) => a.id === selected));
  const album = list[index];
  const f = formats[format];

  function choose(id: string) {
    setSelected(id);
    setFlipped(false);
  }
  function step(n: number) {
    choose(list[(index + n + list.length) % list.length].id);
  }
  function togglePlay() {
    setFlipped(false);
    setPlaying((p) => !p);
  }
  function tilt(x: number, y: number) {
    body.current?.style.setProperty("--rx", `${x}deg`);
    body.current?.style.setProperty("--ry", `${y}deg`);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    tilt(Math.max(-18, Math.min(18, -dy / 5)), Math.max(-30, Math.min(30, dx / 5)));
  }
  function release(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    if (Math.abs(dx) > 90) step(dx < 0 ? 1 : -1);
    drag.current = null;
    tilt(0, 0);
  }
  function key(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      togglePlay();
    }
  }

  const status = playing
    ? `Playing ${album.title} by ${album.artist} on ${f.name}`
    : `${album.title} by ${album.artist}, stopped`;

  return (
    <ExperimentPage
      number="001"
      title="Album covers"
      lead={
        <>
          Twenty favorite records.
          <br />
          Play them on vinyl or CD.
        </>
      }
      meta={`${albums.length} records`}
      notes={
        <>
          <p>
            Music used to be something you held. The sleeve was the first thing
            you saw, and the record or disc came out of it. This is a small
            collection of covers I love, as objects you can pull out, spin and
            turn over.
          </p>
          <p>
            The two formats spin differently. A 12-inch LP turns at a steady 33⅓
            revolutions per minute. A CD runs much faster, roughly 200 to 500, and
            slows down as the laser reads outward.
          </p>
          <p>
            Cover artwork belongs to its rights holders. Images come from Apple’s
            album catalog. The record labels, discs and back sleeves are my own
            interpretations.
          </p>
        </>
      }
    >
      <section className="lab player" aria-label="Album player">
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
          <div className="format-switch" role="group" aria-label="Format">
            {(Object.keys(formats) as Format[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={format === k}
                onClick={() => {
                  setFormat(k);
                  setFlipped(false);
                }}
              >
                {formats[k].name}
              </button>
            ))}
          </div>
        </div>

        <div className="player-stage">
          <div
            className="deck"
            data-format={format}
            data-playing={playing}
            data-flipped={flipped}
            style={{ "--album": album.color } as CSSProperties}
            tabIndex={0}
            role="group"
            aria-roledescription="player"
            aria-label={`${album.title}. Space plays or stops, arrow keys change album, drag to tilt or swipe to browse.`}
            onKeyDown={key}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              drag.current = { x: e.clientX, y: e.clientY };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={move}
            onPointerUp={release}
            onPointerCancel={() => {
              drag.current = null;
              tilt(0, 0);
            }}
          >
            <div className="deck-body" ref={body}>
              <div className="disc-slot">
                <Disc album={album} format={format} />
              </div>
              {format === "vinyl" ? (
                <>
                  <div className="sleeve">
                    <div className="face face-front">
                      <img src={cover(album)} alt={`${album.title} cover`} draggable={false} />
                      <span className="sleeve-shine" />
                    </div>
                    <div className="face face-back">
                      <Back album={album} format="vinyl" />
                    </div>
                  </div>
                  <div className="tonearm" aria-hidden="true">
                    <span className="arm-pivot" />
                    <span className="arm">
                      <span className="arm-head" />
                    </span>
                  </div>
                </>
              ) : (
                <div className="case">
                  <span className="case-tray" />
                  <div className="case-lid">
                    <div className="lid-out">
                      <span className="case-hinge" />
                      <img src={cover(album)} alt={`${album.title} cover`} draggable={false} />
                      <span className="case-shine" />
                    </div>
                    <div className="lid-in">
                      <strong>{album.title}</strong>
                      <span>{album.artist}</span>
                    </div>
                  </div>
                  <div className="face face-back">
                    <Back album={album} format="cd" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="player-info">
            <p className="player-count">
              {index + 1} of {list.length}
            </p>
            <h2>{album.title}</h2>
            <p className="player-artist">{album.artist}</p>
            <p className="player-note">{album.note}</p>
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
                <dd>{f.spec}</dd>
              </div>
            </dl>
            <div className="player-actions">
              <button type="button" className="btn primary" aria-pressed={playing} onClick={togglePlay}>
                {playing ? "Stop" : f.play}
              </button>
              <button
                type="button"
                className="btn"
                aria-pressed={flipped}
                onClick={() => {
                  setPlaying(false);
                  setFlipped(!flipped);
                }}
              >
                {flipped ? "See the front" : "See the back"}
              </button>
              <span className="player-step">
                <button type="button" className="btn icon" onClick={() => step(-1)} aria-label="Previous album">
                  ←
                </button>
                <button type="button" className="btn icon" onClick={() => step(1)} aria-label="Next album">
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

        <div className={`shelf shelf-${format}`} role="group" aria-label="Choose an album">
          {list.map((a) => (
            <button
              type="button"
              key={a.id}
              aria-label={`${a.title} by ${a.artist}`}
              aria-pressed={a.id === album.id}
              onClick={() => choose(a.id)}
              style={
                format === "cd"
                  ? ({ background: a.color, color: inkOn(a.color) } as CSSProperties)
                  : undefined
              }
            >
              {format === "vinyl" ? (
                <img src={cover(a)} alt="" loading="lazy" />
              ) : (
                <span>
                  {a.artist} <b>{a.title}</b>
                </span>
              )}
            </button>
          ))}
        </div>
      </section>
    </ExperimentPage>
  );
}
