import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Intro, Section } from "./Layout";
import { href, useContent } from "@/lib/site";
import { spring } from "@/lib/spring";
import "./experiments.css";

const springStyle = (stiffness: number, damping: number, slow = 1) => {
  const s = spring(stiffness, damping);
  return {
    "--spring": s.easing,
    "--spring-ms": `${s.duration * slow}ms`,
  } as CSSProperties;
};

/* Text with line breaks, as typed in the admin */
const lines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {i ? <br /> : null}
      {line}
    </span>
  ));

export function ExperimentPage({
  number,
  title,
  lead,
  meta,
  notes,
  children,
}: {
  number: string;
  title: string;
  lead: string;
  meta: string;
  notes: string;
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
            <p className="statement secondary">{lines(lead)}</p>
          </div>
          <span className="label">
            Experiment {number} / {meta}
          </span>
        </div>
      </Intro>
      {children}
      <Section label="Notes">
        <div className="prose" dangerouslySetInnerHTML={{ __html: notes }} />
      </Section>
    </>
  );
}

/* Aspect ratio -------------------------------------------------- */

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
  const { aspect } = useContent().playground;
  const ratios = aspect.ratios;
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
      number="001"
      title={aspect.cardTitle}
      lead={aspect.lead}
      meta={`${ratios.length} ratios`}
      notes={aspect.notes}
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
      <Section>
        <div className="ratio-guide">
          {ratios.map((r) => (
            <article key={r.value} aria-current={preset?.value === r.value ? "true" : undefined}>
              <header>
                <h2>
                  {r.name}
                  <span>{r.note ? `${r.note}, ` : ""}{r.value.toFixed(2)}:1</span>
                </h2>
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
