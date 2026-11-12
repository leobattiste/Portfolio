import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Intro, Section } from "./Layout";
import { href } from "@/lib/site";
import { spring } from "@/lib/spring";
import "./experiments.css";

const springStyle = (stiffness: number, damping: number, slow = 1) => {
  const s = spring(stiffness, damping);
  return {
    "--spring": s.easing,
    "--spring-ms": `${s.duration * slow}ms`,
  } as CSSProperties;
};

function ExperimentPage({
  number,
  title,
  lead,
  meta,
  notes,
  children,
}: {
  number: string;
  title: string;
  lead: ReactNode;
  meta: string;
  notes: ReactNode;
  children: ReactNode;
}) {
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
            <h1 className="statement">{title}</h1>
            <p className="statement secondary">{lead}</p>
          </div>
          <span className="label">
            Experiment {number} / {meta}
          </span>
        </div>
      </Intro>
      {children}
      <Section label="Notes">
        <div className="prose">{notes}</div>
      </Section>
    </>
  );
}

/* 002 Aspect ratio -------------------------------------------------- */

const ratios = [
  {
    value: 1.33,
    name: "Standard",
    note: "4:3",
    film: "The Artist (2011)",
    essay: ["Cinema began here. In the 1890s Edison's lab settled on a frame about a third wider than it was tall, and for decades nobody had a reason to change it. Television inherited the shape, so for half a century it was also what a living room looked like.", "The frame is tall and close. A face fills it easily, a doorway turns into a portrait, and there is little room for anything that does not matter. Filmmakers who choose it today usually want that pressure: intimacy, nostalgia, or the feeling of being boxed in."],
    fact: "The Grand Budapest Hotel uses a near-4:3 frame for its 1930s scenes, then widens the picture for each later decade.",
  },
  {
    value: 1.43,
    name: "IMAX",
    film: "The Odyssey (2026)",
    essay: ["IMAX 15/70 is the largest frame in regular film use. The film runs through the camera on its side, and each frame spans fifteen perforations, which makes it almost square and roughly ten times the area of a regular 35mm frame. More area means less grain and more detail, so the picture stays sharp on a screen several stories tall.", "The cost is practical. The cameras are heavy and loud, a roll of film lasts only a few minutes, and only some theaters can show it at full size. Christopher Nolan has pushed the format further than anyone, and he shot The Odyssey entirely for IMAX."],
    fact: "IMAX film projectors hold each frame flat against the lens with suction, which keeps a frame this large perfectly sharp.",
  },
  {
    value: 1.78,
    name: "Widescreen",
    note: "16:9",
    film: "Whatever you watch at home",
    essay: ["16:9 was never a cinema standard. It was proposed in the 1980s for television as a compromise: take the old 4:3 shape and the widest film shape, and find a rectangle that wastes about the same amount of screen on both.", "It stuck, and now it is everywhere: TVs, laptops, phones turned sideways, YouTube. For films it works mostly as the container. A scope film on this screen gets bars above and below, and a 4:3 film gets bars at the sides. It is also the shape of the frame in this experiment, so every other ratio here is shown as bars inside it."],
    fact: "Almost every screen you own is 16:9, which means almost every film you watch has been resized to fit it.",
  },
  {
    value: 1.85,
    name: "Flat",
    film: "Pulp Fiction (1994)",
    essay: ["Flat is the quiet default. It is wide enough for two people to share a shot and tall enough to keep their faces large, so it is what most dramas and comedies use. Conversations get by with nothing but faces and a table, like the diner scenes in Pulp Fiction.", "The name comes from the lenses. Flat uses ordinary spherical lenses, with no squeezing, where scope needs special anamorphic ones. Because it asks nothing special of the audience, it is the ratio you notice least, and that is often the point."],
    fact: "Flat sits so close to 16:9 that most people never notice the thin bars it gets at home.",
  },
  {
    value: 2.39,
    name: "Scope",
    film: "Blade Runner 2049 (2017)",
    essay: ["Scope began as a reply to television. In the 1950s studios needed a reason to get people out of their living rooms, and CinemaScope, introduced with The Robe in 1953, offered a much wider picture. It does this with anamorphic lenses that squeeze the image onto the film and stretch it back out on screen. The ratio settled at 2.39 over the following decades.", "The look has side effects that people now love: oval blurred highlights and long horizontal streaks of light. The shape favors landscapes and distance. Two characters can stand far apart and still share a frame, and the empty space between them becomes part of the scene."],
    fact: "Scope is the ratio most people think of as cinematic, which is why creators on YouTube and in games often add black bars to get the look.",
  },
  {
    value: 2.76,
    name: "Ultra Panavision",
    film: "The Hateful Eight (2015)",
    essay: ["Ultra Panavision 70 is the widest frame in use. It squeezes a picture more than two and a half times as wide as it is tall onto 65mm film. It was made for epics in the 1950s and 60s, like Ben-Hur in 1959, and then almost disappeared.", "Quentin Tarantino brought it back for The Hateful Eight, shot with lenses made in the 1960s, and used it on a story set mostly in one room. That is the surprise: the extreme width does not make the cabin feel bigger, it makes it feel crowded, with every character in the shot at once."],
    fact: "The Hateful Eight was shown in a 70mm roadshow cut with an overture and an intermission, the way epics were released in the 1960s.",
  },
];
const FRAME = 16 / 9;
const MIN = 1.33,
  MAX = 2.76;
