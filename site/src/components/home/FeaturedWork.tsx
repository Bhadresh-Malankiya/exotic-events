"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { events } from "@/content/events";
import { services } from "@/content/services";
import { ART_SIZES, sectionBackgrounds } from "@/lib/assets";
import { DURATION, EASE_EXOTIC } from "@/lib/motion-tokens";

type Filter = "all" | "featured" | "recent";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "recent", label: "Recent" },
];

function serviceName(slug: string) {
  return services.find((s) => s.slug === slug)?.name;
}

function WorkCard({
  event,
  feature = false,
}: {
  event: (typeof events)[number];
  feature?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const label = serviceName(event.category);

  return (
    <motion.div
      layout={!reducedMotion}
      transition={{ duration: DURATION.standard, ease: EASE_EXOTIC }}
      className={feature ? "md:col-span-2 md:row-span-2" : ""}
    >
      <Link
        href={`/events/${event.slug}`}
        className="group block h-full overflow-hidden rounded-card border border-surface-line bg-ink-soft transition-colors duration-500 hover:border-gold/45"
      >
        <div
          className={`relative overflow-hidden ${feature ? "aspect-[3/2]" : "aspect-[3/2]"}`}
        >
          <motion.div
            initial={reducedMotion ? undefined : { scale: 1.06, opacity: 0 }}
            whileInView={reducedMotion ? undefined : { scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: EASE_EXOTIC }}
            className="h-full w-full"
          >
            <Image
              src={event.image}
              alt=""
              width={ART_SIZES.concept.width}
              height={ART_SIZES.concept.height}
              sizes={feature ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 30vw"}
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          </motion.div>
          <span className="absolute right-4 top-4 rounded-full border border-gold/40 bg-ink/75 px-3 py-1 text-xs font-medium text-gold-bright backdrop-blur-sm">
            Design concept
          </span>
        </div>

        <div className={feature ? "p-8" : "p-6"}>
          {label ? (
            <p className="text-xs font-medium tracking-[0.14em] text-gold-bright/90">
              {label}
            </p>
          ) : null}
          <h3
            className={`mt-2 font-display text-ivory ${feature ? "text-3xl" : "text-xl"}`}
          >
            {event.title}
          </h3>
          <p
            className={`mt-2.5 text-sm leading-relaxed text-muted ${feature ? "max-w-lg" : ""}`}
          >
            {event.summary}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export function FeaturedWork() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "featured") return events.filter((e) => e.featured);
    if (filter === "recent") {
      return [...events].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
    return events;
  }, [filter]);

  return (
    <section className="relative isolate section-pad">
      <Image
        src={sectionBackgrounds.charcoalGoldFlowLines}
        alt=""
        width={ART_SIZES.sectionBackground.width}
        height={ART_SIZES.sectionBackground.height}
        sizes="100vw"
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-ink via-ink/75 to-ink"
      />

      <div className="content-shell relative">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-display text-shade">
              Celebrations worth stepping into.
            </h2>
            <p className="mt-5 text-body-lg text-ivory-dim">
              Illustrated design concepts from our studio, each one a starting
              point for a real event — clearly marked, never passed off as
              finished client work.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter concepts"
            className="flex shrink-0 gap-1 rounded-full border border-surface-line bg-ink-soft/60 p-1 backdrop-blur-sm"
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-5 py-2 text-sm transition-colors ${
                  filter === f.id
                    ? "bg-gold text-ink"
                    : "text-ivory-dim hover:text-ivory"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-card-gap md:grid-cols-4">
          {filtered.map((event, index) => (
            <WorkCard key={event.slug} event={event} feature={index === 0} />
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 border-b border-gold/40 pb-1 text-sm font-medium text-gold-bright transition-colors hover:border-gold-bright"
          >
            Explore All Concepts
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
