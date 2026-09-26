/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { byToken } from "@/lib/business/store";
import { totals, rupees } from "@/lib/business/schema";
import { qrBytes, upiLink } from "@/lib/business/pdf";
import { DocumentResponse } from "@/components/portfolio/DocumentResponse";
import "../../document.css";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your event document",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function DocumentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await byToken(token);
  if (!result) notFound();
  const d = result.value,
    t = totals(d),
    qr = d.kind === "invoice" ? await qrBytes(d) : null;
  const expired = Boolean(
    d.dueDate && d.dueDate < new Date().toISOString().slice(0, 10),
  );
  return (
    <div className="client-document">
      <header>
        <div>
          <span>EXOTIC</span>
          <p>{d.business.businessName}</p>
        </div>
        <a href={`/api/documents/${token}/pdf`}>Download PDF ↓</a>
      </header>
      <article>
        <div className="document-heading">
          <div>
            <p>{d.number}</p>
            <h1>
              {d.kind === "quotation" ? "Your quotation." : "Your invoice."}
            </h1>
          </div>
          <span className="document-badge">
            {d.kind === "invoice" && t.balance === 0 ? "Paid" : d.status}
          </span>
        </div>
        <div className="document-parties">
          <div>
            <small>PREPARED FOR</small>
            <h2>{d.clientName}</h2>
            <p>
              {d.clientEmail}
              <br />
              {d.clientPhone}
            </p>
            <p>{d.clientAddress}</p>
          </div>
          <div>
            <small>THE OCCASION</small>
            <h2>{d.event}</h2>
            <p>{d.eventDate}</p>
            {d.dueDate && (
              <p>
                {d.kind === "quotation" ? "Valid until" : "Due"}: {d.dueDate}
              </p>
            )}
          </div>
        </div>
        <div className="document-table">
          <table>
            <thead>
              <tr>
                <th>Item / option</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {d.lines.map((l) => (
                <tr key={l.id}>
                  <td>
                    <strong>{l.name}</strong>
                    <span>{l.variant}</span>
                    <small>{l.description}</small>
                  </td>
                  <td>
                    {l.quantity} {l.unit}
                  </td>
                  <td>{rupees(l.rate)}</td>
                  <td>{rupees(Math.round(l.rate * l.quantity * 100) / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="document-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{rupees(t.subtotal)}</dd>
          </div>
          {t.discount > 0 && (
            <div>
              <dt>Discount</dt>
              <dd>− {rupees(t.discount)}</dd>
            </div>
          )}
          {d.taxRate > 0 && (
            <div>
              <dt>Tax ({d.taxRate}%)</dt>
              <dd>{rupees(t.tax)}</dd>
            </div>
          )}
          <div className="total">
            <dt>Total</dt>
            <dd>{rupees(t.total)}</dd>
          </div>
          {d.kind === "invoice" && (
            <>
              <div>
                <dt>Paid</dt>
                <dd>{rupees(t.paid)}</dd>
              </div>
              <div className="total">
                <dt>Balance due</dt>
                <dd>{rupees(t.balance)}</dd>
              </div>
            </>
          )}
        </dl>
        {d.notes && (
          <section>
            <h3>Notes</h3>
            <p className="preserve-lines">{d.notes}</p>
          </section>
        )}
        {d.terms && (
          <section>
            <h3>Terms & inclusions</h3>
            <p className="preserve-lines">{d.terms}</p>
          </section>
        )}
        {d.approvedAt && (
          <p className="document-confirmation">
            {d.status === "declined" ? "Declined" : "Approved"} by{" "}
            {d.approvedBy} on {d.approvedAt.slice(0, 10)}.
          </p>
        )}
        {d.kind === "quotation" &&
          d.status === "shared" &&
          (expired ? (
            <p className="document-confirmation">
              This quotation has expired. Please ask our team for an updated
              quotation.
            </p>
          ) : (
            <DocumentResponse token={token} />
          ))}
        {d.kind === "invoice" && t.balance > 0 && (
          <section className="document-payment">
            {qr && (
              <img
                width="160"
                height="160"
                src={`data:image/png;base64,${Buffer.from(qr).toString("base64")}`}
                alt="Scan to pay this invoice using UPI"
              />
            )}
            <div>
              <h2>{qr ? "Pay by UPI" : "Payment details"}</h2>
              <p>{d.business.payeeName}</p>
              <p>{d.business.upiId}</p>
              {upiLink(d) && <a href={upiLink(d)}>Open UPI app ↗</a>}
              <p>{d.business.paymentNote}</p>
            </div>
          </section>
        )}
        {d.payments.length > 0 && (
          <section>
            <h3>Recorded payments</h3>
            {d.payments.map((p) => (
              <p key={p.id}>
                {p.date} · {rupees(p.amount)} · {p.method} · {p.reference}
              </p>
            ))}
          </section>
        )}
        <footer>
          <strong>{d.business.businessName}</strong>
          <p>{d.business.address}</p>
          <p>
            {d.business.phone} {d.business.email}
          </p>
        </footer>
      </article>
    </div>
  );
}
