/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getDocument } from "@/lib/cms/storage";
import {
  PortfolioHeader,
  PortfolioFooter,
} from "@/components/portfolio/SiteChrome";
import { NextSteps } from "@/components/portfolio/PlanningContent";
import "../immersive.css";
import "../portfolio.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Services — Planning, Design & Celebration",
  alternates: { canonical: "/services" },
};
export default async function Services() {
  const { value } = await getDocument();
  const c = value.published;
  return (
    <div className="exotic-site p-site">
      <PortfolioHeader brand={c.brand} />
      <section className="p-services-hero">
        <p className="x-kicker">{c.servicePages.eyebrow}</p>
        <h1>{c.servicePages.title}</h1>
        <p>{c.servicePages.description}</p>
        <span className="p-hero-note">
          Plan · Design · Coordinate · Celebrate
        </span>
      </section>
      <section className="p-services-list">
        {c.servicePages.items
          .filter((s) => s.enabled)
          .map((s, i) => (
            <Link
              className="p-service-row"
              key={s.slug}
              href={`/services/${s.slug}`}
            >
              <div className="p-service-image">
                <img src={s.image} alt={s.alt} loading="lazy" />
                <span>0{i + 1}</span>
              </div>
              <div className="p-service-text">
                <p className="x-kicker">{s.title}</p>
                <h2>{s.headline}</h2>
                <p>{s.description}</p>
                <div className="p-service-scope">
                  {s.scope.slice(0, 3).map((x, i) => (
                    <span key={i}>{x.title}</span>
                  ))}
                </div>
                <span className="x-text-link">Discover the experience ↗</span>
              </div>
            </Link>
          ))}
      </section>
      <NextSteps content={c} />
      <PortfolioFooter content={c} />
    </div>
  );
}
