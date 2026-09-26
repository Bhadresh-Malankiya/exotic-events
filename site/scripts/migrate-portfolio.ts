// Add portfolio fields to an existing CMS document without replacing owner edits.
import { get, put } from "@vercel/blob";
import { contentSchema } from "../src/lib/cms/schema";
import { defaultContent } from "../src/lib/cms/defaults";
async function main() {
  const found = await get("cms/site.json", {
    access: "private",
    useCache: false,
    headers: { "Accept-Encoding": "identity" },
  });
  if (!found) {
    console.log(
      "No stored content: defaults already include portfolio fields.",
    );
    return;
  }
  const raw = await new Response(found.stream).json();
  const next = structuredClone(raw);
  for (const version of ["draft", "published"]) {
    for (const item of next[version].gallery.items) {
      const preset = defaultContent.gallery.items.find(
        (x) => x.image === item.image && x.title === item.title,
      );
      if (preset) {
        if (item.keywords === undefined) item.keywords = preset.keywords;
        if (item.featured === undefined) item.featured = preset.featured;
      }
    }
    for (const item of next[version].services.items) {
      const preset = defaultContent.services.items.find(
        (x) => x.title === item.title,
      );
      if (preset && item.serviceSlug === undefined)
        item.serviceSlug = preset.serviceSlug;
    }
    next[version] = contentSchema.parse(next[version]);
  }
  if (JSON.stringify(raw) === JSON.stringify(next)) {
    console.log("Portfolio content is already current.");
    return;
  }
  await put(`history/pre-portfolio-${Date.now()}.json`, JSON.stringify(raw), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  await put("cms/site.json", JSON.stringify(next), {
    access: "private",
    ifMatch: found.blob.etag,
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
  console.log(
    "Portfolio fields added to both versions; existing text and images preserved.",
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
