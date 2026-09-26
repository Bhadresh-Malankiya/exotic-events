/**
 * Licensed stock photography used as atmosphere — venue and celebration
 * imagery that sets the tone of a page.
 *
 * IMPORTANT: these are NOT photographs of events this studio has delivered.
 * They must never be captioned or labelled as our own completed work. Our own
 * design work is the illustrated concept set (see lib/assets.ts), which is
 * always badged "Design concept". Replace these with real event photography
 * as soon as shoots are delivered and permission is granted.
 *
 * Source: Unsplash, used under the Unsplash License (free for commercial use,
 * no attribution required — credits recorded in public/assets/photos/CREDITS.md).
 */
export const PHOTO_BASE = "/assets/photos";

type Photo = {
  src: string;
  width: number;
  height: number;
  /** Descriptive alt text — written for screen readers and search engines. */
  alt: string;
};

export const photos = {
  heroMandapGold: {
    src: `${PHOTO_BASE}/hero-mandap-gold.jpg`,
    width: 2400,
    height: 1600,
    alt: "Indian wedding mandap framed by gold drapery, floral garlands and rows of candles under a chandelier",
  },
  weddingMandapCeremony: {
    src: `${PHOTO_BASE}/wedding-mandap-ceremony.jpg`,
    width: 2000,
    height: 1333,
    alt: "Outdoor wedding ceremony beneath a floral mandap with gold and ivory drapery against a blue sky",
  },
  ballroomChandeliers: {
    src: `${PHOTO_BASE}/ballroom-chandeliers.jpg`,
    width: 2000,
    height: 1333,
    alt: "Banquet hall set for a reception, with chandeliers, tall floral arrangements and dressed round tables",
  },
  floralTablescape: {
    src: `${PHOTO_BASE}/floral-tablescape.jpg`,
    width: 2000,
    height: 1333,
    alt: "Long banquet table styled with blush and ivory floral centerpieces, taper candles and glassware",
  },
  conferenceStage: {
    src: `${PHOTO_BASE}/conference-stage.jpg`,
    width: 2000,
    height: 1429,
    alt: "Speaker presenting on a lit conference stage in front of a large screen and a seated audience",
  },
  beachCeremony: {
    src: `${PHOTO_BASE}/beach-ceremony.jpg`,
    width: 2000,
    height: 1201,
    alt: "Destination wedding ceremony set up on a beach, with a draped arch and white chairs facing the sea",
  },
  birthdayBalloons: {
    src: `${PHOTO_BASE}/birthday-balloons.jpg`,
    width: 2000,
    height: 1333,
    alt: "Birthday celebration setup with a balloon arch, neon sign and a decorated cake table",
  },
  festiveGarlands: {
    src: `${PHOTO_BASE}/festive-garlands.jpg`,
    width: 1600,
    height: 2400,
    alt: "Festive Indian decorations in close-up: gold lotus charms, marigold garlands and pearl strings",
  },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
