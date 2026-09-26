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
  occasion: z.enum(occasionOptions, {
    message: "Choose the occasion closest to your event.",
  }),
  eventDate: z.string().trim().max(100).optional().default(""),
  dateFlexible: z.boolean().optional().default(false),
  city: z.string().trim().max(150).min(2, "Tell us the city."),
  guestCount: z.string().trim().max(100).optional().default(""),
  message: z
    .string()
    .trim()
    .max(4000)
    .min(10, "A sentence or two about the event helps us prepare."),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
