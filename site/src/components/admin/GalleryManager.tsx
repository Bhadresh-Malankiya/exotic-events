"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/lib/cms/schema";
export function GalleryManager({
  items,
  onChange,
}: {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [selected, setSelected] = useState<GalleryItem | null>(null),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [removed, setRemoved] = useState<{
      item: GalleryItem;
      index: number;
    } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  const categories = [...new Set(items.map((i) => i.category))];
  async function upload(file: File) {
    const f = new FormData();
    f.append("file", file);
    const r = await fetch("/api/admin/media", { method: "POST", body: f });
    const result = await r.json();
    if (!r.ok) throw Error(result.error);
    return result.url as string;
  }
  async function add(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    const added: GalleryItem[] = [];
    let failed = 0;
    for (const file of Array.from(files).slice(0, 30)) {
      try {
        const url = await upload(file),
          name = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
        added.push({
          id: "photo-" + crypto.randomUUID(),
          title: name,
          alt: name,
          description: "",
          image: url,
          category: category || "Weddings",
          keywords: "",
          featured: false,
          completed: true,
          event: "",
          location: "",
          year: "",
          credit: "",
          source: "",
          license: "",
        });
      } catch {
        failed++;
      }
    }
    onChange([...items, ...added]);
    setStatus(
      `${added.length} photos added to your draft.${failed ? " " + failed + " could not be uploaded. Use JPG, PNG or WebP under 4 MB." : ""} Save or publish when ready.`,
    );
    setBusy(false);
  }
  function remove(item: GalleryItem) {
    const index = items.findIndex((i) => i.id === item.id);
    setRemoved({ item, index });
    onChange(items.filter((i) => i.id !== item.id));
    setStatus("Photo removed from your draft. You can undo this below.");
  }
  const filtered = items.filter(
    (i) =>
      (!category || i.category === category) &&
      (i.title + " " + i.keywords + " " + i.event)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="gallery-manager">
      <div className="work-heading">
        <div>
          <h2>Your visual portfolio</h2>
          <p>
            {items.length} photos · {items.filter((i) => i.completed).length}{" "}
            completed-work photos · {items.filter((i) => i.featured).length}{" "}
            featured
          </p>
        </div>
        <label className="work-primary work-upload">
          {busy ? "Uploading photos…" : "+ Add photos"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy}
            onChange={(e) => {
              void add(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="work-help">
        Upload your own event photos in batches of up to 30. Select a photo to
        edit its details. Changes go live only when you publish.
      </p>
      <div className="gallery-manager-filters">
        <input
          className="work-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a photo, keyword, or event…"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter photos by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {status && (
        <div className="work-notice" role="status">
          {status}
          {removed && (
            <button
              onClick={() => {
                const next = [...items];
                next.splice(
                  Math.min(removed.index, next.length),
                  0,
                  removed.item,
                );
                onChange(next);
                setRemoved(null);
                setStatus("Photo restored.");
              }}
            >
              Undo removal
            </button>
          )}
        </div>
      )}
      <div className="admin-gallery-grid">
        {filtered.map((item) => (
          <article key={item.id}>
            <button
              className="admin-gallery-photo"
              onClick={() => setSelected(structuredClone(item))}
            >
              <img src={item.image} alt={item.alt} loading="lazy" />
              {item.featured && <span>★ Featured</span>}
              <b>Edit photo ↗</b>
            </button>
            <div>
              <strong>{item.title}</strong>
              <small>
                {item.category} · {item.completed ? "Our work" : "Inspiration"}
              </small>
            </div>
            <footer>
              <button
                aria-label={`${item.featured ? "Unfeature" : "Feature"} ${item.title}`}
                onClick={() =>
                  onChange(
                    items.map((i) =>
                      i.id === item.id ? { ...i, featured: !i.featured } : i,
                    ),
                  )
                }
              >
                {item.featured ? "★ Featured" : "☆ Feature"}
              </button>
              <button onClick={() => setSelected(structuredClone(item))}>
                Edit
              </button>
              <button
                className="gallery-remove"
                disabled={items.length <= 1}
                onClick={() => remove(item)}
                aria-label={`Remove ${item.title}`}
              >
                Remove
              </button>
            </footer>
          </article>
        ))}
      </div>
      <dialog
        className="gallery-edit-drawer"
        ref={dialog}
        onClose={() => setSelected(null)}
        aria-label="Edit gallery photo"
        data-lenis-prevent
      >
        {selected && (
          <>
            <header>
              <h2>Edit photo</h2>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close photo editor"
              >
                ×
              </button>
            </header>
            <div className="gallery-edit-body">
              <img
                className="gallery-edit-preview"
                src={selected.image}
                alt={selected.alt}
              />
              <label className="work-upload work-secondary">
                {busy ? "Replacing image…" : "Replace image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setBusy(true);
                    try {
                      const url = await upload(f);
                      setSelected({
                        ...selected,
                        image: url,
                        completed: true,
                        credit: "",
                        source: "",
                        license: "",
                      });
                    } catch (e) {
                      setStatus((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </label>
              <label className="work-field">
                Photo title
                <input
                  value={selected.title}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      title: e.target.value,
                      alt:
                        selected.alt === selected.title
                          ? e.target.value
                          : selected.alt,
                    })
                  }
                />
              </label>
              <label className="work-field">
                Category
                <input
                  list="gallery-category-options"
                  value={selected.category}
                  onChange={(e) =>
                    setSelected({ ...selected, category: e.target.value })
                  }
                />
                <datalist id="gallery-category-options">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>
              <label className="work-field">
                Search words
                <input
                  value={selected.keywords}
                  onChange={(e) =>
                    setSelected({ ...selected, keywords: e.target.value })
                  }
                  placeholder="floral, ivory, stage, garden"
                />
                <small>
                  Separate words with commas so clients can find related photos.
                </small>
              </label>
              <label className="work-field">
                Caption
                <textarea
                  rows={3}
                  value={selected.description}
                  onChange={(e) =>
                    setSelected({ ...selected, description: e.target.value })
                  }
                />
              </label>
              <label className="work-checkbox">
                <input
                  type="checkbox"
                  checked={selected.featured}
                  onChange={(e) =>
                    setSelected({ ...selected, featured: e.target.checked })
                  }
                />
                Feature this photo on the homepage
              </label>
              <label className="work-checkbox">
                <input
                  type="checkbox"
                  checked={selected.completed}
                  onChange={(e) =>
                    setSelected({ ...selected, completed: e.target.checked })
                  }
                />
                This is work delivered by Exotic
              </label>
              <details>
                <summary>Event details & accessibility</summary>
                {(["event", "location", "year", "alt"] as const).map((key) => (
                  <label className="work-field" key={key}>
                    {
                      {
                        event: "Event name",
                        location: "Location",
                        year: "Year",
                        alt: "Description for screen readers",
                      }[key]
                    }
                    <input
                      value={selected[key]}
                      onChange={(e) =>
                        setSelected({ ...selected, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </details>
              {selected.credit && (
                <p className="work-help">
                  Credit: {selected.credit} · {selected.license}
                </p>
              )}
              <a
                className="work-text-link"
                href={`/gallery?photo=${selected.id}`}
                target="_blank"
                rel="noreferrer"
              >
                View published photo / share link ↗
              </a>
              {status && <p className="work-inline-status">{status}</p>}
            </div>
            <footer>
              <button
                className="work-primary"
                disabled={busy}
                onClick={() => {
                  if (
                    !selected.title.trim() ||
                    !selected.alt.trim() ||
                    !selected.category.trim()
                  ) {
                    setStatus(
                      "Add a title, category, and image description before saving.",
                    );
                    return;
                  }
                  onChange(
                    items.map((i) => (i.id === selected.id ? selected : i)),
                  );
                  setSelected(null);
                  setStatus(
                    "Photo updated in your draft. Save or publish when ready.",
                  );
                }}
              >
                Apply changes to draft
              </button>
            </footer>
          </>
        )}
      </dialog>
    </div>
  );
}
