import Image from "next/image";
import Link from "next/link";
import { EnquiryDialog } from "@/components/forms/EnquiryDialog";
import { GoldenLines } from "@/components/motion/GoldenLines";
import { Reveal } from "@/components/motion/Reveal";
import { ART_SIZES, decor } from "@/lib/assets";

export function EnquiryCTA() {
  return (
    <section className="relative isolate overflow-hidden section-pad">
      <GoldenLines variant="corner" opacity={0.45} />

      <div className="content-shell relative">
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <Image
            src={decor.floralSectionDivider}
            alt=""
            width={ART_SIZES.decor.width}
            height={ART_SIZES.decor.height}
            aria-hidden="true"
            className="pointer-events-none mx-auto mb-10 w-56 opacity-90"
          />

          <h2 className="text-display text-balance text-glow">
            Let&rsquo;s create something worth remembering.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-body-lg text-ivory-dim text-shade">
            Tell us the occasion, the date, and the city — we&rsquo;ll take it
            from there.
          </p>

          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-gold px-8 py-4 text-base font-medium text-ink shadow-[0_18px_44px_-18px_rgba(214,183,107,0.85)] transition-colors hover:bg-gold-bright"
            >
              Book Your Event
            </Link>
            <EnquiryDialog
              triggerLabel="Discuss Your Ideas"
              triggerClassName="inline-flex items-center rounded-full border border-gold/35 px-8 py-4 text-base font-medium text-ivory transition-colors hover:border-gold-bright hover:text-gold-bright"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
