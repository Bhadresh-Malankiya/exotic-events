/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocument } from "@/lib/cms/storage";
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
  const related = c.gallery.items
    .filter((i) => i.category.toLowerCase() === s.category.toLowerCase())
    .slice(0, 4);
  return (
    <div className="exotic-site p-site">
      <PortfolioHeader brand={c.brand} />
      <section className="p-service-hero">
        <img src={s.image} alt={s.alt} />
        <div>
          <Link href="/services" className="p-back">
            ← All services
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
              Explore Related Photos ↗
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
              <p>{item.description}</p>
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
            See our approach to budgets ↗
          </Link>
        </div>
        <div>
          {s.budgetFactors.map((b, i) => (
            <article key={i}>
              <span>0{i + 1}</span>
              <div>
                <h3>{b.title}</h3>
                <p>{b.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
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
              View the full collection ↗
            </Link>
          </div>
          <div className="p-related-grid">
            {related.map((i) => (
              <Link href={`/gallery?photo=${i.id}`} key={i.id}>
                <img src={i.image} alt={i.alt} loading="lazy" />
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
