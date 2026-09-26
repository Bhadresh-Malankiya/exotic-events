import { authorize } from "@/lib/cms/auth";
import { getBusinessDocument } from "@/lib/business/store";
import { makePdf } from "@/lib/business/pdf";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await authorize(request))) return new Response(null, { status: 401 });
  const doc = await getBusinessDocument((await params).id);
  if (!doc) return new Response(null, { status: 404 });
  const bytes = await makePdf(doc.value);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${doc.value.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
