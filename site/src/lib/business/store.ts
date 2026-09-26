import "server-only";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { readJson, writeJson, listAll } from "@/lib/cms/storage";
import {
  workspaceSchema,
  type BusinessDocument,
  type DocumentInput,
  type BusinessSettings,
} from "./schema";
export const workspacePath = "business/workspace.json";
export async function getWorkspace() {
  const old = await readJson<unknown>(workspacePath);
  return {
    value: workspaceSchema.parse(old?.value || {}),
    etag: old?.etag || "",
  };
}
export async function getBusinessDocument(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null;
  return readJson<BusinessDocument>(`business/documents/${id}.json`);
}
export async function allDocuments() {
  const files = await listAll("business/documents/");
  const data = await Promise.all(
    files.map((f) => readJson<BusinessDocument>(f.pathname)),
  );
  return data
    .filter(Boolean)
    .map((d) => ({ ...d!.value, etag: d!.etag }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function byToken(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const pointer = await readJson<{ id: string }>(
    `business/links/${token}.json`,
  );
  if (!pointer) return null;
  const record = await getBusinessDocument(pointer.value.id);
  if (
    !record ||
    record.value.token !== token ||
    ["draft", "cancelled"].includes(record.value.status)
  )
    return null;
  return record;
}
export async function saveDocument(doc: BusinessDocument, etag?: string) {
  return writeJson(`business/documents/${doc.id}.json`, doc, etag);
}
export async function makeDocument(
  input: DocumentInput,
  settings: BusinessSettings,
  sourceQuoteId?: string,
) {
  const hash = sourceQuoteId
    ? createHash("sha256")
        .update("invoice:" + sourceQuoteId)
        .digest("hex")
    : "";
  const id = sourceQuoteId
      ? `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`
      : randomUUID(),
    now = new Date().toISOString();
  const doc: BusinessDocument = {
    ...input,
    id,
    number: `${input.kind === "quotation" ? "Q" : "INV"}-${new Date().getFullYear()}-${id.slice(0, 8).toUpperCase()}`,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    business: settings,
    payments: [],
    ...(sourceQuoteId ? { sourceQuoteId } : {}),
  };
  try {
    await saveDocument(doc);
  } catch (error) {
    if (sourceQuoteId) {
      const existing = await getBusinessDocument(id);
      if (existing?.value.sourceQuoteId === sourceQuoteId)
        return existing.value;
    }
    throw error;
  }
  return doc;
}
export async function shareDocument(doc: BusinessDocument, etag: string) {
  const token = doc.token || randomBytes(32).toString("hex");
  if (!doc.token)
    await writeJson(`business/links/${token}.json`, { id: doc.id });
  const next = {
    ...doc,
    token,
    status:
      doc.kind === "quotation" ? ("shared" as const) : ("issued" as const),
    sharedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveDocument(next, etag);
  return next;
}
export function publicDocument(doc: BusinessDocument) {
  const { partnerEmails, emailNotifications, ...business } = doc.business;
  void partnerEmails;
  void emailNotifications;
  return {
    ...doc,
    business,
    enquiryId: undefined,
    emailStatus: undefined,
    sourceQuoteId: undefined,
    invoiceId: undefined,
  };
}
