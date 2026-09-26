import type { GalleryItem } from "./cms/schema";
export type GalleryFilters = {
  q?: string;
  category?: string;
  featured?: string;
  collection?: string;
  ids?: string;
};
export function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
export function filterGallery(items: GalleryItem[], filters: GalleryFilters) {
  const ids = filters.ids?.split(",").filter(Boolean);
  const synonyms: Record<string, string> = {
    decorations: "decor",
    decoration: "decor",
    decorating: "decor",
    flowers: "floral",
    flower: "floral",
    wedding: "weddings",
    party: "celebrations",
    parties: "celebrations",
    event: "events",
  };
  const words = normalise(filters.q || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => synonyms[w] || w);
  return items.filter((item) => {
    if (
      filters.category &&
      normalise(item.category) !== normalise(filters.category)
    )
      return false;
    if (filters.featured === "1" && !item.featured) return false;
    if (filters.collection === "work" && !item.completed) return false;
    if (filters.collection === "inspiration" && item.completed) return false;
    if (ids && !ids.includes(item.id)) return false;
    const haystack = normalise(
      [
        item.title,
        item.category,
        item.description,
        item.alt,
        item.keywords,
        item.event,
        item.location,
        item.year,
      ].join(" "),
    );
    return words.every((w) => haystack.includes(w));
  });
}
export function relatedGallery(items: GalleryItem[], selected: GalleryItem) {
  const terms = normalise(selected.keywords).split(" ").filter(Boolean);
  return items
    .filter((i) => i.id !== selected.id)
    .map((item) => ({
      item,
      score:
        (normalise(item.category) === normalise(selected.category) ? 10 : 0) +
        terms.filter((t) =>
          normalise(item.keywords + " " + item.title).includes(t),
        ).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.item);
}
