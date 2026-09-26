import "server-only";
import type { BusinessSettings } from "./schema";
export function emailReady() {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}
export async function sendEmail({
  to,
  cc,
  subject,
  text,
  key,
}: {
  to: string;
  cc?: string[];
  subject: string;
  text: string;
  key: string;
}) {
  if (!emailReady()) return { ok: false, status: "not-connected" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": key,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        cc: cc?.filter((e) => e !== to),
        subject,
        text,
      }),
      signal: AbortSignal.timeout(12000),
    });
    return { ok: r.ok, status: r.ok ? "sent" : "failed" };
  } catch {
    return { ok: false, status: "failed" };
  }
}
export async function notifyEnquiry(
  s: BusinessSettings,
  enquiry: {
    id: string;
    name: string;
    contact: string;
    message: string;
    occasion: string;
  },
) {
  if (!s.emailNotifications || !s.partnerEmails.length) return "not-enabled";
  const result = await sendEmail({
    to: s.partnerEmails[0],
    cc: s.partnerEmails.slice(1),
    subject: `New event enquiry · ${enquiry.name}`,
    text: `${enquiry.name}\nContact: ${enquiry.contact}\nOccasion: ${enquiry.occasion}\n\n${enquiry.message}\n\nManage this enquiry in your Exotic admin workspace.`,
    key: `enquiry-${enquiry.id}`,
  });
  return result.status;
}
