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

export const enquirySchema = z.object({
  name: z.string().trim().max(100).min(2, "Enter your name."),
  contact: z
    .string()
    .trim()
    .max(200)
    .min(5, "Enter an email or phone number so we can reach you."),
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
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
