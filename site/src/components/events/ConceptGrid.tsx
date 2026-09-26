"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { events } from "@/content/events";
import { services } from "@/content/services";
import { ART_SIZES } from "@/lib/assets";
import { DURATION, EASE_EXOTIC } from "@/lib/motion-tokens";

const categories = [
  { id: "all", label: "All" },
  ...services.map((s) => ({ id: s.slug, label: s.name })),
];

export function ConceptGrid() {
  const [active, setActive] = useState("all");
  const reducedMotion = useReducedMotion();

  const filtered = useMemo(
    () =>
      active === "all"
        ? events
        : events.filter((event) => event.category === active),
    [active]
  );

  return (
    <>
      <div
        role="tablist"
        aria-label="Filter concepts by service"
        className="flex flex-wrap gap-2"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={active === category.id}
            onClick={() => setActive(category.id)}
            className={`rounded-full border px-5 py-2 text-sm transition-colors ${
              active === category.id
                ? "border-gold bg-gold text-ink"
                : "border-surface-line text-ivory-dim hover:border-gold/45 hover:text-ivory"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-card-gap sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <motion.div
            key={event.slug}
            layout={!reducedMotion}
            initial={reducedMotion ? undefined : { opacity: 0, y: 18 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: DURATION.standard, ease: EASE_EXOTIC }}
          >
            <Link
              href={`/events/${event.slug}`}
              className="group block h-full overflow-hidden rounded-card border border-surface-line bg-ink-soft transition-colors duration-500 hover:border-gold/45"
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={event.image}
                  alt=""
                  width={ART_SIZES.concept.width}
                  height={ART_SIZES.concept.height}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
                <span className="absolute right-4 top-4 rounded-full border border-gold/40 bg-ink/75 px-3 py-1 text-xs font-medium text-gold-bright backdrop-blur-sm">
                  Design concept
                </span>
              </div>
              <div className="p-6">
                <p className="text-xs font-medium tracking-[0.14em] text-gold-bright/90">
                  {services.find((s) => s.slug === event.category)?.name}
                </p>
                <h2 className="mt-2 font-display text-xl text-ivory">
                  {event.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {event.summary}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-muted">
          No concepts in this category yet — tell us what you have in mind and
          we&rsquo;ll design one.
        </p>
      ) : null}
    </>
  );
}
