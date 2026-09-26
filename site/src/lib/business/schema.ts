import { z } from "zod";
const text = z.string().trim().max(300),
  long = z.string().trim().max(4000),
  money = z.number().finite().min(0).max(100000000),
  id = z.string().uuid();
export const variantSchema = z
  .object({
    id,
    name: text.min(1),
    price: money,
    maxPrice: money,
    unit: text.default("each"),
  })
  .refine(
    (v) => v.maxPrice >= v.price,
    "The upper price must be at least the starting price.",
  );
export const catalogSchema = z.object({
  id,
  name: text.min(1),
  category: text,
  description: long,
  variants: z.array(variantSchema).min(1).max(20),
  active: z.boolean().default(true),
});
export const estimateSchema = z
  .object({
    id,
    serviceSlug: text.min(1),
    title: text.min(1),
    enabled: z.boolean(),
    baseMin: money,
    baseMax: money,
    factors: z
      .array(
        z.object({
          id,
          title: text.min(1),
          unit: text,
          min: z.number().min(0).max(100000),
          max: z.number().min(1).max(100000),
          defaultValue: z.number().min(0).max(100000),
          low: money,
          high: money,
        }),
      )
      .max(12),
    note: long,
  })
  .superRefine((p, c) => {
    if (p.baseMax < p.baseMin)
      c.addIssue({
        code: "custom",
        message: "Base upper price must be at least the starting price.",
      });
    for (const f of p.factors)
      if (
        f.max < f.min ||
        f.defaultValue < f.min ||
        f.defaultValue > f.max ||
        f.high < f.low
      )
        c.addIssue({
          code: "custom",
          message: "Check quantity limits and price ranges for each factor.",
        });
  });
export const settingsSchema = z.object({
  businessName: text.min(1).default("Exotic Event & Entertainment"),
  address: long.default(
    "S-41, Nilkanth Business Hub, Singanpor, Surat, Gujarat 395004",
  ),
  phone: text.default("+919909615585"),
  email: z.union([z.literal(""), z.email()]).default(""),
  partnerEmails: z.array(z.email()).max(3).default([]),
  whatsapp: z
    .string()
    .regex(/^\d{0,15}$/)
    .default("919909615585"),
  upiId: z
    .string()
    .trim()
    .regex(/^$|^[a-zA-Z0-9.\-_]{2,100}@[a-zA-Z0-9.\-_]{2,100}$/)
    .default(""),
  payeeName: text.default(""),
  qrImage: z
    .string()
    .regex(/^$|^\/(assets\/[a-zA-Z0-9/_.-]+|api\/media\/[a-z0-9-]+\.webp)$/)
    .default(""),
  taxId: text.default(""),
  terms: long.default(
    "Dates and availability are confirmed after the agreed advance payment. Any change in scope will be quoted separately.",
  ),
  paymentNote: long.default(
    "Please share your payment reference with our team. Payments are confirmed after verification.",
  ),
  emailNotifications: z.boolean().default(false),
});
export const lineSchema = z.object({
  id,
  catalogId: z.string().default(""),
  name: text.min(1),
  variant: text,
  description: z.string().trim().max(1000).default(""),
  quantity: z.number().finite().min(0.01).max(100000),
  unit: text,
  rate: money,
});
export const documentInputSchema = z
  .object({
    kind: z.enum(["quotation", "invoice"]),
    clientName: text.min(2),
    clientEmail: z.union([z.literal(""), z.email()]),
    clientPhone: z
      .string()
      .regex(/^[+\d\s()-]*$/)
      .max(30),
    clientAddress: long,
    event: text.min(1),
    eventDate: text,
    dueDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),
    enquiryId: z.string().max(100).default(""),
    lines: z.array(lineSchema).min(1).max(100),
    discount: money,
    taxRate: z.number().finite().min(0).max(100),
    notes: long,
    terms: long,
  })
  .superRefine((d, c) => {
    const subtotal =
      d.lines.reduce((n, l) => n + Math.round(l.quantity * l.rate * 100), 0) /
      100;
    if (subtotal > 1000000000)
      c.addIssue({
        code: "custom",
        message: "Document totals must be below INR 100 crore.",
      });
    if (d.discount > subtotal)
      c.addIssue({
        code: "custom",
        message: "Discount cannot exceed the subtotal.",
      });
  });
export const paymentSchema = z.object({
  id,
  amount: z.number().positive().max(100000000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reference: text.min(1),
  method: z.enum(["UPI", "Bank transfer", "Cash", "Other"]),
});
export type CatalogItem = z.infer<typeof catalogSchema>;
export type EstimateProfile = z.infer<typeof estimateSchema>;
export type BusinessSettings = z.infer<typeof settingsSchema>;
export type DocumentInput = z.infer<typeof documentInputSchema>;
export type BusinessDocument = DocumentInput & {
  id: string;
  number: string;
  status: "draft" | "shared" | "approved" | "declined" | "issued" | "cancelled";
  createdAt: string;
  updatedAt: string;
  token?: string;
  sharedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  sourceQuoteId?: string;
  invoiceId?: string;
  business: BusinessSettings;
  payments: z.infer<typeof paymentSchema>[];
  emailStatus?: string;
  emailSentAt?: string;
};
export const workspaceSchema = z
  .object({
    settings: settingsSchema.default(() => settingsSchema.parse({})),
    catalog: z.array(catalogSchema).max(1000).default([]),
    estimates: z.array(estimateSchema).max(30).default([]),
  })
  .refine(
    (w) =>
      new Set(w.estimates.map((e) => e.serviceSlug)).size ===
      w.estimates.length,
    "Only one calculator can be configured per service.",
  );
export type BusinessWorkspace = z.infer<typeof workspaceSchema>;
export const totals = (
  doc: Pick<DocumentInput, "lines" | "discount" | "taxRate"> & {
    payments?: { amount: number }[];
  },
) => {
  const subtotal = doc.lines.reduce(
    (n, l) => n + Math.round(l.quantity * l.rate * 100),
    0,
  );
  const discount = Math.min(subtotal, Math.round(doc.discount * 100));
  const tax = Math.round(((subtotal - discount) * doc.taxRate) / 100);
  const total = subtotal - discount + tax;
  const paid = (doc.payments || []).reduce(
    (n, p) => n + Math.round(p.amount * 100),
    0,
  );
  return {
    subtotal: subtotal / 100,
    discount: discount / 100,
    tax: tax / 100,
    total: total / 100,
    paid: paid / 100,
    balance: Math.max(0, total - paid) / 100,
  };
};
export const rupees = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
export function estimateTotal(
  p: EstimateProfile,
  values: Record<string, number>,
) {
  let low = p.baseMin,
    high = p.baseMax;
  for (const f of p.factors) {
    const n = Math.min(f.max, Math.max(f.min, values[f.id] ?? f.defaultValue));
    low += n * f.low;
    high += n * f.high;
  }
  return { low: Math.round(low), high: Math.round(high) };
}
