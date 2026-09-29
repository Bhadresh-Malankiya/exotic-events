import { LineIcon } from "@/components/ui/LineIcon";
import Link from "next/link";
import { getPublicDocument as getDocument } from "@/lib/business/public-content";
import {
  PortfolioHeader,
  PortfolioFooter,
} from "@/components/portfolio/SiteChrome";
import {
  PlanningJourney,
  BudgetGuide,
  NextSteps,
} from "@/components/portfolio/PlanningContent";
import "../immersive.css";
import "../portfolio.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Planning & Budget — From First Idea to Event Day",
  alternates: { canonical: "/planning" },
};
export default async function Planning() {
  const { value } = await getDocument();
  const c = value.published;
  return (
    <div className="exotic-site p-site">
      <PortfolioHeader brand={c.brand} />
      <section className="p-planning-hero">
        <p className="x-kicker">Considered creativity. Clear conversations.</p>
        <h1>
          A beautiful event.
          <br />
          <em>A clear way forward.</em>
        </h1>
        <p>
          From the first idea to the last detail — understand the process, the
          decisions, and what happens next.
        </p>
        <div className="x-actions">
          <a className="x-button x-button-gold" href="#budget">
            Understand Your Budget <LineIcon name="down"/>
          </a>
          <Link className="x-button x-button-outline" href="/gallery">
            Build Your Inspiration Board <LineIcon name="diagonal"/>
          </Link>
        </div>
      </section>
      <PlanningJourney content={c} />
      <div id="budget">
        <BudgetGuide content={c} />
      </div>
      <section className="p-brief">
        <div>
          <p className="x-kicker">Before our first conversation</p>
          <h2>
            A few details
            <br />
            go a long way.
          </h2>
          <p>
            You do not need a finished plan. A starting point helps us recommend
            the right direction.
          </p>
        </div>
        <ul>
          <li>
            <span>01</span>The occasion & preferred date
          </li>
          <li>
            <span>02</span>The city & venue, if selected
          </li>
          <li>
            <span>03</span>Your approximate guest count
          </li>
          <li>
            <span>04</span>A comfortable budget range
          </li>
          <li>
            <span>05</span>A few photos or styles you love
          </li>
        </ul>
      </section>
      <NextSteps content={c} />
      <PortfolioFooter content={c} />
    </div>
  );
}
