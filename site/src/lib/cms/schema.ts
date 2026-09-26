import { z } from "zod";
import {
  servicePagesPreset,
  planningPreset,
  nextStepsPreset,
  collectionPreset,
} from "./presets";
export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
const text = z.string().trim().max(300);
const copy = z.string().trim().max(2000);
const image = z
  .string()
  .regex(/^\/(assets\/[a-zA-Z0-9/_.-]+|api\/media\/[a-z0-9-]+\.webp)$/)
  .max(300);
const link = z.union([
  z.literal(""),
  z.url().refine((v) => v.startsWith("https://"), "Use an https:// link"),
]);
const item = z.object({
  title: text.min(1),
  description: copy,
  image,
  category: text,
  alt: text.min(1),
});
const pair = z.object({ title: text.min(1), description: copy });
const galleryItem = item
  .extend({
    id: z
      .string()
      .regex(/^[a-z0-9-]*$/)
      .max(120)
      .default(""),
    keywords: copy.default(""),
    featured: z.boolean().default(false),
    completed: z.boolean().default(false),
    event: text.default(""),
    location: text.default(""),
    year: text.default(""),
  })
  .transform((v) => ({ ...v, id: v.id || slugify(v.title) }));
const servicePage = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(100),
  title: text.min(1),
  headline: text,
  description: copy,
  image,
  alt: text,
  category: text,
  scope: z.array(pair).min(1).max(12),
  budgetFactors: z.array(pair).min(1).max(12),
  deliverables: copy,
  enabled: z.boolean(),
});
export const contentSchema = z.object({
  brand: z.object({
    name: text.min(1),
    tagline: text,
    logo: image,
    ribbon: image.default("/assets/cinematic/gold-silk.webp"),
    bookingLabel: text.min(1),
    phone: z
      .string()
      .regex(/^[+\d\s()-]*$/)
      .max(30),
    email: z.union([z.literal(""), z.email()]),
    address: text,
    city: text,
    maps: link,
    whatsapp: z.string().regex(/^\d{0,15}$/),
    instagram: link,
    showMap: z.boolean().default(true),
  }),
  hero: z.object({
    enabled: z.boolean(),
    autoplay: z.boolean(),
    intervalSeconds: z.number().min(5).max(30),
    slides: z
      .array(
        z.object({
          eyebrow: text,
          title: text.min(1),
          accent: text,
          description: copy,
          image,
          alt: text.min(1),
          label: text,
          cta: text,
        }),
      )
      .min(1)
      .max(8),
  }),
  services: z.object({
    enabled: z.boolean(),
    eyebrow: text,
    title: text,
    description: copy,
    items: z
      .array(
        item.extend({
          serviceSlug: z
            .string()
            .regex(/^[a-z0-9-]*$/)
            .max(100)
            .default(""),
        }),
      )
      .min(1)
      .max(16),
  }),
  gallery: z.object({
    enabled: z.boolean(),
    eyebrow: text,
    title: text,
    description: copy,
    items: z
      .array(galleryItem)
      .min(1)
      .max(500)
      .refine(
        (items) => new Set(items.map((i) => i.id)).size === items.length,
        "Every photo must have a unique share ID.",
      ),
  }),
  servicePages: z
    .object({
      eyebrow: text,
      title: text,
      description: copy,
      items: z
        .array(servicePage)
        .min(1)
        .max(20)
        .refine(
          (items) => new Set(items.map((i) => i.slug)).size === items.length,
          "Every service needs a unique page address.",
        ),
    })
    .default(servicePagesPreset),
  planning: z
    .object({
      enabled: z.boolean(),
      eyebrow: text,
      title: text,
      description: copy,
      steps: z.array(pair).min(1).max(8),
      budgetTitle: text,
      budgetDescription: copy,
      budgetNote: copy,
      budgetItems: z.array(pair).min(1).max(8),
    })
    .default(planningPreset),
  nextSteps: z
    .object({
      enabled: z.boolean(),
      eyebrow: text,
      title: text,
      description: copy,
      items: z.array(pair).min(1).max(8),
    })
    .default(nextStepsPreset),
  collection: z
    .object({
      title: text,
      description: copy,
      featuredTitle: text,
      featuredDescription: copy,
      showFeatured: z.boolean(),
    })
    .default(collectionPreset),
  feature: z.object({
    enabled: z.boolean(),
    eyebrow: text,
    title: text,
    description: copy,
    image,
    alt: text,
    cta: text,
  }),
  process: z.object({
    enabled: z.boolean(),
    eyebrow: text,
    title: text,
    description: copy,
    image,
    steps: z
      .array(z.object({ title: text.min(1), description: copy }))
      .min(1)
      .max(8),
  }),
  faq: z.object({
    enabled: z.boolean(),
    eyebrow: text,
    title: text,
    items: z.array(z.object({ question: text.min(1), answer: copy })).max(15),
  }),
  contact: z.object({
    enabled: z.boolean(),
    eyebrow: text,
    title: text,
    description: copy,
    image,
    cta: text,
  }),
  footer: z.object({ tagline: text, imageryNote: copy }),
});
export type SiteContent = z.infer<typeof contentSchema>;
export type CmsDocument = {
  draft: SiteContent;
  published: SiteContent;
  updatedAt: string;
  publishedAt: string;
};

export type GalleryItem = SiteContent["gallery"]["items"][number];
export type ServicePage = SiteContent["servicePages"]["items"][number];
