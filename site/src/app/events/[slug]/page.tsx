import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GoldenLines } from "@/components/motion/GoldenLines";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { events, getEventBySlug } from "@/content/events";
import { getServiceBySlug } from "@/content/services";
import { ART_SIZES } from "@/lib/assets";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.title} — design concept`,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      type: "article",
      title: `${event.title} — design concept`,
      description: event.summary,
      url: `/events/${event.slug}`,
      images: [{ url: event.image, width: 3000, height: 2000 }],
    },
  };
}

export default async function EventPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const service = getServiceBySlug(event.category);
  const more = events.filter((e) => e.slug !== event.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Our Work", path: "/events" },
          { name: event.title, path: `/events/${event.slug}` },
        ])}
      />
      <article>
        <header className="relative section-pad-sm">
          <GoldenLines variant="drift" opacity={0.3} />
          <div className="content-shell relative max-w-3xl">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-gold-bright"
            >
              <Icon name="arrow-left" className="h-3.5 w-3.5" />
              All concepts
            </Link>

            <p className="mt-8 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full border border-gold/40 px-3 py-1 text-xs font-medium text-gold-bright">
                Design concept
              </span>
              {service ? (
                <Link
                  href={`/services/${service.slug}`}
                  className="text-gold-bright/90 underline underline-offset-4"
                >
                  {service.name}
                </Link>
              ) : null}
            </p>

            <h1 className="mt-5 text-display text-balance text-glow">
              {event.title}
            </h1>
            <p className="mt-5 text-body-lg text-ivory-dim">{event.summary}</p>
          </div>
        </header>

        <div className="content-shell">
          <Reveal>
            <figure>
              <div className="overflow-hidden rounded-card border border-surface-line">
                <Image
                  src={event.image}
                  alt={`Illustrated concept: ${event.title}`}
                  width={ART_SIZES.concept.width}
                  height={ART_SIZES.concept.height}
                  sizes="100vw"
                  className="h-full w-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <figcaption className="mt-3 text-sm text-muted">
                Original illustration by our studio — not a photograph of a
                completed event.
              </figcaption>
            </figure>
          </Reveal>
        </div>

        <section className="relative section-pad">
          <div className="content-shell grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <Reveal>
              <h2 className="text-heading text-ivory">About this concept</h2>
              <p className="mt-5 text-body-lg leading-relaxed text-ivory-dim">
                {event.description}
              </p>

              {service ? (
                <div className="mt-10 rounded-card border border-surface-line bg-ink-soft p-7">
                  <h3 className="font-display text-xl text-ivory">
                    Delivered through {service.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {service.cardSummary}
                  </p>
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gold-bright"
                  >
                    See the full service
                    <Icon name="arrow-right" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : null}
            </Reveal>

            {event.gallery.length > 0 ? (
              <Reveal delay={0.1}>
                <h2 className="text-heading text-ivory">Detail studies</h2>
                <div className="mt-6 space-y-card-gap">
                  {event.gallery.map((image) => (
                    <div
                      key={image}
                      className="overflow-hidden rounded-card border border-surface-line bg-ink-soft"
                    >
                      <Image
                        src={image}
                        alt=""
                        width={ART_SIZES.decor.width}
                        height={ART_SIZES.decor.height}
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="h-full w-full object-contain p-4"
                      />
                    </div>
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>
        </section>
      </article>

      <section className="relative isolate section-pad">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-ink-soft/60"
        />
        <div className="content-shell relative">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-display text-shade">More concepts</h2>
            <Link
              href="/contact"
              className="inline-flex w-fit items-center rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-gold-bright"
            >
              Book Your Event
            </Link>
          </div>

          <div className="mt-10 grid gap-card-gap sm:grid-cols-3">
            {more.map((other, index) => (
              <Reveal key={other.slug} delay={index * 0.07}>
                <Link
                  href={`/events/${other.slug}`}
                  className="group block overflow-hidden rounded-card border border-surface-line bg-ink transition-colors duration-500 hover:border-gold/45"
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image
                      src={other.image}
                      alt=""
                      width={ART_SIZES.concept.width}
                      height={ART_SIZES.concept.height}
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg text-ivory">
                      {other.title}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
