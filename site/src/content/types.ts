import type { PhotoKey } from "@/lib/photos";

export type Accent = "gold" | "rose" | "sage" | "burgundy" | "forest" | "coast";

export type ProcessStep = {
  title: string;
  description: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type Service = {
  slug: string;
  name: string;
  cardSummary: string;
  icon: string;
  accent: Accent;
  /** Licensed stock photo key used as the page-hero atmosphere */
  heroPhoto: PhotoKey;
  /** 16:9 illustrated hero, kept for in-page editorial use */
  heroImage: string;
  /** 3:4 portrait counterpart for narrow screens */
  heroImageMobile: string;
  /** 3:2 concept illustration used on cards and in-page */
  conceptImage: string;
  heroHeadline: string;
  heroDescription: string;
  metaDescription: string;
  scope: string[];
  process: ProcessStep[];
  faqs: Faq[];
  relatedEventSlugs: string[];
};

export type EventCategory =
  | "wedding-planning"
  | "navratri-events"
  | "corporate-events"
  | "hospitality-management"
  | "custom-decor"
  | "destination-events"
  | "private-celebrations";

export type EventEntry = {
  slug: string;
  title: string;
  category: EventCategory;
  featured: boolean;
  /** Every entry is illustrated concept work, never a photographed project. */
  status: "concept";
  publishedAt: string;
  summary: string;
  description: string;
  image: string;
  gallery: string[];
};
