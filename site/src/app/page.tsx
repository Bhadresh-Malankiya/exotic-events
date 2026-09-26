import { ImmersiveHome } from "@/components/home/ImmersiveHome";
import { getPublicDocument as getDocument } from "@/lib/business/public-content";
import { isAdmin } from "@/lib/cms/auth";
import "./immersive.css";
import "./portfolio.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { value } = await getDocument();
  const preview = (await searchParams).preview === "1";
  return {
    title: { absolute: value.published.brand.name + " — Extraordinary Events" },
    description: value.published.hero.slides[0].description,
    ...(preview ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      images: [
        { url: value.published.hero.slides[0].image, width: 1672, height: 941 },
      ],
      title: value.published.brand.name,
    },
    twitter: { images: [value.published.hero.slides[0].image] },
  };
}
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const draft = preview === "1" && (await isAdmin());
  const { value } = await getDocument();
  return (
    <ImmersiveHome
      content={draft ? value.draft : value.published}
      preview={draft}
    />
  );
}
