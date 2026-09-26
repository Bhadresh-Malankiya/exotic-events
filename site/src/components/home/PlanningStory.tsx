"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GoldenLines } from "@/components/motion/GoldenLines";
import { planningJourney } from "@/content/site";
import { ART_SIZES, concepts } from "@/lib/assets";
import { DURATION, EASE_EXOTIC } from "@/lib/motion-tokens";

const stageImages = [
  concepts.invitationSuiteFlatlay,
  concepts.floralMoonInstallation,
  concepts.ivoryBanquetTablescape,
  concepts.ivoryGardenMandap,
  concepts.palaceCeremony,
];

export function PlanningStory() {
  const stageRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nodes = stageRefs.current.filter(Boolean) as HTMLLIElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.stageIndex));
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative section-pad">
      <GoldenLines variant="weave" opacity={0.3} />

      <div className="content-shell relative">
        <div className="max-w-2xl">
          <h2 className="text-display text-shade">
            From your first idea to the final celebration.
          </h2>
          <p className="mt-5 text-body-lg text-ivory-dim">
            Five stages, the same on a birthday as on a three-day wedding —
            only the scale changes.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-[7px] top-3 bottom-3 hidden w-px bg-surface-line lg:block"
            />
            <ol className="space-y-14 lg:space-y-24">
              {planningJourney.map((stage, index) => (
                <li
                  key={stage.id}
                  ref={(node) => {
                    stageRefs.current[index] = node;
                  }}
                  data-stage-index={index}
                  className="relative lg:pl-12"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-2 hidden h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 transition-all duration-500 lg:block ${
                      active === index
                        ? "border-gold-bright bg-gold-bright shadow-[0_0_18px_rgba(238,214,154,0.6)]"
                        : "border-surface-line bg-ink"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium tracking-[0.2em] transition-colors duration-500 ${
                      active === index ? "text-gold-bright" : "text-muted"
                    }`}
                  >
                    STAGE {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-ivory md:text-3xl">
                    {stage.title}
                  </h3>
                  <p className="mt-3 max-w-md leading-relaxed text-ivory-dim">
                    {stage.description}
                  </p>

                  {/* Mobile keeps a normal vertical timeline — no sticky pin */}
                  <div className="relative mt-6 aspect-[3/2] w-full overflow-hidden rounded-card border border-surface-line lg:hidden">
                    <Image
                      src={stageImages[index]}
                      alt=""
                      width={ART_SIZES.concept.width}
                      height={ART_SIZES.concept.height}
                      sizes="100vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-32">
              <div className="relative aspect-[3/2] overflow-hidden rounded-card border border-surface-line bg-ink-soft">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: EASE_EXOTIC }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={stageImages[active]}
                      alt=""
                      width={ART_SIZES.concept.width}
                      height={ART_SIZES.concept.height}
                      sizes="50vw"
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <motion.p
                key={`caption-${active}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.standard, ease: EASE_EXOTIC }}
                className="mt-4 text-sm text-muted"
              >
                {planningJourney[active].title} — illustrated concept
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
