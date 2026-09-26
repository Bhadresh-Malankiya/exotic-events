import { Suspense } from "react";
import { getPublicDocument as getDocument } from "@/lib/business/public-content";
import { isAdmin } from "@/lib/cms/auth";
import {
  PortfolioHeader,
  PortfolioFooter,
} from "@/components/portfolio/SiteChrome";
import { GalleryBrowser } from "@/components/portfolio/GalleryBrowser";
import "../immersive.css";
import "../portfolio.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { value } = await getDocument();
  const item = value.published.gallery.items.find((i) => i.id === params.photo);
  const title =
    item?.title ||
    [params.category, params.q, "Gallery"].filter(Boolean).join(" · ");
  return {
    title,
    description: item?.description || value.published.collection.description,
    alternates: { canonical: "/gallery" },
    ...(item
      ? {
          openGraph: {
            title: item.title,
            description: item.description,
            images: [item.image],
          },
        }
      : {}),
    ...(params.preview || params.ids || params.saved
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}
export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const { value } = await getDocument();
  const draft = preview === "1" && (await isAdmin());
  const c = draft ? value.draft : value.published;
  return (
    <div className="exotic-site p-site">
      <PortfolioHeader brand={c.brand} />
      <section className="p-gallery-hero">
        <div>
          <p className="x-kicker">The Exotic collection</p>
          <h1>{c.collection.title}</h1>
        </div>
        <p>{c.collection.description}</p>
      </section>
      {draft && (
        <div className="x-preview-banner">Draft preview · not public</div>
      )}
      <section className="p-gallery-body">
        <Suspense fallback={<p>Opening the collection…</p>}>
          <GalleryBrowser content={c} />
        </Suspense>
      </section>
      <PortfolioFooter content={c} />
    </div>
  );
}
