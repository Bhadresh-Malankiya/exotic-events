import { z } from "zod";

export const occasionOptions = [
  "Wedding Planning",
  "Navratri & Festive Events",
  "Corporate Events",
  "Hospitality Management",
  "Custom Décor",
  "Destination Events",
  "Private Celebrations",
  "Something else",
] as const;

export const enquirySchema = z
  .object({
    name: z.string().trim().max(100).min(2, "Enter your name."),
    contact: z.string().trim().max(200).optional().default(""),
    phone: z.string().trim().max(30).optional().default(""),
    email: z
      .union([z.literal(""), z.email()])
      .optional()
      .default(""),
    occasion: z.enum(occasionOptions).optional().default("Something else"),
    eventDate: z.string().trim().max(100).optional().default(""),
    dateFlexible: z.boolean().optional().default(false),
    city: z.string().trim().max(150).optional().default(""),
    guestCount: z.string().trim().max(100).optional().default(""),
    message: z
      .string()
      .trim()
      .max(4000)
      .min(2, "Tell us the occasion or what you have in mind."),
  })
  .superRefine((v, ctx) => {
    const phone =
      v.phone || (v.contact && !v.contact.includes("@") ? v.contact : "");
    const email = v.email || (v.contact.includes("@") ? v.contact : "");
    if (!phone && !email)
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Add a phone number or email.",
      });
    if (
      phone &&
      (!/^[+\d\s()-]+$/.test(phone) ||
        phone.replace(/\D/g, "").length < 7 ||
        phone.replace(/\D/g, "").length > 15)
    )
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid phone number.",
      });
    if (email && !z.email().safeParse(email).success)
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Enter a valid email.",
      });
  })
  .transform((v) => ({
    ...v,
    phone: v.phone || (v.contact && !v.contact.includes("@") ? v.contact : ""),
    email: v.email || (v.contact.includes("@") ? v.contact : ""),
    contact: [v.phone, v.email].filter(Boolean).join(" · ") || v.contact,
  }));

export type EnquiryInput = z.infer<typeof enquirySchema>;