const clampRatio = (r: number) =>
  Math.min(MAX, Math.max(MIN, Math.round(r * 100) / 100));

/* The bars that cover the 16:9 frame to show a given ratio. */
export const bars = (ratio: number) =>
  ({
    "--letter": `${ratio > FRAME ? ((1 - FRAME / ratio) / 2) * 100 : 0}%`,
    "--pillar": `${ratio < FRAME ? ((1 - ratio / FRAME) / 2) * 100 : 0}%`,
  }) as CSSProperties;

/* A drawn sunset, so the page needs no photograph. */
export function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <span className="scene-sun" />
      <span className="scene-hill far" />
      <span className="scene-lighthouse" />
      <span className="scene-hill near" />
      <span className="scene-sea" />
      <span className="scene-glint" />
      <span className="scene-figure" />
    </div>
  );
}

export function AspectRatio() {
  const [ratio, setRatio] = useState(2.39);
  const [grain, setGrain] = useState(true);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const preset = ratios.find((r) => Math.abs(r.value - ratio) < 0.005);
  function down(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, start: ratio };
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const width = event.currentTarget.getBoundingClientRect().width;
    setRatio(
      clampRatio(drag.current.start + ((event.clientX - drag.current.x) / width) * 2),
    );
  }
  function key(event: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = {
      ArrowRight: 0.01,
      ArrowUp: 0.01,
      ArrowLeft: -0.01,
      ArrowDown: -0.01,
    };
    if (event.key in steps) {
      event.preventDefault();
      setRatio((r) => clampRatio(r + steps[event.key] * (event.shiftKey ? 10 : 1)));
    } else if (event.key === "Home") setRatio(MIN);
    else if (event.key === "End") setRatio(MAX);
  }
  return (
    <ExperimentPage
      number="002"
      title="Aspect ratio"
      lead={
        <>
          Six ways to frame a film.
          <br />
          Drag to see what each one leaves out.
        </>
      }
      meta="6 ratios"
      notes={
        <>
          <p>
            Watching movies is one of my favorite hobbies, and it changed how I
            design. I notice the frame before the plot: where the edges sit, what
            gets cropped, and how much room a shot leaves to breathe. A screen
            layout makes the same decisions.
          </p>
          <p>
            Narrow the frame to 4:3 and the lighthouse on the right drops out of
            the picture. Nothing in the scene changed, only what it showed.
          </p>
          <p>
            The bars move on a spring rather than a fixed curve, so every change,
            even mid-drag, reads as one continuous motion.
          </p>
        </>
      }
    >
      <section className="lab" aria-label="Aspect ratio experiment">
        <div className="lab-toolbar">
          <div className="lab-tabs" role="group" aria-label="Ratios">
            {ratios.map((r) => (
              <button
                key={r.value}
                type="button"
                aria-pressed={preset?.value === r.value}
                onClick={() => setRatio(r.value)}
              >
                {r.name}
              </button>
            ))}
          </div>
          <label className="lab-check">
            <input
              type="checkbox"
              checked={grain}
              onChange={(e) => setGrain(e.target.checked)}
            />
            Film grain
          </label>
        </div>
        <div className="lab-stage ratio-stage">
          <div
            className="ratio-frame"
            style={{ ...bars(ratio), ...springStyle(170, 22) }}
            role="slider"
            tabIndex={0}
            aria-label="Aspect ratio"
            aria-valuemin={MIN}
            aria-valuemax={MAX}
            aria-valuenow={ratio}
            aria-valuetext={`${ratio.toFixed(2)} to 1${preset ? `, ${preset.name}` : ""}`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onKeyDown={key}
          >
            <Scene />
            <span className="bar bar-top" />
            <span className="bar bar-bottom" />
            <span className="bar bar-left" />
            <span className="bar bar-right" />
            {grain ? <span className="grain" aria-hidden="true" /> : null}
          </div>
          <div className="ratio-readout">
            <strong data-ratio>{ratio.toFixed(2)} : 1</strong>
            <span>
              {preset ? `${preset.name}${preset.note ? `, ${preset.note}` : ""}` : "Custom"}
            </span>
          </div>
          <p className="lab-hint">Drag across the frame, or use the arrow keys</p>
        </div>
      </section>
      <Section label="Guide">
        <div className="ratio-guide">
          {ratios.map((r) => (
            <article key={r.value} aria-current={preset?.value === r.value ? "true" : undefined}>
              <header>
                <h2>
                  {r.name}
                  <span>{r.note ? `${r.note}, ` : ""}{r.value.toFixed(2)}:1</span>
                </h2>
                <button
                  type="button"
                  className="pill"
                  onClick={() => {
                    setRatio(r.value);
                    document.querySelector(".ratio-stage")?.scrollIntoView({
                      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                      block: "center",
                    });
                  }}
                >
                  See it in the frame
                </button>
              </header>
              {r.essay.map((text) => (
                <p key={text}>{text}</p>
              ))}
              <dl>
                <div>
                  <dt>In the movies</dt>
                  <dd>{r.film}</dd>
                </div>
                <div>
                  <dt>Fun fact</dt>
                  <dd>{r.fact}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </Section>
    </ExperimentPage>
  );
}

/* 003 Variable type ------------------------------------------------- */

export function VariableType() {
  const [text, setText] = useState("Leo Battiste");
  const [radius, setRadius] = useState(220);
  const [mode, setMode] = useState<"cursor" | "wave">("cursor");
  const [invert, setInvert] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);

  const paint = useCallback(
    (time?: number) => {
      const letters = stage.current?.querySelectorAll<HTMLElement>("[data-letter]");
      letters?.forEach((letter, i) => {
        let amount = 0;
        if (mode === "wave") amount = (Math.sin((time ?? 0) / 450 - i * 0.55) + 1) / 2;
        else if (pointer.current) {
          const box = letter.getBoundingClientRect();
          const distance = Math.hypot(
            box.left + box.width / 2 - pointer.current.x,
            box.top + box.height / 2 - pointer.current.y,
          );
          const near = Math.max(0, 1 - distance / radius);
          amount = near * near * (3 - 2 * near);
        }
        if (invert && (mode === "wave" || pointer.current)) amount = 1 - amount;
        letter.style.setProperty("--w", String(Math.round(400 + 500 * amount)));
      });
    },
    [mode, radius, invert],
  );

  useEffect(() => {
    paint();
    if (mode !== "wave") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const loop = (time: number) => {
      paint(time);
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame.current);
  }, [paint, mode, text]);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (mode !== "cursor") return;
    pointer.current = { x: event.clientX, y: event.clientY };
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => paint());
  }
  function leave() {
    if (mode !== "cursor") return;
    pointer.current = null;
    paint();
  }

  return (
    <ExperimentPage
      number="003"
      title="Variable type"
      lead={
        <>
          Letters that get heavier
          <br />
          the closer you get.
        </>
      }
      meta="400 to 900"
      notes={
        <p>
          Schibsted Grotesk, the typeface on this site, is a variable font. Weight
          isn’t a set of separate files: any value from 400 to 900 is available,
          so each letter here picks its own from how close the pointer is. Try a
          small radius for a spotlight, or a large one for a slow swell.
        </p>
      }
    >
      <section className="lab" aria-label="Variable type experiment">
        <div className="lab-toolbar">
          <div className="lab-tabs" role="group" aria-label="Mode">
            <button type="button" aria-pressed={mode === "cursor"} onClick={() => setMode("cursor")}>
              Follow pointer
            </button>
            <button type="button" aria-pressed={mode === "wave"} onClick={() => setMode("wave")}>
              Wave
            </button>
          </div>
          <label className="lab-check">
            <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
            Invert
          </label>
        </div>
        <div
          ref={stage}
          className="lab-stage type-stage"
          onPointerMove={move}
          onPointerDown={move}
          onPointerLeave={leave}
        >
          <p className="type-word" aria-label={text || "Type something"}>
            {(text || "Type something").split("").map((ch, i) =>
              ch === " " ? (
                <span key={i} className="type-space" aria-hidden="true">
                  {" "}
                </span>
              ) : (
                <span
                  key={i}
                  data-letter
                  aria-hidden="true"
                  className={text ? undefined : "type-placeholder"}
                >
                  {ch}
                </span>
              ),
            )}
          </p>
          <p className="lab-hint">
            {mode === "cursor" ? "Move across the letters" : "Weight moves through the word on its own"}
          </p>
        </div>
        <div className="lab-controls">
          <label className="lab-field">
            <span>Text</span>
            <input
              value={text}
              maxLength={24}
              placeholder="Type something"
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <label className="lab-field">
            <span>Radius {radius}px</span>
            <input
              type="range"
              min={60}
              max={480}
              value={radius}
              disabled={mode === "wave"}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </label>
        </div>
      </section>
    </ExperimentPage>
  );
}

