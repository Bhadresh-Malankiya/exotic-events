# Exotic content studio

Website: https://exotic-event-entertainment.vercel.app
Admin: https://exotic-event-entertainment.vercel.app/admin

The admin password is in `.private/admin-access.txt` on this computer. This file and all environment secrets are excluded from Git and Vercel uploads. Sessions expire after eight hours.

## Editing

1. Sign in and choose a section in the sidebar.
2. Edit text, images, contact details, or carousel items. Expand a slide or item to see its fields. Use Move up / Move down to reorder, Duplicate to copy, and Remove to remove it from the draft.
3. Save draft. Open Preview draft to review the saved version.
4. Publish changes to update the live website. A server-side version check prevents a stale tab from overwriting a newer save.

Images can be uploaded from an image field or from the Media library. JPG, PNG, and WebP files up to 4 MB are accepted and optimized. Give each image a useful accessibility description. Uploads remain in the library when an item is removed, so they can be reused.

Each main section can be shown or hidden. Hero autoplay, slide interval, all hero images, the gold ribbon, service cards, gallery categories, feature, process, FAQs, contact section, and footer copy are editable.

## Enquiries and contact

Enquiries are saved privately and appear under Enquiries. Set their status to new, contacted, or archived. No automatic notification emails are sent. Refresh the inbox to load new submissions.

The phone and address came from the business listing supplied by the owner:
https://maps.app.goo.gl/zBCxBvPwq22yLM7s8

Public email, WhatsApp, and Instagram are hidden until filled in under Business details. WhatsApp requires digits with country code, without a plus sign. The Maps listing did not verify a WhatsApp number or public email.

## Storage and deployment

Vercel project: exotic-event-entertainment
Private Blob store: exotic-content (Mumbai region)

Content and enquiries survive redeployment. Private storage is never exposed directly. Only normalized image files can be served through the public media route. Publishing also saves the previous document under the private `history/` prefix for technical recovery.

Older service/about/contact URLs redirect to the corresponding homepage sections, keeping all public content in the current visual design.

The integration check is `node --env-file=.env.local scripts/check-cms.mjs`. It verifies authentication, CSRF, draft isolation, publication, optimistic concurrency, uploads, rejected SVGs, and enquiry persistence. It creates and removes its own disposable records. Do not run against a site being actively edited because it temporarily updates the draft.

Generated visuals and their prompts are documented in IMAGE-PROMPTS.md. Photo attribution is in public/assets/photos/CREDITS.md. Replace illustrative photographs with approved client event photography through the editor when available.

## Portfolio, sharing, and client selections

The gallery lives at `/gallery`. Upload your completed-event photography under **Photo gallery**, then edit each photo’s heading, description, category, keywords, event, location, and year. Keywords are comma-separated (for example `floral, mandap, ivory, garden`). Tick **Completed Exotic event** only for work your team delivered. Existing stock and generated images remain inspiration. Tick **Feature this photo** to place it in featured collections and on the homepage. The first three featured photos, in your chosen order, appear on the homepage.

Each photo has a permanent share ID. Keep it unchanged after sharing. New and duplicated photos receive a new ID. Gallery URLs preserve filters, for example `/gallery?category=Weddings`, `/gallery?q=floral`, `/gallery?featured=1`, and `/gallery?collection=work`. Open a photo and use **Share photo**, or use **Share this collection** for the current filters.

Visitors can save up to 20 photos using the heart buttons. Their shortlist stays in their browser. **Share shortlist** creates a link containing the selected photo IDs, so recipients do not need the same browser. **Discuss These Ideas** includes those references in the enquiry. Messages arrive in the admin **Enquiries** inbox; they are not automatically emailed.

## Service pages and planning

**Service pages** controls the service index and individual pages at `/services/{page-address}`. Edit images, headline, scope, cost factors, and deliverables. Each service needs a unique page address. The service-carousel item’s **Linked service page address** should match that address. Disabled services disappear from the index and return a not-found page.

**Planning & budget** manages the planning steps and cost guidance at `/planning` and on the homepage. **What happens next** controls the next-step guidance. **Gallery page & featured section** controls the gallery introduction and homepage featured section. These pages explain what goes into a quotation; they do not advertise unverified fixed prices.

**Business details → Show location map** controls the bottom map. Its pin/search uses the business name and full address. The directions button uses the separate Google Maps link.

Save a draft before using **Preview draft**. Gallery and collection sections preview the gallery; other sections preview the homepage. Service-page text can be reviewed in the editor before publishing.
