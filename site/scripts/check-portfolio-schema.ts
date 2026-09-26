import assert from "node:assert/strict";
import { contentSchema } from "../src/lib/cms/schema";
import { defaultContent } from "../src/lib/cms/defaults";
const current = contentSchema.parse(defaultContent);
assert.equal(current.gallery.items.filter((i) => i.featured).length, 3);
assert.ok(current.gallery.items.every((i) => !i.completed));
assert.ok(
  current.services.items.every((i) =>
    current.servicePages.items.some((s) => s.slug === i.serviceSlug),
  ),
);
const old = JSON.parse(JSON.stringify(current));
for (const key of ["servicePages", "planning", "nextSteps", "collection"])
  delete old[key];
for (const item of old.gallery.items)
  for (const key of [
    "id",
    "keywords",
    "featured",
    "completed",
    "event",
    "location",
    "year",
  ])
    delete item[key];
const migrated = contentSchema.parse(old);
assert.ok(migrated.servicePages.items.length >= 6);
assert.ok(migrated.gallery.items.every((i) => i.id));
const duplicate = structuredClone(current);
duplicate.gallery.items.push({ ...duplicate.gallery.items[0] });
assert.equal(contentSchema.safeParse(duplicate).success, false);
const bad = structuredClone(current);
bad.gallery.items[0].image = "https://untrusted.example/image.png";
assert.equal(contentSchema.safeParse(bad).success, false);
const duplicateService = structuredClone(current);
duplicateService.servicePages.items.push({
  ...duplicateService.servicePages.items[0],
});
assert.equal(contentSchema.safeParse(duplicateService).success, false);
console.log(
  "Portfolio schema checks passed: migration, defaults, valid service links, unique photo/page IDs, safe image paths.",
);
