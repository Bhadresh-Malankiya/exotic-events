import { WhatsAppContact } from "@/components/layout/WhatsAppContact";
import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageMotion } from "@/components/motion/PageMotion";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { photos } from "@/lib/photos";
import { organizationJsonLd, SITE_URL, websiteJsonLd } from "@/lib/seo";
import "lenis/dist/lenis.css";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.fullName} — Wedding, Festive & Corporate Event Planning`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.fullName,
  keywords: [
    "event planning",
    "wedding planner",
    "mandap decor",
    "Navratri event management",
    "garba event organiser",
    "corporate event management",
    "hospitality management",
    "destination wedding planner",
    "event decor",
    "private celebration planner",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: site.fullName,
    title: `${site.fullName} — Wedding, Festive & Corporate Event Planning`,
    description: site.description,
    url: "/",
    images: [
      {
        url: photos.heroMandapGold.src,
        width: photos.heroMandapGold.width,
        height: photos.heroMandapGold.height,
        alt: photos.heroMandapGold.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.fullName} — Event Planning & Décor`,
    description: site.description,
    images: [photos.heroMandapGold.src],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/assets/exotic/favicons/exotic-32.png", sizes: "32x32" },
      { url: "/assets/exotic/favicons/exotic-192.png", sizes: "192x192" },
    ],
    apple: "/assets/exotic/favicons/exotic-180.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodoni.variable} ${manrope.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-ink text-ivory">
        <a
          href="#main-content"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-full bg-gold px-5 py-2 text-sm font-medium text-ink"
        >
          Skip to content
        </a>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <SmoothScroll />
        <PageMotion />
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <WhatsAppContact />
      </body>
    </html>
  );
}
