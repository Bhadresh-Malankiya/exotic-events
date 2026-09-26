import { authorize, privateHeaders } from "@/lib/cms/auth";
import {
  getWorkspace,
  workspacePath,
  allDocuments,
  getBusinessDocument,
  makeDocument,
  saveDocument,
  shareDocument,
} from "@/lib/business/store";
import {
  workspaceSchema,
  documentInputSchema,
  paymentSchema,
  totals,
} from "@/lib/business/schema";
import { writeJson } from "@/lib/cms/storage";
import { emailReady, sendEmail } from "@/lib/business/email";
const reply = (v: unknown, status = 200) =>
  Response.json(v, { status, headers: privateHeaders });
export async function GET(request: Request) {
  if (!(await authorize(request)))
    return reply({ error: "Please sign in." }, 401);
  try {
    const [workspace, documents] = await Promise.all([
      getWorkspace(),
      allDocuments(),
    ]);
    return reply({ workspace, documents, emailConnected: emailReady() });
  } catch {
    return reply(
      { error: "Your workspace could not be loaded. Try again." },
      503,
    );
  }
}
export async function POST(request: Request) {
  if (!(await authorize(request)))
    return reply({ error: "Please sign in again." }, 401);
  if (Number(request.headers.get("content-length")) > 2_000_000)
    return reply({ error: "This document is too large." }, 413);
  const b = await request.json().catch(() => null);
  if (!b) return reply({ error: "Please check your details." }, 400);
  try {
    if (b.action === "workspace") {
      const parsed = workspaceSchema.safeParse(b.value);
      if (!parsed.success)
        return reply({ error: parsed.error.issues[0].message }, 400);
      const current = await getWorkspace();
      if (current.etag !== b.etag)
        return reply(
          { error: "Someone updated the workspace. Reload before saving." },
          409,
        );
      await writeJson(workspacePath, parsed.data, current.etag || undefined);
      return reply({ ok: true });
    }
    if (b.action === "create") {
      const parsed = documentInputSchema.safeParse(b.value);
      if (!parsed.success)
        return reply({ error: parsed.error.issues[0].message }, 400);
      if (
        parsed.data.discount > totals({ ...parsed.data, discount: 0 }).subtotal
      )
        return reply({ error: "Discount cannot exceed the subtotal." }, 400);
      const { value } = await getWorkspace();
      return reply({
        document: await makeDocument(parsed.data, value.settings),
      });
    }
    const old = await getBusinessDocument(b.id);
    if (!old) return reply({ error: "This document was not found." }, 404);
    if (old.etag !== b.etag)
      return reply(
        { error: "This document changed. Reload before continuing." },
        409,
      );
    const doc = old.value;
    if (b.action === "update") {
      if (doc.status !== "draft")
        return reply(
          {
            error:
              "Shared documents are locked. Duplicate it to prepare a revision.",
          },
          400,
        );
      const input = documentInputSchema.parse(b.value);
      if (input.kind !== doc.kind)
        return reply({ error: "Document type cannot change." }, 400);
      if (input.discount > totals({ ...input, discount: 0 }).subtotal)
        return reply({ error: "Discount cannot exceed the subtotal." }, 400);
      const { value } = await getWorkspace();
      await saveDocument(
        {
          ...doc,
          ...input,
          business: value.settings,
          updatedAt: new Date().toISOString(),
        },
        old.etag,
      );
    } else if (b.action === "share") {
      if (doc.status !== "draft")
        return reply(
          { error: "Use the existing share link for this document." },
          400,
        );
      return reply({ document: await shareDocument(doc, old.etag) });
    } else if (b.action === "cancel") {
      if (doc.status === "approved" || doc.payments.length)
        return reply(
          {
            error:
              "Approved quotations and documents with payments cannot be cancelled here.",
          },
          400,
        );
      await saveDocument(
        { ...doc, status: "cancelled", updatedAt: new Date().toISOString() },
        old.etag,
      );
    } else if (b.action === "payment") {
      if (doc.kind !== "invoice" || doc.status !== "issued")
        return reply(
          { error: "Issue the invoice before recording a payment." },
          400,
        );
      const payment = paymentSchema.parse(b.payment);
      if (doc.payments.some((p) => p.id === payment.id))
        return reply({ ok: true });
      if (payment.amount > totals(doc).balance)
        return reply({ error: "Payment exceeds the outstanding amount." }, 400);
      await saveDocument(
        {
          ...doc,
          payments: [...doc.payments, payment],
          updatedAt: new Date().toISOString(),
        },
        old.etag,
      );
    } else if (b.action === "invoice") {
      if (doc.kind !== "quotation" || doc.status !== "approved")
        return reply(
          { error: "The client must approve the quotation first." },
          400,
        );
      const existing = (await allDocuments()).find(
        (d) => d.sourceQuoteId === doc.id,
      );
      if (existing) return reply({ document: existing });
      const { value } = await getWorkspace();
      const input = documentInputSchema.parse({ ...doc, kind: "invoice" });
      const invoice = await makeDocument(input, value.settings, doc.id);
      await saveDocument(
        { ...doc, invoiceId: invoice.id, updatedAt: new Date().toISOString() },
        old.etag,
      );
      return reply({ document: invoice });
    } else if (b.action === "email") {
      if (
        !doc.token ||
        ["draft", "cancelled"].includes(doc.status) ||
        !doc.clientEmail
      )
        return reply(
          { error: "Create a share link and add a client email first." },
          400,
        );
      if (!emailReady())
        return reply(
          {
            error:
              "Email sending is not connected. You can use Share on WhatsApp or copy the link.",
          },
          503,
        );
      const { value } = await getWorkspace();
      const url = `${process.env.NEXT_PUBLIC_SITE_URL}/documents/${doc.token}`;
      const result = await sendEmail({
        to: doc.clientEmail,
        cc: value.settings.partnerEmails,
        subject: `${doc.business.businessName} · ${doc.kind === "quotation" ? "Quotation" : "Invoice"} ${doc.number}`,
        text: `Hello ${doc.clientName},\n\nPlease review your ${doc.kind} for ${doc.event}:\n${url}\n\nYou can view the details and download the PDF using this private link.\n\n${doc.business.businessName}`,
        key: `document-${doc.id}`,
      });
      await saveDocument(
        {
          ...doc,
          emailStatus: result.status,
          ...(result.ok ? { emailSentAt: new Date().toISOString() } : {}),
        },
        old.etag,
      );
      if (!result.ok)
        return reply(
          {
            error:
              "Email could not be sent. Check your email connection. Your document is saved.",
          },
          502,
        );
    } else return reply({ error: "Choose a valid action." }, 400);
    return reply({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.name === "ZodError")
      return reply(
        { error: "Check required fields, quantities, and prices." },
        400,
      );
    return reply(
      {
        error:
          "Could not save. Reload to get the latest version and try again.",
      },
      409,
    );
  }
}
