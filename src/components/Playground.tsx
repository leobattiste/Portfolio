import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Intro, Section } from "./Layout";
import { asset, href } from "@/lib/site";
import albums from "../../content/albums.json";
import "./playground.css";
import {
  AspectRatioArt,
  VariableTypeArt,
  MorphingButtonArt,
} from "./Experiments";

function ExperimentCard({
  path,
  title,
  blurb,
  label,
  art,
}: {
  path: string;
  title: string;
  blurb: string;
  label: string;
  art: ReactNode;
}) {
  return (
    <a className="experiment" href={href(path)}>
      <div className="experiment-art" aria-hidden="true">
        {art}
      </div>
      <div className="experiment-caption">
        <div>
          <h2>
            {title} <span aria-hidden="true">↗</span>
          </h2>
          <p>{blurb}</p>
        </div>
        <span className="label">{label}</span>
      </div>
    </a>
  );
}

export function Playground() {
  return (
    <>
      <Intro>
        <h1 className="statement">Playground</h1>
        <p className="statement secondary">
          Small experiments. Loose ideas.
          <br />
          Things made just to see what happens.
        </p>
      </Intro>
      <Section label="Experiments" count={4}>
        <div className="experiments">
          <ExperimentCard
            path="/playground/album-covers/"
            title="Album covers"
            blurb="20 iconic records. A collection you can get your hands on."
            label="001 · Interactive"
            art={[albums[17], albums[0], albums[15]].map((a, i) => (
              <img
                key={a.id}
                src={asset(`albums/${a.id}.jpg`)}
                alt=""
                style={{ "--i": i } as CSSProperties}
              />
            ))}
          />
          <ExperimentCard
            path="/playground/aspect-ratio/"
            title="Aspect ratio"
            blurb="Six ways to frame the same shot. Drag to see what each one hides."
            label="002 · Film"
            art={<AspectRatioArt />}
          />
          <ExperimentCard
            path="/playground/variable-type/"
            title="Variable type"
            blurb="Letters that get heavier the closer you get."
            label="003 · Type"
            art={<VariableTypeArt />}
          />
          <ExperimentCard
            path="/playground/morphing-button/"
            title="Morphing button"
            blurb="One button, four states, tuned with real springs."
            label="004 · Motion"
            art={<MorphingButtonArt />}
          />
        </div>
      </Section>
    </>
  );
}

