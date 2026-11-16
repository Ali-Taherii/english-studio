import { dir, type Locale } from "@/i18n/config";
import { adminInsert } from "@/lib/supabase/admin";

// Every email the app sends goes through here: Resend's REST API, then a row in email_log.

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

type Email = {
  to: string;
  subject: string;
  // Optional opening line above the rows. Escaped here.
  intro?: string;
  // Label/value rows; values are escaped here, so pass them raw.
  rows: { label: string; value: string }[];
  locale: Locale;
  template: string;
  replyTo?: string;
  ref?: { table: string; id: string };
  profileId?: string;
  dedupeKey?: string;
};

function render({ intro, rows, locale }: Pick<Email, "intro" | "rows" | "locale">) {
  const opening = intro ? `<p dir="auto" style="margin:0 0 16px">${escapeHtml(intro)}</p>` : "";
  const body = rows
    .map(
      ({ label, value }) =>
        `<p style="margin:0 0 12px"><strong>${escapeHtml(label)}</strong><br><span dir="auto" style="white-space:pre-wrap">${escapeHtml(value)}</span></p>`,
    )
    .join("");
  return `<div lang="${locale}" dir="${dir[locale]}" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.7;color:#1f2a2e">${opening}${body}</div>`;
}

// Returns false when email isn't configured or the send fails; callers decide whether that matters.
export async function sendEmail(email: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`Email "${email.template}" not sent: RESEND_API_KEY or EMAIL_FROM is missing`);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        html: render(email),
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Resend failed: ${response.status} ${await response.text()}`);
    const { id } = (await response.json()) as { id?: string };

    await adminInsert("email_log", {
      to_email: email.to,
      profile_id: email.profileId ?? null,
      template: email.template,
      locale: email.locale,
      ref_table: email.ref?.table ?? null,
      ref_id: email.ref?.id ?? null,
      dedupe_key: email.dedupeKey ?? null,
      provider_id: id ?? null,
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
