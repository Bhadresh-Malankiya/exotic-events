import { ResponsivePhoto } from "@/components/ui/ResponsivePhoto";
import { LineIcon } from "@/components/ui/LineIcon";

import { JsonLd } from "@/components/seo/JsonLd";
import { serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import Link from "next/link";
import { getWorkspace } from "@/lib/business/store";
import { EstimateCalculator } from "@/components/portfolio/EstimateCalculator";
import { notFound } from "next/navigation";
import { getPublicDocument as getDocument } from "@/lib/business/public-content";
import {
  PortfolioHeader,
  PortfolioFooter,
} from "@/components/portfolio/SiteChrome";
import {
  PlanningJourney,
  NextSteps,
} from "@/components/portfolio/PlanningContent";
import { EnquiryDialog } from "@/components/forms/EnquiryDialog";
import "../../immersive.css";
import "../../portfolio.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { value } = await getDocument();
  const s = value.published.servicePages.items.find(
    (i) => i.slug === slug && i.enabled,
  );
  return s
    ? {
        title: s.title,
        description: s.description,
        alternates: { canonical: `/services/${s.slug}` },
        openGraph: {
          images: [s.image],
          title: s.headline,
          description: s.description,
        },
      }
    : {};
}
export default async function Service({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { value } = await getDocument();
  const c = value.published,
    s = c.servicePages.items.find((i) => i.slug === slug && i.enabled);
  if (!s) notFound();
  const { value: workspace } = await getWorkspace();
  const calculator = workspace.estimates.find(
    (p) => p.serviceSlug === s.slug && p.enabled,
  );
  const related = c.gallery.items
    .filter((i) => i.category.toLowerCase() === s.category.toLowerCase())
    .slice(0, 4);
  return (
    <div className="exotic-site p-site">
      <JsonLd
        data={serviceJsonLd({
          name: s.title,
          description: s.description,
          slug: s.slug,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: s.title, path: `/services/${s.slug}` },
        ])}
      />
      <PortfolioHeader brand={c.brand} />
      <section className="p-service-hero">
        <ResponsivePhoto src={s.image} alt={s.alt} />
        <div>
          <Link href="/services" className="p-back">
            <LineIcon name="back" /> All services
          </Link>
          <p className="x-kicker">{s.title}</p>
          <h1>{s.headline}</h1>
          <p>{s.description}</p>
          <div className="x-actions">
            <EnquiryDialog
              triggerLabel="Plan Your Event →"
              triggerClassName="x-button x-button-gold"
              initialMessage={`I would like to discuss ${s.title.toLowerCase()}.\n\nMy event plans: `}
            />
            <Link
              href={`/gallery?category=${encodeURIComponent(s.category)}`}
              className="x-button x-button-glass"
            >
              Explore Related Photos <LineIcon name="diagonal" />
            </Link>
          </div>
        </div>
      </section>
      <section className="p-scope">
        <div className="p-split-heading">
          <div>
            <p className="x-kicker">How we can help</p>
            <h2>
              Every detail.
              <br />
              One connected experience.
            </h2>
          </div>
          <p className="x-description">
            Choose the support you need. Your final scope is tailored to the
            occasion, the venue, and your priorities.
          </p>
        </div>
        <div className="p-scope-grid">
          {s.scope.map((item, i) => (
            <article key={i}>
              <span>0{i + 1}</span>
              <h3>{item.title}</h3>
              <details>
                <summary>What’s included</summary>
                <p>{item.description}</p>
              </details>
            </article>
          ))}
        </div>
      </section>
      <section className="p-service-budget">
        <div>
          <p className="x-kicker">Let’s talk budget</p>
          <h2>
            What goes into
            <br />
            your quotation?
          </h2>
          <p>{s.deliverables}</p>
          <Link href="/planning#budget" className="x-text-link">
            See our approach to budgets <LineIcon name="diagonal" />
          </Link>
        </div>
        <div>
          {s.budgetFactors.map((b, i) => (
            <article key={i}>
              <span>0{i + 1}</span>
              <div>
                <details>
                  <summary>{b.title}</summary>
                  <p>{b.description}</p>
                </details>
              </div>
            </article>
          ))}
        </div>
      </section>
      {calculator && <EstimateCalculator profile={calculator} />}
      {c.planning.enabled && <PlanningJourney content={c} compact />}
      {related.length > 0 && (
        <section className="p-related-section">
          <div className="p-split-heading">
            <div>
              <p className="x-kicker">See the possibilities</p>
              <h2>A feeling to start from.</h2>
            </div>
            <Link
              className="x-text-link"
              href={`/gallery?category=${encodeURIComponent(s.category)}`}
            >
              View the full collection <LineIcon name="diagonal" />
            </Link>
          </div>
          <div className="p-related-grid">
            {related.map((i) => (
              <Link href={`/gallery?photo=${i.id}`} key={i.id}>
                <ResponsivePhoto src={i.image} alt={i.alt} loading="lazy" />
                <span>{i.completed ? "Our work" : "Inspiration"}</span>
                <h3>{i.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
      <NextSteps content={c} />
      <PortfolioFooter content={c} />
    </div>
  );
}
