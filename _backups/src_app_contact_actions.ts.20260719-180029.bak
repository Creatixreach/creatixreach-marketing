"use server";

import { z } from "zod";
import { escapeHtml } from "@/lib/escape-html";
import { FROM_SALES, getResend } from "@/lib/resend";
import { TOPIC_LABELS, type CtaTopic } from "@/lib/cta-messages";

export type ContactActionResult =
  | { ok: true }
  | { ok: false; error: string };

const TOPIC_VALUES: [CtaTopic, ...CtaTopic[]] = [
  "general",
  "web-social",
  "systems",
  "dialer",
  "cold-calling",
];

const BUDGET_VALUES = [
  "",
  "<$1k",
  "$1-5k",
  "$5-20k",
  "$20k+",
  "Not sure yet",
] as const;

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254),
  company: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  topic: z.enum(TOPIC_VALUES),
  budget: z.enum(BUDGET_VALUES).optional().default(""),
  message: z
    .string()
    .trim()
    .min(10, "Please share a bit more about what you need.")
    .max(5000, "Message is too long. Please keep it under 5000 characters."),
});

function buildEmailHtml(input: {
  name: string;
  email: string;
  company: string;
  phone: string;
  topicLabel: string;
  budget: string;
  message: string;
}): string {
  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;width:35%;vertical-align:top;">${escapeHtml(
          label
        )}</td><td style="padding:6px 0;font-size:13px;color:#111827;font-weight:500;">${escapeHtml(
          value
        )}</td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${escapeHtml(
    "New brief from " + input.name
  )}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f4f6;">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <tr><td style="background:#0f172a;padding:20px 28px;color:#f8fafc;font-size:14px;font-weight:600;letter-spacing:0.02em;">CreatixReach - Marketing site lead</td></tr>
      <tr><td style="padding:28px;">
        <h1 style="margin:0 0 8px 0;font-size:20px;color:#0f172a;">New brief: ${escapeHtml(
          input.topicLabel
        )}</h1>
        <p style="margin:0 0 16px 0;font-size:14px;color:#374151;line-height:1.6;">
          From <strong>${escapeHtml(input.name)}</strong>${
    input.company ? ` at <strong>${escapeHtml(input.company)}</strong>` : ""
  } via creatixreach.io.
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 16px 0;border-collapse:collapse;">
          ${row("Name", input.name)}
          ${row("Email", input.email)}
          ${row("Company", input.company)}
          ${row("Phone", input.phone)}
          ${row("Topic", input.topicLabel)}
          ${row("Budget", input.budget)}
        </table>
        <div style="background:#f9fafb;border-left:3px solid #4f46e5;border-radius:6px;padding:16px 20px;margin:8px 0 20px 0;">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Message</div>
          <div style="white-space:pre-wrap;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml(
            input.message
          )}</div>
        </div>
        <a href="mailto:${escapeHtml(input.email)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:500;">Reply to ${escapeHtml(
    input.name
  )}</a>
      </td></tr>
      <tr><td style="background:#f9fafb;padding:14px 28px;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;">Sales team - creatixreach.io</td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function submitContactAction(
  formData: FormData
): Promise<ContactActionResult> {
  // Honeypot - silently succeed if filled
  const honeypot = formData.get("_honey")?.toString() ?? "";
  if (honeypot.length > 0) {
    return { ok: true };
  }

  const parsed = ContactSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    company: formData.get("company")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    topic: formData.get("topic")?.toString() ?? "",
    budget: formData.get("budget")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Please check the form.";
    return { ok: false, error: first };
  }

  const data = parsed.data;
  const topicLabel = TOPIC_LABELS[data.topic];

  // Recipients: info@ (canonical) + ADMIN_NOTIFICATION_EMAIL (real inbox), deduped
  const adminInbox = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  const recipients: string[] = ["info@creatixreach.io"];
  if (adminInbox && adminInbox !== "info@creatixreach.io") {
    recipients.push(adminInbox);
  }

  const subject = `[Marketing site] ${topicLabel} - ${data.name}`;
  const html = buildEmailHtml({
    name: data.name,
    email: data.email,
    company: data.company,
    phone: data.phone,
    topicLabel,
    budget: data.budget,
    message: data.message,
  });

  const client = getResend();
  if (!client) {
    console.error("[marketing-contact] RESEND_API_KEY not configured");
    return {
      ok: false,
      error:
        "Couldn't send. Please WhatsApp us instead at +1 323 297 8843.",
    };
  }

  console.log(
    `[marketing-contact] sending to ${recipients.join(",")} subject="${subject}"`
  );

  try {
    const result = await client.emails.send({
      from: FROM_SALES,
      to: recipients,
      replyTo: data.email,
      subject,
      html,
    });

    // Resend can return 200 with an error object - check explicitly (portal gotcha #167)
    if (result.error) {
      console.error(
        "[marketing-contact] resend error",
        JSON.stringify(result.error)
      );
      return {
        ok: false,
        error: "Couldn't send. Please WhatsApp us instead.",
      };
    }

    console.log(`[marketing-contact] sent, id=${result.data?.id}`);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[marketing-contact] throw", msg);
    return {
      ok: false,
      error: "Couldn't send. Please WhatsApp us instead.",
    };
  }
}
