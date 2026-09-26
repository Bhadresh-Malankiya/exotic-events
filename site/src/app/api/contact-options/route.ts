import { getWorkspace } from "@/lib/business/store";
export async function GET() {
  try {
    const w = await getWorkspace();
    return Response.json(
      {
        whatsapp: w.value.settings.whatsapp,
        phone: w.value.settings.phone,
        email: w.value.settings.email,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ whatsapp: "", phone: "", email: "" });
  }
}
