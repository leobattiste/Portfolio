export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  domain: string;
  category: string;
  tags: string[];
  featured: boolean;
  order: number;
  linkStatus: string;
}
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
  sections: { id: string; title: string; body: string }[];
  closing: string;
}
export interface Article {
  slug: string;
  title: string;
  description: string;
  topic: string;
  date: string;
  published: boolean;
  body: string;
  html: string;
  minutes: number;
}
