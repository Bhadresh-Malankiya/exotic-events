import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import {
  totals,
  estimateTotal,
  settingsSchema,
  documentInputSchema,
  variantSchema,
  type BusinessDocument,
} from "../src/lib/business/schema";
import { makePdf, upiLink } from "../src/lib/business/pdf";
async function main() {
  const line = {
    id: randomUUID(),
    catalogId: "",
    name: "Lighting and floral installation",
    variant: "Premium warm-white finish",
    description:
      "Includes installation, on-site support and collection after the event.",
    quantity: 3,
    unit: "sets",
    rate: 0.1,
  };
  assert.equal(totals({ lines: [line], discount: 0, taxRate: 0 }).total, 0.3);
  assert.equal(
    totals({
      lines: [{ ...line, quantity: 2, rate: 100 }],
      discount: 20,
      taxRate: 18,
    }).total,
    212.4,
  );
  assert(
    !variantSchema.safeParse({
      id: randomUUID(),
      name: "Premium",
      price: 200,
      maxPrice: 100,
      unit: "each",
    }).success,
  );
  const profile = {
    id: randomUUID(),
    serviceSlug: "test",
    title: "Test",
    enabled: true,
    baseMin: 100,
    baseMax: 200,
    note: "",
    factors: [
      {
        id: "factor",
        title: "Guests",
        unit: "guests",
        min: 10,
        max: 100,
        defaultValue: 20,
        low: 5,
        high: 10,
      },
    ],
  };
  assert.deepEqual(estimateTotal(profile, { factor: 999 }), {
    low: 600,
    high: 1200,
  });
  const input = {
    kind: "invoice" as const,
    clientName: "Quality Assurance — Not a Client",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "Sample address for PDF layout testing only",
    event: "MULTI-PAGE SAMPLE — NO PAYMENT REQUESTED",
    eventDate: "2026-12-15",
    dueDate: "",
    enquiryId: "",
    lines: Array.from({ length: 32 }, (_, i) => ({
      ...line,
      id: randomUUID(),
      name: `${i + 1}. Lighting & floral installation`,
      quantity: 2,
      rate: 9999.95,
    })),
    discount: 5000,
    taxRate: 18,
    notes: "This is a software test. Do not pay this invoice.",
    terms:
      "Test-only terms.\nItems wrap across pages and totals must remain aligned.",
  };
  const valid = documentInputSchema.parse(input);
  assert(
    !documentInputSchema.safeParse({ ...input, discount: 99999999 }).success,
  );
  const doc: BusinessDocument = {
    ...valid,
    id: randomUUID(),
    number: "INV-QA-SAMPLE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "issued",
    payments: [],
    business: {
      ...settingsSchema.parse({}),
      upiId: "qa-test@example",
      payeeName: "TEST ONLY DO NOT PAY",
    },
  };
  assert(upiLink(doc).includes("cu=INR"));
  assert.equal(upiLink({ ...doc, kind: "quotation" }), "");
  await mkdir(".private/qa", { recursive: true });
  await writeFile(".private/qa/multipage-invoice.pdf", await makePdf(doc));
  console.log(
    "PASS: decimal totals, discounted tax, pricing ranges, estimate clamps, invalid discounts, invoice-only UPI link, 32-line PDF with QR.",
  );
}
main();
