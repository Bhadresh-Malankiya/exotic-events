import Image from "next/image";
import type { ReactNode } from "react";
import { GoldenLines } from "@/components/motion/GoldenLines";
import { photos, type PhotoKey } from "@/lib/photos";

/**
 * Shared masthead for every inner page. The background is licensed stock
 * photography used as atmosphere — never captioned as our own work.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  photo,
  actions,
  compact = false,
  focus = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  photo: PhotoKey;
  actions?: ReactNode;
  compact?: boolean;
  focus?: string;
}) {
  const image = photos[photo];

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <Image
        src={image.src}
        alt=""
        width={image.width}
        height={image.height}
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        style={{ objectPosition: focus }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/92 via-ink/70 to-ink md:bg-gradient-to-r md:from-ink md:via-ink/82 md:to-ink/35"
      />
      {/* Dissolves the photo edge into the page instead of a hard cut */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent"
      />

      <GoldenLines variant="drift" className="-z-10" opacity={0.38} />

      <div
        className={`content-shell relative flex items-center ${
          compact ? "min-h-[48svh] py-24" : "min-h-[62svh] py-28"
        }`}
      >
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="mb-5 flex items-center gap-3 text-sm tracking-[0.2em] text-gold-bright/90">
              <span className="h-px w-10 bg-gold-deep" aria-hidden="true" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-display text-balance text-ivory text-glow">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-xl text-body-lg text-ivory-dim text-shade">
              {description}
            </p>
          ) : null}
          {actions ? (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
