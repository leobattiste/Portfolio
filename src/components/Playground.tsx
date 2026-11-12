import type { ReactNode } from "react";
import { Intro, Section } from "./Layout";
import { href } from "@/lib/site";
import { TurntableArt } from "./Albums";
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
            blurb="Twenty favorite records on a turntable you can play."
            label="001 · Music"
            art={<TurntableArt />}
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
