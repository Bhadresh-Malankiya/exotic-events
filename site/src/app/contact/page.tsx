import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { GoldenLines } from "@/components/motion/GoldenLines";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { generalFaqs } from "@/content/site";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description:
    "Send an enquiry about your wedding, festive night, corporate event or private celebration.",
};

const whatToExpect = [
  {
    icon: "email",
    title: "We read every enquiry",
    body: "Your message reaches our planning team directly — not a shared inbox nobody watches.",
  },
  {
    icon: "clock",
    title: "A reply within a business day",
    body: "Usually with a couple of questions and a suggested time for a planning call.",
  },
  {
    icon: "calendar",
    title: "Then a proper conversation",
    body: "We talk through date, venue, guest count and budget before proposing any scope.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's create something worth remembering."
        description="Tell us the occasion, the date, and the city. We'll come back with the questions that actually matter."
        photo="ballroomChandeliers"
        compact
      />

      <section className="relative section-pad">
        <GoldenLines variant="drift" opacity={0.26} />
        <div className="content-shell relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <h2 className="text-heading text-ivory">What happens next</h2>
            <ul className="mt-8 space-y-8">
              {whatToExpect.map((item) => (
                <li key={item.title} className="flex gap-5">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40">
                    <Icon name={item.icon} className="h-4 w-4 text-gold" />
                  </span>
                  <div>
                    <h3 className="font-medium text-ivory">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-12 rounded-card border border-surface-line bg-ink-soft p-6">
              <h3 className="font-medium text-ivory">Before you write</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Even a rough date and guest count helps. If your date is still
                open, say so — flexibility often opens up better venues.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-card border border-surface-line bg-ink-soft p-7 md:p-10">
              <h2 className="text-heading text-ivory">Send an enquiry</h2>
              <p className="mt-2 text-sm text-muted">
                Fields marked with a short note are optional.
              </p>
              <EnquiryForm className="mt-8" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative isolate section-pad-sm">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-ink-soft/60"
        />
        <div className="content-shell relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <h2 className="text-display text-shade">Quick answers</h2>
          <div className="border-t border-surface-line">
            {generalFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group border-b border-surface-line py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-ivory">
                  <span className="font-medium">{faq.question}</span>
                  <Icon
                    name="plus"
                    className="h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45"
                  />
                </summary>
                <p className="mt-3.5 max-w-2xl leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
