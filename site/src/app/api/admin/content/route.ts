import { authorize, privateHeaders } from "@/lib/cms/auth";
import { getDocument, writeJson } from "@/lib/cms/storage";
import { contentSchema } from "@/lib/cms/schema";
import { BlobPreconditionFailedError } from "@vercel/blob";
export async function GET(request: Request) {
  if (!(await authorize(request))) return new Response(null, { status: 401 });
  return Response.json(await getDocument(), { headers: privateHeaders });
}
export async function PUT(request: Request) {
  if (!(await authorize(request))) return new Response(null, { status: 401 });
  if (Number(request.headers.get("content-length")) > 2000000)
    return new Response(null, { status: 413 });
  try {
    const body = await request.json();
    const old = await getDocument();
    const parsed = contentSchema.safeParse(
      body.action === "restore" ? old.value.published : body.content,
    );
    if (!parsed.success)
      return Response.json(
        {
          error: parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("\n"),
        },
        { status: 400 },
      );
    if (!["draft", "publish", "restore"].includes(body.action))
      return new Response(null, { status: 400 });
    if (body.etag !== old.etag)
      return Response.json(
        { error: "Content changed in another tab. Reload before saving." },
        { status: 409 },
      );
    const now = new Date().toISOString();
    const draft = body.action === "restore" ? old.value.published : parsed.data;
    const doc = {
      ...old.value,
      draft,
      updatedAt: now,
      ...(body.action === "publish"
        ? { published: draft, publishedAt: now }
        : {}),
    };
    if (body.action === "publish" && old.etag)
      await writeJson(`history/${Date.now()}.json`, old.value);
    const result = await writeJson("cms/site.json", doc, old.etag || undefined);
    return Response.json(
      { value: doc, etag: result.etag },
      { headers: privateHeaders },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof BlobPreconditionFailedError
            ? "Content changed. Reload before saving."
            : "Unable to save. Please try again.",
      },
      { status: error instanceof BlobPreconditionFailedError ? 409 : 503 },
    );
  }
}
