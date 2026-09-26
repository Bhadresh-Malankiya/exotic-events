"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import {
  totals,
  rupees,
  workspaceSchema,
  type BusinessWorkspace as Workspace,
  type BusinessDocument,
  type DocumentInput,
  type CatalogItem,
  type EstimateProfile,
} from "@/lib/business/schema";
import type { SiteContent } from "@/lib/cms/schema";
type SavedDocument = BusinessDocument & { etag: string };
type Enquiry = {
  id: string;
  name: string;
  contact: string;
  occasion: string;
  message: string;
  receivedAt: string;
  status: string;
  city?: string;
};
type Data = {
  workspace: { value: Workspace; etag: string };
  documents: SavedDocument[];
  emailConnected: boolean;
};
const uid = () => crypto.randomUUID();
const blankLine = () => ({
  id: uid(),
  catalogId: "",
  name: "",
  variant: "",
  description: "",
  quantity: 1,
  unit: "each",
  rate: 0,
});
const newDoc = (
  kind: "quotation" | "invoice",
  terms: string,
): DocumentInput => ({
  kind,
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientAddress: "",
  event: "",
  eventDate: "",
  dueDate: "",
  enquiryId: "",
  lines: [blankLine()],
  discount: 0,
  taxRate: 0,
  notes: "",
  terms,
});
export function BusinessWorkspace({
  view,
  content,
}: {
  view: string;
  content: SiteContent | null;
}) {
  const [data, setData] = useState<Data | null>(null),
    [ws, setWs] = useState<Workspace>(workspaceSchema.parse({})),
    [enquiries, setEnquiries] = useState<Enquiry[]>([]),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [active, setActive] = useState<string | null>(null),
    [editing, setEditing] = useState<DocumentInput | null>(null),
    [editId, setEditId] = useState<string | null>(null),
    [catalog, setCatalog] = useState<CatalogItem | null>(null),
    [estimate, setEstimate] = useState<EstimateProfile | null>(null),
    [itemSearch, setItemSearch] = useState(""),
    [paymentFor, setPaymentFor] = useState<SavedDocument | null>(null),
    [payment, setPayment] = useState({
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      reference: "",
      method: "UPI" as "UPI" | "Bank transfer" | "Cash" | "Other",
    });
  const modalOpen = Boolean(
    active || editing || catalog || estimate || paymentFor,
  );
  const editingOpen = Boolean(editing),
    catalogOpen = Boolean(catalog),
    estimateOpen = Boolean(estimate),
    paymentOpen = Boolean(paymentFor);
  useEffect(() => {
    if (!modalOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const current = () =>
      Array.from(document.querySelectorAll<HTMLElement>(".work-overlay")).at(
        -1,
      );
    const focusable = () =>
      Array.from(
        current()?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) || [],
      ).filter((el) => el.getClientRects().length > 0);
    const timer = window.setTimeout(() => focusable()[0]?.focus(), 0);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (paymentOpen) setPaymentFor(null);
        else if (catalogOpen) setCatalog(null);
        else if (estimateOpen) setEstimate(null);
        else if (editingOpen) setEditing(null);
        else setActive(null);
      }
      if (e.key === "Tab") {
        const els = focusable(),
          first = els[0],
          last = els.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !current()?.contains(document.activeElement))
        ) {
          e.preventDefault();
          last?.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            !current()?.contains(document.activeElement))
        ) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [modalOpen, editingOpen, catalogOpen, estimateOpen, paymentOpen]);
  async function load() {
    const r = await fetch("/api/admin/business");
    const d = await r.json();
    if (!r.ok) throw Error(d.error);
    setData(d);
    setWs(d.workspace.value);
    const er = await fetch("/api/admin/enquiries");
    if (er.ok) setEnquiries(await er.json());
    return d as Data;
  }
  useEffect(() => {
    let alive = true;
    fetch("/api/admin/business")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        if (alive) {
          setData(d);
          setWs(d.workspace.value);
        }
      })
      .catch((e) => setStatus(e.message));
    fetch("/api/admin/enquiries")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (alive) setEnquiries(d);
      });
    return () => {
      alive = false;
    };
  }, []);
  async function action(body: unknown) {
    setBusy(true);
    setStatus("");
    try {
      const r = await fetch("/api/admin/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await r.json();
      if (!r.ok) throw Error(result.error);
      await load();
      setStatus("Saved successfully.");
      return result;
    } catch (e) {
      setStatus((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function saveWorkspace(next: Workspace) {
    return action({
      action: "workspace",
      value: {
        ...next,
        settings: {
          ...next.settings,
          partnerEmails: next.settings.partnerEmails
            .map((e) => e.trim())
            .filter(Boolean),
        },
      },
      etag: data?.workspace.etag,
    });
  }
  function startDocument(kind: "quotation" | "invoice", enquiry?: Enquiry) {
    const d = newDoc(kind, ws.settings.terms);
    if (enquiry) {
      d.clientName = enquiry.name;
      d.clientEmail = enquiry.contact.includes("@") ? enquiry.contact : "";
      d.clientPhone = /^[+\d\s()-]+$/.test(enquiry.contact)
        ? enquiry.contact
        : "";
      d.event =
        enquiry.occasion === "Something else" ? "Your event" : enquiry.occasion;
      d.notes = enquiry.message;
      d.enquiryId = enquiry.id;
    }
    setEditId(null);
    setEditing(d);
    setItemSearch("");
  }
  async function saveDoc() {
    if (!editing) return;
    const result = await action(
      editId
        ? {
            action: "update",
            id: editId,
            etag: data?.documents.find((d) => d.id === editId)?.etag,
            value: editing,
          }
        : { action: "create", value: editing },
    );
    if (result) {
      setActive(result.document?.id || editId);
      setEditing(null);
    }
  }
  async function copy(s: string) {
    try {
      await navigator.clipboard.writeText(s);
      setStatus("Link copied. You can paste it into a message.");
    } catch {
      setStatus("Copy this link: " + s);
    }
  }
  const selected = data?.documents.find((d) => d.id === active);
  const filteredDocs = (data?.documents || []).filter(
    (d) =>
      d.kind === (view === "invoices" ? "invoice" : "quotation") &&
      [d.number, d.clientName, d.event, d.status]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const draftTotals = editing ? totals(editing) : null;
  const textField = (
    name: string,
    value: string,
    change: (v: string) => void,
    props: Record<string, unknown> = {},
  ) => (
    <label className="work-field">
      {name}
      <input
        value={value}
        onChange={(e) => change(e.target.value)}
        {...props}
      />
    </label>
  );
  const numField = (
    name: string,
    value: number,
    change: (v: number) => void,
  ) => (
    <label className="work-field">
      {name}
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => change(Number(e.target.value))}
      />
    </label>
  );
  const setSetting = (key: string, value: unknown) =>
    setWs((w) => ({ ...w, settings: { ...w.settings, [key]: value } }));
  if (!data)
    return (
      <div className="work-loading" role="status">
        Opening your workspace…{status && <p>{status}</p>}
      </div>
    );
  return (
    <div className="work-area">
      {status && (
        <div className="work-notice" role="status">
          {status}
          <button onClick={() => setStatus("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}
      {view === "dashboard" && (
        <>
          <div className="work-welcome">
            <p>YOUR EVENT DESK</p>
            <h2>A clear view of what’s next.</h2>
            <span>
              Keep every conversation, proposal, and payment in one place.
            </span>
            <button
              className="work-primary"
              onClick={() => startDocument("quotation")}
            >
              + Create a quotation
            </button>
          </div>
          <div className="work-stats">
            <div>
              <span>New enquiries</span>
              <strong>
                {enquiries.filter((e) => e.status === "new").length}
              </strong>
            </div>
            <div>
              <span>Awaiting client approval</span>
              <strong>
                {
                  data.documents.filter(
                    (d) => d.kind === "quotation" && d.status === "shared",
                  ).length
                }
              </strong>
            </div>
            <div>
              <span>Approved quotations</span>
              <strong>
                {data.documents.filter((d) => d.status === "approved").length}
              </strong>
            </div>
            <div>
              <span>Invoice balance</span>
              <strong>
                {rupees(
                  data.documents
                    .filter(
                      (d) => d.kind === "invoice" && d.status === "issued",
                    )
                    .reduce((n, d) => n + totals(d).balance, 0),
                )}
              </strong>
            </div>
          </div>
          <div className="work-panel">
            <h3>Your next steps</h3>
            <ol className="work-checklist">
              <li>
                <span>01</span>
                <div>
                  <strong>Add your service items and prices</strong>
                  <p>
                    Create reusable items with options such as basic, premium,
                    per guest, or per day.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Turn an enquiry into a quotation</strong>
                  <p>
                    Choose the items, adjust prices, then share a private
                    approval link.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Invoice the approved plan</strong>
                  <p>
                    Generate a matching invoice, add your UPI details, and
                    record verified payments.
                  </p>
                </div>
              </li>
            </ol>
          </div>
          <div className="work-panel">
            <h3>Recent documents</h3>
            {data.documents.slice(0, 5).map((d) => (
              <button
                className="work-record"
                key={d.id}
                onClick={() => setActive(d.id)}
              >
                <strong>{d.clientName}</strong>
                <span>{d.number}</span>
                <span className="work-badge">{d.status}</span>
                <b>{rupees(totals(d).total)}</b>
              </button>
            ))}
            {!data.documents.length && (
              <p className="work-empty">
                Your first quotation starts a new event story.
              </p>
            )}
          </div>
        </>
      )}
      {(view === "quotations" || view === "invoices") && (
        <>
          <div className="work-heading">
            <div>
              <h2>
                {view === "quotations" ? "Quotations" : "Invoices & payments"}
              </h2>
              <p>
                {view === "quotations"
                  ? "Prepare a proposal, share it, and track the client’s decision."
                  : "Keep approved scopes and verified payments together."}
              </p>
            </div>
            <button
              className="work-primary"
              onClick={() =>
                startDocument(view === "quotations" ? "quotation" : "invoice")
              }
            >
              + New {view === "quotations" ? "quotation" : "invoice"}
            </button>
          </div>
          <input
            className="work-search"
            placeholder="Search client, event, document number, or status…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="work-panel">
            {filteredDocs.map((d) => (
              <button
                className="work-record"
                key={d.id}
                onClick={() => setActive(d.id)}
              >
                <div>
                  <strong>{d.clientName}</strong>
                  <small>{d.event}</small>
                </div>
                <span>{d.number}</span>
                <span className="work-badge">
                  {d.kind === "invoice" &&
                  d.status === "issued" &&
                  totals(d).balance === 0
                    ? "paid"
                    : d.status}
                </span>
                <b>
                  {rupees(
                    d.kind === "invoice" ? totals(d).balance : totals(d).total,
                  )}
                </b>
              </button>
            ))}
            {!filteredDocs.length && (
              <div className="work-empty">
                <h3>Nothing here yet.</h3>
                <p>
                  Create a document to get started, or try a different search.
                </p>
              </div>
            )}
          </div>
        </>
      )}
      {view === "enquiries" && (
        <>
          <div className="work-heading">
            <div>
              <h2>Conversations worth celebrating.</h2>
              <p>
                Reply to a client or start a quotation with their details
                already filled in.
              </p>
            </div>
            <button onClick={() => load().catch((e) => setStatus(e.message))}>
              Refresh ↻
            </button>
          </div>
          <input
            className="work-search"
            placeholder="Search name, contact, or event…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="work-enquiry-grid">
            {enquiries
              .filter((e) =>
                JSON.stringify(e).toLowerCase().includes(query.toLowerCase()),
              )
              .map((e) => (
                <article className="work-panel" key={e.id}>
                  <div className="work-heading">
                    <h3>{e.name}</h3>
                    <span className="work-badge">{e.status}</span>
                  </div>
                  <p>{e.contact}</p>
                  <small>
                    {new Date(e.receivedAt).toLocaleDateString()} · {e.occasion}
                  </small>
                  <p className="work-message">{e.message}</p>
                  <div className="work-actions">
                    <button
                      className="work-primary"
                      onClick={() => startDocument("quotation", e)}
                    >
                      Create quotation →
                    </button>
                    {/^[+\d\s()-]+$/.test(e.contact) && (
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://wa.me/${e.contact.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}?text=${encodeURIComponent(`Hello ${e.name}, thank you for your enquiry with Exotic. Let's discuss your event.`)}`}
                      >
                        Reply on WhatsApp ↗
                      </a>
                    )}
                    {e.contact.includes("@") && (
                      <a
                        href={`mailto:${encodeURIComponent(e.contact)}?cc=${encodeURIComponent(ws.settings.partnerEmails.join(","))}&subject=${encodeURIComponent("Your event enquiry · Exotic")}`}
                      >
                        Reply by email ↗
                      </a>
                    )}
                  </div>
                  <label className="work-field">
                    Progress
                    <select
                      value={e.status}
                      onChange={async (ev) => {
                        const r = await fetch("/api/admin/enquiries", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: e.id,
                            status: ev.target.value,
                          }),
                        });
                        if (r.ok) await load();
                        else
                          setStatus(
                            "Could not update this enquiry. Try again.",
                          );
                      }}
                    >
                      <option value="new">New enquiry</option>
                      <option value="contacted">Contacted</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                </article>
              ))}
          </div>
          {!enquiries.length && (
            <div className="work-empty">
              New website enquiries will appear here.
            </div>
          )}
        </>
      )}
      {view === "catalog" && (
        <>
          <div className="work-heading">
            <div>
              <h2>Your services. Your price book.</h2>
              <p>
                Save an item once. Choose from multiple pricing options every
                time you quote.
              </p>
            </div>
            <button
              className="work-primary"
              onClick={() =>
                setCatalog({
                  id: uid(),
                  name: "",
                  category: "Décor",
                  description: "",
                  active: true,
                  variants: [
                    {
                      id: uid(),
                      name: "Standard",
                      price: 0,
                      maxPrice: 0,
                      unit: "each",
                    },
                  ],
                })
              }
            >
              + Add an item
            </button>
          </div>
          <input
            className="work-search"
            placeholder="Search item name or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="work-catalog-grid">
            {ws.catalog
              .filter((c) =>
                (c.name + " " + c.category)
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((c) => (
                <button
                  className="work-catalog-card"
                  key={c.id}
                  onClick={() => setCatalog(structuredClone(c))}
                >
                  <span className="work-badge">{c.category}</span>
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                  <div>
                    {c.variants.map((v) => (
                      <p key={v.id}>
                        <strong>{v.name}</strong>
                        <span>
                          {rupees(v.price)}
                          {v.maxPrice > v.price
                            ? " – " + rupees(v.maxPrice)
                            : ""}{" "}
                          / {v.unit}
                        </span>
                      </p>
                    ))}
                  </div>
                  <small>
                    {c.active
                      ? "Available in quotations"
                      : "Hidden from new quotations"}{" "}
                    · Edit ↗
                  </small>
                </button>
              ))}
          </div>
          {!ws.catalog.length && (
            <div className="work-empty">
              <h3>Build a price book that works your way.</h3>
              <p>
                Add flowers, seating, sound, stages, staffing, transport, or any
                other item you quote.
              </p>
            </div>
          )}
        </>
      )}
      {view === "estimates" && (
        <>
          <div className="work-heading">
            <div>
              <h2>Help clients find a starting budget.</h2>
              <p>
                Set a base range and quantity-based factors for each service.
                Only enabled calculators appear on the website.
              </p>
            </div>
            <button
              className="work-primary"
              onClick={() =>
                setEstimate({
                  id: uid(),
                  serviceSlug:
                    content?.servicePages.items[0]?.slug || "wedding-planning",
                  title: "Get a starting estimate",
                  enabled: false,
                  baseMin: 0,
                  baseMax: 0,
                  note: "An indicative range, not a quotation. Final pricing depends on your venue, dates, scope, and availability.",
                  factors: [],
                })
              }
            >
              + Add calculator
            </button>
          </div>
          <div className="work-catalog-grid">
            {ws.estimates.map((p) => (
              <button
                className="work-catalog-card"
                key={p.id}
                onClick={() => setEstimate(structuredClone(p))}
              >
                <span className="work-badge">
                  {p.enabled ? "Visible on website" : "Not published"}
                </span>
                <h3>{p.title}</h3>
                <p>
                  {content?.servicePages.items.find(
                    (s) => s.slug === p.serviceSlug,
                  )?.title || p.serviceSlug}
                </p>
                <strong>
                  {rupees(p.baseMin)} – {rupees(p.baseMax)}
                </strong>
                <p>{p.factors.length} adjustable factors</p>
              </button>
            ))}
          </div>
          {!ws.estimates.length && (
            <div className="work-empty">
              Add your actual starting prices before publishing an estimate
              calculator.
            </div>
          )}
        </>
      )}
      {view === "businessSettings" && (
        <>
          <div className="work-heading">
            <div>
              <h2>Business & message settings</h2>
              <p>
                Contact details, partner copies, and payment instructions in one
                place.
              </p>
            </div>
            <button
              className="work-primary"
              disabled={busy}
              onClick={() => saveWorkspace(ws)}
            >
              Save settings
            </button>
          </div>
          <div className="work-settings-grid">
            <section className="work-panel">
              <h3>Business details on documents</h3>
              <p className="work-help">
                Changes apply to new documents and saved draft updates. Shared
                documents keep the details your client received.
              </p>
              {textField("Business name", ws.settings.businessName, (v) =>
                setSetting("businessName", v),
              )}
              {textField("Business address", ws.settings.address, (v) =>
                setSetting("address", v),
              )}
              {textField("Phone number", ws.settings.phone, (v) =>
                setSetting("phone", v),
              )}
              {textField(
                "Public business email",
                ws.settings.email,
                (v) => setSetting("email", v),
                { type: "email" },
              )}
              {textField(
                "Tax registration number (if applicable)",
                ws.settings.taxId,
                (v) => setSetting("taxId", v),
              )}
              <label className="work-field">
                Default quotation terms
                <textarea
                  rows={4}
                  value={ws.settings.terms}
                  onChange={(e) => setSetting("terms", e.target.value)}
                />
              </label>
            </section>
            <section className="work-panel">
              <h3>WhatsApp & partner emails</h3>
              {textField(
                "WhatsApp number (country code + number)",
                ws.settings.whatsapp,
                (v) => setSetting("whatsapp", v.replace(/\D/g, "")),
                { placeholder: "919909615585" },
              )}
              <p className="work-help">
                Visitors can send their enquiry through WhatsApp. You can also
                share quotations and invoices directly from each document.
              </p>
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  {textField(
                    `Partner ${i + 1} email`,
                    ws.settings.partnerEmails[i] || "",
                    (v) => {
                      const next = [...ws.settings.partnerEmails];
                      next[i] = v;
                      setSetting("partnerEmails", next);
                    },
                    { type: "email" },
                  )}
                </div>
              ))}
              <div
                className={`work-connection ${data.emailConnected ? "connected" : ""}`}
              >
                <strong>
                  {data.emailConnected
                    ? "Email sending connected"
                    : "Automatic email is not connected"}
                </strong>
                <p>
                  {data.emailConnected
                    ? "Enquiries can notify your partners. Document emails include partners in CC."
                    : "Use “Open email app” on a document to send with partner CC. Automatic delivery needs a verified sending account."}
                </p>
              </div>
              <label className="work-checkbox">
                <input
                  type="checkbox"
                  checked={ws.settings.emailNotifications}
                  disabled={!data.emailConnected}
                  onChange={(e) =>
                    setSetting("emailNotifications", e.target.checked)
                  }
                />
                Email partners when a new enquiry arrives
              </label>
            </section>
            <section className="work-panel">
              <h3>UPI payments on invoices</h3>
              {textField(
                "UPI ID",
                ws.settings.upiId,
                (v) => setSetting("upiId", v),
                { placeholder: "yourbusiness@bank" },
              )}
              {textField("Payee name", ws.settings.payeeName, (v) =>
                setSetting("payeeName", v),
              )}
              <p className="work-help">
                A QR is generated for the invoice balance when a UPI ID and
                payee name are saved. It does not automatically mark the invoice
                as paid.
              </p>
              <label className="work-upload">
                Upload a payment QR instead
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const form = new FormData();
                    form.append("file", f);
                    const r = await fetch("/api/admin/media", {
                      method: "POST",
                      body: form,
                    });
                    const result = await r.json();
                    if (r.ok) setSetting("qrImage", result.url);
                    else setStatus(result.error);
                  }}
                />
              </label>
              {ws.settings.qrImage && (
                <div className="work-qr">
                  <img src={ws.settings.qrImage} alt="Payment QR" />
                  <button onClick={() => setSetting("qrImage", "")}>
                    Remove QR
                  </button>
                </div>
              )}
              <label className="work-field">
                Payment instructions
                <textarea
                  value={ws.settings.paymentNote}
                  onChange={(e) => setSetting("paymentNote", e.target.value)}
                  rows={3}
                />
              </label>
            </section>
          </div>
        </>
      )}
      {selected && !editing && (
        <div
          className="work-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Document details"
        >
          <section className="work-dialog">
            <header>
              <div>
                <small>{selected.number}</small>
                <h2>{selected.clientName}</h2>
              </div>
              <button
                onClick={() => setActive(null)}
                aria-label="Close document"
              >
                ×
              </button>
            </header>
            <div className="work-dialog-body">
              <div className="work-heading">
                <div>
                  <span className="work-badge">{selected.status}</span>
                  <h3>{selected.event}</h3>
                  {status && (
                    <p role="status" className="work-message">
                      {status}
                    </p>
                  )}
                </div>
                <strong className="work-total">
                  {rupees(totals(selected).total)}
                </strong>
              </div>
              <div className="work-actions">
                {selected.status === "draft" && (
                  <>
                    <button
                      onClick={() => {
                        setEditId(selected.id);
                        setEditing(structuredClone(selected));
                      }}
                    >
                      Edit details
                    </button>
                    <button
                      className="work-primary"
                      disabled={busy}
                      onClick={() =>
                        action({
                          action: "share",
                          id: selected.id,
                          etag: selected.etag,
                        })
                      }
                    >
                      {selected.kind === "quotation"
                        ? "Create approval link"
                        : "Issue invoice & create link"}
                    </button>
                  </>
                )}
                <a
                  href={`/api/admin/business/pdf/${selected.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download PDF ↓
                </a>
                <button
                  onClick={() => {
                    setEditId(null);
                    setEditing({
                      ...selected,
                      lines: selected.lines.map((l) => ({ ...l, id: uid() })),
                    });
                  }}
                >
                  Duplicate / revise
                </button>
                {selected.status === "approved" && (
                  <button
                    className="work-primary"
                    disabled={busy}
                    onClick={async () => {
                      const r = await action({
                        action: "invoice",
                        id: selected.id,
                        etag: selected.etag,
                      });
                      if (r) setActive(r.document.id);
                    }}
                  >
                    Create invoice from approval →
                  </button>
                )}
                {selected.kind === "invoice" &&
                  selected.status === "issued" &&
                  totals(selected).balance > 0 && (
                    <button
                      className="work-primary"
                      onClick={() => {
                        setPaymentFor(selected);
                        setPayment({
                          amount: totals(selected).balance,
                          date: new Date().toISOString().slice(0, 10),
                          reference: "",
                          method: "UPI",
                        });
                      }}
                    >
                      Record verified payment
                    </button>
                  )}
              </div>
              {selected.token && selected.status !== "cancelled" && (
                <div className="work-share-box">
                  <h3>Share with your client</h3>
                  <p>
                    This private link lets the client review and download their
                    document
                    {selected.kind === "quotation"
                      ? " and approve the quotation"
                      : ""}
                    .
                  </p>
                  <div className="work-actions">
                    <button
                      onClick={() =>
                        copy(`${location.origin}/documents/${selected.token}`)
                      }
                    >
                      Copy private link
                    </button>
                    <a
                      href={`/documents/${selected.token}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Preview client view ↗
                    </a>
                    {selected.clientPhone && (
                      <a
                        href={`https://wa.me/${selected.clientPhone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}?text=${encodeURIComponent(`Hello ${selected.clientName}, here is your ${selected.kind} for ${selected.event}: ${location.origin}/documents/${selected.token}`)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Send on WhatsApp ↗
                      </a>
                    )}
                    {selected.clientEmail &&
                      (data.emailConnected ? (
                        <button
                          onClick={() =>
                            action({
                              action: "email",
                              id: selected.id,
                              etag: selected.etag,
                            })
                          }
                          disabled={busy}
                        >
                          Send email with partner CC
                        </button>
                      ) : (
                        <a
                          href={`mailto:${encodeURIComponent(selected.clientEmail)}?cc=${encodeURIComponent(ws.settings.partnerEmails.join(","))}&subject=${encodeURIComponent(`${selected.number} · ${selected.event}`)}&body=${encodeURIComponent(`Hello ${selected.clientName},\n\nYour ${selected.kind} is ready to review:\n${location.origin}/documents/${selected.token}\n\n${ws.settings.businessName}`)}`}
                        >
                          Open email app with CC ↗
                        </a>
                      ))}
                  </div>
                  {selected.emailSentAt && (
                    <p>
                      Email sent{" "}
                      {new Date(selected.emailSentAt).toLocaleString()}.
                    </p>
                  )}
                </div>
              )}
              <div className="work-table-wrap">
                <table className="work-table">
                  <thead>
                    <tr>
                      <th>Item / option</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines.map((l) => (
                      <tr key={l.id}>
                        <td>
                          <strong>{l.name}</strong>
                          <small>{l.variant}</small>
                        </td>
                        <td>
                          {l.quantity} {l.unit}
                        </td>
                        <td>{rupees(l.rate)}</td>
                        <td>{rupees(l.rate * l.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="work-summary">
                <p>
                  Subtotal <strong>{rupees(totals(selected).subtotal)}</strong>
                </p>
                <p>
                  Discount <strong>{rupees(totals(selected).discount)}</strong>
                </p>
                <p>
                  Tax <strong>{rupees(totals(selected).tax)}</strong>
                </p>
                <p>
                  Total <strong>{rupees(totals(selected).total)}</strong>
                </p>
                {selected.kind === "invoice" && (
                  <>
                    <p>
                      Paid <strong>{rupees(totals(selected).paid)}</strong>
                    </p>
                    <p>
                      Balance{" "}
                      <strong>{rupees(totals(selected).balance)}</strong>
                    </p>
                  </>
                )}
              </div>
              {selected.approvedAt && (
                <div className="work-confirmation">
                  {selected.status === "declined" ? "Declined" : "Approved"} by{" "}
                  {selected.approvedBy} ·{" "}
                  {new Date(selected.approvedAt).toLocaleString()}
                </div>
              )}
              {selected.payments.map((p) => (
                <p key={p.id}>
                  Payment: {rupees(p.amount)} · {p.date} · {p.method} ·{" "}
                  {p.reference}
                </p>
              ))}
              <details>
                <summary>Notes & terms</summary>
                <p className="work-message">{selected.notes}</p>
                <p className="work-message">{selected.terms}</p>
              </details>
              {["draft", "shared", "issued"].includes(selected.status) &&
                selected.payments.length === 0 && (
                  <details className="work-danger">
                    <summary>Cancel this document</summary>
                    <p>
                      This disables its client link. Keep it in your records as
                      cancelled.
                    </p>
                    <button
                      disabled={busy}
                      onClick={() =>
                        action({
                          action: "cancel",
                          id: selected.id,
                          etag: selected.etag,
                        })
                      }
                    >
                      Confirm cancellation
                    </button>
                  </details>
                )}
            </div>
          </section>
        </div>
      )}
      {editing && (
        <div
          className="work-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Quotation and invoice editor"
        >
          <section className="work-dialog work-dialog-wide">
            <header>
              <div>
                <small>{editId ? "EDIT DOCUMENT" : "NEW DOCUMENT"}</small>
                <h2>
                  {editing.kind === "quotation"
                    ? "Build your quotation"
                    : "Prepare your invoice"}
                </h2>
              </div>
              <button
                onClick={() => setEditing(null)}
                aria-label="Close editor"
              >
                ×
              </button>
            </header>
            <div className="work-document-editor">
              <div>
                <details open className="work-panel">
                  <summary>1. Client & occasion</summary>
                  <div className="work-form-grid">
                    {textField("Client name", editing.clientName, (v) =>
                      setEditing({ ...editing, clientName: v }),
                    )}
                    {textField("Event / occasion", editing.event, (v) =>
                      setEditing({ ...editing, event: v }),
                    )}
                    {textField(
                      "Client email (optional)",
                      editing.clientEmail,
                      (v) => setEditing({ ...editing, clientEmail: v }),
                      { type: "email" },
                    )}
                    {textField(
                      "Client WhatsApp / phone",
                      editing.clientPhone,
                      (v) => setEditing({ ...editing, clientPhone: v }),
                    )}
                    {textField(
                      "Event date (optional)",
                      editing.eventDate,
                      (v) => setEditing({ ...editing, eventDate: v }),
                      { type: "date" },
                    )}
                    {textField(
                      editing.kind === "quotation"
                        ? "Valid until (optional)"
                        : "Payment due (optional)",
                      editing.dueDate,
                      (v) => setEditing({ ...editing, dueDate: v }),
                      { type: "date" },
                    )}
                    {textField(
                      "Client address (optional)",
                      editing.clientAddress,
                      (v) => setEditing({ ...editing, clientAddress: v }),
                    )}
                  </div>
                </details>
                <section className="work-panel">
                  <h3>2. Items & pricing</h3>
                  <input
                    className="work-search"
                    placeholder="Search your saved items and choose an option…"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                  />
                  <div className="work-item-picker">
                    {ws.catalog
                      .filter(
                        (c) =>
                          c.active &&
                          (c.name + " " + c.category)
                            .toLowerCase()
                            .includes(itemSearch.toLowerCase()),
                      )
                      .slice(0, 12)
                      .map((c) => (
                        <details key={c.id}>
                          <summary>
                            {c.name}{" "}
                            <small>{c.variants.length} pricing options</small>
                          </summary>
                          {c.variants.map((v) => (
                            <button
                              key={v.id}
                              onClick={() => {
                                const line = {
                                  id: uid(),
                                  catalogId: c.id,
                                  name: c.name,
                                  variant: v.name,
                                  description: c.description,
                                  quantity: 1,
                                  unit: v.unit,
                                  rate: v.price,
                                };
                                setEditing({
                                  ...editing,
                                  lines: [
                                    ...editing.lines.filter(
                                      (l) => l.name || l.rate,
                                    ),
                                    line,
                                  ],
                                });
                              }}
                            >
                              <span>
                                {v.name} · {rupees(v.price)}
                                {v.maxPrice > v.price
                                  ? "–" + rupees(v.maxPrice)
                                  : ""}{" "}
                                / {v.unit}
                              </span>
                              <b>+ Add</b>
                            </button>
                          ))}
                        </details>
                      ))}
                  </div>
                  {editing.lines.map((l, i) => (
                    <div className="work-line-editor" key={l.id}>
                      <span className="work-line-number">{i + 1}</span>
                      <div className="work-form-grid">
                        {textField("Item name", l.name, (v) =>
                          setEditing({
                            ...editing,
                            lines: editing.lines.map((x) =>
                              x.id === l.id ? { ...x, name: v } : x,
                            ),
                          }),
                        )}
                        {textField("Option / specification", l.variant, (v) =>
                          setEditing({
                            ...editing,
                            lines: editing.lines.map((x) =>
                              x.id === l.id ? { ...x, variant: v } : x,
                            ),
                          }),
                        )}
                        {numField("Quantity", l.quantity, (v) =>
                          setEditing({
                            ...editing,
                            lines: editing.lines.map((x) =>
                              x.id === l.id ? { ...x, quantity: v } : x,
                            ),
                          }),
                        )}
                        {numField("Agreed unit price (₹)", l.rate, (v) =>
                          setEditing({
                            ...editing,
                            lines: editing.lines.map((x) =>
                              x.id === l.id ? { ...x, rate: v } : x,
                            ),
                          }),
                        )}
                        {textField("Unit", l.unit, (v) =>
                          setEditing({
                            ...editing,
                            lines: editing.lines.map((x) =>
                              x.id === l.id ? { ...x, unit: v } : x,
                            ),
                          }),
                        )}
                        {textField(
                          "Description (optional)",
                          l.description,
                          (v) =>
                            setEditing({
                              ...editing,
                              lines: editing.lines.map((x) =>
                                x.id === l.id ? { ...x, description: v } : x,
                              ),
                            }),
                        )}
                      </div>
                      <div className="work-line-end">
                        <strong>{rupees(l.rate * l.quantity)}</strong>
                        <button
                          disabled={editing.lines.length === 1}
                          onClick={() =>
                            setEditing({
                              ...editing,
                              lines: editing.lines.filter((x) => x.id !== l.id),
                            })
                          }
                        >
                          Remove item
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    className="work-secondary"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        lines: [...editing.lines, blankLine()],
                      })
                    }
                  >
                    + Add a custom item
                  </button>
                </section>
                <details className="work-panel">
                  <summary>3. Notes & terms</summary>
                  <label className="work-field">
                    Notes
                    <textarea
                      rows={4}
                      value={editing.notes}
                      onChange={(e) =>
                        setEditing({ ...editing, notes: e.target.value })
                      }
                    />
                  </label>
                  <label className="work-field">
                    Terms & inclusions
                    <textarea
                      rows={4}
                      value={editing.terms}
                      onChange={(e) =>
                        setEditing({ ...editing, terms: e.target.value })
                      }
                    />
                  </label>
                </details>
              </div>
              <aside className="work-quote-summary">
                <h3>Your document</h3>
                <p>{editing.lines.length} line items</p>
                {numField("Discount (₹)", editing.discount, (v) =>
                  setEditing({ ...editing, discount: v }),
                )}
                {numField("Tax rate (%)", editing.taxRate, (v) =>
                  setEditing({ ...editing, taxRate: v }),
                )}
                <p className="work-help">
                  Only apply tax that is appropriate for your business and the
                  services being billed.
                </p>
                <div className="work-summary">
                  <p>
                    Subtotal <strong>{rupees(draftTotals!.subtotal)}</strong>
                  </p>
                  <p>
                    Discount <strong>− {rupees(draftTotals!.discount)}</strong>
                  </p>
                  <p>
                    Tax <strong>{rupees(draftTotals!.tax)}</strong>
                  </p>
                  <p>
                    Total <strong>{rupees(draftTotals!.total)}</strong>
                  </p>
                </div>
                <button
                  className="work-primary"
                  disabled={busy}
                  onClick={saveDoc}
                >
                  {busy ? "Saving…" : "Save draft"}
                </button>
                <p className="work-help">
                  Review the saved document, then create its private share link.
                  Nothing is sent automatically.
                </p>
                {status && (
                  <p role="status" className="work-inline-status">
                    {status}
                  </p>
                )}
              </aside>
            </div>
          </section>
        </div>
      )}
      {catalog && (
        <div
          className="work-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Service item editor"
        >
          <section className="work-dialog">
            <header>
              <h2>
                {ws.catalog.some((c) => c.id === catalog.id)
                  ? "Edit service item"
                  : "Add a service item"}
              </h2>
              <button
                onClick={() => setCatalog(null)}
                aria-label="Close item editor"
              >
                ×
              </button>
            </header>
            <div className="work-dialog-body">
              {textField("Item name", catalog.name, (v) =>
                setCatalog({ ...catalog, name: v }),
              )}
              {textField("Category", catalog.category, (v) =>
                setCatalog({ ...catalog, category: v }),
              )}
              {textField("Description", catalog.description, (v) =>
                setCatalog({ ...catalog, description: v }),
              )}
              <h3>Pricing options</h3>
              <p className="work-help">
                Each option can have a starting and upper price. The final
                quotation uses the price you select or adjust.
              </p>
              {catalog.variants.map((v, i) => (
                <div className="work-variant" key={v.id}>
                  <div className="work-form-grid">
                    {textField("Option name", v.name, (n) =>
                      setCatalog({
                        ...catalog,
                        variants: catalog.variants.map((x, j) =>
                          j === i ? { ...x, name: n } : x,
                        ),
                      }),
                    )}
                    {textField("Unit (guest, day, piece…)", v.unit, (n) =>
                      setCatalog({
                        ...catalog,
                        variants: catalog.variants.map((x, j) =>
                          j === i ? { ...x, unit: n } : x,
                        ),
                      }),
                    )}
                    {numField("Starting price (₹)", v.price, (n) =>
                      setCatalog({
                        ...catalog,
                        variants: catalog.variants.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                price: n,
                                maxPrice: Math.max(n, x.maxPrice),
                              }
                            : x,
                        ),
                      }),
                    )}
                    {numField("Upper price (₹)", v.maxPrice, (n) =>
                      setCatalog({
                        ...catalog,
                        variants: catalog.variants.map((x, j) =>
                          j === i ? { ...x, maxPrice: n } : x,
                        ),
                      }),
                    )}
                  </div>
                  <button
                    disabled={catalog.variants.length === 1}
                    onClick={() =>
                      setCatalog({
                        ...catalog,
                        variants: catalog.variants.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Remove option
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setCatalog({
                    ...catalog,
                    variants: [
                      ...catalog.variants,
                      {
                        id: uid(),
                        name: "",
                        price: 0,
                        maxPrice: 0,
                        unit: "each",
                      },
                    ],
                  })
                }
              >
                + Add pricing option
              </button>
              <label className="work-checkbox">
                <input
                  type="checkbox"
                  checked={catalog.active}
                  onChange={(e) =>
                    setCatalog({ ...catalog, active: e.target.checked })
                  }
                />
                Available for new quotations
              </label>
              {status && <p className="work-inline-status">{status}</p>}
              <button
                className="work-primary"
                disabled={busy}
                onClick={async () => {
                  const next = {
                    ...ws,
                    catalog: [
                      ...ws.catalog.filter((c) => c.id !== catalog.id),
                      catalog,
                    ],
                  };
                  if (await saveWorkspace(next)) setCatalog(null);
                }}
              >
                Save item
              </button>
            </div>
          </section>
        </div>
      )}
      {estimate && (
        <div
          className="work-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Estimate calculator editor"
        >
          <section className="work-dialog">
            <header>
              <h2>Service estimate calculator</h2>
              <button
                onClick={() => setEstimate(null)}
                aria-label="Close calculator editor"
              >
                ×
              </button>
            </header>
            <div className="work-dialog-body">
              <label className="work-field">
                Service page
                <select
                  value={estimate.serviceSlug}
                  onChange={(e) =>
                    setEstimate({ ...estimate, serviceSlug: e.target.value })
                  }
                >
                  {content?.servicePages.items.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
              {textField("Calculator heading", estimate.title, (v) =>
                setEstimate({ ...estimate, title: v }),
              )}
              <div className="work-form-grid">
                {numField("Base price from (₹)", estimate.baseMin, (v) =>
                  setEstimate({
                    ...estimate,
                    baseMin: v,
                    baseMax: Math.max(v, estimate.baseMax),
                  }),
                )}
                {numField("Base price to (₹)", estimate.baseMax, (v) =>
                  setEstimate({ ...estimate, baseMax: v }),
                )}
              </div>
              <h3>Adjustable factors</h3>
              <p className="work-help">
                For example: number of guests, flower arrangements, event days,
                or crew members.
              </p>
              {estimate.factors.map((f, i) => {
                const change = (key: string, value: unknown) =>
                  setEstimate({
                    ...estimate,
                    factors: estimate.factors.map((x, j) =>
                      i === j ? { ...x, [key]: value } : x,
                    ),
                  });
                return (
                  <div className="work-variant" key={f.id}>
                    <div className="work-form-grid">
                      {textField("Factor name", f.title, (v) =>
                        change("title", v),
                      )}
                      {textField("Unit", f.unit, (v) => change("unit", v))}
                      {numField("Lowest quantity", f.min, (v) =>
                        change("min", v),
                      )}
                      {numField("Highest quantity", f.max, (v) =>
                        change("max", v),
                      )}
                      {numField("Starting quantity", f.defaultValue, (v) =>
                        change("defaultValue", v),
                      )}
                      {numField("Cost per unit from (₹)", f.low, (v) =>
                        change("low", v),
                      )}
                      {numField("Cost per unit to (₹)", f.high, (v) =>
                        change("high", v),
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setEstimate({
                          ...estimate,
                          factors: estimate.factors.filter((_, j) => i !== j),
                        })
                      }
                    >
                      Remove factor
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() =>
                  setEstimate({
                    ...estimate,
                    factors: [
                      ...estimate.factors,
                      {
                        id: uid(),
                        title: "",
                        unit: "guests",
                        min: 0,
                        max: 500,
                        defaultValue: 100,
                        low: 0,
                        high: 0,
                      },
                    ],
                  })
                }
              >
                + Add factor
              </button>
              <label className="work-field">
                Note under the estimate
                <textarea
                  rows={3}
                  value={estimate.note}
                  onChange={(e) =>
                    setEstimate({ ...estimate, note: e.target.value })
                  }
                />
              </label>
              <label className="work-checkbox">
                <input
                  type="checkbox"
                  checked={estimate.enabled}
                  onChange={(e) =>
                    setEstimate({ ...estimate, enabled: e.target.checked })
                  }
                />
                Show calculator on the service page
              </label>
              {status && <p className="work-inline-status">{status}</p>}
              <button
                className="work-primary"
                disabled={busy}
                onClick={async () => {
                  if (
                    ws.estimates.some(
                      (p) =>
                        p.serviceSlug === estimate.serviceSlug &&
                        p.id !== estimate.id,
                    )
                  ) {
                    setStatus(
                      "This service already has a calculator. Edit that calculator instead.",
                    );
                    return;
                  }
                  if (
                    await saveWorkspace({
                      ...ws,
                      estimates: [
                        ...ws.estimates.filter((x) => x.id !== estimate.id),
                        estimate,
                      ],
                    })
                  )
                    setEstimate(null);
                }}
              >
                Save calculator
              </button>
            </div>
          </section>
        </div>
      )}
      {paymentFor && (
        <div
          className="work-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Record payment"
        >
          <section className="work-dialog work-dialog-small">
            <header>
              <h2>Record a verified payment</h2>
              <button
                onClick={() => setPaymentFor(null)}
                aria-label="Close payment form"
              >
                ×
              </button>
            </header>
            <div className="work-dialog-body">
              <p>
                Only record money you have confirmed receiving. Balance:{" "}
                {rupees(totals(paymentFor).balance)}
              </p>
              {numField("Amount received (₹)", payment.amount, (v) =>
                setPayment({ ...payment, amount: v }),
              )}
              {textField(
                "Received on",
                payment.date,
                (v) => setPayment({ ...payment, date: v }),
                { type: "date" },
              )}
              {textField(
                "Payment reference / receipt note",
                payment.reference,
                (v) => setPayment({ ...payment, reference: v }),
              )}
              <label className="work-field">
                Payment method
                <select
                  value={payment.method}
                  onChange={(e) =>
                    setPayment({
                      ...payment,
                      method: e.target.value as typeof payment.method,
                    })
                  }
                >
                  {["UPI", "Bank transfer", "Cash", "Other"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              {status && <p className="work-inline-status">{status}</p>}
              <button
                className="work-primary"
                disabled={busy}
                onClick={async () => {
                  if (
                    await action({
                      action: "payment",
                      id: paymentFor.id,
                      etag: paymentFor.etag,
                      payment: { ...payment, id: uid() },
                    })
                  )
                    setPaymentFor(null);
                }}
              >
                Confirm payment received
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
