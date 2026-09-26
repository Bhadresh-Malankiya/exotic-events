import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GoldenLines } from "@/components/motion/GoldenLines";
import { Reveal } from "@/components/motion/Reveal";
import { services } from "@/content/services";
import { ART_SIZES } from "@/lib/assets";

const featuredSlugs = ["wedding-planning", "navratri-events", "corporate-events"];

export function Services() {
  const featured = services.filter((s) => featuredSlugs.includes(s.slug));
  const compact = services.filter((s) => !featuredSlugs.includes(s.slug));

  return (
    <section id="services" className="relative section-pad">
      <GoldenLines variant="drift" opacity={0.32} />

      <div className="content-shell relative">
        <Reveal className="max-w-2xl">
          <h2 className="text-display text-shade">
            Every occasion. Thoughtfully imagined.
          </h2>
          <p className="mt-5 text-body-lg text-ivory-dim">
            Seven ways we plan, stage, and look after an event — take one, or
            combine a few into something larger.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-card-gap md:grid-cols-3">
          {featured.map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.08}>
              <Link
                href={`/services/${service.slug}`}
                className="group block h-full overflow-hidden rounded-card border border-surface-line bg-ink-soft transition-colors duration-500 hover:border-gold/45"
              >
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={service.conceptImage}
                    alt=""
                    width={ART_SIZES.concept.width}
                    height={ART_SIZES.concept.height}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-soft to-transparent"
                  />
                </div>
                <div className="p-7">
                  <Icon name={service.icon} className="h-7 w-7 text-gold" />
                  <h3 className="mt-4 font-display text-2xl text-ivory">
                    {service.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {service.cardSummary}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold-bright transition-transform duration-300 group-hover:translate-x-1">
                    Learn more
                    <Icon name="arrow-right" className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-card-gap grid gap-card-gap sm:grid-cols-2 lg:grid-cols-4">
          {compact.map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.06}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col rounded-card border border-surface-line bg-ink-soft/70 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/45 hover:bg-ink-soft"
              >
                <Icon name={service.icon} className="h-6 w-6 text-gold" />
                <h3 className="mt-4 text-lg font-medium text-ivory">
                  {service.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {service.cardSummary}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm text-gold-bright">
                  Learn more
                  <Icon name="arrow-right" className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 border-b border-gold/40 pb-1 text-sm font-medium text-gold-bright transition-colors hover:border-gold-bright"
          >
            View All Services
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
