import { concepts, heroes, heroesMobile } from "@/lib/assets";
import type { Service } from "./types";

export const services: Service[] = [
  {
    slug: "wedding-planning",
    name: "Wedding Planning",
    cardSummary:
      "End-to-end planning and décor direction, from the first idea to the last dance.",
    icon: "wedding-rings",
    accent: "rose",
    heroPhoto: "weddingMandapCeremony",
    heroImage: heroes.ivoryGardenWedding,
    heroImageMobile: heroesMobile.ivoryGardenWedding,
    conceptImage: concepts.ivoryGardenMandap,
    heroHeadline: "A wedding staged like the most important night of your life.",
    heroDescription:
      "We plan the whole arc of the wedding — venue and mandap design, décor direction, vendors, and the day itself — so you're a guest at your own celebration, not its project manager.",
    metaDescription:
      "Full-service wedding planning: venue and mandap design, décor direction, vendor coordination, and day-of management.",
    scope: [
      "Venue scouting and mandap or stage design",
      "Décor concept, palette, and floral direction",
      "Vendor coordination — catering, photography, entertainment",
      "Day-of event management and run-of-show",
      "Guest experience and hospitality touches",
      "Budget planning and timeline management",
    ],
    process: [
      {
        title: "Discovery conversation",
        description:
          "We talk through the two of you, your families, and the shape you want the day to take — traditions to keep, and ones you'd rather skip.",
      },
      {
        title: "Concept and mood board",
        description:
          "Palette, mandap or stage direction, and décor references come together into one point of view before a single vendor is booked.",
      },
      {
        title: "Vendor and logistics coordination",
        description:
          "We brief and manage catering, décor, photography, and entertainment against one shared timeline.",
      },
      {
        title: "Rehearsal and day-of execution",
        description:
          "A run-through ahead of time, then a coordination team on-site so the day moves the way it was planned.",
      },
    ],
    faqs: [
      {
        question: "How far in advance should we start planning?",
        answer:
          "Six to twelve months gives the most room for venue and vendor choice, especially across a wedding season. Shorter timelines are workable — tell us your date and we'll say plainly what's realistic.",
      },
      {
        question: "Can you work with a venue we've already booked?",
        answer:
          "Yes. We'll plan around your venue and existing bookings rather than asking you to start over.",
      },
      {
        question: "Do you handle destination or multi-day weddings?",
        answer:
          "Multi-day functions, yes. For weddings outside your home city, see Destination Events — the coordination model there is a little different.",
      },
    ],
    relatedEventSlugs: ["ivory-garden-mandap", "palace-ceremony"],
  },
  {
    slug: "navratri-events",
    name: "Navratri & Festive Events",
    cardSummary:
      "Stage, sound, and nightly programming for garba and dandiya evenings that hold up for nine nights.",
    icon: "navratri",
    accent: "gold",
    heroPhoto: "festiveGarlands",
    heroImage: heroes.burgundyCultural,
    heroImageMobile: heroesMobile.burgundyCultural,
    conceptImage: concepts.rangoliCelebrationStage,
    heroHeadline: "Nine nights of rhythm, staged with intention.",
    heroDescription:
      "Garba and dandiya nights live or die on floor flow, sound, and pacing. We design the stage and schedule so the energy holds from night one through the ninth.",
    metaDescription:
      "Navratri and festive event production: stage and floor design, artist booking, lighting, and nightly run-of-show.",
    scope: [
      "Stage and dandiya/garba floor design",
      "Live music and dhol artist coordination",
      "Festive lighting and drapery",
      "Costume-friendly guest flow and seating",
      "Multi-night programming and scheduling",
      "Refreshment and prasad coordination",
    ],
    process: [
      {
        title: "Programming plan",
        description:
          "We map which nights carry which format — raas, dandiya, live sets — before deciding on stage or floor size.",
      },
      {
        title: "Stage and floor design",
        description:
          "Circulation, sightlines, and lighting are planned for a moving crowd, not a seated one.",
      },
      {
        title: "Artist and vendor booking",
        description:
          "Dhol players, instructors, and sound vendors are booked and briefed against your programming plan.",
      },
      {
        title: "Nightly run-of-show",
        description:
          "A coordination team resets the floor, manages timing, and handles the evening on-site for each of your chosen nights.",
      },
    ],
    faqs: [
      {
        question: "Can you run all nine nights, or select evenings only?",
        answer:
          "Either. Some clients run a full nine nights, others choose two or three key evenings — the programming plan adjusts either way.",
      },
      {
        question:
          "Do you coordinate dandiya instructors and live dhol players?",
        answer:
          "Yes, booking and briefing performing artists and instructors is part of this service.",
      },
      {
        question:
          "Can this scale from a housing-society courtyard to a banquet hall?",
        answer:
          "Yes — the stage and floor design changes with the venue, but the planning approach is the same.",
      },
    ],
    relatedEventSlugs: ["rangoli-celebration-stage"],
  },
  {
    slug: "corporate-events",
    name: "Corporate Events",
    cardSummary:
      "Conferences, launches, and brand experiences staged with the same discipline as your business.",
    icon: "corporate",
    accent: "gold",
    heroPhoto: "conferenceStage",
    heroImage: heroes.navyConference,
    heroImageMobile: heroesMobile.navyConference,
    conceptImage: concepts.architecturalGalaDinner,
    heroHeadline: "Launches and conferences that read as considered, not corporate.",
    heroDescription:
      "From a product reveal to a multi-day summit, we handle the stage, AV, and delegate logistics so your team can focus on the content, not the cabling.",
    metaDescription:
      "Corporate event production: conference and launch staging, AV, stage design, delegate logistics, and executive hospitality.",
    scope: [
      "Conference and summit production",
      "Product launch staging",
      "Brand environment and stage design",
      "AV, lighting, and podium setup",
      "Delegate logistics and registration flow",
      "Executive and speaker hospitality",
    ],
    process: [
      {
        title: "Objective and audience briefing",
        description:
          "We start from what the event needs to achieve for your audience, not a generic run-of-show template.",
      },
      {
        title: "Stage and brand environment design",
        description:
          "Staging, signage, and lighting are built around your existing brand guidelines rather than a stock backdrop.",
      },
      {
        title: "Production and AV coordination",
        description:
          "Sound, lighting, and screen content are tested and briefed ahead of the event, not on the day of.",
      },
      {
        title: "Live-day management",
        description:
          "A coordination team runs registration, timing, and speaker changeovers so your team can stay in the room, not backstage.",
      },
    ],
    faqs: [
      {
        question: "Can you manage a hybrid, in-person and streamed, format?",
        answer:
          "Yes — tell us the streaming platform and audience split and we'll plan the AV and run-of-show around both.",
      },
      {
        question: "Do you work within our internal brand guidelines?",
        answer:
          "That's the starting point for staging and signage — send your brand guide during the briefing stage.",
      },
      {
        question: "What lead time do you need for a product launch?",
        answer:
          "Eight to ten weeks is comfortable for staging and vendor booking; shorter is possible for a smaller-format launch.",
      },
    ],
    relatedEventSlugs: ["architectural-gala-dinner"],
  },
  {
    slug: "hospitality-management",
    name: "Hospitality Management",
    cardSummary:
      "Guest reception, service coordination, and the small details guests actually remember.",
    icon: "hospitality",
    accent: "sage",
    heroPhoto: "ballroomChandeliers",
    heroImage: heroes.ivoryHospitalityTable,
    heroImageMobile: heroesMobile.ivoryGardenWedding,
    conceptImage: concepts.ivoryBanquetTablescape,
    heroHeadline: "The part guests remember: how they were looked after.",
    heroDescription:
      "Hospitality is the layer underneath every other service we offer — reception, seating, service pacing, and guest support handled so nobody notices the coordination happening.",
    metaDescription:
      "Hospitality management for weddings and corporate events: guest reception, seating coordination, VIP hospitality, and on-site guest support.",
    scope: [
      "Guest reception and welcome design",
      "Seating and table service coordination",
      "Concierge-style guest assistance",
      "VIP and speaker hospitality",
      "Food and beverage service coordination",
      "On-site guest experience management",
    ],
    process: [
      {
        title: "Guest journey mapping",
        description:
          "We walk the venue as a guest would — arrival, seating, service, departure — and plan around the friction points.",
      },
      {
        title: "Service standards briefing",
        description:
          "Front-of-house staff, whether ours or your venue's existing team, are briefed against one shared standard.",
      },
      {
        title: "On-site team coordination",
        description:
          "A lead coordinator manages pacing between service, programming, and any changes on the day.",
      },
      {
        title: "Live guest support",
        description:
          "Concierge-style support for guest questions, accessibility needs, and VIP requests through the event.",
      },
    ],
    faqs: [
      {
        question:
          "Do you provide hospitality staff, or coordinate our existing team?",
        answer:
          "Both are possible — we can supply a coordination team, brief your venue's existing staff, or a mix of the two.",
      },
      {
        question:
          "Can this run alongside a wedding or corporate event we're already booking with you?",
        answer:
          "Yes, this is usually layered onto another service rather than booked entirely on its own.",
      },
      {
        question: "How do you handle VIP or accessibility requirements?",
        answer:
          "Tell us in the planning stage — seating, service order, and access routes are planned around those needs in advance.",
      },
    ],
    relatedEventSlugs: ["ivory-banquet-tablescape"],
  },
  {
    slug: "custom-decor",
    name: "Custom Décor",
    cardSummary:
      "Venue styling, floral direction, and installations built around your occasion, not a catalogue.",
    icon: "floral-decor",
    accent: "rose",
    heroPhoto: "floralTablescape",
    heroImage: heroes.forestFloralInstallation,
    heroImageMobile: heroesMobile.emeraldWelcomeLounge,
    conceptImage: concepts.floralMoonInstallation,
    heroHeadline: "Décor built around your occasion, not a catalogue.",
    heroDescription:
      "Palette, materials, and installation are planned around your venue and occasion first — the catalogue of ideas comes second, not the other way round.",
    metaDescription:
      "Custom event décor: venue styling, floral direction, lighting and sculptural installations, and tablescapes.",
    scope: [
      "Venue styling and spatial layout",
      "Floral and botanical direction",
      "Drapery, lighting, and sculptural installations",
      "Tablescapes and centerpiece design",
      "Palette and material selection",
      "Teardown and venue restoration",
    ],
    process: [
      {
        title: "Mood and palette exploration",
        description:
          "We narrow toward one palette and material direction before any décor is sourced or built.",
      },
      {
        title: "Spatial and material plan",
        description:
          "Layout, scale, and materials are planned against your venue's actual dimensions and light.",
      },
      {
        title: "Installation and styling",
        description:
          "Our team installs on-site ahead of the event, with time built in for adjustment.",
      },
      {
        title: "On-site refinement",
        description:
          "A final walkthrough before guests arrive, and teardown handled after, restoring the venue afterward.",
      },
    ],
    faqs: [
      {
        question: "Can you style a venue we've already decorated in part?",
        answer:
          "Yes — tell us what's already planned and we'll design around it rather than replace it.",
      },
      {
        question:
          "Do you source flowers seasonally, or work from a fixed palette?",
        answer:
          "Seasonally, where possible — we'll flag if a reference palette needs adjusting for what's actually available on your date.",
      },
      {
        question: "Can décor travel between multiple event days?",
        answer:
          "Some elements can be adapted and reused across a multi-day function; we'll plan for this from the start if that's the brief.",
      },
    ],
    relatedEventSlugs: ["floral-moon-installation", "invitation-suite-flatlay"],
  },
  {
    slug: "destination-events",
    name: "Destination Events",
    cardSummary:
      "Remote planning and vendor coordination for celebrations held away from home.",
    icon: "globe-route",
    accent: "sage",
    heroPhoto: "beachCeremony",
    heroImage: heroes.coastalDestination,
    heroImageMobile: heroesMobile.coastalDestination,
    conceptImage: concepts.coastalCeremony,
    heroHeadline: "Planning that travels with you.",
    heroDescription:
      "We coordinate destination celebrations from here — working with your chosen venue and vendors local to the destination — rather than claiming an office on the ground we don't have.",
    metaDescription:
      "Destination event planning: remote venue shortlisting, logistics planning, and coordination with local destination vendors.",
    scope: [
      "Destination venue shortlisting, coordinated remotely",
      "Travel-friendly timeline and logistics planning",
      "Coordination with vendors local to the destination",
      "Guest travel and stay communication support",
      "Décor and programming adapted to the destination",
      "Remote planning calls and site-visit coordination",
    ],
    process: [
      {
        title: "Destination and date discussion",
        description:
          "We talk through the destination, guest count, and travel realities before shortlisting anything.",
      },
      {
        title: "Remote venue and vendor shortlisting",
        description:
          "Working from venue documentation, calls, and local vendor references rather than an on-the-ground office.",
      },
      {
        title: "Logistics and guest communication plan",
        description:
          "Travel windows, stay details, and guest communication are planned around your date and destination.",
      },
      {
        title: "Coordination through the event dates",
        description:
          "We stay the coordination point of contact across your planning team, the venue, and destination vendors through the event.",
      },
    ],
    faqs: [
      {
        question: "Do you have offices at the destination?",
        answer:
          "No — we coordinate remotely and work with vendors local to your chosen destination, joining key planning calls where it helps.",
      },
      {
        question: "Who handles permits and local regulations?",
        answer:
          "That responsibility sits with the venue, local vendors, and you as the client, guided by a planning checklist we prepare together — we don't handle permits directly.",
      },
      {
        question: "Do you travel to the destination?",
        answer:
          "This is discussed and agreed per event; travel arrangements and costs are worked out separately from the planning fee.",
      },
    ],
    relatedEventSlugs: ["coastal-ceremony"],
  },
  {
    slug: "private-celebrations",
    name: "Private Celebrations",
    cardSummary:
      "Birthdays, anniversaries, and milestone parties planned at a size that still feels personal.",
    icon: "balloons",
    accent: "rose",
    heroPhoto: "birthdayBalloons",
    heroImage: heroes.blushBirthday,
    heroImageMobile: heroesMobile.roseInvitationStory,
    conceptImage: concepts.blushBirthdayCelebration,
    heroHeadline: "The small celebrations, given real attention.",
    heroDescription:
      "Birthdays, anniversaries, engagements and naming ceremonies — planned properly, without the scale or formality of a full wedding production.",
    metaDescription:
      "Private celebration planning for birthdays, anniversaries, engagements and milestone parties: styling, catering coordination and hosting.",
    scope: [
      "Birthday and milestone party planning",
      "Anniversary and engagement celebrations",
      "Intimate venue styling and tablescapes",
      "Cake, catering, and beverage coordination",
      "Entertainment and music booking",
      "Guest invitations and RSVP tracking",
    ],
    process: [
      {
        title: "The brief, in one conversation",
        description:
          "Who it's for, how many people, and the feeling you want — usually enough to start on a smaller celebration.",
      },
      {
        title: "Styling and supplier plan",
        description:
          "A palette, a venue layout, and a shortlist of suppliers sized to the guest count rather than a wedding budget.",
      },
      {
        title: "Setup on the day",
        description:
          "We install the styling and brief the venue so the host isn't arranging chairs an hour before guests arrive.",
      },
      {
        title: "Hosting support",
        description:
          "Someone on-site to run timings — cake, speeches, music — so the family can actually be present.",
      },
    ],
    faqs: [
      {
        question: "Is there a minimum guest count?",
        answer:
          "No. We plan intimate gatherings as readily as larger parties — the scope and fee scale with what you actually need.",
      },
      {
        question: "Can you work in a home or a private garden?",
        answer:
          "Yes. Home celebrations need a slightly different plan for power, catering access and seating, which we'll walk through with you.",
      },
      {
        question: "Can you just handle the décor and leave the rest to us?",
        answer:
          "Yes — styling-only is a common way to book this service. Tell us what you'd rather keep in your own hands.",
      },
    ],
    relatedEventSlugs: ["blush-milestone-birthday"],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
