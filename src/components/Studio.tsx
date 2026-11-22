import type { ReactNode } from "react";
import { Intro, Section } from "./Layout";
import { href, useContent } from "@/lib/site";
import "./playground.css";
import { ProjectLink } from "./Pages";
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

export function Studio() {
  const { projects, playground } = useContent();
  const { aspect } = playground;
  return (
    <>
      <Intro>
        <h1 className="statement">{playground.title}</h1>
        <p className="project-description">{playground.intro}</p>
      </Intro>
      <Section label="Projects" count={projects.length}>
        {projects.map((project) => (
          <ProjectLink key={project.slug} project={project} />
        ))}
      </Section>
      <Section label="Experiments" count={1}>
        <div className="experiments">
          <ExperimentCard
            path="/studio/aspect-ratio/"
            title={aspect.cardTitle}
            blurb={aspect.cardBlurb}
            label="001 · Film"
            art={<AspectRatioArt />}
          />
        </div>
      </Section>
    </>
  );
}
