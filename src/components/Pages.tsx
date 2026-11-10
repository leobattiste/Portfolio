import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Shapes,
  Layers3,
  Palette,
  MousePointer2,
  Code2,
  BookOpen,
  Copy,
  Check,
  Globe,
  Code2 as Github,
  Heart,
  Plus,
  MoveUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  site,
  projects,
  articles,
  resources,
  asset,
  href,
  prettyDate,
} from "@/lib/site";
import type { Project, Article, Resource } from "@/types";
import {
  PageHeading,
  SectionHeading,
  ProjectCard,
  ResourceCard,
  ArticleRow,
  ContactBanner,
  BackLink,
  SaveButton,
} from "./Cards";
const highlights = resources.filter((r) => r.featured).slice(0, 3);
export function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="eyebrow">
          <span />
          INDEPENDENT MIND. INTENTIONAL DESIGN.
        </div>
        <h1>
          Thoughtful by design.
          <br />
          <span>Curious by nature.</span>
        </h1>
        <div className="hero-bottom">
          <p>
            I’m <strong>Leo Battiste</strong>, a product designer connecting
            <br className="wide-only" /> brands, digital experiences, and the
            people behind them.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <a href={href("/about/")}>
              A little about me
              <ArrowUpRight size={15} />
            </a>
          </Button>
        </div>
        <div className="hero-discipline">
          <span>
            <Palette size={13} />
            Brand identity
          </span>
          <i />
          <span>
            <MousePointer2 size={13} />
            Product design
          </span>
          <i />
          <span>
            <Code2 size={13} />
            Development
          </span>
        </div>
      </section>
      <section className="home-section">
        <SectionHeading
          number="01"
          label="Selected work"
          link="Explore work"
          to="/work/"
        />
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </section>
      <section className="home-section">
        <SectionHeading number="02" label="Beyond the work" />
        <div className="bento-grid">
          <Card className="about-bento">
            <div className="bento-copy">
              <span className="micro-label">THE PERSON BEHIND THE PIXELS</span>
              <h3>
                Hi, I’m Leo.
                <br />
                Good to have you here.
              </h3>
              <p>
                I care about the big picture
                <br />
                and the little things.
              </p>
              <a href={href("/about/")} className="quiet-link">
                Get to know me
                <ArrowUpRight size={14} />
              </a>
            </div>
            <img
              src={asset("portrait.jpg")}
              width="1280"
              height="1280"
              alt="Leo Battiste"
              loading="lazy"
            />
          </Card>
          <a className="toolbox-bento" href={href("/toolbox/")}>
            <div className="bento-top">
              <Shapes size={22} />
              <ArrowUpRight size={19} />
            </div>
            <span className="bento-number">
              {resources.length}
              <span>+</span>
            </span>
            <h3>Good finds, collected.</h3>
            <p>
              Tools and resources worth keeping.
              <br />
              And definitely worth sharing.
            </p>
          </a>
        </div>
      </section>
      <section className="home-section">
        <SectionHeading
          number="03"
          label="Notes along the way"
          link="The Journal"
          to="/journal/"
        />
        {articles.map((a) => (
          <ArticleRow key={a.slug} article={a} />
        ))}
      </section>
      <section className="home-section">
        <SectionHeading
          number="04"
          label="From the Toolbox"
          link="All resources"
          to="/toolbox/"
        />
        <div className="resource-grid">
          {highlights.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
export function About() {
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE ABOUT ME"
        title="A person behind the pixels."
        description="I’m Leo Battiste, a product designer bringing a considered eye and a curious mind to brands and digital experiences."
      />
      <section className="about-layout">
        <div className="about-photo">
          <img
            src={asset("portrait.jpg")}
            width="1280"
            height="1280"
            alt="Portrait of Leo Battiste"
          />
          <div>
            <span>LEO BATTISTE</span>
            <span>PRODUCT DESIGNER ↗</span>
          </div>
        </div>
        <div className="about-story">
          <Badge variant="outline">Brand × Product</Badge>
          <h2>
            Consider the whole.
            <br />
            Care for the details.
          </h2>
          <p>{site.bio}</p>
          <p>
            My work on Pheelm spans the name and logo through to the digital
            experience. It brings together a clear idea, a considered identity,
            and a product people can explore.
          </p>
          <p>
            This space is also home to my ongoing collection of tools and
            references. The Toolbox is a way to share useful things I’ve found
            along the way.
          </p>
          <Button asChild variant="outline">
            <a href={href("/work/pheelm/")}>
              Explore Pheelm
              <ArrowUpRight size={14} />
            </a>
          </Button>
        </div>
      </section>
      <section className="home-section">
        <SectionHeading number="01" label="A few things I care about" />
        <div className="principle-grid">
          {[
            {
              icon: MousePointer2,
              title: "Make room for clarity.",
              text: "Help people understand where they are, what matters, and what they can do next.",
            },
            {
              icon: Palette,
              title: "Connect brand and product.",
              text: "Let the idea behind a product show up in its identity and in the experience of using it.",
            },
            {
              icon: Shapes,
              title: "Stay curious.",
              text: "Keep exploring tools, references, and different ways of approaching a design problem.",
            },
          ].map((p) => (
            <Card key={p.title} className="principle-card">
              <p.icon size={21} />
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Card>
          ))}
        </div>
      </section>
      {site.resume ? (
        <Button asChild>
          <a href={href(site.resume)}>Download résumé</a>
        </Button>
      ) : null}
      <ContactBanner />
    </>
  );
}
export function Work() {
  return (
    <>
      <PageHeading
        eyebrow="SELECTED WORK"
        title="Ideas, made into experiences."
        description="A closer look at the products I’m shaping, from the first idea to the details that bring them to life."
      />
      <div className="work-index">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <div className="next-project">
        <span>
          <Plus size={22} />
        </span>
        <div>
          <h2>There’s more taking shape.</h2>
          <p>A considered collection, growing one project at a time.</p>
        </div>
        <Badge variant="outline">More soon</Badge>
      </div>
      <ContactBanner />
    </>
  );
}
export function ProjectPage({ project: p }: { project: Project }) {
  return (
    <>
      <BackLink to="/work/" label="All work" />
      <section className="project-heading">
        <div className="eyebrow">
          <span />
          BRAND & PRODUCT / {p.status.toUpperCase()}
        </div>
        <h1>
          {p.title}
          <span>.</span>
        </h1>
        <p>{p.subtitle}</p>
        <div className="project-actions">
          <Button asChild>
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
              Visit Pheelm
              <ArrowUpRight size={15} />
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
              View source
              <Github size={14} />
            </a>
          </Button>
        </div>
      </section>
      <figure className="case-cover">
        <img src={asset(p.cover)} width="1200" height="630" alt={p.coverAlt} />
        <figcaption>Pheelm · Brand artwork from the live product.</figcaption>
      </figure>
      <div className="case-facts">
        <div>
          <span>MY ROLE</span>
          <p>{p.role}</p>
        </div>
        <div>
          <span>PLATFORM</span>
          <p>{p.platform}</p>
        </div>
        <div>
          <span>EXPLORE</span>
          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
            pheelm.com
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
      <div className="reading-layout">
        <aside>
          <span className="micro-label">IN THIS PROJECT</span>
          {p.sections.map((s, i) => (
            <a key={s.id} href={"#" + s.id}>
              <span>0{i + 1}</span>
              {s.id[0].toUpperCase() + s.id.slice(1)}
            </a>
          ))}
        </aside>
        <article className="prose-content">
          {p.sections.map((s, i) => (
            <section key={s.id} id={s.id}>
              <span className="micro-label">
                0{i + 1} / {s.id.toUpperCase()}
              </span>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
              {s.id === "identity" ? (
                <div className="brand-study">
                  <span>pheelm</span>
                  <p>ONE IDENTITY. A WORLD OF STORIES.</p>
                  <div>
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ) : null}
            </section>
          ))}
          <Card className="case-note">
            <BookOpen size={19} />
            <div>
              <h3>A closer look, coming next.</h3>
              <p>{p.closing}</p>
            </div>
          </Card>
          <Button asChild>
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
              Explore the live product
              <ArrowUpRight size={15} />
            </a>
          </Button>
        </article>
      </div>
      <ContactBanner />
    </>
  );
}
export function Journal() {
  const [topic, setTopic] = useState("all");
  const topics = [...new Set(articles.map((a) => a.topic))];
  return (
    <>
      <PageHeading
        eyebrow="THE JOURNAL"
        title="Notes along the way."
        description="Thoughts on making things, resources worth returning to, and ideas that don’t quite fit in a case study."
      />
      <div className="journal-toolbar">
        <Tabs value={topic} onValueChange={setTopic}>
          <TabsList>
            <TabsTrigger value="all">All notes</TabsTrigger>
            {topics.map((t) => (
              <TabsTrigger key={t} value={t}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <a className="quiet-link" href={href("/feed.xml")}>
          Follow via RSS
          <ArrowUpRight size={14} />
        </a>
      </div>
      {articles
        .filter((a) => topic === "all" || a.topic === topic)
        .map((a) => (
          <ArticleRow key={a.slug} article={a} />
        ))}
      <div className="journal-note">
        <BookOpen size={18} />
        <p>
          A small notebook, with room to grow.
          <br />
          More thoughts will find their way here.
        </p>
      </div>
      <ContactBanner />
    </>
  );
}
function ShareButton() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info("Copy the address from your browser to share this page.");
    }
  }
  return (
    <Button variant="outline" onClick={copy}>
      {copied ? <Check size={14} /> : <Copy size={14} />}Copy link
    </Button>
  );
}
export function ArticlePage({ article: a }: { article: Article }) {
  return (
    <>
      <BackLink to="/journal/" label="All notes" />
      <section className="article-heading">
        <Badge variant="secondary">{a.topic}</Badge>
        <h1>{a.title}</h1>
        <p>{a.description}</p>
        <div className="author">
          <img src={asset("portrait.jpg")} alt="" width="32" height="32" />
          <span>Leo Battiste</span>
          <span>·</span>
          <time dateTime={a.date}>{prettyDate(a.date)}</time>
          <span>·</span>
          <span>{a.minutes} min read</span>
        </div>
      </section>
      <Separator />
      <div className="reading-layout">
        <aside>
          <span className="micro-label">IN THIS NOTE</span>
          {[...a.body.matchAll(/^## (.+)$/gm)].map((m) => (
            <a
              key={m[1]}
              href={
                "#" +
                m[1]
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")
              }
            >
              {m[1]}
            </a>
          ))}
          <ShareButton />
        </aside>
        <article
          className="prose-content article-prose"
          dangerouslySetInnerHTML={{ __html: a.html }}
        />
      </div>
      <div className="article-ending">
        <span>Thanks for reading.</span>
        <Button asChild variant="outline">
          <a href={href("/toolbox/")}>
            Explore the Toolbox
            <ArrowUpRight size={14} />
          </a>
        </Button>
      </div>
      <ContactBanner />
    </>
  );
}
export function ResourcePage({ resource: r }: { resource: Resource }) {
  return (
    <>
      <BackLink to="/toolbox/" label="The Toolbox" />
      <section className="resource-detail">
        <div className="resource-detail-mark">{r.title[0]}</div>
        <div className="eyebrow">{r.category}</div>
        <h1>{r.title}</h1>
        <p>{r.description}</p>
        <div className="resource-detail-actions">
          <Button asChild>
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              Visit resource
              <ArrowUpRight size={15} />
            </a>
          </Button>
          <SaveButton resource={r} full />
          <ShareButton />
        </div>
        <div className="resource-metadata">
          <div>
            <span>WEBSITE</span>
            <p>{r.domain}</p>
          </div>
          <div>
            <span>CATEGORY</span>
            <a
              href={href(
                "/toolbox/?category=" + encodeURIComponent(r.category),
              )}
            >
              {r.category}
            </a>
          </div>
          <div>
            <span>COLLECTION</span>
            <p>{r.featured ? "Highlight" : "Saved reference"}</p>
          </div>
        </div>
        <p className="resource-small-print">
          This resource belongs to its original maker. Visit their website for
          current features, pricing, and terms.
        </p>
      </section>
      <section className="home-section">
        <SectionHeading
          number="↗"
          label="A few related finds"
          link="All resources"
          to="/toolbox/"
        />
        <div className="resource-grid">
          {resources
            .filter((x) => x.id !== r.id && x.category === r.category)
            .slice(0, 3)
            .map((x) => (
              <ResourceCard key={x.id} resource={x} />
            ))}
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
export function Contact() {
  return (
    <>
      <PageHeading
        eyebrow="SAY HELLO"
        title="Good work starts with a conversation."
        description="A project you’re thinking about, a resource I should know, or just a good conversation. I’d love to connect."
      />
      <div className="contact-options">
        {site.email ? (
          <a href={"mailto:" + site.email}>
            <span>EMAIL</span>
            <h2>{site.email}</h2>
            <ArrowUpRight />
          </a>
        ) : null}
        <a href={site.github} target="_blank" rel="noopener noreferrer">
          <Github />
          <div>
            <span>FIND ME ON GITHUB</span>
            <h2>@leobattiste</h2>
            <p>Projects, experiments, and the things I’m building.</p>
          </div>
          <ArrowUpRight />
        </a>
        <a
          href="https://www.pheelm.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Globe />
          <div>
            <span>MY LATEST PROJECT</span>
            <h2>Pheelm</h2>
            <p>A home for discovering films by Black directors.</p>
          </div>
          <ArrowUpRight />
        </a>
      </div>
      <div className="contact-decoration">
        <span>
          Let’s make
          <br />
          something meaningful.
        </span>
        <MoveUpRight />
      </div>
    </>
  );
}
export function Privacy() {
  return (
    <>
      <PageHeading
        eyebrow="THE SMALL PRINT"
        title="A little clarity about privacy."
        description="A simple site, with a simple approach to your data."
      />
      <article className="prose-content legal-content">
        <h2>Your saved resources</h2>
        <p>
          Toolbox favorites are stored in your browser’s local storage. There is
          no portfolio account and no portfolio database receiving your
          favorites. Clear this site’s browser data to remove them. When storage
          is unavailable, favorites work for the current visit.
        </p>
        <h2>Import and export</h2>
        <p>
          Exporting creates a JSON file on your device. Importing reads that
          file locally in your browser. Your file is not uploaded to a server.
        </p>
        <h2>Appearance</h2>
        <p>
          Your light or dark appearance preference is saved locally in your
          browser.
        </p>
        <h2>Fonts, images, and links</h2>
        <p>
          Fonts and imagery are served with the site. The portfolio does not
          load analytics or advertising trackers. External websites have their
          own privacy practices.
        </p>
        <h2>Hosting and contact</h2>
        <p>
          The hosting service may process technical information needed to
          deliver the site, including network requests. Access follows the
          hosting service’s sharing settings. You can find me on{" "}
          <a href={site.github}>GitHub</a>.
        </p>
      </article>
    </>
  );
}
export function NotFound() {
  return (
    <div className="not-found">
      <span className="error-code">404</span>
      <PageHeading
        eyebrow="A LITTLE OFF TRACK"
        title="Let’s find your way back."
        description="That page may have moved, but there’s still plenty to explore."
      />
      <Button asChild>
        <a href={href("/")}>
          Back to the overview
          <ArrowRight size={14} />
        </a>
      </Button>
    </div>
  );
}
