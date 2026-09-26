// Two libraries live under /public/assets:
//   exotic-2d/ — the flat illustration collection (heroes, concepts, decor)
//   exotic/    — the original brand kit (logo, icons, ornaments)
// Change these two constants if either library ever moves.
export const ART_BASE = "/assets/exotic-2d";
export const BRAND_BASE = "/assets/exotic";

/** Desktop hero compositions — 3200x1800, copy space in the left ~40%. */
export const heroes = {
  goldenFloralMoon: `${ART_BASE}/01-hero-backgrounds/golden-floral-moon-hero.png`,
  charcoalGala: `${ART_BASE}/01-hero-backgrounds/charcoal-gala-evening-hero.png`,
  ivoryGardenWedding: `${ART_BASE}/01-hero-backgrounds/ivory-garden-wedding-hero.png`,
  emeraldWelcomeLounge: `${ART_BASE}/01-hero-backgrounds/emerald-welcome-lounge-hero.png`,
  burgundyCultural: `${ART_BASE}/01-hero-backgrounds/burgundy-cultural-celebration-hero.png`,
  navyConference: `${ART_BASE}/01-hero-backgrounds/navy-conference-hero.png`,
  ivoryHospitalityTable: `${ART_BASE}/01-hero-backgrounds/ivory-hospitality-table-hero.png`,
  coastalDestination: `${ART_BASE}/01-hero-backgrounds/coastal-destination-hero.png`,
  forestFloralInstallation: `${ART_BASE}/01-hero-backgrounds/forest-floral-installation-hero.png`,
  roseInvitationStory: `${ART_BASE}/01-hero-backgrounds/rose-invitation-story-hero.png`,
  blushBirthday: `${ART_BASE}/01-hero-backgrounds/blush-birthday-hero.png`,
  sagePlanningStudio: `${ART_BASE}/01-hero-backgrounds/sage-planning-studio-hero.png`,
} as const;

/** Portrait hero compositions — 1800x2400, artwork sits below the copy area. */
export const heroesMobile = {
  goldenFloralMoon: `${ART_BASE}/05-mobile-hero-compositions/golden-floral-moon-mobile.png`,
  ivoryGardenWedding: `${ART_BASE}/05-mobile-hero-compositions/ivory-garden-wedding-mobile.png`,
  charcoalGala: `${ART_BASE}/05-mobile-hero-compositions/charcoal-gala-evening-mobile.png`,
  burgundyCultural: `${ART_BASE}/05-mobile-hero-compositions/burgundy-cultural-celebration-mobile.png`,
  navyConference: `${ART_BASE}/05-mobile-hero-compositions/navy-conference-mobile.png`,
  coastalDestination: `${ART_BASE}/05-mobile-hero-compositions/coastal-destination-mobile.png`,
  emeraldWelcomeLounge: `${ART_BASE}/05-mobile-hero-compositions/emerald-welcome-lounge-mobile.png`,
  roseInvitationStory: `${ART_BASE}/05-mobile-hero-compositions/rose-invitation-story-mobile.png`,
} as const;

/** Event concept illustrations — 3000x2000 (3:2). Concepts, never real projects. */
export const concepts = {
  ivoryGardenMandap: `${ART_BASE}/02-event-concepts/weddings/ivory-garden-mandap.png`,
  palaceCeremony: `${ART_BASE}/02-event-concepts/weddings/palace-ceremony.png`,
  rangoliCelebrationStage: `${ART_BASE}/02-event-concepts/navratri-cultural/rangoli-celebration-stage.png`,
  architecturalGalaDinner: `${ART_BASE}/02-event-concepts/corporate-events/architectural-gala-dinner.png`,
  ivoryBanquetTablescape: `${ART_BASE}/02-event-concepts/hospitality/ivory-banquet-tablescape.png`,
  coastalCeremony: `${ART_BASE}/02-event-concepts/destination-events/coastal-ceremony.png`,
  blushBirthdayCelebration: `${ART_BASE}/02-event-concepts/private-celebrations/blush-birthday-celebration.png`,
  floralMoonInstallation: `${ART_BASE}/02-event-concepts/stage-and-decor/floral-moon-installation.png`,
  invitationSuiteFlatlay: `${ART_BASE}/02-event-concepts/planning-and-details/invitation-suite-flatlay.png`,
} as const;

