export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  published: boolean;
  cover: string;
  coverAlt: string;
  disciplines: string[];
  role: string;
  platform: string;
  status: string;
  liveUrl: string;
  sourceUrl: string;
  html: string;
  order: number;
}
export interface Article {
  slug: string;
  title: string;
  description: string;
  topic: string;
  date: string;
  published: boolean;
  html: string;
  minutes: number;
}
export interface About {
  statement: string;
  html: string;
  portrait: string;
  disciplines: string[];
}
export interface PlaygroundRatio {
  value: number;
  name: string;
  note?: string;
  film: string;
  essay: string[];
  fact: string;
}
export interface Playground {
  title: string;
  intro: string;
  description: string;
  aspect: {
    cardTitle: string;
    cardBlurb: string;
    lead: string;
    description: string;
    notes: string;
    ratios: PlaygroundRatio[];
  };
}
export interface Content {
  projects: Project[];
  articles: Article[];
  about: About;
  playground: Playground;
}
