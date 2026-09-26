import { byToken } from "@/lib/business/store";
import { makePdf } from "@/lib/business/pdf";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const doc = await byToken((await params).token);
  if (!doc) return new Response(null, { status: 404 });
  const bytes = await makePdf(doc.value);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${doc.value.number}.pdf"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    },
  });
}
