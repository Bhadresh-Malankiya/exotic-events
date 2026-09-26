This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Business workspace

Open `/admin` and use the **Your business** menu:

- **Business & messages**: update WhatsApp, public contact information, up to three partner email addresses, quotation terms, UPI ID/payee name, or a payment QR. Shared documents retain their original business details; changes apply to new documents and saved draft updates.
- **Items & pricing**: save reusable line items with several named price options and indicative ranges. Choose options in a quotation and adjust the agreed price per line.
- **Quotations**: create a draft, review/download its PDF, then create a private client link. Shared quotations are locked; duplicate one for a revision. A client can approve or decline the shared quotation. Approved quotations can generate one linked invoice.
- **Invoices & payments**: issue an invoice, share its link or PDF, and record payments after verifying receipt. UPI QR codes do not automatically confirm payment.
- **Service estimates**: enter actual base prices and quantity factors, then enable the calculator for its service page. Calculators remain hidden until configured and enabled.
- **Photo gallery**: batch upload, search, filter, edit in a drawer, mark featured/completed work, or remove with undo. Save the draft, preview, then publish. Stock references are labelled inspiration.

Enquiries are saved privately. WhatsApp links open a composed message for the visitor or owner to send; this is not the WhatsApp Cloud API. Partner email copies are included in email drafts. Optional automatic email delivery uses `RESEND_API_KEY` and `EMAIL_FROM` (a verified sender); configure these privately in the hosting environment, then enable enquiry notifications in admin. Never place email credentials in public website content.

Private client documents use unguessable links and are excluded from indexing. Only share a document link with its intended recipient. Documents, pricing, payment records and workspace settings are stored in private Vercel Blob storage.

### Verification

`pnpm lint` and `pnpm build` check the application. `pnpm dlx tsx scripts/check-business-math.ts` checks totals and produces a private PDF fixture. The integration checks in `scripts/check-business.mjs` and `scripts/check-workspace.mjs` use synthetic records and clean them up; run against a test environment with the locally stored admin access file and Blob credentials. Do not run synthetic message tests with delivery enabled.

Additional reference photography is recorded with creator and source credits in `scripts/gallery-collection.json`. The original collection and curation scripts exclude paid Unsplash+ images. These images are examples for style selection, not claims of completed Exotic client work.
