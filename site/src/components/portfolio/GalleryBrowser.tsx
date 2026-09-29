"use client";
import { ResponsivePhoto } from "@/components/ui/ResponsivePhoto";
import { LineIcon } from "@/components/ui/LineIcon";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { GalleryItem, SiteContent } from "@/lib/cms/schema";
import { filterGallery, relatedGallery } from "@/lib/gallery";
import { EnquiryDialog } from "@/components/forms/EnquiryDialog";
export function GalleryBrowser({ content: c }: { content: SiteContent }) {
  const query = useSearchParams();
  const [saved, setSaved] = useState<string[]>([]),
    [status, setStatus] = useState(""),
    [limit, setLimit] = useState(24);
  const dialog = useRef<HTMLDialogElement>(null),
    searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const items = c.gallery.items;
  const selected = items.find((i) => i.id === query.get("photo"));
  const category = query.get("category") || "";
  const q = query.get("q") || "";
  const [searchValue, setSearchValue] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setSearchValue(q), 0);
    return () => clearTimeout(t);
  }, [q]);
  const savedView = query.get("saved") === "1";
  const filtered = filterGallery(items, {
    q,
    category,
    featured: query.get("featured") || "",
    collection: query.get("collection") || "",
    ids: query.get("ids") || undefined,
  }).filter((i) => !savedView || saved.includes(i.id));
  function href(changes: Record<string, string | null>) {
    const p = new URLSearchParams(query.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    return "/gallery" + (p.size ? "?" + p.toString() : "");
  }
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const s = JSON.parse(localStorage.getItem("exotic-shortlist") || "[]");
        if (Array.isArray(s))
          setSaved(s.filter((x) => typeof x === "string").slice(0, 20));
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (selected) {
      if (!dialog.current?.open) dialog.current?.showModal();
    } else dialog.current?.close();
  }, [selected]);
  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );
  function toggle(item: GalleryItem) {
    if (!saved.includes(item.id) && saved.length >= 20) {
      setStatus(
        "Your shortlist can hold 20 photos. Remove one to add another.",
      );
      return;
    }
    const next = saved.includes(item.id)
      ? saved.filter((id) => id !== item.id)
      : [...saved, item.id];
    setSaved(next);
    try {
      localStorage.setItem("exotic-shortlist", JSON.stringify(next));
    } catch {
      setStatus(
        "Saved for this visit. Your browser could not store the shortlist.",
      );
    }
  }
  async function share(url: string) {
    try {
      await navigator.clipboard.writeText(
        new URL(url, window.location.origin).href,
      );
      setStatus("Link copied. Share it with your family, client, or planner.");
    } catch {
      setStatus("Copy this link: " + new URL(url, window.location.origin).href);
    }
  }
  function navigate(e: MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    e.preventDefault();
    if (searchTimer.current) clearTimeout(searchTimer.current);
    window.history.pushState(null, "", e.currentTarget.href);
  }
  function close() {
    window.history.replaceState(null, "", href({ photo: null }));
  }
  const shortlist = items.filter((i) => saved.includes(i.id));
  const enquiryMessage = shortlist.length
    ? "I would like to discuss these gallery selections:\n" +
      shortlist
        .map((i) => `${i.title.slice(0, 40)} — /gallery?photo=${i.id}`)
        .join("\n") +
      "\n\nMy event plans: "
    : "";
  function pin(item: GalleryItem, index: number) {
    return (
      <article className="p-pin" key={item.id}>
        <Link
          prefetch={false}
          onClick={navigate}
          href={href({ photo: item.id })}
          scroll={false}
          className="p-pin-image"
          style={{ aspectRatio: [0.76, 1.08, 0.88, 0.68, 1.18][index % 5] }}
        >
          <ResponsivePhoto src={item.image} alt={item.alt} loading="lazy" />
          <span className="p-pin-open">Explore <LineIcon name="diagonal"/></span>
          {item.featured && <span className="p-featured-badge">Featured</span>}
        </Link>
        <button
          className={`p-save ${saved.includes(item.id) ? "is-saved" : ""}`}
          onClick={() => toggle(item)}
          aria-label={`${saved.includes(item.id) ? "Remove" : "Save"} ${item.title}`}
          aria-pressed={saved.includes(item.id)}
        >
          {saved.includes(item.id) ? "♥" : "♡"}
        </button>
        <div className="p-pin-copy">
          <p>
            {item.category}
            <span>{item.completed ? "Our work" : "Inspiration"}</span>
          </p>
          <Link
            prefetch={false}
            onClick={navigate}
            href={href({ photo: item.id })}
            scroll={false}
          >
            <h2>{item.title}</h2>
          </Link>
          {item.location && <small>{item.location}</small>}
        </div>
      </article>
    );
  }
  return (
    <>
      <div className="p-gallery-controls">
        <div className="p-search-row">
          <label className="p-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search gallery"
              value={searchValue}
              placeholder="Try floral, wedding, stage, gold…"
              onChange={(e) => {
                const value = e.target.value;
                setSearchValue(value);
                if (searchTimer.current) clearTimeout(searchTimer.current);
                searchTimer.current = setTimeout(
                  () =>
                    window.history.replaceState(
                      null,
                      "",
                      href({ q: value || null, photo: null }),
                    ),
                  450,
                );
              }}
            />
          </label>
          <button
            onClick={() =>
              share(
                href(
                  savedView
                    ? {
                        saved: null,
                        ids: saved.join(",") || "none",
                        photo: null,
                      }
                    : { photo: null },
                ),
              )
            }
            className="x-button x-button-outline"
          >
            Share this collection <LineIcon name="diagonal"/>
          </button>
        </div>
        <div className="p-category-tabs">
          <Link
            prefetch={false}
            onClick={navigate}
            scroll={false}
            href={href({ category: null, photo: null })}
            className={!category ? "active" : ""}
          >
            All occasions
          </Link>
          {[...new Set(items.map((i) => i.category))].map((cat) => (
            <Link
              prefetch={false}
              onClick={navigate}
              scroll={false}
              key={cat}
              href={href({ category: cat, photo: null })}
              className={category === cat ? "active" : ""}
            >
              {cat}
            </Link>
          ))}
        </div>
        <div className="p-filter-row">
          <div>
            <Link
              prefetch={false}
              onClick={navigate}
              scroll={false}
              className={query.get("featured") === "1" ? "active" : ""}
              href={href({
                featured: query.get("featured") === "1" ? null : "1",
                photo: null,
              })}
            >
              ✦ Featured
            </Link>
            <Link
              prefetch={false}
              onClick={navigate}
              scroll={false}
              className={query.get("collection") === "work" ? "active" : ""}
              href={href({
                collection: query.get("collection") === "work" ? null : "work",
                photo: null,
              })}
            >
              Our completed work
            </Link>
            <Link
              prefetch={false}
              onClick={navigate}
              scroll={false}
              className={savedView ? "active" : ""}
              href={href({
                saved: savedView ? null : "1",
                ids: null,
                photo: null,
              })}
            >
              ♡ My shortlist ({saved.length})
            </Link>
          </div>
          <span>
            {filtered.length} {filtered.length === 1 ? "photo" : "photos"}
            {query.get("ids") ? " · Shared collection" : ""}
          </span>
        </div>
      </div>
      {status && (
        <div className="p-notice" role="status">
          {status}
          <button aria-label="Dismiss message" onClick={() => setStatus("")}>
            ✕
          </button>
        </div>
      )}
      {filtered.length ? (
        <>
          <div className="p-masonry">{filtered.slice(0, limit).map(pin)}</div>
          {filtered.length > limit && (
            <div className="p-load-more">
              <button
                className="x-button x-button-outline"
                onClick={() => setLimit((v) => v + 24)}
              >
                Explore more photos <LineIcon name="down"/>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-empty">
          <span>✦</span>
          <h2>
            {savedView
              ? "Your favourites start here."
              : query.get("collection") === "work"
                ? "Our latest work, coming into focus."
                : "A different search. A new possibility."}
          </h2>
          <p>
            {savedView
              ? "Tap the heart on any photo to build your personal collection."
              : query.get("collection") === "work"
                ? "We are curating our completed-event portfolio. Contact our team to see recent projects, or explore the inspiration collection."
                : "Try a broader keyword or another occasion."}
          </p>
          <Link
            prefetch={false}
            onClick={navigate}
            href="/gallery"
            className="x-button x-button-outline"
          >
            Explore all photos <LineIcon name="diagonal"/>
          </Link>
        </div>
      )}
      {shortlist.length > 0 && (
        <aside className="p-shortlist">
          <div className="p-shortlist-thumbs">
            {shortlist.slice(0, 3).map((i) => (
              <img key={i.id} src={i.image} alt="" />
            ))}
          </div>
          <div>
            <strong>
              {shortlist.length} {shortlist.length === 1 ? "idea" : "ideas"}.
              Your direction.
            </strong>
            <span>Your shortlist stays in this browser.</span>
          </div>
          <button
            className="p-share-shortlist"
            onClick={() =>
              share("/gallery?ids=" + encodeURIComponent(saved.join(",")))
            }
          >
            Share shortlist <LineIcon name="diagonal"/>
          </button>
          <EnquiryDialog
            triggerLabel="Discuss These Ideas →"
            triggerClassName="x-button x-button-gold"
            initialMessage={enquiryMessage}
          />
        </aside>
      )}
      <dialog
        className="p-photo-dialog"
        ref={dialog}
        aria-label="Photo details and related ideas"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {selected && (
          <>
            <button
              className="p-photo-close"
              onClick={close}
              aria-label="Close photo"
            >
              ✕
            </button>
            <div className="p-photo-main">
              <div className="p-photo-large">
                <img src={selected.image} alt={selected.alt} />
              </div>
              <div className="p-photo-info">
                <p className="x-kicker">
                  {selected.category} ·{" "}
                  {selected.completed ? "Our work" : "Inspiration"}
                </p>
                <h2>{selected.title}</h2>
                <p>{selected.description}</p>
                {selected.credit && (
                  <p className="p-photo-meta">
                    Photo: {selected.credit} · {selected.license}. Resized for
                    display.{" "}
                    {selected.source && (
                      <a
                        href={selected.source}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Original &amp; licence <LineIcon name="diagonal"/>
                      </a>
                    )}
                  </p>
                )}
                {selected.event && (
                  <p className="p-photo-meta">{selected.event}</p>
                )}
                {(selected.location || selected.year) && (
                  <p className="p-photo-meta">
                    {[selected.location, selected.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <div className="p-keywords">
                  {selected.keywords
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <Link
                        prefetch={false}
                        onClick={navigate}
                        key={tag}
                        href={href({ q: tag, category: null, photo: null })}
                        scroll={false}
                      >
                        #{tag}
                      </Link>
                    ))}
                </div>
                <div className="x-actions">
                  <button
                    className="x-button x-button-gold"
                    onClick={() => toggle(selected)}
                  >
                    {saved.includes(selected.id)
                      ? "♥ Saved to shortlist"
                      : "♡ Save this idea"}
                  </button>
                  <button
                    className="x-button x-button-outline"
                    onClick={() => share("/gallery?photo=" + selected.id)}
                  >
                    Share photo <LineIcon name="diagonal"/>
                  </button>
                </div>
                <EnquiryDialog
                  triggerLabel="Plan Something Like This →"
                  triggerClassName="x-text-link"
                  initialMessage={`I like “${selected.title}” (${selected.category}). Reference: /gallery?photo=${selected.id}\n\nMy event plans: `}
                />
                <p className="p-provenance">
                  {selected.completed
                    ? "A completed event from the Exotic portfolio."
                    : "Selected inspiration imagery. Ask our team about adapting this style to your occasion and budget."}
                </p>
                {status && (
                  <p role="status" className="p-notice">
                    {status}
                  </p>
                )}
              </div>
            </div>
            <div className="p-related">
              <p className="x-kicker">Follow the feeling</p>
              <h3>More like this.</h3>
              <div>
                {relatedGallery(items, selected).map((item) => (
                  <Link
                    prefetch={false}
                    onClick={navigate}
                    key={item.id}
                    href={href({ photo: item.id })}
                    scroll={false}
                  >
                    <ResponsivePhoto src={item.image} alt={item.alt} loading="lazy" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