/* 004 Morphing button ----------------------------------------------- */

type State = "idle" | "loading" | "done" | "failed";
const spinner = (
  <svg className="morph-spinner" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
    <path d="M10 2a8 8 0 0 1 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const faces: Record<State, ReactNode> = {
  idle: <>Publish entry</>,
  loading: (
    <>
      {spinner}
      <span className="sr-only">Publishing</span>
    </>
  ),
  done: (
    <>
      <svg className="morph-check" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Published
    </>
  ),
  failed: <>Couldn’t publish. Try again</>,
};
const announcements: Record<State, string> = {
  idle: "",
  loading: "Publishing",
  done: "Published",
  failed: "Couldn’t publish. Press the button to try again.",
};
const states = Object.keys(faces) as State[];

function Curve({ stiffness, damping }: { stiffness: number; damping: number }) {
  const { points, duration } = spring(stiffness, damping);
  const top = Math.max(1.05, ...points);
  const d = points
    .map((p, i) => `${i ? "L" : "M"}${((i / (points.length - 1)) * 240).toFixed(1)},${(76 - (p / top) * 64).toFixed(1)}`)
    .join("");
  return (
    <figure className="curve">
      <svg viewBox="0 0 240 80" role="img" aria-label={`Spring curve. It settles in ${duration} milliseconds.`}>
        <line x1="0" x2="240" y1={76 - 64 / top} y2={76 - 64 / top} className="curve-target" />
        <path d={d} />
      </svg>
      <figcaption>Settles in {duration} ms</figcaption>
    </figure>
  );
}

