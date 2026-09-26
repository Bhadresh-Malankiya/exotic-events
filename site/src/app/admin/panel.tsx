"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { CmsDocument, SiteContent } from "@/lib/cms/schema";
import { defaultContent } from "@/lib/cms/defaults";
type Json = string | number | boolean | Json[] | { [key: string]: Json };
type Enquiry = {
  id: string;
  receivedAt: string;
  status: string;
  name: string;
  contact: string;
  occasion: string;
  city: string;
  eventDate: string;
  dateFlexible: boolean;
  guestCount: string;
  message: string;
};
const labels: Record<string, string> = {
  servicePages: "Service pages",
  planning: "Planning & budget",
  nextSteps: "What happens next",
  collection: "Gallery page & featured section",
  keywords: "Search keywords (separate with commas)",
  featured: "Feature this photo",
  completed: "Completed Exotic event (your own work only)",
  id: "Permanent photo share ID",
  slug: "Service page address",
  serviceSlug: "Linked service page address (e.g. wedding-planning)",
  showMap: "Show location map",
  brand: "Business details",
  hero: "Hero slideshow",
  services: "Services carousel",
  gallery: "Photo gallery",
  feature: "Full-width feature",
  process: "Our story & process",
  faq: "Questions & answers",
  contact: "Contact section",
  footer: "Footer",
  enabled: "Show this section",
  autoplay: "Automatically fade between slides",
  intervalSeconds: "Seconds per slide",
  eyebrow: "Small heading",
  title: "Heading",
  accent: "Gold italic line",
  description: "Supporting text",
  image: "Image",
  alt: "Image description (accessibility)",
  label: "Scene label",
  cta: "Button label",
  logo: "Brand logo",
  ribbon: "Gold ribbon overlay",
  bookingLabel: "Booking button",
  phone: "Public phone number",
  email: "Public email",
  address: "Full business address",
  city: "City / region",
  maps: "Google Maps link",
  whatsapp: "WhatsApp number with country code (digits only)",
  instagram: "Instagram link",
  imageryNote: "Photography credit / disclosure",
  tagline: "Tagline",
  category: "Category / small label",
};
function freshItem(item: Json): Json {
  const copy = structuredClone(item);
  if (copy && typeof copy === "object" && !Array.isArray(copy)) {
    if ("id" in copy) copy.id = "photo-" + crypto.randomUUID();
    if ("slug" in copy)
      copy.slug =
        String(copy.slug).slice(0, 60) + "-" + crypto.randomUUID().slice(0, 8);
    if ("completed" in copy) copy.completed = false;
  }
  return copy;
}
function label(k: string) {
  return (
    labels[k] ||
    k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
  );
}
export function AdminPanel({ authenticated }: { authenticated: boolean }) {
  const [authed, setAuthed] = useState(authenticated),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [section, setSection] = useState("hero"),
    [content, setContent] = useState<SiteContent | null>(null),
    [etag, setEtag] = useState(""),
    [dirty, setDirty] = useState(false),
    [publishedAt, setPublishedAt] = useState(""),
    [enquiries, setEnquiries] = useState<Enquiry[]>([]),
    [media, setMedia] = useState<string[]>([]),
    [picker, setPicker] = useState<(string | number)[] | null>(null);
  const pickerRef = useRef<HTMLDialogElement>(null);
  async function api(url: string, options: RequestInit = {}) {
    const r = await fetch(url, options);
    if (r.status === 401) {
      setAuthed(false);
      throw Error("Please sign in again.");
    }
    const result = await r.json().catch(() => ({}));
    if (!r.ok)
      throw Error(result.error || "Something went wrong. Please try again.");
    return result;
  }
  async function load() {
    try {
      const doc = await api("/api/admin/content");
      setContent(doc.value.draft);
      setEtag(doc.etag);
      setPublishedAt(doc.value.publishedAt);
      setDirty(false);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  useEffect(() => {
    if (authed) {
      const timer = setTimeout(() => void load(), 0);
      return () => clearTimeout(timer);
    }
  }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  useEffect(() => {
    if (picker) pickerRef.current?.showModal();
    else pickerRef.current?.close();
  }, [picker]);
  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const r = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      setPassword("");
      setAuthed(true);
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function update(path: (string | number)[], value: Json) {
    setContent((previous) => {
      const next = structuredClone(previous) as unknown as Record<string, Json>;
      let node: Record<string | number, Json> = next;
      path.slice(0, -1).forEach((k) => {
        node = node[k] as Record<string | number, Json>;
      });
      node[path[path.length - 1]] = value;
      return next as unknown as SiteContent;
    });
    setDirty(true);
  }
  async function save(action: "draft" | "publish" | "restore") {
    if (!content) return;
    setBusy(true);
    setStatus("");
    try {
      const result: { value: CmsDocument; etag: string } = await api(
        "/api/admin/content",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, etag, action }),
        },
      );
      setContent(result.value.draft);
      setEtag(result.etag);
      setPublishedAt(result.value.publishedAt);
      setDirty(false);
      setStatus(
        action === "publish"
          ? "Published. Your website is up to date."
          : action === "restore"
            ? "Draft restored from the live website."
            : "Draft saved. Your live website has not changed.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function chooseSection(next: string) {
    setSection(next);
    setStatus("");
    try {
      if (next === "enquiries") setEnquiries(await api("/api/admin/enquiries"));
      if (next === "media")
        setMedia(
          (await api("/api/admin/media")).map((m: { url: string }) => m.url),
        );
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  async function upload(file: File | null, path?: (string | number)[]) {
    if (!file) return;
    setBusy(true);
    setStatus("");
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await api("/api/admin/media", {
        method: "POST",
        body: form,
      });
      setMedia((m) => [result.url, ...m]);
      if (path) update(path, result.url);
      setStatus(
        "Image uploaded. Save your draft or publish to use it on the website.",
      );
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function openPicker(path: (string | number)[]) {
    setPicker(path);
    try {
      setMedia(
        (await api("/api/admin/media")).map((m: { url: string }) => m.url),
      );
    } catch (e) {
      setStatus((e as Error).message);
    }
  }
  function field(
    value: Json,
    path: (string | number)[],
    name: string,
  ): React.ReactNode {
    const id = "field-" + path.join("-");
    if (typeof value === "boolean")
      return (
        <label key={id} className="admin-toggle">
          <input
            id={id}
            type="checkbox"
            checked={value}
            onChange={(e) => update(path, e.target.checked)}
          />
          <span>{label(name)}</span>
        </label>
      );
    if (typeof value === "number")
      return (
        <label className="admin-field" key={id}>
          {label(name)}
          <input
            id={id}
            type="number"
            min="5"
            max="30"
            value={value}
            onChange={(e) => update(path, Number(e.target.value))}
          />
        </label>
      );
    if (typeof value === "string")
      return (
        <div
          className={`admin-field ${name === "image" || name === "logo" || name === "ribbon" ? "admin-image-field" : ""}`}
          key={id}
        >
          <label htmlFor={id}>{label(name)}</label>
          {name === "image" || name === "logo" || name === "ribbon" ? (
            <>
              <img src={value} alt="Current image" />
              <input
                id={id}
                value={value}
                onChange={(e) => update(path, e.target.value)}
              />
              <div className="admin-image-actions">
                <label className="admin-small-button">
                  Upload image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={(e) => {
                      void upload(e.target.files?.[0] || null, path);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button type="button" onClick={() => openPicker(path)}>
                  Choose from library
                </button>
              </div>
            </>
          ) : [
              "description",
              "title",
              "answer",
              "imageryNote",
              "tagline",
              "headline",
              "deliverables",
              "keywords",
              "budgetDescription",
              "budgetNote",
            ].includes(name) ? (
            <textarea
              id={id}
              rows={name === "answer" ? 4 : 3}
              value={value}
              onChange={(e) => update(path, e.target.value)}
            />
          ) : (
            <input
              id={id}
              value={value}
              onChange={(e) => update(path, e.target.value)}
            />
          )}
        </div>
      );
    if (Array.isArray(value))
      return (
        <div className="admin-array" key={id}>
          <div className="admin-array-title">
            <h3>
              {label(name)} <span>{value.length}</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                let defaults: Json = defaultContent as unknown as Json;
                for (const key of path)
                  defaults = (defaults as Record<string | number, Json>)[
                    typeof key === "number" ? 0 : key
                  ];
                update(path, [
                  ...value,
                  freshItem(value[0] || (defaults as Json[])[0]),
                ]);
              }}
            >
              + Add{" "}
              {name === "slides" ? "slide" : name === "steps" ? "step" : "item"}
            </button>
          </div>
          {value.map((item, index) => (
            <details key={id + index} className="admin-item">
              <summary>
                <span className="admin-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {typeof item === "object" && !Array.isArray(item)
                  ? String(
                      item.title || item.question || item.label || "Untitled",
                    )
                  : "Item"}
                <span>⌄</span>
              </summary>
              <div className="admin-item-body">
                <div className="admin-item-tools">
                  <button
                    disabled={index === 0}
                    onClick={() => {
                      const arr = [...value];
                      [arr[index - 1], arr[index]] = [
                        arr[index],
                        arr[index - 1],
                      ];
                      update(path, arr);
                    }}
                  >
                    ↑ Move up
                  </button>
                  <button
                    disabled={index === value.length - 1}
                    onClick={() => {
                      const arr = [...value];
                      [arr[index + 1], arr[index]] = [
                        arr[index],
                        arr[index + 1],
                      ];
                      update(path, arr);
                    }}
                  >
                    ↓ Move down
                  </button>
                  <button
                    onClick={() =>
                      update(path, [
                        ...value.slice(0, index + 1),
                        freshItem(item),
                        ...value.slice(index + 1),
                      ])
                    }
                  >
                    Duplicate
                  </button>
                  <button
                    className="admin-remove"
                    disabled={value.length <= 1}
                    onClick={() =>
                      update(
                        path,
                        value.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
                {field(item, [...path, index], "")}
              </div>
            </details>
          ))}
        </div>
      );
    return (
      <div className="admin-fields" key={id}>
        {Object.entries(value).map(([k, v]) => field(v, [...path, k], k))}
      </div>
    );
  }
  const allImages = [
    ...new Set([
      ...media,
      ...(JSON.stringify(content || defaultContent).match(
        /\/(?:assets|api\/media)\/[^"\s]+/g,
      ) || []),
    ]),
  ];
  if (!authed)
    return (
      <div className="admin-login">
        <Link href="/" className="admin-back">
          ← Back to website
        </Link>
        <form onSubmit={login}>
          <img src={defaultContent.brand.logo} alt="Exotic" />
          <p className="admin-eyebrow">Content studio</p>
          <h1>A little backstage access.</h1>
          <p>Sign in to manage your website and enquiries.</p>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in →"}
          </button>
          {status && (
            <p role="alert" className="admin-status">
              {status}
            </p>
          )}
        </form>
      </div>
    );
  return (
    <div className="admin-shell" data-lenis-prevent>
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">
          EXOTIC<span>CONTENT STUDIO</span>
        </Link>
        <p className="admin-nav-label">Website content</p>
        <nav>
          {Object.keys(defaultContent).map((key) => (
            <button
              key={key}
              className={section === key ? "active" : ""}
              onClick={() => chooseSection(key)}
            >
              {label(key)}
            </button>
          ))}
        </nav>
        <p className="admin-nav-label">Manage</p>
        <nav>
          <button
            className={section === "media" ? "active" : ""}
            onClick={() => chooseSection("media")}
          >
            Media library
          </button>
          <button
            className={section === "enquiries" ? "active" : ""}
            onClick={() => chooseSection("enquiries")}
          >
            Enquiries
          </button>
        </nav>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-live-link"
        >
          View live website ↗
        </a>
        <button
          className="admin-logout"
          onClick={async () => {
            try {
              await api("/api/admin/session", { method: "DELETE" });
              setAuthed(false);
            } catch (e) {
              setStatus((e as Error).message);
            }
          }}
        >
          Sign out
        </button>
      </aside>
      <div className="admin-workspace">
        <header className="admin-toolbar">
          <div>
            <p className="admin-eyebrow">Your website, your way</p>
            <h1>{label(section)}</h1>
            <span className="admin-save-state">
              {dirty
                ? "● Unsaved changes"
                : publishedAt
                  ? "Published " + new Date(publishedAt).toLocaleDateString()
                  : "Ready for your first edit"}
            </span>
          </div>
          <div className="admin-toolbar-actions">
            <a
              href={
                section === "gallery" || section === "collection"
                  ? "/gallery?preview=1"
                  : "/?preview=1"
              }
              target="_blank"
              rel="noreferrer"
            >
              Preview draft ↗
            </a>
            <button disabled={busy || !content} onClick={() => save("draft")}>
              {busy ? "Working…" : "Save draft"}
            </button>
            <button
              className="admin-primary"
              disabled={busy || !content}
              onClick={() => save("publish")}
            >
              Publish changes
            </button>
          </div>
        </header>
        {status && (
          <div className="admin-status" role="status">
            {status}
          </div>
        )}
        <div className="admin-content">
          {section === "enquiries" ? (
            <>
              <div className="admin-section-heading">
                <p>
                  Messages sent through your website. No enquiry emails are sent
                  automatically.
                </p>
                <button onClick={() => chooseSection("enquiries")}>
                  Refresh ↻
                </button>
              </div>
              {enquiries.length === 0 ? (
                <div className="admin-empty">
                  <h2>Every event starts here.</h2>
                  <p>New enquiries will appear in this inbox.</p>
                </div>
              ) : (
                enquiries.map((e) => (
                  <article className="admin-enquiry" key={e.id}>
                    <div>
                      <h2>{e.name}</h2>
                      <span>{new Date(e.receivedAt).toLocaleString()}</span>
                    </div>
                    <label>
                      Status
                      <select
                        value={e.status}
                        onChange={async (event) => {
                          const next = event.target.value;
                          try {
                            await api("/api/admin/enquiries", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: e.id, status: next }),
                            });
                            setEnquiries((old) =>
                              old.map((x) =>
                                x.id === e.id ? { ...x, status: next } : x,
                              ),
                            );
                          } catch (error) {
                            setStatus((error as Error).message);
                          }
                        }}
                      >
                        {["new", "contacted", "archived"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <dl>
                      <dt>Contact</dt>
                      <dd>{e.contact}</dd>
                      <dt>Occasion</dt>
                      <dd>{e.occasion}</dd>
                      <dt>Location</dt>
                      <dd>{e.city}</dd>
                      <dt>Date</dt>
                      <dd>
                        {e.eventDate || "Not decided"}
                        {e.dateFlexible ? " (flexible)" : ""}
                      </dd>
                      <dt>Guests</dt>
                      <dd>{e.guestCount || "Not specified"}</dd>
                    </dl>
                    <p>{e.message}</p>
                  </article>
                ))
              )}
            </>
          ) : section === "media" ? (
            <>
              <div className="admin-section-heading">
                <p>
                  Upload JPG, PNG or WebP images, up to 4 MB. Images are
                  optimized automatically.
                </p>
                <label className="admin-small-button">
                  + Upload image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={busy}
                    onChange={(e) => {
                      void upload(e.target.files?.[0] || null);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="admin-media-grid">
                {allImages.map((url) => (
                  <figure key={url}>
                    <img src={url} alt="Website image" loading="lazy" />
                    <figcaption>{url.split("/").pop()}</figcaption>
                  </figure>
                ))}
              </div>
            </>
          ) : content ? (
            <>
              <p className="admin-help">
                Edit the fields below. Save a draft to preview your changes,
                then publish when ready.
              </p>
              {section === "gallery" && (
                <p className="admin-help">
                  Upload your event photos, add a category and comma-separated
                  keywords, and select Featured for the homepage. Mark Completed
                  Exotic event only for work your team delivered. Keep each
                  photo’s share ID unchanged after sharing its link.
                </p>
              )}
              {field(
                content[section as keyof SiteContent] as unknown as Json,
                [section],
                section,
              )}
              <details className="admin-recovery">
                <summary>Discard draft changes</summary>
                <p>
                  Restore the draft from the current live website. Published
                  content stays unchanged.
                </p>
                <button disabled={busy} onClick={() => save("restore")}>
                  Restore live version
                </button>
              </details>
            </>
          ) : (
            <p>Loading your content…</p>
          )}
        </div>
      </div>
      <dialog
        className="admin-picker"
        ref={pickerRef}
        onClose={() => setPicker(null)}
      >
        <header>
          <h2>Choose an image</h2>
          <button
            onClick={() => setPicker(null)}
            aria-label="Close image library"
          >
            ✕
          </button>
        </header>
        <div className="admin-media-grid">
          {allImages.map((url) => (
            <button
              key={url}
              onClick={() => {
                if (picker) update(picker, url);
                setPicker(null);
              }}
            >
              <img src={url} alt={url.split("/").pop()} loading="lazy" />
            </button>
          ))}
        </div>
      </dialog>
    </div>
  );
}