const genres = ["All", ...new Set(albums.map((a) => a.genre))];
export function AlbumCovers() {
  const [genre, setGenre] = useState("All");
  const [selected, setSelected] = useState(albums[0].id);
  const [view, setView] = useState<"shelf" | "grid">("shelf");
  const [vinyl, setVinyl] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const sleeve = useRef<HTMLDivElement>(null);
  const filtered = albums.filter((a) => genre === "All" || a.genre === genre);
  const index = Math.max(
    0,
    filtered.findIndex((a) => a.id === selected),
  );
  const album = filtered[index];
  function select(id: string) {
    setSelected(id);
    setFlipped(false);
    setVinyl(false);
  }
  function step(n: number) {
    select(filtered[(index + n + filtered.length) % filtered.length].id);
  }
  function resetTilt() {
    sleeve.current?.style.setProperty("--rx", "0deg");
    sleeve.current?.style.setProperty("--ry", "0deg");
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x,
      dy = event.clientY - drag.current.y;
    sleeve.current?.style.setProperty(
      "--rx",
      `${Math.max(-25, Math.min(25, -dy / 4))}deg`,
    );
    sleeve.current?.style.setProperty(
      "--ry",
      `${Math.max(-40, Math.min(40, dx / 4))}deg`,
    );
  }
  function release(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    if (Math.abs(dx) > 100 && !flipped) step(dx < 0 ? 1 : -1);
    drag.current = null;
    resetTilt();
  }
  return (
    <>
      <Intro
        rail={
          <a className="label" href={href("/playground/")}>
            ← Playground
          </a>
        }
      >
        <div className="album-heading">
          <div>
            <h1 className="statement">Album covers</h1>
            <p className="statement secondary">
              A little history. A lot of good sleeves.
            </p>
          </div>
          <span className="label">Experiment 001 / 20 records</span>
        </div>
      </Intro>
      <section
        className="record-room"
        aria-label="Interactive album collection"
        style={{ "--record-color": album.color } as CSSProperties}
      >
        <div className="record-toolbar">
          <div className="genre-tabs" aria-label="Filter albums by genre">
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={genre === g}
                onClick={() => {
                  setGenre(g);
                  select(
                    (g === "All"
                      ? albums
                      : albums.filter((a) => a.genre === g))[0].id,
                  );
                }}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="view-tabs" aria-label="Collection view">
            {(["shelf", "grid"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === "shelf" ? "3D shelf" : "Grid"}
              </button>
            ))}
          </div>
        </div>
        {view === "shelf" ? (
          <>
            <div
              className="record-stage"
              tabIndex={0}
              role="group"
              aria-label="Album viewer. Use left and right arrows to browse; drag the cover to rotate or swipe to change albums."
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  step(e.key === "ArrowRight" ? 1 : -1);
                }
              }}
            >
              <div className="stage-glow" />
              {[-2, -1, 1, 2].map((offset) => {
                const a =
                  filtered[
                    (index + offset + filtered.length) % filtered.length
                  ];
                return filtered.length > Math.abs(offset) ? (
                  <button
                    type="button"
                    className="neighbor-record"
                    key={offset}
                    style={{ "--offset": offset } as CSSProperties}
                    onClick={() => select(a.id)}
                    aria-label={`View ${a.title} by ${a.artist}`}
                  >
                    <img src={asset(`albums/${a.id}.jpg`)} alt="" />
                  </button>
                ) : null;
              })}
              <div
                className="record-object"
                ref={sleeve}
                data-flipped={flipped}
                data-vinyl={vinyl}
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  drag.current = { x: e.clientX, y: e.clientY };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={move}
                onPointerUp={release}
                onPointerCancel={() => {
                  drag.current = null;
                  resetTilt();
                }}
              >
                <div className="vinyl-disc" aria-hidden="true">
                  <div style={{ backgroundColor: album.color }}>
                    <span>
                      {album.artist}
                      <br />
                      {album.year}
                      <br />●
                    </span>
                  </div>
                </div>
                <div className="record-sleeve">
                  <div className="record-front">
                    <img
                      src={asset(`albums/${album.id}.jpg`)}
                      alt={`${album.title} album cover by ${album.artist}`}
                      draggable={false}
                    />
                    <span className="sleeve-shine" />
                  </div>
                  <div className="record-back">
                    <span>
                      {album.genre} / {album.year}
                    </span>
                    <strong>{album.title}</strong>
                    <p>{album.note}</p>
                    <span>{album.artist}</span>
                  </div>
                </div>
              </div>
              <span className="stage-instruction">
                Drag to tilt · Swipe to browse · ← →
              </span>
            </div>
            <div className="record-information">
              <button
                className="record-arrow"
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous album"
              >
                ←
              </button>
              <div aria-live="polite" aria-atomic="true">
                <p className="record-counter">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(filtered.length).padStart(2, "0")} · {album.genre} ·{" "}
                  {album.year}
                </p>
                <h2>{album.title}</h2>
                <p>{album.artist}</p>
              </div>
              <button
                className="record-arrow"
                type="button"
                onClick={() => step(1)}
                aria-label="Next album"
              >
                →
              </button>
            </div>
            <div className="record-actions">
              <button
                type="button"
                aria-pressed={vinyl}
                onClick={() => {
                  setVinyl(!vinyl);
                  setFlipped(false);
                }}
              >
                {vinyl ? "Put record away" : "Pull out vinyl"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
              <button
                type="button"
                aria-pressed={flipped}
                onClick={() => {
                  setFlipped(!flipped);
                  setVinyl(false);
                }}
              >
                {flipped ? "Show cover" : "Read sleeve notes"}{" "}
                <span aria-hidden="true">↻</span>
              </button>
              <a href={album.source} target="_blank" rel="noopener noreferrer">
                Explore album ↗
              </a>
            </div>
          </>
        ) : (
          <div className="album-grid">
            {filtered.map((a) => (
              <button
                type="button"
                key={a.id}
                onClick={() => {
                  select(a.id);
                  setView("shelf");
                }}
              >
                <img
                  src={asset(`albums/${a.id}.jpg`)}
                  alt={`${a.title} album cover`}
                  loading="lazy"
                />
                <strong>{a.title}</strong>
                <span>
                  {a.artist} · {a.year}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="record-strip" aria-label="Choose an album">
          {filtered.map((a) => (
            <button
              type="button"
              key={a.id}
              aria-label={`${a.title} by ${a.artist}`}
              aria-pressed={a.id === album.id}
              onClick={() => {
                select(a.id);
                setView("shelf");
              }}
            >
              <img src={asset(`albums/${a.id}.jpg`)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </section>
      <Section label="About the collection">
        <p className="collection-note">
          Twenty sleeves across rock, pop, jazz, soul, folk, electronic,
          alternative, and rap. An experiment in browsing music as a physical
          object. Cover artwork belongs to its respective rights holders; images
          sourced from Apple’s album catalog. The vinyl and reverse sleeves are
          interpretive, with short notes about each cover.
        </p>
      </Section>
    </>
  );
}
