"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logos } from "@/lib/assets";
import { primaryNav, site } from "@/content/site";
import { Icon } from "@/components/ui/Icon";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  if (pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/gallery") || pathname.startsWith("/services") || pathname === "/planning") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-surface-line/60 bg-ink/85 backdrop-blur-md">
      <div className="content-shell flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          aria-label={`${site.fullName} — home`}
        >
          <Image
            src={logos.emblemGold}
            alt=""
            width={79}
            height={32}
            className="h-8 w-auto"
            loading="eager"
            fetchPriority="high"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-[0.14em] text-ivory">
              {site.name.toUpperCase()}
            </span>
            <span className="mt-1 text-[0.6rem] tracking-[0.24em] text-muted">
              EVENT &amp; ENTERTAINMENT
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-9">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ivory-dim transition-colors hover:text-gold-bright"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold-bright"
          >
            Book Your Event
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-surface-line text-ivory"
          aria-label="Open menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label="Site menu"
        className="m-0 h-full max-h-none w-full max-w-none border-none bg-ink p-0 text-ivory backdrop:bg-ink/70 open:flex open:flex-col"
      >
        <div className="content-shell flex h-20 items-center justify-between">
          <span className="font-display text-lg tracking-[0.14em]">
            {site.name.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-surface-line"
            aria-label="Close menu"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <nav
          aria-label="Mobile"
          className="content-shell flex flex-1 flex-col justify-center gap-2 pb-24"
          onClick={() => setOpen(false)}
        >
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b border-surface-line py-5 font-display text-3xl text-ivory"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-8 inline-flex w-fit items-center rounded-full bg-gold px-7 py-3 text-base font-medium text-ink"
          >
            Book Your Event
          </Link>
        </nav>
      </dialog>
    </header>
  );
}
