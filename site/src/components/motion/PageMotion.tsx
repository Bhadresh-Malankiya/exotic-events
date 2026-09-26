"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export function PageMotion() {
  const pathname = usePathname();
  useEffect(() => {
    if (
      pathname.startsWith("/admin") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const selector =
      ".exotic-site section h2, .exotic-site section h3, .exotic-site .x-description, .p-pin, .p-next-grid article, .p-steps-grid article, .p-scope-grid article, .x-process-step, .p-featured-grid > a";
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.animate(
              [
                { opacity: 0, transform: "translateY(22px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: 700,
                easing: "cubic-bezier(.2,.7,.2,1)",
                fill: "both",
              },
            );
            observer.unobserve(el);
          }
        }),
      { threshold: 0.08 },
    );
    const seen = new WeakSet<Element>();
    const observe = () =>
      document.querySelectorAll(selector).forEach((e) => {
        if (!seen.has(e)) {
          seen.add(e);
          observer.observe(e);
        }
      });
    observe();
    const mutations = new MutationObserver(observe);
    mutations.observe(
      document.getElementById("main-content") || document.body,
      { childList: true, subtree: true },
    );
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);
  return null;
}
