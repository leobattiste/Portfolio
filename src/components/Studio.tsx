import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { Intro, Section } from "./Layout";
import { href, media, useContent } from "@/lib/site";
import { AspectRatioArt } from "./Experiments";
import "./studio.css";

function follow(event: PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - box.top}px`);
}

function StudioCard({
  path,
  title,
  summary,
  coverStyle,
  children,
}: {
  path: string;
  title: string;
  summary: string;
  coverStyle?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <a className="project studio-card" href={href(path)}>
      {children ? (
        <div className="cover studio-visual" style={coverStyle} onPointerMove={follow}>
          {children}
          <span className="cover-chip" aria-hidden="true">View project</span>
        </div>
      ) : null}
      <div className="line">
        <h2 className="studio-card-title">{title}</h2>
        <span className="line-note">{summary}</span>
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
      <Section>
        <ul className="studio-items" aria-label="Studio">
          {projects.map((project) => (
            <li key={project.slug}>
              <StudioCard
                path={`/studio/${project.slug}/`}
                title={project.title}
                summary={project.subtitle}
                coverStyle={{ viewTransitionName: `cover-${project.slug}` }}
              >
                {project.cover ? (
                  <img src={media(project.cover)} width="1200" height="630" alt={project.coverAlt} />
                ) : null}
              </StudioCard>
            </li>
          ))}
          <li>
            <StudioCard
              path="/studio/aspect-ratio/"
              title={aspect.cardTitle}
              summary={aspect.cardBlurb}
            >
              <div className="studio-art" aria-hidden="true"><AspectRatioArt /></div>
            </StudioCard>
          </li>
        </ul>
      </Section>
    </>
  );
}
