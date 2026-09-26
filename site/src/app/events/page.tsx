import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ConceptGrid } from "@/components/events/ConceptGrid";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  alternates: { canonical: "/events" },
  title: "Our Work",
  description:
    "Illustrated design concepts for weddings, festive nights, corporate events, hospitality and private celebrations.",
};

export default function EventsIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Celebrations worth stepping into."
        description="Design concepts from our studio — illustrated starting points for real events, each one clearly marked as a concept rather than a finished project."
        photo="floralTablescape"
        compact
      />

      <section className="relative section-pad">
        <div className="content-shell">
          <Reveal className="mb-12 max-w-2xl rounded-card border border-gold/25 bg-ink-soft/70 p-6">
            <p className="text-sm leading-relaxed text-ivory-dim">
              <span className="font-medium text-gold-bright">
                A note on what you&rsquo;re seeing.
              </span>{" "}
              Everything below is original illustration produced by our studio
              to show design direction. None of it is a photograph of a
              completed client event, and no client names, dates or venues are
              implied. Photography will replace these as events are delivered
              and permission is given.
            </p>
          </Reveal>

          <ConceptGrid />
        </div>
      </section>

      <section className="relative section-pad-sm">
        <div className="content-shell text-center">
          <Reveal>
            <h2 className="text-display text-balance text-glow">
              Want something in this direction?
            </h2>
            <Link
              href="/contact"
              className="mt-9 inline-flex items-center rounded-full bg-gold px-8 py-4 text-base font-medium text-ink shadow-[0_18px_44px_-18px_rgba(214,183,107,0.85)] transition-colors hover:bg-gold-bright"
            >
              Book Your Event
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
