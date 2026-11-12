import { useState, type CSSProperties, type FormEvent, type PointerEvent } from "react";
import {
  site,
  useContent,
  media,
  href,
  host,
  prettyDate,
} from "@/lib/site";
import { sendMessage } from "@/lib/backend";
import type { Project, Article } from "@/types";
import { Intro, Section } from "./Layout";

const external = { target: "_blank", rel: "noopener noreferrer" };
// The same name on a cover across pages lets the browser move it between them.
const shared = (p: Project) =>
  ({ viewTransitionName: `cover-${p.slug}` }) as CSSProperties;

function follow(event: PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - box.top}px`);
}

function Breadcrumbs({ section, title }: { section: "Work" | "Journal"; title: string }) {
  const sectionPath = section === "Work" ? "/work/" : "/journal/";
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href={href("/")}>Home</a></li>
        <li><a href={href(sectionPath)}>{section}</a></li>
        <li aria-current="page">{title}</li>
      </ol>
    </nav>
  );
}

function ProjectLink({ project: p }: { project: Project }) {
  return (
    <a className="project" href={href(`/work/${p.slug}/`)}>
      {p.cover ? (
        <span className="cover" style={shared(p)} onPointerMove={follow}>
          <img src={media(p.cover)} width="1200" height="630" alt={p.coverAlt} />
          <span className="cover-chip" aria-hidden="true">
            Read the case study
          </span>
        </span>
      ) : null}
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
      {items.map((a, i) => (
        <li key={a.slug}>
          <a className="line article-line" href={href(`/journal/${a.slug}/`)}>
            <span className="article-list-heading">
              <span className="line-title">
                <span className="article-no">{items.length - i}.</span>
                {a.title}
              </span>
              <time className="article-list-date" dateTime={a.date}>
                {prettyDate(a.date)}
              </time>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

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
            <span className="line-end">
              @{site.instagram.replace(/\/$/, "").split("/").pop()}
            </span>
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

function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    // A field people never see. Only automated senders fill it in.
    if (data.get("company")) return setState("sent");
    setState("sending");
    try {
      await sendMessage({
        name: String(data.get("name")).trim(),
        email: String(data.get("email")).trim(),
        message: String(data.get("message")).trim(),
      });
      form.reset();
      setState("sent");
    } catch {
      setState("failed");
    }
  }
  if (state === "sent")
    return (
      <p className="form-note" role="status">
        Message sent. I’ll reply to the email address you gave.
      </p>
    );
  return (
    <form className="form" onSubmit={submit}>
      <label>
        <span>Name</span>
        <input name="name" required maxLength={120} autoComplete="name" />
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" required maxLength={200} autoComplete="email" />
      </label>
      <label>
        <span>Message</span>
        <textarea name="message" required maxLength={5000} rows={6} />
      </label>
      <input className="trap" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="form-end">
        <button className="button" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending" : "Send message"}
        </button>
        {state === "failed" ? (
          <p className="form-note" role="alert">
            The message didn’t send. Try again, or email {site.email}.
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function Contact() {
  return (
    <>
      <Intro>
        <h1 className="statement">Contact</h1>
      </Intro>
      <Section label="Send a message">
        <ContactForm />
      </Section>
      <Section label="Elsewhere">
        <ContactLines />
      </Section>
    </>
  );
}

export function Home() {
  const { projects, articles } = useContent();
  const [lead] = projects;
  const [latest] = articles;
  return (
    <>
      <div className="home-hero">
        <Intro>
          <h1 className="statement">
            I’m {site.name}, a {site.role.toLowerCase()} based in {site.location}.
          </h1>
          <p className="statement">
            I enjoy creating digital products that solve everyday problems and
            bring people together.
          </p>
          <p className="statement">
            Explore my{" "}
            <a className="peek-link" href={href("/work/")}>
              work
              {lead?.cover ? (
                <span className="peek" aria-hidden="true">
                  <img src={media(lead.cover)} width="1200" height="630" alt="" />
                </span>
              ) : null}
            </a>
            , read what’s on my mind in the{" "}
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
            , or visit the{" "}
            <a className="peek-link" href={href("/playground/")}>
              playground
              <span className="peek" aria-hidden="true">
                <span className="peek-text">
                  <strong>Aspect ratio</strong>
                  A guide to how films are framed
                </span>
              </span>
            </a>{" "}
            for personal projects and creative explorations.
          </p>
        </Intro>
      </div>
    </>
  );
}

export function Work() {
  const { projects } = useContent();
  return (
    <>
      <Intro>
        <h1 className="statement">Work</h1>
      </Intro>
      <Section>
        {projects.map((p) => (
          <ProjectLink key={p.slug} project={p} />
        ))}
      </Section>
    </>
  );
}

export function ProjectPage({ project: p }: { project: Project }) {
  const facts = [
    ["Role", p.role],
    ["Platform", p.platform],
    ["Status", p.status],
    ["Disciplines", p.disciplines.join(", ")],
  ].filter(([, value]) => value);
  return (
    <article>
      <Intro>
        <Breadcrumbs section="Work" title={p.title} />
        <h1 className="statement">{p.title}</h1>
        <p className="project-description">{p.description}</p>
      </Intro>
      {p.cover ? (
        <div className="row cover-block">
          <div className="rail-empty" />
          <figure className="cover" style={shared(p)}>
            <img src={media(p.cover)} width="1200" height="630" alt={p.coverAlt} />
          </figure>
        </div>
      ) : null}
      <section className="row section" aria-label="Project information">
        <div className="rail-empty" />
        <div>
          <dl className="facts">
          {facts.map(([name, value]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          {p.liveUrl || p.sourceUrl ? (
            <div>
              <dt>Link</dt>
              <dd>
                {p.liveUrl ? (
                  <a className="link" href={p.liveUrl} {...external}>
                    {host(p.liveUrl)}
                  </a>
                ) : null}
                {p.sourceUrl ? (
                  <a className="link" href={p.sourceUrl} {...external}>
                    Source code
                  </a>
                ) : null}
              </dd>
            </div>
          ) : null}
          </dl>
        </div>
      </section>
      {p.html ? (
        <Section label="Case study">
          <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
        </Section>
      ) : null}
    </article>
  );
}

export function Journal() {
  const { articles } = useContent();
  return (
    <>
      <Intro>
        <h1 className="statement">Journal</h1>
      </Intro>
      <Section>
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
      <Intro>
        <Breadcrumbs section="Journal" title={a.title} />
        <h1 className="statement">{a.title}</h1>
        <time className="article-date" dateTime={a.date}>
          {prettyDate(a.date)}
        </time>
        {a.description ? <p className="statement">{a.description}</p> : null}
      </Intro>
      <div className="row section">
        <div className="meta">
          <span>{a.minutes} min read</span>
          {a.topic ? <span>{a.topic}</span> : null}
        </div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: a.html }} />
      </div>
    </article>
  );
}

export function About() {
  const { about } = useContent();
  return (
    <>
      <Intro>
        <h1 className="statement">About</h1>
      </Intro>
      <div className="row section">
        {about.portrait ? (
          <img
            className="portrait"
            src={media(about.portrait)}
            width="1280"
            height="1280"
            alt={`Portrait of ${site.name}`}
          />
        ) : (
          <div className="rail-empty" />
        )}
        <div className="prose" dangerouslySetInnerHTML={{ __html: about.html }} />
      </div>
      {about.disciplines.length ? (
        <Section label="What I do">
          <ul className="lines">
            {about.disciplines.map((d) => (
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
