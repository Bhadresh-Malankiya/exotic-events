import { concepts, decor, sectionBackgrounds } from "@/lib/assets";
import type { EventEntry } from "./types";

// Every entry is an illustrated design concept, built ahead of a photographed
// portfolio — never presented as a completed client event.
export const events: EventEntry[] = [
  {
    slug: "ivory-garden-mandap",
    title: "Ivory Garden Mandap",
    category: "wedding-planning",
    featured: true,
    status: "concept",
    publishedAt: "2026-09-15",
    summary:
      "A mandap built around light — ivory drapery, a gold frame, and florals that stay soft rather than heavy.",
    description:
      "This concept treats the mandap as the room's one piece of architecture: a slim gold frame, ivory drapery falling clean rather than gathered, and floral clusters weighted to the corners so sightlines to the couple stay open from every seat. A starting point for a garden or banquet ceremony.",
    image: concepts.ivoryGardenMandap,
    gallery: [decor.gardenFloralArch, sectionBackgrounds.ivoryLinenAndLeaves],
  },
  {
    slug: "palace-ceremony",
    title: "Palace Ceremony",
    category: "wedding-planning",
    featured: true,
    status: "concept",
    publishedAt: "2026-09-15",
    summary:
      "Deep emerald, arched silhouettes, and candlelight — a ceremony concept for a heritage venue.",
    description:
      "Built for a venue that already has architecture worth keeping: arched silhouettes echo the room instead of covering it, the palette stays deep emerald and gold, and light comes from low candle clusters rather than overhead rigging.",
    image: concepts.palaceCeremony,
    gallery: [decor.goldChandelierIllustration, sectionBackgrounds.emeraldBotanicalEdges],
  },
  {
    slug: "rangoli-celebration-stage",
    title: "Rangoli Celebration Stage",
    category: "navratri-events",
    featured: true,
    status: "concept",
    publishedAt: "2026-09-15",
    summary:
      "A festive stage concept designed to hold its energy from the first night through the ninth.",
    description:
      "A stage sized for a moving crowd rather than a seated one: a raised platform with a rangoli medallion as the focal point, marigold toran overhead, and a floor left deliberately clear so garba circles have room to form and re-form across the evening.",
    image: concepts.rangoliCelebrationStage,
    gallery: [decor.decoratedDandiyaPair, sectionBackgrounds.charcoalGoldCornerRays],
  },
  {
    slug: "architectural-gala-dinner",
    title: "Architectural Gala Dinner",
    category: "corporate-events",
    featured: false,
    status: "concept",
    publishedAt: "2026-09-15",
    summary:
      "A dark, editorial dinner concept built around three lit arches and clean round tables.",
    description:
      "A gala staging concept built on restraint: three lit arches as the only backdrop, chandeliers held high, and round tables kept sparse so the room photographs well and conversation still works. Intended for award dinners and executive events.",
    image: concepts.architecturalGalaDinner,
    gallery: [decor.goldChandelierIllustration, sectionBackgrounds.midnightConstellationArch],
  },
  {
    slug: "ivory-banquet-tablescape",
    title: "Ivory Banquet Tablescape",
    category: "hospitality-management",
    featured: false,
    status: "concept",
    publishedAt: "2026-09-15",
    summary:
      "A reception tablescape concept focused on service flow as much as how the table looks.",
    description:
      "A long banquet setting planned from the server's side as well as the guest's: centerpieces kept low for sightlines, place settings spaced for plated service, and a palette of blush and ivory that holds up under warm venue lighting.",
    image: concepts.ivoryBanquetTablescape,
    gallery: [decor.botanicalPlaceSetting, sectionBackgrounds.champagneFineVeins],
  },
  {
    slug: "coastal-ceremony",
    title: "Coastal Ceremony",
    category: "destination-events",
    featured: false,
    status: "concept",
    publishedAt: "2026-09-15",
    summary:
      "An arrival-and-ceremony concept designed to travel: light materials, minimal build.",
    description:
      "A destination-friendly ceremony concept — a light arch with floral corners, materials chosen because they can reasonably be sourced or carried, and a footprint that works on sand without a heavy structural build.",
    image: concepts.coastalCeremony,
    gallery: [decor.tropicalPalmPair],
  },
  {
    slug: "floral-moon-installation",
    title: "Floral Moon Installation",
    category: "custom-decor",
    featured: false,
    status: "concept",
    publishedAt: "2026-09-15",
    summary:
      "One circular floral installation carrying an entire room, instead of many smaller pieces.",
    description:
      "Rather than layering décor around a room, this concept spends the budget on a single gesture: a suspended gold ring dressed asymmetrically with blooms, lit from below by candles. A reference for clients who want one strong statement.",
    image: concepts.floralMoonInstallation,
    gallery: [decor.asymmetricFloralCrescent, sectionBackgrounds.goldArtDecoFans],
  },
  {
    slug: "blush-milestone-birthday",
    title: "Blush Milestone Birthday",
    category: "private-celebrations",
    featured: false,
    status: "concept",
    publishedAt: "2026-09-15",
    summary:
      "A birthday concept that stays warm and personal rather than scaling up into a wedding.",
    description:
      "A milestone celebration concept in blush and gold: a balloon arch kept asymmetric, a cake table as the natural gathering point, and seating arranged in small clusters so the room feels like a party rather than a banquet.",
    image: concepts.blushBirthdayCelebration,
    gallery: [decor.blushBalloonBouquet],
  },
  {
    slug: "invitation-suite-flatlay",
    title: "Invitation Suite Concept",
    category: "custom-decor",
    featured: false,
    status: "concept",
    publishedAt: "2026-09-15",
    summary:
      "Stationery, palette, and paper direction worked out before anything goes to print.",
    description:
      "The planning detail clients see first and remember longest: invitation, envelope and insert cards developed as one suite, with the palette agreed here and then carried through to the décor rather than the other way round.",
    image: concepts.invitationSuiteFlatlay,
    gallery: [decor.blankInvitationSuite],
  },
];

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}
