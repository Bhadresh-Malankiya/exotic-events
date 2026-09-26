import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { GoldenLines } from "@/components/motion/GoldenLines";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { planningCommitments, planningJourney, site } from "@/content/site";
import { ART_SIZES, concepts } from "@/lib/assets";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About",
  description:
    "How Exotic Event & Entertainment plans, styles and runs weddings, festive nights and corporate events.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A planning studio, not a package menu."
        description={`${site.fullName} plans and styles events end to end — the design direction, the vendors, and the coordination on the day itself.`}
        photo="weddingMandapCeremony"
        compact
      />

      <section className="relative section-pad">
        <GoldenLines variant="drift" opacity={0.28} />
        <div className="content-shell relative grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="text-display text-shade">How we work</h2>
            <div className="mt-6 space-y-5 text-body-lg leading-relaxed text-ivory-dim">
              <p>
                Most events go wrong in the gaps — between the décor team and
                the caterer, between what was agreed in month one and what
                arrives on the day. We plan to close those gaps.
              </p>
              <p>
                That means one planner who holds the whole picture, a written
                scope everyone works from, and a team physically present on the
                day rather than managing by phone. The design direction comes
                first, and every vendor decision is made against it.
              </p>
              <p>
                We work across weddings, Navratri and festive nights, corporate
                events, hospitality, décor, destinations and private
                celebrations — at whatever scale suits the occasion.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-card border border-surface-line">
              <Image
                src={concepts.invitationSuiteFlatlay}
                alt="Illustrated invitation suite concept"
                width={ART_SIZES.concept.width}
                height={ART_SIZES.concept.height}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative isolate section-pad">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-ink-soft/60"
        />
        <div className="content-shell relative">
          <Reveal className="max-w-2xl">
            <h2 className="text-display text-shade">What we commit to</h2>
          </Reveal>
          <div className="mt-12 grid gap-card-gap md:grid-cols-3">
            {planningCommitments.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08}>
                <div className="h-full rounded-card border border-surface-line bg-ink p-7">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40">
                    <Icon name="check" className="h-4 w-4 text-gold-bright" />
                  </span>
                  <h3 className="mt-5 text-lg font-medium text-ivory">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative section-pad">
        <GoldenLines variant="weave" opacity={0.26} />
        <div className="content-shell relative">
          <Reveal className="max-w-2xl">
            <h2 className="text-display text-shade">The five stages</h2>
            <p className="mt-5 text-body-lg text-ivory-dim">
              The same shape on every event — only the scale changes.
            </p>
          </Reveal>

          <ol className="mt-12 grid gap-card-gap sm:grid-cols-2 lg:grid-cols-5">
            {planningJourney.map((stage, index) => (
              <Reveal as="li" key={stage.id} delay={index * 0.06}>
                <div className="h-full rounded-card border border-surface-line bg-ink-soft p-6">
                  <span className="font-display text-2xl text-gold/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-xl text-ivory">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {stage.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative section-pad-sm">
        <div className="content-shell">
          <Reveal className="mx-auto max-w-2xl rounded-card border border-gold/25 bg-ink-soft/70 p-8 text-center">
            <h2 className="font-display text-2xl text-ivory">
              About the imagery on this site
            </h2>
            <p className="mt-4 leading-relaxed text-ivory-dim">
              Every event image here is original illustration produced by our
              studio to communicate design direction. We don&rsquo;t publish
              client photographs, testimonials or event counts we can&rsquo;t
              verify — as real events are delivered and permission is given,
              photography will replace these concepts.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative section-pad-sm">
        <GoldenLines variant="corner" opacity={0.38} />
        <div className="content-shell relative text-center">
          <Reveal>
            <h2 className="text-display text-balance text-glow">
              Tell us what you&rsquo;re planning.
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
