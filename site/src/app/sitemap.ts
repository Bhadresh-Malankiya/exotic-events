import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getDocument } from "@/lib/cms/storage";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { value } = await getDocument();
  return [
    "/",
    "/gallery",
    "/services",
    "/planning",
    ...value.published.servicePages.items
      .filter((s) => s.enabled)
      .map((s) => `/services/${s.slug}`),
  ].map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
