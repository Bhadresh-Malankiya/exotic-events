"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

// Lenis eases the native scroll without hijacking it: wheel, touch, keyboard,
// anchor links and scrollbar dragging all still work. Disabled outright for
// anyone who asked for reduced motion.
export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/documents") || window.matchMedia("(pointer: coarse)").matches) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReduced.matches) return;

    const lenis = new Lenis({
      duration: 0.85,
      anchors: { offset: -90 },
      prevent: (node) => node.closest("dialog") !== null,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      touchMultiplier: 1.4,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