export function MorphingButton() {
  const [state, setState] = useState<State>("idle");
  const [failNext, setFailNext] = useState(false);
  const [slow, setSlow] = useState(false);
  const [stiffness, setStiffness] = useState(320);
  const [damping, setDamping] = useState(24);
  const [widths, setWidths] = useState<Partial<Record<State, number>>>({});
  const measure = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const pace = slow ? 4 : 1;

  useEffect(() => {
    const read = () => {
      const next: Partial<Record<State, number>> = {};
      measure.current
        ?.querySelectorAll<HTMLElement>("[data-measure]")
        .forEach((el) => (next[el.dataset.measure as State] = el.offsetWidth));
      setWidths(next);
    };
    read();
    document.fonts?.ready.then(read);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms * pace));
  }
  function press() {
    if (state === "loading" || state === "done") return;
    setState("loading");
    later(() => {
      if (failNext) {
        setFailNext(false);
        setState("failed");
      } else {
        setState("done");
        later(() => setState("idle"), 1800);
      }
    }, 1400);
  }

  return (
    <ExperimentPage
      number="004"
      title="Morphing button"
      lead={
        <>
          One button, four states.
          <br />
          Tuned with real springs.
        </>
      }
      meta="4 states"
      notes={
        <p>
          Each change is one shape becoming another, not one button swapped for
          the next, so your eye never loses it. Stiffness is how hard the shape
          pulls toward its new size; damping is how quickly it settles. High
          stiffness with low damping overshoots and wobbles. Low stiffness with
          high damping drifts in slowly.
        </p>
      }
    >
      <section className="lab" aria-label="Morphing button experiment">
        <div className="lab-toolbar">
          <label className="lab-check">
            <input type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} />
            Make the next one fail
          </label>
          <label className="lab-check">
            <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} />
            Slow motion
          </label>
        </div>
        <div className="lab-stage morph-stage">
          <button
            type="button"
            className="morph"
            data-state={state}
            data-ready={widths[state] ? "" : undefined}
            aria-disabled={state === "loading" || state === "done"}
            onClick={press}
            style={{
              width: widths[state],
              ...springStyle(stiffness, damping, pace),
            }}
          >
            {states.map((s) => (
              <span key={s} className="morph-face" data-active={s === state} aria-hidden={s !== state}>
                {faces[s]}
              </span>
            ))}
          </button>
          <p className="sr-only" role="status">
            {announcements[state]}
          </p>
          <div className="morph-measure" ref={measure} aria-hidden="true">
            {states.map((s) => (
              <span key={s} className="morph" data-state={s} data-measure={s}>
                <span className="morph-face">{faces[s]}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="lab-controls morph-controls">
          <div className="morph-sliders">
            <label className="lab-field">
              <span>Stiffness {stiffness}</span>
              <input type="range" min={80} max={700} value={stiffness} onChange={(e) => setStiffness(Number(e.target.value))} />
            </label>
            <label className="lab-field">
              <span>Damping {damping}</span>
              <input type="range" min={6} max={50} value={damping} onChange={(e) => setDamping(Number(e.target.value))} />
            </label>
            <button
              type="button"
              className="link lab-reset"
              onClick={() => {
                setStiffness(320);
                setDamping(24);
              }}
            >
              Reset
            </button>
          </div>
          <Curve stiffness={stiffness} damping={damping} />
        </div>
      </section>
    </ExperimentPage>
  );
}

/* Previews for the Playground index -------------------------------- */

export function AspectRatioArt() {
  return (
    <div className="art-frame" style={{ ...bars(2.39), ...springStyle(170, 22) }}>
      <Scene />
      <span className="bar bar-top" />
      <span className="bar bar-bottom" />
      <span className="bar bar-left" />
      <span className="bar bar-right" />
    </div>
  );
}
export function VariableTypeArt() {
  return (
    <p className="art-word">
      {"Weight".split("").map((ch, i) => (
        <span key={i} style={{ "--i": i } as CSSProperties}>
          {ch}
        </span>
      ))}
    </p>
  );
}
export function MorphingButtonArt() {
  return (
    <span className="art-morph" style={springStyle(320, 24)}>
      <span className="art-morph-label">Publish entry</span>
      {spinner}
    </span>
  );
}
