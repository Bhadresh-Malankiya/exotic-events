# Exotic — asset-aware cinematic website build command

Attach your preferred full-homepage reference image, put this package beside your project, and paste the command below into your coding agent. The asset folder is `public/assets/exotic/`. In a web URL, omit `public`: `/assets/exotic/...`.

---

Act as a senior creative frontend engineer, UI/UX designer, motion designer and practical 3D developer. Build the Exotic Event & Entertainment website, not another mockup or a plan that waits for approval. Inspect the existing repository first. Read relevant available skills and the installed versions' official documentation. Use tools that are actually available and report what you actually tested.

## 1. Inspect the assets before designing

Read `README.md`, `ASSET_MANIFEST.json`, `ASSET_MAP.md`, and this command. Open `START_HERE.html` or inspect `previews/asset-pack-overview.jpg` and the 3D contact sheet. When the user provides a catalogue selection JSON, treat that as the shortlist, not an instruction to load every file.

Copy `public/assets/exotic/` into the same public asset path in the application. Do not double-nest `public/public`. Preserve descriptive filenames. Do not publish docs, sources, or the complete reference folder by default. If the user already moved the assets, locate them and adapt the base path in one central config.

This is a library to select from. Use only what improves each scene. DO NOT display every model, loader, SVG, particle overlay and ornament just because it exists. A polished result should use fewer, more intentional elements.

Understand the source distinctions:
- `models/*.glb` are 35 original stylized model/scene designs, not photorealistic reconstructions of the prior collage. Models are Y-up, front +Z, generally metre-scale, with named groups and material factors.
- `models/mobile/` contains lighter geometry variants. Compare triangle counts in `models-manifest.json`; choose by scene budget, not only screen width. The tiny sparkle has no meaningful geometry to simplify.
- `models/animated/` contains four counterparts with embedded animation clips. Static variants do not have hidden animation. Use `AnimationMixer`/`useAnimations` only when clips exist.
- `model-renders/` contains transparent PNG renders. They are 2D fallbacks or independent foreground layers, not real 3D.
- `lottie/` contains actual JSON animations; `animated-svg/` contains standalone SVG alternatives. Choose one format per interaction, not both at once.
- `logos/` contains derivatives of a low-resolution supplied logo. The `*-trace.svg` files are approximate silhouette traces, not the original master vector. Preserve the original transparent raster when exact appearance matters; request a master vector before oversized printing.
- `backgrounds/` contains text-free 3D illustrations, not client-event photography.
- `references/` contains earlier AI-generated design mockups. Their event statistics, testimonials, brands, cities and contact details are unverified. Do not publish them as facts or use the whole screenshot as a webpage.

## 2. Art direction and spacing

Create an intimate cinematic entrance into an event: invitation → venue reveal → services → selected celebrations → planning story → enquiry.

Use charcoal, soft ivory, champagne gold, restrained rose and sage. Import the supplied design tokens, then refine them against real browser screenshots. Use an editorial serif and a readable sans-serif from an appropriately licensed source; do not assume font files are in this pack.

Aim for content width 1280–1360px; desktop section spacing 96–144px; mobile 64–88px; gutters 20–24px on mobile; card gaps 24–40px. Use `clamp()` to keep headings balanced: approximately 64–92px desktop and 40–52px mobile. Body copy should be comfortably readable, approximately 18px desktop and 16px mobile with 1.6 line-height. Maintain a clear hierarchy and ample negative space. Do not imitate the compressed scale of the tall design screenshot.

Use restrained metallic accents. Avoid constant borders, bloom everywhere, busy text backgrounds, repeated narrow card rows, or gold particles over every paragraph. Keep active controls comfortably large and focus-visible.

## 3. Architecture

Respect the existing stack and package manager. For a new project, use Next.js App Router, TypeScript, Tailwind, Motion for React, React Three Fiber/Three.js and selective Drei utilities. Prefer one animation engine for interface motion. Use current `motion/react` APIs in a new setup, or stay consistent with an existing supported `framer-motion` installation.

Keep indexable content server-rendered. Isolate interactive client components. Dynamically load the WebGL enhancement after a useful poster and readable HTML are already visible. Do not convert the entire site to client-only rendering.

Use typed content records for services, events, FAQs and verified business details. No invented reviews, stats, brand endorsements, awards, addresses or overseas offices.

