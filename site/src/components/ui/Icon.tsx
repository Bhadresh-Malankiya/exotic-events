import { ICON_MAP } from "@/generated/icon-map";

// Icons ship as stroke="currentColor" SVGs, baked into ICON_MAP at build
// time (see scripts/generate-icons.mjs). Inlining the markup — instead of
// <img src> — lets them inherit color from Tailwind text-* classes, and a
// plain object import (no fs) keeps this safe to use from Client Components.
export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const markup = ICON_MAP[name];
  if (!markup) return null;
  return (
    <span
      className={className}
      style={{ display: "inline-flex" }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
