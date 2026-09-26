import { getWorkspace } from "@/lib/business/store";
import { getDocument } from "@/lib/cms/storage";
export async function GET() {
  try {
    const [w, c] = await Promise.all([getWorkspace(), getDocument()]);
    return Response.json(
      {
        whatsapp: w.value.settings.whatsapp || c.value.published.brand.whatsapp,
        phone: w.value.settings.phone || c.value.published.brand.phone,
        email: w.value.settings.email || c.value.published.brand.email,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ whatsapp: "", phone: "", email: "" });
  }
}