## 4. Homepage: six substantial sections

### A. Entrance / hero

Build the original logo, navigation and a clear headline as HTML. Suggested headline: “Extraordinary events. Beautifully brought to life.” Primary action: “Book Your Event.” Secondary: “Explore Our Work.”

Choose ONE main 3D composition. Recommended starting point: `models/mobile/scene-wedding-portal.glb`, or the lighter `models/portal-arch-triple.glb` combined with just one floral detail. Use `textures/studio-softbox.hdr` for a soft metallic environment when supported. The meshes carry material factors, not texture UV layouts for arbitrary surface-image mapping; inspect before adding material textures.

Layer the scene deliberately: a quiet background; a midground arch; optional `overlays/floral-corner-left.png`; readable foreground copy. Do not obscure the model with excessive bloom. Keep the poster `model-renders/scene-wedding-portal.png` visible until enhancement is ready. Use real event photographs only when the business supplies rights-cleared imagery. Do not imply illustrated renders are real completed work.

Create a SHORT on-load reveal, around 0.8–1.2 seconds: stable poster and navigation → headline settles 16–24px → supporting copy and actions → decorative details settle independently. Do not hold the website hostage to a loader. For a brief ornamental brand moment use `lottie/exotic-emblem-reveal.json` or its animated-SVG counterpart, play once, and respect reduced motion. Use `exotic-emblem-orbit` only inside an actual pending loading area; never fake progress.

On capable desktop layouts, use one bounded sticky hero chapter, roughly 180–220svh. First allow reading and clicking, then move slightly through the arch. Separate foreground/background motion: background scale about 1.00→1.10; foreground arch shifts more; camera travels modestly. Release naturally into services. Controls must not move away while someone tries to click them.

Use restrained fine-pointer parallax, at most a few degrees and approximately 8–16px. Touch and reduced-motion layouts get normal flow and an attractive static scene, not a long pinned sequence.

### B. Services

Heading: “Every occasion. Thoughtfully imagined.” Six spacious service cards link to real pages. Use the supplied wedding-rings, navratri, corporate, hospitality, floral-decor and globe-route SVGs; one icon per card is enough. All text stays real HTML.

Use varied editorial composition, not six cramped cards squeezed across a row. A subtle entrance stagger and 4–6px hover lift are enough. Keep image hover transforms and scroll transforms on separate wrappers. Provide keyboard-equivalent feedback. Include a visible “View All Services” link.

### C. Featured and recent work

Heading: “Celebrations worth stepping into.” Build functional All / Featured / Recent filters and “Explore All Events.” One larger feature with supporting cards is preferable to a repetitive carousel. Use verified dates to sort Recent; do not call synthetic examples recent completed work. Mark concept entries clearly as “Design concept.”

Create one controlled image-entry moment: the image expands within its frame, scale settles approximately 1.06→1.00, a small foreground layer separates, then the caption appears. Do not zoom interface text. Filters must preserve keyboard focus and minimize layout jump.

### D. Planning story

Heading: “From your first idea to the final celebration.” Tell Discover → Design → Plan → Create → Celebrate. Use ordinary readable text alongside a sticky visual panel on desktop. Suggested visual assets: `invitation-suite.glb` → `portal-arch.glb` → `floral-centerpiece.glb` → `scene-wedding-portal.glb`.

Preload only the next required asset and avoid keeping every model on the GPU. A lightly animated path can use `ornaments/progress-journey.svg` or `lottie/journey-draw.json`. Progress follows the section instead of becoming an unrelated infinite loop. On mobile use a normal vertical timeline. Across the page, allow at most two bounded sticky storytelling moments.

### E. Confidence and FAQs

Use a calm, readable section with genuine service details and accessible FAQs. Publish testimonials only when supplied and approved. Otherwise use planning commitments and a team/process introduction. No arbitrary counters or invented brand logos. Keep backgrounds quiet and animations minimal.

### F. Enquiry CTA and footer

Heading: “Let’s create something worth remembering.” Use one restrained `ornaments/gold-ribbon-wide.svg` or static gold-ribbon model render, not all decorative layers together. Primary action: “Book Your Event.” Secondary: “Discuss Your Ideas.”

