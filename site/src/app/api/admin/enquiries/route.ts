import { randomUUID } from "node:crypto";
import { enquirySchema } from "@/lib/enquiry-schema";
import { authorize, privateHeaders } from "@/lib/cms/auth";
import { listAll, readJson, writeJson } from "@/lib/cms/storage";
export async function GET(request: Request) {
  if (!(await authorize(request))) return new Response(null, { status: 401 });
  const files = await listAll("enquiries/");
  const records = await Promise.all(
    files.map((f) => readJson<Record<string, unknown>>(f.pathname)),
  );
  return Response.json(
    records
      .filter(Boolean)
      .map((r) => r!.value)
      .sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt))),
    { headers: privateHeaders },
  );
}
export async function PATCH(request: Request) {
  if (!(await authorize(request))) return new Response(null, { status: 401 });
  const body = await request.json().catch(() => null);
  if (
    !body ||
    !/^[a-f0-9-]{36}$/.test(body.id) ||
    !["new", "contacted", "archived"].includes(body.status)
  )
    return new Response(null, { status: 400 });
  const path = `enquiries/${body.id}.json`;
  const old = await readJson<Record<string, unknown>>(path);
  if (!old) return new Response(null, { status: 404 });
  try {
    await writeJson(path, { ...old.value, status: body.status }, old.etag);
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Please reload and try again." },
      { status: 409 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await authorize(request))) return new Response(null, { status: 401 });
  const parsed = enquirySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Check the details." },
      { status: 400 },
    );
  const id = randomUUID();
  await writeJson(`enquiries/${id}.json`, {
    ...parsed.data,
    id,
    receivedAt: new Date().toISOString(),
    status: "new",
    source: "manual",
  });
  return Response.json({ ok: true, id }, { headers: privateHeaders });
}