/** Quiet section backgrounds — 3200x1800. */
export const sectionBackgrounds = {
  charcoalGoldFlowLines: `${ART_BASE}/03-section-backgrounds/charcoal-gold-flow-lines.png`,
  charcoalGoldCornerRays: `${ART_BASE}/03-section-backgrounds/charcoal-gold-corner-rays.png`,
  goldArtDecoFans: `${ART_BASE}/03-section-backgrounds/gold-art-deco-fans.png`,
  midnightConstellationArch: `${ART_BASE}/03-section-backgrounds/midnight-constellation-arch.png`,
  emeraldBotanicalEdges: `${ART_BASE}/03-section-backgrounds/emerald-botanical-edges.png`,
  ivoryLinenAndLeaves: `${ART_BASE}/03-section-backgrounds/ivory-linen-and-leaves.png`,
  champagneFineVeins: `${ART_BASE}/03-section-backgrounds/champagne-fine-veins.png`,
  ivoryPalaceArchPattern: `${ART_BASE}/03-section-backgrounds/ivory-palace-arch-pattern.png`,
} as const;

/** Alpha-transparent decorative layers — 3000x2000. One or two per section, no more. */
export const decor = {
  botanicalCornerBouquet: `${ART_BASE}/04-transparent-decor/botanical-corner-bouquet.png`,
  gardenFloralArch: `${ART_BASE}/04-transparent-decor/garden-floral-arch.png`,
  floralSectionDivider: `${ART_BASE}/04-transparent-decor/floral-section-divider.png`,
  hangingLanternTrio: `${ART_BASE}/04-transparent-decor/hanging-lantern-trio.png`,
  champagneRibbonWave: `${ART_BASE}/04-transparent-decor/champagne-ribbon-wave.png`,
  asymmetricFloralCrescent: `${ART_BASE}/04-transparent-decor/asymmetric-floral-crescent.png`,
  goldPetalTrail: `${ART_BASE}/04-transparent-decor/gold-petal-trail.png`,
  goldChandelierIllustration: `${ART_BASE}/04-transparent-decor/gold-chandelier-illustration.png`,
  eucalyptusFan: `${ART_BASE}/04-transparent-decor/eucalyptus-fan.png`,
  festoonLightStrands: `${ART_BASE}/04-transparent-decor/festoon-light-strands.png`,
  blankInvitationSuite: `${ART_BASE}/04-transparent-decor/blank-invitation-suite.png`,
  oliveBranchSweep: `${ART_BASE}/04-transparent-decor/olive-branch-sweep.png`,
  decoratedDandiyaPair: `${ART_BASE}/04-transparent-decor/decorated-dandiya-pair.png`,
  botanicalPlaceSetting: `${ART_BASE}/04-transparent-decor/botanical-place-setting.png`,
  tropicalPalmPair: `${ART_BASE}/04-transparent-decor/tropical-palm-pair.png`,
  blushBalloonBouquet: `${ART_BASE}/04-transparent-decor/blush-balloon-bouquet.png`,
  floralCelebrationCake: `${ART_BASE}/04-transparent-decor/floral-celebration-cake.png`,
  marigoldLeafToran: `${ART_BASE}/04-transparent-decor/marigold-leaf-toran.png`,
  lotusRangoliMedallion: `${ART_BASE}/04-transparent-decor/lotus-rangoli-medallion.png`,
} as const;

export const logos = {
  emblemGold: `${BRAND_BASE}/logos/emblem-gold.png`,
  emblemIvory: `${BRAND_BASE}/logos/emblem-white.png`,
} as const;

export const ornaments = {
  goldRibbonWide: `${BRAND_BASE}/ornaments/gold-ribbon-wide.svg`,
  dividerBotanical: `${BRAND_BASE}/ornaments/divider-botanical.svg`,
} as const;

export const emblem = {
  bookingSuccessPoster: `${BRAND_BASE}/lottie-posters/booking-success.png`,
  loadingDotsAnimated: `${BRAND_BASE}/animated-svg/loading-dots.svg`,
} as const;

/** Natural pixel dimensions, so every <Image> can carry explicit width/height. */
export const ART_SIZES = {
  hero: { width: 3200, height: 1800 },
  heroMobile: { width: 1800, height: 2400 },
  concept: { width: 3000, height: 2000 },
  sectionBackground: { width: 3200, height: 1800 },
  decor: { width: 3000, height: 2000 },
} as const;
