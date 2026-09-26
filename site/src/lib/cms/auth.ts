import "server-only";
import { cookies } from "next/headers";
import {
  createHmac,
  scryptSync,
  timingSafeEqual,
  randomBytes,
} from "node:crypto";
export const COOKIE = "exotic_admin";
const sign = (s: string) =>
  createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "")
    .update(s)
    .digest("base64url");
export function verifyPassword(value: string) {
  const encoded = process.env.ADMIN_PASSWORD_HASH;
  if (!encoded || value.length > 200) return false;
  const [salt, hash] = encoded.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(value, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function newSession() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + 8 * 3600000,
      nonce: randomBytes(16).toString("hex"),
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export async function isAdmin() {
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
    return false;
  try {
    return (
      JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now()
    );
  } catch {
    return false;
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = [
    new URL(request.url).origin,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ];
  return allowed.includes(origin);
}
export async function authorize(request: Request) {
  return (await isAdmin()) && (request.method === "GET" || sameOrigin(request));
}
export const privateHeaders = { "Cache-Control": "no-store" };
