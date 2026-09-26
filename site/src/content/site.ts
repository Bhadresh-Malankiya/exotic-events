import type { Faq, ProcessStep } from "./types";

export const site = {
  name: "Exotic",
  fullName: "Exotic Event & Entertainment",
  description:
    "Event planning, décor, and hospitality management for weddings, festive celebrations, and corporate events.",
};

export const primaryNav = [
  { href: "/services", label: "Services" },
  { href: "/events", label: "Our Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerServiceLinks = [
  { href: "/services/wedding-planning", label: "Wedding Planning" },
  { href: "/services/navratri-events", label: "Navratri & Festive Events" },
  { href: "/services/corporate-events", label: "Corporate Events" },
  { href: "/services/hospitality-management", label: "Hospitality Management" },
  { href: "/services/custom-decor", label: "Custom Décor" },
  { href: "/services/destination-events", label: "Destination Events" },
  { href: "/services/private-celebrations", label: "Private Celebrations" },
] as const;

export const planningJourney: (ProcessStep & { id: string })[] = [
  {
    id: "discover",
    title: "Discover",
    description:
      "A first conversation about the occasion, the people it's for, and what you want the day to feel like.",
  },
  {
    id: "design",
    title: "Design",
    description:
      "Palette, décor direction, and stage or mandap concepts come together into one shared point of view.",
  },
  {
    id: "plan",
    title: "Plan",
    description:
      "Vendors, timeline, and budget are locked in against the design — no surprises in the weeks before.",
  },
  {
    id: "create",
    title: "Create",
    description:
      "Décor, staging, and installations come together on-site, with time built in to refine before guests arrive.",
  },
  {
    id: "celebrate",
    title: "Celebrate",
    description:
      "A coordination team runs the day itself, so you're a guest at your own event, not its manager.",
  },
];

export const planningCommitments = [
  {
    title: "One point of contact",
    description:
      "A single planner coordinates every vendor, so you're never chasing three different people for one answer.",
  },
  {
    title: "Clear, written scope",
    description:
      "What's included, what isn't, and the payment schedule are agreed in writing before work begins.",
  },
  {
    title: "A team on-site",
    description:
      "On the day itself, coordination is handled in person — not managed remotely by phone.",
  },
];

export const generalFaqs: Faq[] = [
  {
    question: "What happens after I send an enquiry?",
    answer:
      "We reply personally to arrange a planning call, usually within one business day, to talk through your date, occasion, and rough scope.",
  },
  {
    question: "Do you only plan weddings?",
    answer:
      "No — weddings, Navratri and festive events, corporate functions, and custom décor are all covered. See Services for the full list.",
  },
  {
    question:
      "Can you take over an event we've already started planning ourselves?",
    answer:
      "Yes. Tell us what's already booked or decided, and we'll plan around it rather than asking you to start again.",
  },
  {
    question: "Do you work outside your home city?",
    answer:
      "Yes, through our Destination Events service — coordinated remotely, working with vendors local to your chosen destination.",
  },
];

export const contactChannels = {
  formNote:
    "The enquiry form below reaches our planning team directly — it's the fastest way to start a conversation.",
};
