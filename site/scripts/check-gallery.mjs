import assert from "node:assert/strict";
import { filterGallery, relatedGallery } from "../src/lib/gallery.ts";
const photo = (id, category, keywords, more = {}) => ({
  id,
  category,
  keywords,
  title: id,
  alt: "Photo",
  description: "",
  image: "/assets/photo.jpg",
  featured: false,
  completed: false,
  event: "",
  location: "",
  year: "",
  ...more,
});
const photos = [
  photo("gold-mandap", "Weddings", "gold, floral, stage, decor", {
    featured: true,
  }),
  photo("red-stage", "Décor", "red, floral, stage, decor", { completed: true }),
  photo("blue-gala", "Corporate", "blue, gala, events", {
    featured: true,
    location: "Surat",
  }),
  photo("garden-wedding", "Weddings", "garden, floral, decor"),
];
assert.equal(filterGallery(photos, { q: "flowers gold" })[0].id, "gold-mandap");
assert.equal(
  filterGallery(photos, { q: "decorations", category: "decor" })[0].id,
  "red-stage",
);
assert.deepEqual(
  filterGallery(photos, { featured: "1", category: "weddings" }).map(
    (i) => i.id,
  ),
  ["gold-mandap"],
);
assert.deepEqual(
  filterGallery(photos, { collection: "work" }).map((i) => i.id),
  ["red-stage"],
);
assert.equal(filterGallery(photos, { collection: "inspiration" }).length, 3);
assert.equal(filterGallery(photos, { q: "SURAT" }).length, 1);
assert.equal(
  filterGallery(photos, { ids: "red-stage,blue-gala", q: "red" }).length,
  1,
);
assert.equal(filterGallery(photos, { ids: "unknown" }).length, 0);
assert.equal(filterGallery(photos, { q: "notpresent" }).length, 0);
assert.equal(relatedGallery(photos, photos[0])[0].id, "garden-wedding");
assert.ok(
  relatedGallery(photos, photos[0]).every((i) => i.id !== "gold-mandap"),
);
console.log(
  "Gallery checks passed: keywords, accents, combinations, provenance, shared selections, related photos.",
);
