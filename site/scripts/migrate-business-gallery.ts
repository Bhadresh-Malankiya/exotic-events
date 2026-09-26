import { get, put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import { contentSchema } from "../src/lib/cms/schema";
import { servicePagesPreset } from "../src/lib/cms/presets";
async function main() {
  const found = await get("cms/site.json", {
    access: "private",
    useCache: false,
    headers: { "Accept-Encoding": "identity" },
  });
  if (!found) throw Error("CMS document not found");
  const raw = await new Response(found.stream).json(),
    next = structuredClone(raw);
  const photos = JSON.parse(
    await readFile("scripts/gallery-collection.json", "utf8"),
  );
  for (const version of ["draft", "published"]) {
    const c = next[version];
    const ids = new Set(c.gallery.items.map((p: { id: string }) => p.id));
    c.gallery.items.push(
      ...photos.filter((p: { id: string }) => !ids.has(p.id)),
    );
    for (const s of servicePagesPreset.items)
      if (
        !c.servicePages.items.some((v: { slug: string }) => v.slug === s.slug)
      )
        c.servicePages.items.push(s);
    if (!c.brand.whatsapp) c.brand.whatsapp = "919909615585";
    next[version] = contentSchema.parse(c);
  }
  if (JSON.stringify(raw) === JSON.stringify(next)) {
    console.log("Already current");
    return;
  }
  await put(
    `history/pre-business-gallery-${Date.now()}.json`,
    JSON.stringify(raw),
    {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
    },
  );
  next.updatedAt = next.publishedAt = new Date().toISOString();
  await put("cms/site.json", JSON.stringify(next), {
    access: "private",
    ifMatch: found.blob.etag,
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
  console.log(
    "Added " +
      photos.length +
      " photographs and new service pages without replacing existing owner edits.",
  );
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
