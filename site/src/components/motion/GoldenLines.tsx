"use client";

import { useRef, useId } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

// Gold filaments that draw themselves in as the section passes through the
// viewport, then hold. Purely decorative: aria-hidden, pointer-events none,
// and skipped entirely under reduced motion (the static version just sits at
// low opacity instead of animating).
type Variant = "drift" | "arc" | "weave" | "corner";

const PATHS: Record<Variant, string[]> = {
  // Long shallow curves crossing the section
  drift: [
    "M-40 210 C 220 120, 430 300, 700 190 S 1140 90, 1480 240",
    "M-40 330 C 260 260, 480 400, 760 320 S 1180 250, 1480 350",
  ],
  // A wide sweeping arc, like the ribbon in the hero art
  arc: [
    "M-40 400 C 260 380, 380 90, 720 120 S 1180 380, 1480 250",
    "M-40 460 C 300 440, 420 170, 740 200 S 1200 430, 1480 320",
  ],
  // Interlacing lines for busier editorial bands
  weave: [
    "M-40 120 C 320 200, 560 40, 900 160 S 1240 320, 1480 200",
    "M-40 280 C 280 180, 620 360, 940 260 S 1260 140, 1480 300",
    "M-40 420 C 360 480, 600 260, 980 380 S 1280 460, 1480 380",
  ],
  // Framing lines that hug one corner
  corner: [
    "M1480 -20 C 1180 120, 1240 300, 980 420 S 560 520, 120 470",
    "M1480 80 C 1220 220, 1280 380, 1020 500 S 600 600, 160 560",
  ],
};

export function GoldenLines({
  variant = "drift",
  className,
  opacity = 0.5,
}: {
  variant?: Variant;
  className?: string;
  opacity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const gradientId = useId();
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Draw across the first ~65% of the section's pass, then hold.
  const draw = useTransform(scrollYProgress, [0, 0.65], [0, 1]);
  const fade = useTransform(scrollYProgress, [0, 0.12, 0.85, 1], [0, 1, 1, 0.35]);

  const paths = PATHS[variant];

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <motion.svg
        viewBox="0 0 1440 560"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        style={reducedMotion ? { opacity: opacity * 0.6 } : { opacity: fade }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A8873F" stopOpacity="0" />
            <stop offset="28%" stopColor="#D6B76B" stopOpacity={opacity} />
            <stop offset="62%" stopColor="#EED69A" stopOpacity={opacity} />
            <stop offset="100%" stopColor="#A8873F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {paths.map((d, index) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={index === 0 ? 1.4 : 0.9}
            strokeLinecap="round"
            style={reducedMotion ? undefined : { pathLength: draw }}
          />
        ))}
      </motion.svg>
    </div>
  );
}
