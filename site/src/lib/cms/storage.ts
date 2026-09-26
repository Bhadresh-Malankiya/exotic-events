import "server-only";
import { get, put, list, BlobPreconditionFailedError } from "@vercel/blob";
import { createHash } from "node:crypto";
import { defaultContent } from "./defaults";
import { contentSchema, type CmsDocument } from "./schema";
export const configured = () =>
  !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
export async function readJson<T>(
  path: string,
): Promise<{ value: T; etag: string } | null> {
  const data = await get(path, {
    access: "private",
    useCache: false,
    headers: { "Accept-Encoding": "identity" },
  });
  if (!data) return null;
  return {
    value: (await new Response(data.stream).json()) as T,
    etag: data.blob.etag,
  };
}
export async function writeJson(path: string, value: unknown, etag?: string) {
  return put(path, JSON.stringify(value), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
    ...(etag ? { ifMatch: etag } : { allowOverwrite: false }),
  });
}
export async function getDocument() {
  if (configured()) {
    const found = await readJson<CmsDocument>("cms/site.json");
    if (found)
      return {
        ...found,
        value: {
          ...found.value,
          draft: contentSchema.parse(found.value.draft),
          published: contentSchema.parse(found.value.published),
        },
      };
  }
  return {
    value: {
      draft: defaultContent,
      published: defaultContent,
      updatedAt: "",
      publishedAt: "",
    },
    etag: "",
  };
}
export async function listAll(prefix: string) {
  const blobs = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}
// Origin reads and conditional writes make limits shared across serverless instances.
export async function rateLimit(
  request: Request,
  scope: string,
  max: number,
  windowMs: number,
) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
    (process.env.VERCEL
      ? "unknown"
      : request.headers.get("x-forwarded-for")?.split(",")[0] || "local");
  const key = createHash("sha256")
    .update(scope + ip)
    .digest("hex");
  const path = `limits/${scope}-${key}.json`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const old = await readJson<{ count: number; until: number }>(path);
    const now = Date.now();
    const current =
      old && old.value.until > now
        ? old.value
        : { count: 0, until: now + windowMs };
    if (current.count >= max) return false;
    try {
      await writeJson(
        path,
        { count: current.count + 1, until: current.until },
        old?.etag,
      );
      return true;
    } catch (error) {
      if (
        error instanceof BlobPreconditionFailedError ||
        (error instanceof Error && /already exists/i.test(error.message))
      )
        continue;
      throw error;
    }
  }
  return false;
}
