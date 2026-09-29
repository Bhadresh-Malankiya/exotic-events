"use client";
import { totals, rupees, type BusinessDocument } from "@/lib/business/schema";
import { LineIcon } from "@/components/ui/LineIcon";
export function BusinessOverview({
  documents,
  enquiries,
  create,
  navigate,
  open,
}: {
  documents: BusinessDocument[];
  enquiries: { id: string; name: string; status: string; receivedAt: string }[];
  create: (kind: "quotation" | "invoice") => void;
  navigate: (v: string) => void;
  open: (id: string) => void;
}) {
  const invoices = documents.filter(
    (d) => d.kind === "invoice" && d.status === "issued",
  );
  const quotes = documents.filter(
    (d) =>
      d.kind === "quotation" &&
      ["shared", "approved", "declined"].includes(d.status),
  );
  const approved = quotes.filter((d) => d.status === "approved");
  const months = Array.from({ length: 6 }, (_, i) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
      invoiced: 0,
      paid: 0,
    };
  });
  invoices.forEach((d) => {
    const m = months.find(
      (m) => m.key === (d.sharedAt || d.createdAt).slice(0, 7),
    );
    if (m) m.invoiced += totals(d).total;
    d.payments.forEach((p) => {
      const m = months.find((m) => m.key === p.date.slice(0, 7));
      if (m) m.paid += p.amount;
    });
  });
  const last = months[5],
    prev = months[4],
    max = Math.max(1, ...months.flatMap((m) => [m.invoiced, m.paid]));
  const balance = invoices.reduce((n, d) => n + totals(d).balance, 0),
    overdue = invoices.filter(
      (d) =>
        d.dueDate &&
        d.dueDate < new Date().toISOString().slice(0, 10) &&
        totals(d).balance > 0,
    );
  const change =
    prev.paid > 0
      ? `${(((last.paid - prev.paid) / prev.paid) * 100).toFixed(0)}% vs last month`
      : "No paid revenue last month";
  const pipeline = [
    ["Enquiries", enquiries.length],
    [
      "Quoted enquiries",
      new Set(quotes.map((d) => d.enquiryId).filter(Boolean)).size,
    ],
    ["Approved quotations", approved.length],
    ["Issued invoices", invoices.length],
    [
      "Fully paid invoices",
      invoices.filter((d) => totals(d).balance === 0).length,
    ],
  ] as [string, number][];
  return (
    <>
      <div className="desk-intro">
        <div>
          <p className="admin-eyebrow">BUSINESS AT A GLANCE</p>
          <h2>Your next event starts here.</h2>
          <p>Quotations, client conversations and payments in one place.</p>
        </div>
        <span>
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="desk-shortcuts">
        {[
          {
            label: "Create quotation",
            icon: "document",
            run: () => create("quotation"),
          },
          {
            label: "Create invoice",
            icon: "plus",
            run: () => create("invoice"),
          },
          {
            label: "Enquiries",
            icon: "mail",
            run: () => navigate("enquiries"),
          },
          {
            label: "Items & prices",
            icon: "price",
            run: () => navigate("catalog"),
          },
          {
            label: "Photo gallery",
            icon: "photo",
            run: () => navigate("gallery"),
          },
          {
            label: "Payment settings",
            icon: "wallet",
            run: () => navigate("businessSettings"),
          },
        ].map((x) => (
          <button key={x.label} onClick={x.run}>
            <LineIcon name={x.icon} />
            <span>{x.label}</span>
            <LineIcon name="diagonal" />
          </button>
        ))}
      </div>
      <div className="desk-metrics">
        {[
          {
            label: "Collected this month",
            value: rupees(last.paid),
            note: change,
          },
          {
            label: "Invoiced this month",
            value: rupees(last.invoiced),
            note: "Issued invoices only",
          },
          {
            label: "Outstanding balance",
            value: rupees(balance),
            note: `${overdue.length} overdue invoice${overdue.length === 1 ? "" : "s"}`,
          },
          {
            label: "Quotation approval",
            value: quotes.length
              ? `${Math.round((approved.length / quotes.length) * 100)}%`
              : "—",
            note: `${approved.length} approved of ${quotes.length} shared`,
          },
        ].map((m) => (
          <article key={m.label}>
            <p>{m.label}</p>
            <strong>{m.value}</strong>
            <small>{m.note}</small>
          </article>
        ))}
      </div>
      <div className="desk-analysis">
        <section className="work-panel">
          <div className="work-heading">
            <h3>Revenue over time</h3>
            <div className="chart-legend">
              <span>Invoiced</span>
              <span>Collected</span>
            </div>
          </div>
          <div
            className="revenue-chart"
            role="img"
            aria-label={months
              .map(
                (m) =>
                  `${m.label}: ${rupees(m.invoiced)} invoiced, ${rupees(m.paid)} collected`,
              )
              .join("; ")}
          >
            {months.map((m) => (
              <div className="chart-month" key={m.key}>
                <div className="chart-bars">
                  <div
                    style={{ height: `${(m.invoiced / max) * 100}%` }}
                    title={`Invoiced: ${rupees(m.invoiced)}`}
                  />
                  <div
                    style={{ height: `${(m.paid / max) * 100}%` }}
                    title={`Collected: ${rupees(m.paid)}`}
                  />
                </div>
                <strong>{m.label}</strong>
                <small>{rupees(m.paid)}</small>
              </div>
            ))}
          </div>
          <p className="work-help">
            Collections use payment dates. Invoiced amounts use issue dates.
            Drafts and cancelled documents are excluded.
          </p>
          <details>
            <summary>View exact monthly figures</summary>
            <table className="work-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Invoiced</th>
                  <th>Collected</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.key}>
                    <td>{m.key}</td>
                    <td>{rupees(m.invoiced)}</td>
                    <td>{rupees(m.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>
        <section className="work-panel">
          <h3>From enquiry to payment</h3>
          <div className="pipeline">
            {pipeline.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <i
                  style={{
                    width: `${Math.max(2, (value / Math.max(1, ...pipeline.map((p) => p[1]))) * 100)}%`,
                  }}
                />
              </div>
            ))}
          </div>
          <small className="work-help">
            Counts can include repeat quotations and direct invoices.
          </small>
        </section>
      </div>
      <div className="desk-analysis">
        <section className="work-panel">
          <h3>Needs your attention</h3>
          {[
            {
              label: "New enquiries to reply to",
              count: enquiries.filter((e) => e.status === "new").length,
              view: "enquiries",
            },
            {
              label: "Quotations awaiting approval",
              count: quotes.filter((d) => d.status === "shared").length,
              view: "documents",
            },
            {
              label: "Approved quotes to invoice",
              count: approved.filter((d) => !d.invoiceId).length,
              view: "documents",
            },
            {
              label: "Overdue payments to follow up",
              count: overdue.length,
              view: "documents",
            },
          ].map((x) => (
            <button
              className="desk-task"
              key={x.label}
              onClick={() => navigate(x.view)}
            >
              <span>{x.label}</span>
              <b>{x.count}</b>
              <LineIcon />
            </button>
          ))}
        </section>
        <section className="work-panel">
          <h3>Recent activity</h3>
          {documents.slice(0, 5).map((d) => (
            <button className="desk-task" key={d.id} onClick={() => open(d.id)}>
              <span>
                <strong>{d.clientName}</strong>
                <small>
                  {d.number} · {d.status}
                </small>
              </span>
              <b>{rupees(totals(d).total)}</b>
            </button>
          ))}
          {!documents.length && (
            <p className="work-empty">
              Create your first quotation to start tracking your business.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
