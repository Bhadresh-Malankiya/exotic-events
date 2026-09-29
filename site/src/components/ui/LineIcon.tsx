import type { CSSProperties } from "react";
export function LineIcon({
  name = "arrow",
  className = "",
  style,
}: {
  name?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const paths: Record<string, string> = {
    arrow: "M4 12h16m-6-6 6 6-6 6",
    diagonal: "M6 18 18 6M6 6h12v12",
    back: "M20 12H4m6-6-6 6 6 6",
    down: "M12 4v16m-6-6 6 6 6-6",
    plus: "M12 5v14M5 12h14",
    document: "M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7",
    chart: "M4 3v18h17M8 16v-4m5 4V7m5 9v-6",
    mail: "M3 5h18v14H3zM3 6l9 7 9-7",
    photo: "M3 3h18v18H3zM3 16l6-6 7 11m-3-7 3-3 5 5M16 7h.01",
    settings: "M4 7h16M4 17h16M8 4v6m8 4v6",
    price: "M3 3h9l9 9-9 9-9-9zM7 7h.01",
    close: "m6 6 12 12M6 18 18 6",
    menu: "M4 6h16M4 12h16M4 18h16",
    wallet: "M3 6h18v14H3zM3 6V3h15v3m-3 5h6v5h-6z",
    people:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8m6 9v-2a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    whatsapp:
      "M21 11.5a9 9 0 0 1-13.4 8L3 21l1.5-4.6A9 9 0 1 1 21 11.5ZM8 7c0 5 4 9 9 9l1-3-3-1-1 1-3-3 1-1-1-3z",
  };
  return (
    <svg
      className={`line-icon ${className}`}
      style={style}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.arrow} />
    </svg>
  );
}
export function ArrowLabel({ children }: { children: string }) {
  const match = children.match(/[→↗←↓]/);
  return (
    <>
      {children.replace(/[→↗←↓]/g, "").trim()}
      {match && (
        <LineIcon
          name={
            (
              { "↗": "diagonal", "←": "back", "↓": "down" } as Record<
                string,
                string
              >
            )[match[0]] || "arrow"
          }
        />
      )}
    </>
  );
}
