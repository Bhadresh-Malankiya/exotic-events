import { get } from "@vercel/blob";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(id))
    return new Response(null, { status: 404 });
  try {
    const image = await get("media/" + id, { access: "private" });
    if (!image) return new Response(null, { status: 404 });
    return new Response(image.stream, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
