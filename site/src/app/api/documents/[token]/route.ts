import { z } from "zod";
import { sameOrigin, privateHeaders } from "@/lib/cms/auth";
import { byToken, saveDocument } from "@/lib/business/store";
import { rateLimit } from "@/lib/cms/storage";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const input = z
    .object({
      name: z.string().trim().min(2).max(150),
      action: z.enum(["approve", "decline"]),
      agree: z.literal(true),
    })
    .safeParse(await request.json().catch(() => null));
  if (!input.success)
    return Response.json(
      {
        error:
          "Enter your name and confirm that you have reviewed the quotation.",
      },
      { status: 400 },
    );
  try {
    if (!(await rateLimit(request, "document-response", 20, 3600000)))
      return Response.json(
        { error: "Please try again later." },
        { status: 429 },
      );
    const { token } = await params;
    const old = await byToken(token);
    if (!old || old.value.kind !== "quotation")
      return new Response(null, { status: 404 });
    const d = old.value;
    if (d.status !== "shared")
      return Response.json(
        {
          error:
            "This quotation has already been answered or is no longer available.",
        },
        { status: 409 },
      );
    if (d.dueDate && d.dueDate < new Date().toISOString().slice(0, 10))
      return Response.json(
        {
          error:
            "This quotation has expired. Please request an updated quotation.",
        },
        { status: 400 },
      );
    await saveDocument(
      {
        ...d,
        status: input.data.action === "approve" ? "approved" : "declined",
        approvedBy: input.data.name,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      old.etag,
    );
    return Response.json({ ok: true }, { headers: privateHeaders });
  } catch {
    return Response.json(
      { error: "The quotation changed. Please reload and try again." },
      { status: 409 },
    );
  }
}
