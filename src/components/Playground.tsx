import type { ReactNode } from "react";
import { Intro, Section } from "./Layout";
import { href } from "@/lib/site";
import "./playground.css";
import { AspectRatioArt } from "./Experiments";

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
      <Section label="Experiments" count={1}>
        <div className="experiments">
          <ExperimentCard
            path="/playground/aspect-ratio/"
            title="Aspect ratio"
            blurb="Six ways to frame a film. Drag to see what each one hides."
            label="001 · Film"
            art={<AspectRatioArt />}
          />
        </div>
      </Section>
    </>
  );
}
