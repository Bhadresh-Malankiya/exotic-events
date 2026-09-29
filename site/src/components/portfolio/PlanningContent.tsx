import { ResponsivePhoto } from "@/components/ui/ResponsivePhoto";
import { LineIcon } from "@/components/ui/LineIcon";

import Link from "next/link";
import { EnquiryDialog } from "@/components/forms/EnquiryDialog";
import type { SiteContent } from "@/lib/cms/schema";
export function PlanningJourney({
  content: c,
  compact = false,
}: {
  content: SiteContent;
  compact?: boolean;
}) {
  const p = c.planning;
  return (
    <section className={`p-planning-section ${compact ? "is-compact" : ""}`}>
      <div className="p-split-heading">
        <div>
          <p className="x-kicker">{p.eyebrow}</p>
          <h2>{p.title}</h2>
        </div>
        <div>
          <p className="x-description">{p.description}</p>
          {compact && (
            <Link className="x-text-link" href="/planning">
              Explore planning & budget <LineIcon name="diagonal"/>
            </Link>
          )}
        </div>
      </div>
      <div className="p-steps-grid">
        {p.steps.map((s, i) => (
          <article key={i}>
            <span>0{i + 1}</span>
            <div className="p-step-line" />
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function BudgetGuide({ content: c }: { content: SiteContent }) {
  const p = c.planning;
  return (
    <section className="p-budget">
      <div className="p-budget-intro">
        <p className="x-kicker">Clarity before commitment</p>
        <h2>{p.budgetTitle}</h2>
        <p>{p.budgetDescription}</p>
        <EnquiryDialog
          triggerLabel="Discuss Your Priorities →"
          triggerClassName="x-button x-button-gold"
          initialMessage="I would like to understand the planning scope and budget for my event.\n\nMy occasion, city, guest count, and preferred budget: "
        />
      </div>
      <div className="p-budget-board">
        <p className="x-kicker">What shapes your quotation</p>
        {p.budgetItems.map((b, i) => (
          <div className="p-budget-line" key={i}>
            <span>0{i + 1}</span>
            <div>
              <h3>{b.title}</h3>
              <p>{b.description}</p>
            </div>
            <span><LineIcon name="diagonal"/></span>
          </div>
        ))}
        <p className="p-budget-note">{p.budgetNote}</p>
      </div>
    </section>
  );
}
export function NextSteps({ content: c }: { content: SiteContent }) {
  const p = c.nextSteps;
  if (!p.enabled) return null;
  return (
    <section className="p-next">
      <div className="p-split-heading">
        <div>
          <p className="x-kicker">{p.eyebrow}</p>
          <h2>{p.title}</h2>
        </div>
        <p className="x-description">{p.description}</p>
      </div>
      <div className="p-next-grid">
        {p.items.map((s, i) => (
          <article key={i}>
            <span>0{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.description}</p>
          </article>
        ))}
      </div>
      <div className="p-next-actions">
        <EnquiryDialog
          triggerLabel="Tell Us About Your Event →"
          triggerClassName="x-button x-button-gold"
        />
        <Link href="/gallery" className="x-text-link">
          Find a little inspiration first <LineIcon name="diagonal"/>
        </Link>
      </div>
    </section>
  );
}
export function FeaturedCollection({ content: c }: { content: SiteContent }) {
  const featured = c.gallery.items.filter((i) => i.featured);
  if (!c.collection.showFeatured || !featured.length) return null;
  return (
    <section className="p-featured">
      <div className="p-split-heading">
        <div>
          <p className="x-kicker">Featured in the collection</p>
          <h2>{c.collection.featuredTitle}</h2>
        </div>
        <div>
          <p className="x-description">{c.collection.featuredDescription}</p>
          <Link href="/gallery?featured=1" className="x-text-link">
            Explore featured photos <LineIcon name="diagonal"/>
          </Link>
        </div>
      </div>
      <div className="p-featured-grid">
        {featured.slice(0, 3).map((item) => (
          <Link key={item.id} href={`/gallery?photo=${item.id}`}>
            <ResponsivePhoto src={item.image} alt={item.alt} loading="lazy" />
            <span className="p-featured-badge">✦ Featured</span>
            <div>
              <p>
                {item.category} · {item.completed ? "Our work" : "Inspiration"}
              </p>
              <h3>{item.title}</h3>
              <span>Explore this story <LineIcon name="diagonal"/></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
