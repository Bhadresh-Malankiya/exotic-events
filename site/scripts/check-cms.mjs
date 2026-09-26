import fs from "node:fs";
import assert from "node:assert/strict";
import { del } from "@vercel/blob";
const base = process.env.TEST_BASE || "http://localhost:3001";
const password = fs
  .readFileSync(".private/admin-access.txt", "utf8")
  .match(/Password: (.+)/)[1];
const baseHeaders = { Origin: base, "Content-Type": "application/json" };
const req = async (path, method = "GET", body, headers = {}) =>
  fetch(base + path, {
    method,
    headers: { ...baseHeaders, ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
let r = await req("/api/admin/content");
assert.equal(r.status, 401);
r = await req(
  "/api/admin/session",
  "POST",
  { password },
  { Origin: "https://untrusted.example" },
);
assert.equal(r.status, 403);
r = await req("/api/admin/session", "POST", { password });
assert.equal(r.status, 200);
const cookie = r.headers.get("set-cookie").split(";")[0];
const h = { Cookie: cookie };
assert.match(r.headers.get("set-cookie"), /HttpOnly/i);
assert.match(r.headers.get("set-cookie"), /SameSite=strict/i);
r = await req("/api/admin/content", "GET", undefined, h);
assert.equal(r.status, 200);
let doc = await r.json();
const original = structuredClone(doc.value.draft);
const draft = structuredClone(original);
draft.hero.slides[0].title = "CMS integration verification";
r = await req(
  "/api/admin/content",
  "PUT",
  { content: draft, etag: doc.etag, action: "draft" },
  h,
);
assert.equal(r.status, 200);
doc = await r.json();
let publicHtml = await (await fetch(base)).text();
assert.ok(!publicHtml.includes("CMS integration verification"));
let previewHtml = await (
  await fetch(base + "/?preview=1", { headers: { Cookie: cookie } })
).text();
assert.ok(previewHtml.includes("CMS integration verification"));
r = await req(
  "/api/admin/content",
  "PUT",
  { content: original, etag: "stale", action: "publish" },
  h,
);
assert.equal(r.status, 409);
r = await req(
  "/api/admin/content",
  "PUT",
  { content: original, etag: doc.etag, action: "publish" },
  h,
);
assert.equal(r.status, 200);
doc = await r.json();
assert.deepEqual(doc.value.published, original);
const invalid = structuredClone(original);
invalid.brand.maps = "javascript:alert(1)";
r = await req(
  "/api/admin/content",
  "PUT",
  { content: invalid, etag: doc.etag, action: "draft" },
  h,
);
assert.equal(r.status, 400);
const form = new FormData();
form.append(
  "file",
  new Blob([fs.readFileSync("public/assets/cinematic/corporate.webp")], {
    type: "image/webp",
  }),
  "test.webp",
);
r = await fetch(base + "/api/admin/media", {
  method: "POST",
  headers: { Origin: base, Cookie: cookie },
  body: form,
});
assert.equal(r.status, 200);
const uploaded = await r.json();
r = await fetch(base + uploaded.url);
assert.equal(r.status, 200);
assert.match(r.headers.get("content-type"), /image\/webp/);
const unsafe = new FormData();
unsafe.append(
  "file",
  new Blob(
    [
      '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>',
    ],
    { type: "image/jpeg" },
  ),
  "bad.jpg",
);
r = await fetch(base + "/api/admin/media", {
  method: "POST",
  headers: { Origin: base, Cookie: cookie },
  body: unsafe,
});
assert.equal(r.status, 400);
r = await req("/api/enquiries", "POST", {
  name: "CMS verification",
  contact: "test@example.invalid",
  occasion: "Corporate Events",
  city: "Test city",
  message: "Integration verification only. This record will be removed.",
});
assert.equal(r.status, 200);
const enquiry = await r.json();
r = await req("/api/admin/enquiries", "GET", undefined, h);
assert.equal(r.status, 200);
const inbox = await r.json();
assert.ok(inbox.some((e) => e.id === enquiry.id));
r = await req(
  "/api/admin/enquiries",
  "PATCH",
  { id: enquiry.id, status: "contacted" },
  h,
);
assert.equal(r.status, 200);
r = await fetch(base + "/api/media/site.json");
assert.equal(r.status, 404);
r = await req("/api/admin/session", "DELETE", undefined, h);
assert.equal(r.status, 200);
// Delete only this script's disposable verification uploads and enquiry.
await del(uploaded.url.replace("/api/", ""));
await del("enquiries/" + enquiry.id + ".json");
console.log(
  "PASS: authentication, CSRF, draft isolation, publication, stale-write protection, URL validation, image upload/read, SVG rejection, private enquiry inbox, status update, media path restriction and sign-out.",
);
