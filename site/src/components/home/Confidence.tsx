import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { generalFaqs, planningCommitments } from "@/content/site";
import { ART_SIZES, decor, sectionBackgrounds } from "@/lib/assets";

export function Confidence() {
  return (
    <section className="relative isolate section-pad">
      <Image
        src={sectionBackgrounds.emeraldBotanicalEdges}
        alt=""
        width={ART_SIZES.sectionBackground.width}
        height={ART_SIZES.sectionBackground.height}
        sizes="100vw"
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-forest/80"
        style={{ backgroundColor: "rgba(20, 38, 32, 0.82)" }}
      />

      <div className="content-shell relative grid gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <h2 className="text-display text-shade">
            Planned the way we&rsquo;d want it planned.
          </h2>
          <p className="mt-5 max-w-md text-body-lg text-ivory-dim">
            A few commitments we hold ourselves to on every event, whatever
            its size.
          </p>

          <ul className="mt-12 space-y-9">
            {planningCommitments.map((item) => (
              <li key={item.title} className="flex gap-5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-ink/40">
                  <Icon name="check" className="h-4 w-4 text-gold-bright" />
                </span>
                <div>
                  <h3 className="text-lg font-medium text-ivory">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 leading-relaxed text-ivory-dim/90">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative">
            <Image
              src={decor.oliveBranchSweep}
              alt=""
              width={ART_SIZES.decor.width}
              height={ART_SIZES.decor.height}
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 w-40 opacity-40 lg:w-52"
            />
            <h2 className="relative text-display text-shade">
              Questions, answered plainly.
            </h2>
            <div className="relative mt-10 border-t border-ivory/15">
              {generalFaqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group border-b border-ivory/15 py-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-ivory">
                    <span className="font-medium">{faq.question}</span>
                    <Icon
                      name="plus"
                      className="h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45"
                    />
                  </summary>
                  <p className="mt-3.5 max-w-xl leading-relaxed text-ivory-dim/90">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