Provide a working enquiry dialog or /contact with name, preferred contact detail, occasion, date/flexibility, city, optional guest count and message. Accessible labels, validation and focus return are required. Connect to a real existing backend when available. Show success and `booking-success.json` ONLY after a genuine successful submission. Otherwise label the form as a preview; never fake sending.

Footer: original brand, service links, work, about, verified contact/social links, privacy and appropriate legal content. No dummy email, phone or address.

## 5. Real separate service pages

Implement a reusable detail-page foundation with distinct art direction and original copy, not identical pages with swapped headings:

- `/services/wedding-planning`: mandap-pavilion or floral-arch, pearl blossom accents; explain end-to-end planning and décor scope.
- `/services/navratri-events`: scene-festive-entry or dandiya-pair, restrained rose/saffron accents, navratri-rhythm only in an appropriate detail; explain cultural programming, stage/decor and coordination using verified offerings.
- `/services/corporate-events`: suspended-halo, podium-trio, dark editorial layout; explain conferences, launches and brand experiences as confirmed.
- `/services/hospitality-management`: scene-hospitality or hospitality-cloche; focus on guest reception, coordination and experience, with only verified service promises.
- `/services/custom-decor`: sculptural-ribbon, botanical-leaf and palette/floral-decor icons; show personalization, venue styling and occasion formats.
- `/services/destination-events`: a clean airy presentation, globe-route icon and a modest mandap composition; separate intended destination coordination from confirmed overseas experience. Do not claim local offices, global coverage or permit handling without evidence.

Each detail page needs: a service-specific H1 and hero, scope/inclusions, a useful process, related work or labelled concepts, appropriate FAQs, clear booking CTA and related-service links. Keep approximately 5–6 substantial sections. Include /services, /events, /events/[slug], /about and /contact. Build only useful routes; no empty shells or dead links.

## 6. Motion and rendering engineering

Use `useScroll`, `useTransform`, `useSpring` selectively, and `useReducedMotion`. Stable refs, fixed hooks order, cleanup subscriptions, and seeded randomness are mandatory. Do not write React state on every animation frame. Animate transforms/opacity; avoid large animated blur or shadow surfaces.

The four embedded GLB clips are: wedding-rings / SlowTurn, sculptural-ribbon / Float, crystal-chandelier / GentleSway, gold-sparkle / SlowTurn. Use an animation mixer and stop it offscreen. Do not also run another conflicting rotation on the same object.

Prefer a single active canvas. Cap rendering resolution, monitor performance, reuse geometry/materials, and dispose unused resources. For on-demand rendering, invalidate whenever imperative camera/object changes occur, and render only while an active transition needs frames. Static scenes should not run a perpetual render loop. Handle WebGL failure/context loss with the corresponding PNG fallback.

Keep native scroll and keyboard behavior. Never intercept the whole page's wheel or touch scrolling. Pause ambient animation offscreen, on hidden tabs and in reduced-motion mode. For continuing decoration, provide a motion toggle. Keep focused elements and controls stable.

## 7. Accessibility, SEO and validation

Semantic landmarks, one H1, ordered headings, readable contrast, real internal links, meaningful image alternatives, decorative SVGs hidden from assistive technology, keyboard-operable filters/menus/forms, correct dialog focus and Escape support. In reduced motion, remove camera travel, parallax and big zooms without hiding essential content.

Metadata and structured data must use verified business information. Do not index placeholder concepts as completed client case studies. No fabricated review schema. Set production canonicals only after the real domain is known. Give images dimensions/aspect ratios; do not lazy-load the primary hero poster. Animation itself is not an SEO strategy.

Test at 360, 390, 768, 1024, 1440 and wide desktop widths. Inspect above/below-fold spacing, sticky transitions in both scroll directions, controls during animation, mobile touch targets, reduced motion, keyboard focus, form validation, missing images, unavailable WebGL and console/hydration errors.

Run the actual available lint, type-check, tests and production build. Capture browser screenshots of the homepage and each service page when tools permit, inspect them, and fix clipping or awkward spacing. The pack's previews are not proof that your finished app works. Do not claim testing you did not run.

Begin implementation. Deliver the working website, asset choices actually used, routes created, tests actually performed, and any remaining real-content/integration dependencies. Do not stop at generic fade-ins and do not use all assets at once.
