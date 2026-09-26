import { authorize, privateHeaders } from "@/lib/cms/auth";
import { listAll } from "@/lib/cms/storage";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
export async function GET(request: Request) {
  if (!(await authorize(request))) return new Response(null, { status: 401 });
  const files = await listAll("media/");
  return Response.json(
    files
      .map((f) => ({ url: "/api/" + f.pathname, createdAt: f.uploadedAt }))
      .reverse(),
    { headers: privateHeaders },
  );
}
export async function POST(request: Request) {
  if (!(await authorize(request))) return new Response(null, { status: 401 });
  if (Number(request.headers.get("content-length")) > 4_200_000)
    return Response.json(
      { error: "Choose an image smaller than 4 MB." },
      { status: 413 },
    );
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 4_000_000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return Response.json(
        { error: "Choose a JPG, PNG or WebP smaller than 4 MB." },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(bytes, {
      limitInputPixels: 40_000_000,
    }).metadata();
    if (!["jpeg", "png", "webp"].includes(meta.format))
      return Response.json(
        { error: "Only JPG, PNG and WebP images are supported." },
        { status: 400 },
      );
    const buffer = await sharp(bytes, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();
    const id = randomUUID() + ".webp";
    await put("media/" + id, buffer, {
      access: "private",
      contentType: "image/webp",
      addRandomSuffix: false,
    });
    return Response.json({ url: "/api/media/" + id });
  } catch {
    return Response.json(
      { error: "This image could not be uploaded. Try another file." },
      { status: 400 },
    );
  }
}
