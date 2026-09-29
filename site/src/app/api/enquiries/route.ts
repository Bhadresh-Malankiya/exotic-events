import { getWorkspace } from "@/lib/business/store";
import { notifyEnquiry } from "@/lib/business/email";
import { randomUUID } from "node:crypto";
import { enquirySchema } from "@/lib/enquiry-schema";
import { sameOrigin } from "@/lib/cms/auth";
import { configured, rateLimit, writeJson } from "@/lib/cms/storage";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ ok: false }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 16000)
    return Response.json({ ok: false }, { status: 413 });
  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  if (!configured())
    return Response.json(
      {
        ok: false,
        error: "Please call us while our enquiry service is unavailable.",
      },
      { status: 503 },
    );
  try {
    if (!(await rateLimit(request, "enquiry", 5, 3600000)))
      return Response.json(
        { ok: false, error: "Please call us, or try again later." },
        { status: 429 },
      );
    const id = randomUUID();
    const record = {
      id,
      receivedAt: new Date().toISOString(),
      status: "new",
      ...parsed.data,
    };
    await writeJson(`enquiries/${id}.json`, record);
    let whatsapp = "";
    try {
      const { value } = await getWorkspace();
      whatsapp = value.settings.whatsapp;
      await notifyEnquiry(value.settings, record);
    } catch {
      /* The saved enquiry remains in the inbox even if notification delivery fails. */
    }
    return Response.json({ ok: true, id, whatsapp });
  } catch {
    return Response.json(
      {
        ok: false,
        error: "Your enquiry was not saved. Please try again or call us.",
      },
      { status: 503 },
    );
  }
}
