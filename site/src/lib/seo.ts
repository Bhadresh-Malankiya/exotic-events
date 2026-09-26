import { site } from "@/content/site";

/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in the deploy environment once
 * the real domain is live — canonicals and sitemap entries follow it. The
 * localhost fallback keeps dev honest rather than baking in a guessed domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Organization + website graph. Only facts we can actually stand behind. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.fullName,
    alternateName: site.name,
    url: SITE_URL,
    description: site.description,
    logo: absoluteUrl("/assets/exotic/logos/emblem-gold.png"),
    telephone: '+91 99096 15585',
    address: { '@type':'PostalAddress', streetAddress:'S-41, Nilkanth Business Hub, Singanpor', addressLocality:'Surat', addressRegion:'Gujarat', postalCode:'395004', addressCountry:'IN' },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.fullName,
    url: SITE_URL,
    inLanguage: "en",
  };
}

export function serviceJsonLd({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    url: absoluteUrl(`/services/${slug}`),
    provider: {
      "@type": "Organization",
      name: site.fullName,
      url: SITE_URL,
    },
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
