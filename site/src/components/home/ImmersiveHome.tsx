"use client";
/* eslint-disable @next/next/no-img-element */
import { ResponsivePhoto } from "@/components/ui/ResponsivePhoto";
import Link from "next/link";
import { LineIcon } from "@/components/ui/LineIcon";
import { BusinessMap } from "@/components/portfolio/SiteChrome";
import {
  FeaturedCollection,
  PlanningJourney,
  NextSteps,
} from "@/components/portfolio/PlanningContent";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { EnquiryDialog } from "@/components/forms/EnquiryDialog";
import type { SiteContent } from "@/lib/cms/schema";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <LineIcon name={diagonal ? "diagonal" : "arrow"} />;
}
function Mark({ index = 0 }: { index?: number }) {
  const paths = [
    <>
      <circle cx="10" cy="13" r="6" />
      <circle cx="19" cy="13" r="6" />
      <path d="m8 5 2-3 2 3m5 0 2-3 2 3" />
    </>,
    <>
      <path d="M4 24V9h8v15M12 24V3h10v21M2 24h24M7 12v2m0 3v2m9-12h2m-2 4h2m-2 4h2m-2 4h2" />
    </>,
    <>
      <path d="M14 24C1 20 1 12 3 9c6 0 9 6 11 15Zm0 0C27 20 27 12 25 9c-6 0-9 6-11 15Zm0-3C8 13 9 6 14 2c5 4 6 11 0 19Z" />
    </>,
    <>
      <circle cx="14" cy="14" r="11" />
      <ellipse cx="14" cy="14" rx="5" ry="11" />
      <path d="M3 14h22M6 7h16M6 21h16" />
    </>,
    <>
      <path d="m14 2 3 8 9 1-7 6 2 9-7-5-7 5 2-9-7-6 9-1Z" />
    </>,
    <>
      <path d="M3 21h22M5 18a9 9 0 0 1 18 0ZM14 7V4m-3 0h6M2 24h24" />
    </>,
  ];
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      aria-hidden="true"
    >
      {paths[index % paths.length]}
    </svg>
  );
}
function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <>
      <p className="x-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      {description && <p className="x-description">{description}</p>}
    </>
  );
}
function ScrollControls({
  rail,
}: {
  rail: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="x-controls">
      <button
        aria-label="Previous photos"
        onClick={() =>
          rail.current?.scrollBy({
            left: -rail.current.clientWidth * 0.7,
            behavior: "smooth",
          })
        }
      >
        <LineIcon name="back" />
      </button>
      <button
        aria-label="Next photos"
        onClick={() =>
          rail.current?.scrollBy({
            left: rail.current.clientWidth * 0.7,
            behavior: "smooth",
          })
        }
      >
        <LineIcon name="arrow" />
      </button>
    </div>
  );
}
function useDragRail(ref: React.RefObject<HTMLDivElement | null>, key = "") {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = 0,
      left = 0,
      active = false,
      moved = false;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      active = true;
      moved = false;
      start = e.clientX;
      left = el.scrollLeft;
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      const distance = e.clientX - start;
      if (Math.abs(distance) > 7) {
        moved = true;
        el.setPointerCapture(e.pointerId);
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
        e.preventDefault();
        el.scrollLeft = left - distance;
      }
    };
    const up = () => {
      active = false;
      el.style.scrollSnapType = "";
      el.style.cursor = "";
    };
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    const drag = (e: DragEvent) => e.preventDefault();
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    el.addEventListener("dragstart", drag);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      el.removeEventListener("dragstart", drag);
    };
  }, [ref, key]);
}
export function ImmersiveHome({
  content: c,
  preview = false,
}: {
  content: SiteContent;
  preview?: boolean;
}) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const [category, setCategory] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null),
    serviceRail = useRef<HTMLDivElement>(null),
    galleryRail = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();
  useDragRail(serviceRail);
  useDragRail(galleryRail, category);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const parallax = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    if (
      paused ||
      scrolled ||
      reduce ||
      !c.hero.autoplay ||
      c.hero.slides.length < 2
    )
      return;
    const id = setInterval(
      () => setSlide((i) => (i + 1) % c.hero.slides.length),
      c.hero.intervalSeconds * 1000,
    );
    return () => clearInterval(id);
  }, [
    paused,
    scrolled,
    reduce,
    c.hero.autoplay,
    c.hero.intervalSeconds,
    c.hero.slides.length,
  ]);
  useEffect(() => {
    if (lightbox !== null) dialog.current?.showModal();
    else dialog.current?.close();
  }, [lightbox]);
  const filtered = c.gallery.items.filter(
    (x) => category === "All" || x.category === category,
  ).slice(0, 12);
  const hero = c.hero.slides[slide % c.hero.slides.length];
  const selectSlide = (i: number) => {
    setSlide(i);
    setPaused(true);
  };
  return (
    <div className="exotic-site p-home-spaced">
      {preview && (
        <div className="x-preview-banner">
          Draft preview · changes are not public{" "}
          <a href="/admin">
            Return to editor <LineIcon name="diagonal" />
          </a>
        </div>
      )}
      <header className={`x-header ${scrolled ? "is-scrolled" : ""}`}>
        <a
          href="#home"
          className="x-logo"
          aria-label={`${c.brand.name} — home`}
        >
          <img src={c.brand.logo} alt={c.brand.name} width="267" height="171" />
        </a>
        <nav className={menu ? "is-open" : ""} aria-label="Main navigation">
          {[
            ["#home", "Home"],
            ["/services", "Services"],
            ["/gallery", "Gallery"],
            ["/planning", "Planning"],
            ["#contact", "Contact"],
          ].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
        </nav>
        <EnquiryDialog
          triggerLabel={`${c.brand.bookingLabel}  →`}
          triggerClassName="x-button x-button-outline x-nav-book"
        />
        <button
          className="x-menu"
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? (
            "✕"
          ) : (
            <>
              <i />
              <i />
            </>
          )}
        </button>
      </header>
      {c.hero.enabled && (
        <section
          onPointerMove={(e) => {
            if (reduce || e.pointerType !== "mouse") return;
            const box = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty(
              "--mx",
              `${(e.clientX - box.left - box.width / 2) * 0.008}px`,
            );
          }}
          ref={heroRef}
          className="x-hero"
          id="home"
          aria-label="Featured experiences"
        >
          <motion.div
            className="x-hero-scenes"
            style={{ y: reduce ? 0 : parallax }}
          >
            {c.hero.slides.map((s, i) => (
              <div
                className={`x-hero-scene ${slide === i ? "is-active" : ""}`}
                key={s.image + i}
              >
                <ResponsivePhoto
                  sizes="100vw"
                  src={s.image}
                  alt={s.alt}
                  loading="eager"
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              </div>
            ))}
          </motion.div>
          <div className="x-hero-shade" />
          <div className="x-dust" aria-hidden="true" />
          <div className="x-hero-copy">
            <p className="x-kicker">{hero.eyebrow}</p>
            <h1>
              {hero.title}
              <em>{hero.accent}</em>
            </h1>
            <div className="x-gold-rule" />
            <p className="x-hero-description">{hero.description}</p>
            <div className="x-actions">
              <EnquiryDialog
                triggerLabel={`${c.brand.bookingLabel}  →`}
                triggerClassName="x-button x-button-gold"
              />
              <a className="x-button x-button-glass" href="#experiences">
                {hero.cta}
                <span className="x-play">
                  <LineIcon name="diagonal" />
                </span>
              </a>
            </div>
            <div className="x-hero-promises">
              <span>
                <Mark index={3} />
                Thoughtfully planned
              </span>
              <span>
                <Mark index={2} />
                Beautifully designed
              </span>
              <span>
                <Mark index={4} />
                Personally yours
              </span>
            </div>
          </div>
          <div className="x-hero-side">
            People
            <br />
            Events
            <br />
            Emotions
            <br />
            Forever
            <span />
          </div>
          <div className="x-hero-bottom">
            <a href="#experiences" className="x-scroll">
              <span>
                <LineIcon name="down" />
              </span>
              Scroll to discover
            </a>
            <div className="x-slide-control">
              <span className="x-scene-label">{hero.label}</span>
              <div className="x-slide-dots">
                {c.hero.slides.map((s, i) => (
                  <button
                    key={i}
                    className={slide === i ? "active" : ""}
                    aria-label={`Show ${s.label}`}
                    aria-pressed={slide === i}
                    onClick={() => selectSlide(i)}
                  >
                    <span>0{i + 1}</span>
                    <i />
                  </button>
                ))}
                <button
                  className="x-pause"
                  aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? "▷" : "Ⅱ"}
                </button>
              </div>
            </div>
            <p className="x-signature">
              More than events.
              <br />
              We create feelings.
            </p>
          </div>
        </section>
      )}
      {c.services.enabled && (
        <section id="experiences" className="x-services x-section x-ribbon">
          <img className="x-silk" src={c.brand.ribbon} alt="" loading="lazy" />
          <div className="x-section-intro">
            <Heading {...c.services} />
            <a className="x-text-link" href="#contact">
              Let’s bring it to life <Arrow />
            </a>
            <ScrollControls rail={serviceRail} />
          </div>
          <div className="x-service-rail" ref={serviceRail}>
            {c.services.items.map((item, i) => (
              <Link
                href={
                  item.serviceSlug
                    ? `/services/${item.serviceSlug}`
                    : "/services"
                }
                className="x-service-card"
                onPointerMove={(e) => {
                  const box = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty(
                    "--px",
                    `${e.clientX - box.left}px`,
                  );
                  e.currentTarget.style.setProperty(
                    "--py",
                    `${e.clientY - box.top}px`,
                  );
                }}
                key={i}
              >
                <ResponsivePhoto
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                />
                <span className="x-card-shade" />
                <span className="x-service-number">{item.category}</span>
                <span className="x-service-copy">
                  <Mark index={i} />
                  <h3>{item.title}</h3>
                  <span className="x-hover-copy">{item.description}</span>
                  <span className="x-card-arrow">
                    <LineIcon name="diagonal" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <FeaturedCollection content={c} />
      {c.gallery.enabled && (
        <section id="gallery" className="x-gallery x-section">
          <div className="x-section-top">
            <div>
              <Heading {...c.gallery} />
            </div>
            <div className="x-gallery-tools">
              <div className="x-filters" aria-label="Filter gallery">
                {[
                  "All",
                  ...new Set(c.gallery.items.map((x) => x.category)),
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    aria-pressed={cat === category}
                    className={cat === category ? "active" : ""}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <ScrollControls rail={galleryRail} />
            </div>
          </div>
          <div ref={galleryRail} className="x-gallery-rail" key={category}>
            {filtered.map((item, i) => (
              <button
                className="x-gallery-card"
                key={item.image + i}
                onClick={() => setLightbox(c.gallery.items.indexOf(item))}
              >
                <ResponsivePhoto
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                />
                <span className="x-card-shade" />
                <span className="x-photo-label">{item.category}</span>
                <span className="x-gallery-copy">
                  <h3>{item.title}</h3>
                  <span className="x-hover-copy">{item.description}</span>
                </span>
                <span className="x-view">
                  View <Arrow diagonal />
                </span>
              </button>
            ))}
          </div>
          <div className="x-gallery-bottom">
            <Link className="x-text-link" href="/gallery">
              Explore the full gallery & save your favourites{" "}
              <LineIcon name="diagonal" />
            </Link>
            <span>
              Drag or explore <Arrow />
            </span>
          </div>
        </section>
      )}
      {c.feature.enabled && (
        <section className="x-feature">
          <img
            className="x-feature-photo"
            src={c.feature.image}
            alt={c.feature.alt}
            loading="lazy"
          />
          <div className="x-feature-shade" />
          <div className="x-feature-copy">
            <Heading {...c.feature} />
            <EnquiryDialog
              triggerLabel={`${c.feature.cta}  ↗`}
              triggerClassName="x-button x-button-glass"
            />
          </div>
          <span className="x-feature-word" aria-hidden="true">
            EXTRAORDINARY
          </span>
        </section>
      )}
      {c.process.enabled && (
        <section className="x-journey x-section x-ribbon" id="journey">
          <img className="x-silk" src={c.brand.ribbon} alt="" loading="lazy" />
          <img
            className="x-section-background"
            src={c.process.image}
            alt=""
            loading="lazy"
          />
          <div className="x-section-intro">
            <Heading {...c.process} />
            <a href="#contact" className="x-text-link">
              Start your journey <Arrow />
            </a>
          </div>
          <div className="x-process">
            {c.process.steps.map((step, i) => (
              <div className="x-process-step" key={i}>
                <span className="x-process-number">0{i + 1}</span>
                <span className="x-process-icon">
                  <Mark index={i + 2} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
            <div className="x-process-note">
              <span>Dream.</span>
              <span>Plan.</span>
              <span>Decorate.</span>
              <em>Celebrate.</em>
            </div>
          </div>
        </section>
      )}
      {c.planning.enabled && <PlanningJourney content={c} compact />}
      {c.faq.enabled && (
        <section className="x-faq x-section">
          <div className="x-section-intro">
            <Heading {...c.faq} />
            <p className="x-description">Have something else in mind?</p>
            {c.brand.phone && (
              <a
                className="x-text-link"
                href={`tel:${c.brand.phone.replace(/[^+\d]/g, "")}`}
              >
                Let’s talk <Arrow />
              </a>
            )}
          </div>
          <div className="x-faq-list">
            {c.faq.items.map((item, i) => (
              <details key={i}>
                <summary>
                  <span className="x-faq-number">0{i + 1}</span>
                  {item.question}
                  <span className="x-faq-toggle">+</span>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      <NextSteps content={c} />
      {c.contact.enabled && (
        <section id="contact" className="x-contact x-ribbon">
          <img
            className="x-section-background"
            src={c.contact.image}
            alt=""
            loading="lazy"
          />
          <div className="x-contact-copy">
            <Heading {...c.contact} />
            <div className="x-actions">
              <EnquiryDialog
                triggerLabel={`${c.contact.cta}  →`}
                triggerClassName="x-button x-button-gold"
              />
              {c.brand.phone && (
                <a
                  href={`tel:${c.brand.phone.replace(/[^+\d]/g, "")}`}
                  className="x-button x-button-glass"
                >
                  Call Our Team <Arrow diagonal />
                </a>
              )}
              {c.brand.whatsapp && (
                <a
                  className="x-text-link"
                  href={`https://wa.me/${c.brand.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp <LineIcon name="diagonal" />
                </a>
              )}
            </div>
          </div>
          <p className="x-contact-mantra">
            Bigger
            <br />
            Brighter
            <br />
            Bolder
            <br />
            <span>Together</span>
          </p>
        </section>
      )}
      <BusinessMap brand={c.brand} />
      <footer className="x-footer">
        <div className="x-footer-main">
          <a href="#home">
            <img
              className="x-footer-logo"
              src={c.brand.logo}
              alt={c.brand.name}
              width="267"
              height="171"
            />
          </a>
          <div>
            <p className="x-kicker">Explore</p>
            <Link href="/services">Our expertise</Link>
            <Link href="/gallery">The gallery</Link>
            <Link href="/planning">Planning & budget</Link>
            <a href="#contact">Start a conversation</a>
          </div>
          <div className="x-footer-contact">
            <p className="x-kicker">Find us in {c.brand.city}</p>
            {c.brand.phone && (
              <a href={`tel:${c.brand.phone.replace(/[^+\d]/g, "")}`}>
                {c.brand.phone}
              </a>
            )}
            {c.brand.email && (
              <a href={`mailto:${c.brand.email}`}>{c.brand.email}</a>
            )}
            {c.brand.maps && (
              <a href={c.brand.maps} target="_blank" rel="noreferrer">
                {c.brand.address} ↗
              </a>
            )}
            {c.brand.instagram && (
              <a href={c.brand.instagram} target="_blank" rel="noreferrer">
                Instagram <LineIcon name="diagonal" />
              </a>
            )}
          </div>
          <p className="x-footer-signature">{c.footer.tagline}</p>
        </div>
        <div className="x-footer-bottom">
          <span>
            © {new Date().getFullYear()} {c.brand.name}
          </span>
          <span>{c.brand.tagline}</span>
          <a href="#home" aria-label="Back to top">
            ↑
          </a>
        </div>
        <p className="x-imagery-note">{c.footer.imageryNote}</p>
      </footer>
      <dialog
        ref={dialog}
        className="x-lightbox"
        aria-label="Photo gallery"
        onClose={() => setLightbox(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightbox(null);
        }}
        onKeyDown={(e) => {
          if (lightbox === null) return;
          if (e.key === "ArrowRight")
            setLightbox((lightbox + 1) % c.gallery.items.length);
          if (e.key === "ArrowLeft")
            setLightbox(
              (lightbox + c.gallery.items.length - 1) % c.gallery.items.length,
            );
        }}
      >
        {lightbox !== null && (
          <>
            <button
              className="x-lightbox-close"
              aria-label="Close photo"
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>
            <img
              src={c.gallery.items[lightbox].image}
              alt={c.gallery.items[lightbox].alt}
            />
            <div className="x-lightbox-caption">
              <div>
                <p className="x-kicker">{c.gallery.items[lightbox].category}</p>
                <h3>{c.gallery.items[lightbox].title}</h3>
                <p>{c.gallery.items[lightbox].description}</p>
              </div>
              <div className="x-controls">
                <button
                  aria-label="Previous photo"
                  onClick={() =>
                    setLightbox(
                      (lightbox + c.gallery.items.length - 1) %
                        c.gallery.items.length,
                    )
                  }
                >
                  <LineIcon name="back" />
                </button>
                <button
                  aria-label="Next photo"
                  onClick={() =>
                    setLightbox((lightbox + 1) % c.gallery.items.length)
                  }
                >
                  <LineIcon name="arrow" />
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
