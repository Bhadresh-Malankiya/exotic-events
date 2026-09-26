import type { Variants } from "motion/react";
import { DURATION, EASE_EXOTIC, STAGGER } from "./motion-tokens";

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: STAGGER,
      delayChildren: 0.05,
    },
  },
};

export const settleUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE_EXOTIC },
  },
};

export const settleUpSmall: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.standard, ease: EASE_EXOTIC },
  },
};
