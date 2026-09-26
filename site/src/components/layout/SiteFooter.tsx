"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { logos, ornaments } from "@/lib/assets";
import { footerServiceLinks, site } from "@/content/site";

const year = new Date().getFullYear();

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/gallery") || pathname.startsWith("/services") || pathname === "/planning") return null;
  return (
    <footer className="border-t border-surface-line bg-ink-soft">
      <div className="content-shell pt-16 pb-10">
        <Image
          src={ornaments.goldRibbonWide}
          alt=""
          width={1200}
          height={400}
          className="mx-auto mb-14 h-10 w-auto max-w-xs opacity-80"
          aria-hidden="true"
        />

        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={logos.emblemGold}
                alt=""
                width={69}
                height={28}
                className="h-7 w-auto"
              />
              <span className="font-display text-base tracking-[0.14em] text-ivory">
                {site.name.toUpperCase()}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted">
              {site.description}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-ivory">Services</h2>
            <ul className="mt-4 space-y-3">
              {footerServiceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-gold-bright"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-medium text-ivory">Studio</h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/events"
                  className="text-sm text-muted transition-colors hover:text-gold-bright"
                >
                  Our Work
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted transition-colors hover:text-gold-bright"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted transition-colors hover:text-gold-bright"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-medium text-ivory">Get in touch</h2>
            <p className="mt-4 text-sm text-muted">
              The quickest way to reach us is the enquiry form on our{" "}
              <Link
                href="/contact"
                className="text-gold-bright underline underline-offset-4"
              >
                Contact page
              </Link>
              . We reply personally to arrange a planning call.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-surface-line pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.fullName}. All rights reserved.
          </p>
          <p className="max-w-xl">
            Enquiry details are used only to plan your event and are never sold
            or shared with third parties.
          </p>
        </div>
      </div>
    </footer>
  );
}
