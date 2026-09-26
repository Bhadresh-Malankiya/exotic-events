import { cookies } from "next/headers";
import {
  COOKIE,
  verifyPassword,
  newSession,
  isAdmin,
  sameOrigin,
  privateHeaders,
} from "@/lib/cms/auth";
import { configured, rateLimit } from "@/lib/cms/storage";
export async function GET() {
  return Response.json(
    { authenticated: await isAdmin() },
    { headers: privateHeaders },
  );
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: "Request not allowed." }, { status: 403 });
  if (
    !configured() ||
    !process.env.ADMIN_PASSWORD_HASH ||
    !process.env.ADMIN_SESSION_SECRET
  )
    return Response.json(
      { error: "Admin access is not configured." },
      { status: 503 },
    );
  try {
    if (!(await rateLimit(request, "login", 8, 15 * 60000)))
      return Response.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    const body = await request.json();
    if (typeof body.password !== "string" || !verifyPassword(body.password))
      return Response.json(
        { error: "The password is incorrect." },
        { status: 401 },
      );
    (await cookies()).set(COOKIE, newSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 3600,
      path: "/",
    });
    return Response.json({ ok: true }, { headers: privateHeaders });
  } catch {
    return Response.json(
      { error: "Sign-in is temporarily unavailable." },
      { status: 503 },
    );
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  (await cookies()).delete(COOKIE);
  return Response.json({ ok: true });
}
