"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import type { SiteContent } from "@/lib/cms/schema";
import { EnquiryDialog } from "@/components/forms/EnquiryDialog";
export function PortfolioHeader({ brand }: { brand: SiteContent["brand"] }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="x-header is-scrolled p-header">
      <Link href="/" className="x-logo">
        <img src={brand.logo} alt={brand.name} width="267" height="171" />
      </Link>
      <nav className={open ? "is-open" : ""} aria-label="Main navigation">
        {[
          ["/", "Home"],
          ["/services", "Services"],
          ["/gallery", "Gallery"],
          ["/planning", "Planning & budget"],
          ["/#contact", "Contact"],
        ].map(([href, text]) => (
          <Link href={href} key={href} onClick={() => setOpen(false)}>
            {text}
          </Link>
        ))}
      </nav>
      <EnquiryDialog
        triggerLabel={`${brand.bookingLabel} →`}
        triggerClassName="x-button x-button-outline x-nav-book"
      />
      <button
        className="x-menu"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          "✕"
        ) : (
          <>
            <i />
            <i />
          </>
        )}
      </button>
    </header>
  );
}
export function BusinessMap({ brand }: { brand: SiteContent["brand"] }) {
  if (!brand.showMap || !brand.address) return null;
  const query = encodeURIComponent(brand.name + ", " + brand.address);
  return (
    <section className="p-map" aria-label="Visit Exotic">
      <div className="p-map-info">
        <p className="x-kicker">Find us in {brand.city}</p>
        <h2>
          Let’s meet.
          <br />
          <em>Make it extraordinary.</em>
        </h2>
        <p>{brand.address}</p>
        <div className="x-actions">
          {brand.maps && (
            <a
              className="x-button x-button-outline"
              href={brand.maps}
              target="_blank"
              rel="noreferrer"
            >
              Get directions ↗
            </a>
          )}
          {brand.phone && (
            <a
              className="x-text-link"
              href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`}
            >
              {brand.phone}
            </a>
          )}
        </div>
      </div>
      <iframe
        title={`${brand.name} office location`}
        src={`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${query}!6i16`}
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </section>
  );
}
export function PortfolioFooter({ content: c }: { content: SiteContent }) {
  return (
    <>
      <BusinessMap brand={c.brand} />
      <footer className="p-footer">
        <Link href="/">
          <img src={c.brand.logo} alt={c.brand.name} width="120" height="77" />
        </Link>
        <div>
          <Link href="/services">Our services</Link>
          <Link href="/gallery">Explore the gallery</Link>
          <Link href="/planning">Planning & budget</Link>
        </div>
        <div>
          {c.brand.phone && (
            <a href={`tel:${c.brand.phone.replace(/[^+\d]/g, "")}`}>
              {c.brand.phone}
            </a>
          )}
          {c.brand.email && (
            <a href={`mailto:${c.brand.email}`}>{c.brand.email}</a>
          )}
          <span>
            © {new Date().getFullYear()} {c.brand.name}
          </span>
        </div>
        <p>{c.footer.imageryNote}</p>
      </footer>
    </>
  );
}
