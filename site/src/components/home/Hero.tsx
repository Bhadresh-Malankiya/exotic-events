"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { GoldenLines } from "@/components/motion/GoldenLines";
import { photos } from "@/lib/photos";
import { staggerContainer, settleUp } from "@/lib/variants";

export function Hero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Art drifts up and brightens away slightly; copy leaves a touch sooner.
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const artScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6, 0.95], [1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-ink"
      aria-label="Introduction"
    >
      {/* Illustrated ground. One file downloads per breakpoint. */}
      <motion.div
        className="absolute inset-0 -z-20"
        style={reducedMotion ? undefined : { y: artY, scale: artScale }}
      >
        <Image
          src={photos.heroMandapGold.src}
          alt=""
          width={photos.heroMandapGold.width}
          height={photos.heroMandapGold.height}
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          aria-hidden="true"
          className="h-full w-full object-cover object-[60%_center] md:object-center"
        />
      </motion.div>

      {/* Scrim: keeps the left copy column readable over the art at every width */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/88 via-ink/60 to-ink md:bg-gradient-to-r md:from-ink md:via-ink/85 md:to-ink/25"
      />
      {/* Dissolves the photo edge into the page instead of a hard cut */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-ink to-transparent"
      />

      <GoldenLines variant="arc" className="-z-10" opacity={0.45} />

      <div className="content-shell relative flex min-h-[92svh] items-center py-24 md:min-h-[88svh]">
        <motion.div
          style={
            reducedMotion ? undefined : { y: copyY, opacity: copyOpacity }
          }
          className="max-w-2xl"
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.p
              variants={settleUp}
              className="mb-6 flex items-center gap-3 text-sm tracking-[0.2em] text-gold-bright/90"
            >
              <span className="h-px w-10 bg-gold-deep" aria-hidden="true" />
              Weddings · Celebrations · Corporate
            </motion.p>

            <motion.h1
              variants={settleUp}
              className="text-hero text-balance text-ivory text-glow"
            >
              Extraordinary events, beautifully brought to life.
            </motion.h1>

            <motion.p
              variants={settleUp}
              className="mt-6 max-w-lg text-body-lg text-ivory-dim text-shade"
            >
              We plan and style weddings, festive nights, and corporate
              gatherings — from the first idea for the venue to the last
              guest leaving happy.
            </motion.p>

            <motion.div
              variants={settleUp}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full bg-gold px-8 py-4 text-base font-medium text-ink shadow-[0_18px_44px_-18px_rgba(214,183,107,0.85)] transition-colors hover:bg-gold-bright"
              >
                Book Your Event
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center rounded-full border border-gold/35 bg-ink/40 px-8 py-4 text-base font-medium text-ivory backdrop-blur-sm transition-colors hover:border-gold-bright hover:text-gold-bright"
              >
                Explore Services
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
