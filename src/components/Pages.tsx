import type { CSSProperties, PointerEvent } from "react";
import {
  site,
  projects,
  articles,
  resources,
  asset,
  href,
  host,
  prettyDate,
} from "@/lib/site";
import type { Project, Article } from "@/types";
import { Intro, Section } from "./Layout";

const external = { target: "_blank", rel: "noopener noreferrer" };
const highlights = resources.filter((r) => r.featured);
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// The same name on a cover across pages lets the browser move it between them.
const shared = (p: Project) =>
  ({ viewTransitionName: `cover-${p.slug}` }) as CSSProperties;

function follow(event: PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - box.top}px`);
}

function ProjectLink({ project: p }: { project: Project }) {
  return (
    <a className="project" href={href(`/work/${p.slug}/`)}>
      <span className="cover" style={shared(p)} onPointerMove={follow}>
        <img src={asset(p.cover)} width="1200" height="630" alt={p.coverAlt} />
        <span className="cover-chip" aria-hidden="true">
          Read the case study
        </span>
      </span>
      <span className="line">
        <span className="line-title">{p.title}</span>
        <span className="line-note">{p.subtitle}</span>
      </span>
    </a>
  );
}

function ArticleLines({ items }: { items: Article[] }) {
  return (
    <ul className="lines">
      {items.map((a) => (
        <li key={a.slug}>
          <a className="line" href={href(`/journal/${a.slug}/`)}>
            <span className="line-title">{a.title}</span>
            <time className="line-end" dateTime={a.date}>
              {prettyDate(a.date)}
            </time>
          </a>
        </li>
      ))}
    </ul>
  );
}

const handle = (url: string) =>
  "@" + new URL(url).pathname.replace(/\//g, "");

function ContactLines() {
  return (
    <ul className="lines">
      <li>
        <a className="line" href={`mailto:${site.email}`}>
          <span className="line-title">Email</span>
          <span className="line-end">{site.email}</span>
        </a>
      </li>
      {site.instagram ? (
        <li>
          <a className="line" href={site.instagram} {...external}>
            <span className="line-title">Instagram</span>
            <span className="line-end">{handle(site.instagram)}</span>
          </a>
        </li>
      ) : null}
      {site.resume ? (
        <li>
          <a className="line" href={href(site.resume)}>
            <span className="line-title">Résumé</span>
            <span className="line-end">PDF</span>
          </a>
        </li>
      ) : null}
    </ul>
  );
}

export function Contact() {
  return (
    <>
      <Intro>
        <h1 className="statement">Contact</h1>
        <p className="statement">
          For projects, questions or a hello, email is the best way to reach
          me.
        </p>
      </Intro>
      <Section label="Reach me">
        <ContactLines />
      </Section>
    </>
  );
}

export function Home() {
  const [lead] = projects;
  const [latest] = articles;
  return (
    <Intro>
      <h1 className="statement">
        I’m {site.name}, a {site.role.toLowerCase()} based in {site.location}.
      </h1>
      <p className="statement">
        I enjoy turning ideas into intuitive, thoughtful digital experiences.
        Here, you can explore my{" "}
        <a className="peek-link" href={href("/work/")}>
          work
          {lead ? (
            <span className="peek" aria-hidden="true">
              <img src={asset(lead.cover)} width="1200" height="630" alt="" />
            </span>
          ) : null}
        </a>
        , read my thoughts and experiences in my{" "}
        <a className="peek-link" href={href("/journal/")}>
          journal
          {latest ? (
            <span className="peek" aria-hidden="true">
              <span className="peek-text">
                <strong>{latest.title}</strong>
                {prettyDate(latest.date)}
              </span>
            </span>
          ) : null}
        </a>
        , and check out the tools and resources I use in my{" "}
        <a className="peek-link" href={href("/toolbox/")}>
          toolbox
          <span className="peek" aria-hidden="true">
            <span className="peek-text">
              <strong>
                {highlights
                  .slice(0, 3)
                  .map((r) => r.title)
                  .join(", ")}
              </strong>
              and {resources.length - 3} more links
            </span>
          </span>
        </a>
        .
      </p>
    </Intro>
  );
}

export function Work() {
  return (
    <>
      <Intro>
        <h1 className="statement">Work</h1>
        <p className="statement">
          Products I’ve designed and built.{" "}
          {projects.length === 1
            ? "One is public so far, and more are on the way."
            : null}
        </p>
      </Intro>
      <Section label="Projects" count={projects.length}>
        {projects.map((p) => (
          <ProjectLink key={p.slug} project={p} />
        ))}
      </Section>
    </>
  );
}

export function ProjectPage({ project: p }: { project: Project }) {
  return (
    <article>
      <Intro
        rail={
          <a className="back" href={href("/work/")}>
            All work
          </a>
        }
      >
        <h1 className="statement">{p.title}</h1>
        <p className="statement">{p.description}</p>
      </Intro>
      <div className="row cover-block">
        <div className="rail-empty" />
        <figure className="cover" style={shared(p)}>
          <img src={asset(p.cover)} width="1200" height="630" alt={p.coverAlt} />
        </figure>
      </div>
      <Section label="Details">
        <dl className="facts">
          <dt>Role</dt>
          <dd>{p.role}</dd>
          <dt>Platform</dt>
          <dd>{p.platform}</dd>
          <dt>Status</dt>
          <dd>{p.status}</dd>
          {p.liveUrl || p.sourceUrl ? (
            <>
              <dt>Links</dt>
              <dd>
                {p.liveUrl ? (
                  <a className="link" href={p.liveUrl} {...external}>
                    {host(p.liveUrl)}
                  </a>
                ) : null}
                {p.sourceUrl ? (
                  <a className="link" href={p.sourceUrl} {...external}>
                    Source on GitHub
                  </a>
                ) : null}
              </dd>
            </>
          ) : null}
        </dl>
      </Section>
      {p.sections.map((s) => (
        <Section key={s.id} label={capital(s.id)}>
          <div className="prose">
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        </Section>
      ))}
      {p.closing ? (
        <Section label="Next">
          <p className="prose muted">{p.closing}</p>
        </Section>
      ) : null}
    </article>
  );
}

export function Journal() {
  return (
    <>
      <Intro>
        <h1 className="statement">Journal</h1>
        <p className="statement">
          Notes on what I’m making and what I’m learning from it.
        </p>
      </Intro>
      <Section label="Entries" count={articles.length}>
        {articles.length ? (
          <ArticleLines items={articles} />
        ) : (
          <p className="muted">Nothing published yet.</p>
        )}
      </Section>
    </>
  );
}

export function ArticlePage({ article: a }: { article: Article }) {
  return (
    <article>
      <Intro
        rail={
          <a className="back" href={href("/journal/")}>
            All entries
          </a>
        }
      >
        <h1 className="statement">{a.title}</h1>
        <p className="statement">{a.description}</p>
      </Intro>
      <div className="row section">
        <div className="meta">
          <time dateTime={a.date}>{prettyDate(a.date)}</time>
          <span>{a.minutes} min read</span>
        </div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: a.html }} />
      </div>
    </article>
  );
}

export function About() {
  const [lead] = projects;
  const disciplines = [...new Set(projects.flatMap((p) => p.disciplines))];
  return (
    <>
      <Intro>
        <h1 className="statement">
          I work across brand and product, so how something looks and how it
          works come from the same place.
        </h1>
      </Intro>
      <div className="row section">
        <img
          className="portrait"
          src={asset("portrait.jpg")}
          width="1280"
          height="1280"
          alt={`Portrait of ${site.name}`}
        />
        <div className="prose">
          <p>
            I’m {site.name}, a {site.role.toLowerCase()}
            {site.location ? ` based in ${site.location}` : ""}. I like owning a
            product from the first idea to the shipped code, because the
            decisions that matter most tend to fall between disciplines.
          </p>
          {lead ? (
            <p>
              {lead.title} is the clearest example. It started as a name, became
              a logo and an identity, and then a product I designed and built
              myself. You can{" "}
              <a href={href(`/work/${lead.slug}/`)}>read the case study</a> or{" "}
              <a href={lead.liveUrl} {...external}>
                visit the live site
              </a>
              .
            </p>
          ) : null}
          <p>
            I’m also a collector. The{" "}
            <a href={href("/toolbox/")}>toolbox</a> holds {resources.length}{" "}
            tools and references I’ve saved over the years, shared in case
            they’re useful to you too.
          </p>
          {site.availability ? <p>{site.availability}</p> : null}
        </div>
      </div>
      {disciplines.length ? (
        <Section label="What I do">
          <ul className="lines">
            {disciplines.map((d) => (
              <li className="line" key={d}>
                <span className="line-title">{d}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
      <Section label="Contact">
        <ContactLines />
      </Section>
    </>
  );
}

export function Privacy() {
  return (
    <>
      <Intro>
        <h1 className="statement">Privacy</h1>
        <p className="statement">
          This site has no accounts, no analytics and no advertising trackers.
        </p>
      </Intro>
      <Section label="Saved links">
        <p className="prose">
          Links you save in the Toolbox are stored in your browser’s local
          storage. Nothing is sent to a server. Clear this site’s browser data
          to remove them. When storage is unavailable, saved links last for the
          current visit only.
        </p>
      </Section>
      <Section label="Import and export">
        <p className="prose">
          Exporting creates a JSON file on your device. Importing reads that
          file in your browser. The file is never uploaded.
        </p>
      </Section>
      <Section label="Appearance">
        <p className="prose">
          Your light or dark theme choice is saved in your browser.
        </p>
      </Section>
      <Section label="Fonts and links">
        <p className="prose">
          Fonts and images are served with the site. External websites have
          their own privacy practices.
        </p>
      </Section>
      <Section label="Hosting">
        <p className="prose">
          The hosting service may process technical information needed to
          deliver the site, such as network requests. You can reach me at{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </Section>
    </>
  );
}

export function NotFound() {
  return (
    <Intro>
      <h1 className="statement">This page doesn’t exist.</h1>
      <p className="statement">
        It may have moved. Start again from the{" "}
        <a href={href("/")}>home page</a>, or look through the{" "}
        <a href={href("/work/")}>work</a>.
      </p>
    </Intro>
  );
}
