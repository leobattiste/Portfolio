import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { asset, href, prettyDate } from "@/lib/site";
import { useFavorites } from "@/lib/favorites";
import type { Resource, Project, Article } from "@/types";
export function SectionHeading({
  number,
  label,
  link,
  to,
}: {
  number: string;
  label: string;
  link?: string;
  to?: string;
}) {
  return (
    <div className="section-heading">
      <h2>
        <span>{number}</span>
        {label}
      </h2>
      {link && to ? (
        <a className="quiet-link" href={href(to)}>
          {link}
          <ArrowUpRight size={14} />
        </a>
      ) : null}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-heading">
      <div className="eyebrow">
        <span />
        {eyebrow}
      </div>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {children}
    </section>
  );
}
export function ProjectCard({ project: p }: { project: Project }) {
  return (
    <Card className="project-card">
      <a className="project-art" href={href("/work/" + p.slug + "/")}>
        <img
          src={asset(p.cover)}
          width="1200"
          height="630"
          alt={p.coverAlt}
          loading="lazy"
        />
        <span className="project-open">
          <ArrowUpRight size={20} />
          <span className="sr-only">Explore {p.title}</span>
        </span>
      </a>
      <div className="project-info">
        <div className="project-name">
          <h3>
            <a href={href("/work/" + p.slug + "/")}>{p.title}</a>
          </h3>
          <p>{p.subtitle}</p>
        </div>
        <div className="project-tags">
          {p.disciplines.slice(0, 2).map((d) => (
            <Badge key={d} variant="secondary">
              {d}
            </Badge>
          ))}
          <span className="live-label">
            <i />
            Live
          </span>
        </div>
      </div>
    </Card>
  );
}
export function SaveButton({
  resource: r,
  full = false,
}: {
  resource: Resource;
  full?: boolean;
}) {
  const { saved, toggle } = useFavorites(),
    on = saved.has(r.id);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={full ? "outline" : "ghost"}
          size={full ? "default" : "icon"}
          className={on ? "is-saved" : ""}
          aria-label={`${on ? "Unsave" : "Save"} ${r.title}`}
          aria-pressed={on}
          onClick={() => toggle(r.id)}
        >
          <Heart size={16} fill={on ? "currentColor" : "none"} />
          {full ? (on ? "Saved" : "Save resource") : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {on ? "Remove from favorites" : "Save for later"}
      </TooltipContent>
    </Tooltip>
  );
}
export function ResourceCard({
  resource: r,
  list = false,
}: {
  resource: Resource;
  list?: boolean;
}) {
  return (
    <Card className={`resource-card ${list ? "resource-list-card" : ""}`}>
      <div className="resource-head">
        <a
          className="resource-monogram"
          href={href("/toolbox/" + r.id + "/")}
          aria-hidden="true"
          tabIndex={-1}
        >
          {r.title[0].toUpperCase()}
        </a>
        <SaveButton resource={r} />
      </div>
      <div className="resource-copy">
        <h3>
          <a href={href("/toolbox/" + r.id + "/")}>{r.title}</a>
        </h3>
        <p>{r.description}</p>
      </div>
      <div className="resource-foot">
        <a href={href("/toolbox/?category=" + encodeURIComponent(r.category))}>
          {r.category}
        </a>
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${r.title} (opens in a new tab)`}
        >
          <ArrowUpRight size={16} />
        </a>
      </div>
    </Card>
  );
}
export function ArticleRow({ article: a }: { article: Article }) {
  return (
    <a href={href("/journal/" + a.slug + "/")} className="article-row">
      <div className="article-icon">
        <Bookmark size={20} />
      </div>
      <div>
        <div className="article-meta">
          <span>{a.topic}</span>
          <span>·</span>
          <span>{a.minutes} min read</span>
        </div>
        <h3>{a.title}</h3>
        <p>{a.description}</p>
      </div>
      <span className="article-date">{prettyDate(a.date)}</span>
      <ArrowUpRight className="article-arrow" size={20} />
    </a>
  );
}
export function ContactBanner() {
  return (
    <section className="contact-banner">
      <div>
        <span className="eyebrow">LET’S MAKE SOMETHING GOOD.</span>
        <h2>It starts with a conversation.</h2>
        <p>A new idea, a thoughtful collaboration, or simply a hello.</p>
      </div>
      <Button asChild className="rounded-full">
        <a href={href("/contact/")}>
          Let’s connect
          <ArrowUpRight size={15} />
        </a>
      </Button>
    </section>
  );
}
export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <a className="back-link" href={href(to)}>
      <ArrowRight size={13} className="rotate-180" />
      {label}
    </a>
  );
}
