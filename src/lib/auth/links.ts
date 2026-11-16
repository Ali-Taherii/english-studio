import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { loadDictionary } from "@/i18n/load";
import { sendEmail } from "@/lib/email";
import { adminClient } from "./supabase";

// One-time login links: invites, "email me a link" and password resets. Supabase creates the
// token; the email itself goes out through our own sender, so it is in the reader's
// language (L3) and lands in email_log like every other email.

export type LinkKind = "invite" | "magiclink" | "recovery";

// Where each kind of link lands after it has logged the person in.
const landing: Record<LinkKind, string> = {
  invite: "set-password",
  recovery: "set-password",
  magiclink: "login", // the login page forwards a logged-in person to their own home
};

type Options = {
  kind: LinkKind;
  email: string;
  locale: Locale;
  // Invites only: stored on the new account and copied into profiles by the database trigger.
  fullName?: string;
  profileId?: string;
};

// Returns false if the link could not be created or the email could not be sent.
export async function sendAuthLink({ kind, email, locale, fullName, profileId }: Options): Promise<boolean> {
  const admin = adminClient();
  const { data, error } =
    kind === "invite"
      ? await admin.auth.admin.generateLink({
          type: "invite",
          email,
          options: { data: { full_name: fullName, locale } },
        })
      : await admin.auth.admin.generateLink({ type: kind, email });

  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    console.error(error ?? new Error(`No token returned for ${kind} link`));
    return false;
  }

  const url = new URL(`${site.url}/${locale}/auth/confirm`);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", kind);
  url.searchParams.set("next", `/${locale}/${landing[kind]}`);

  // Without an email provider (local development) the link would be lost, so print it.
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.info(`[dev] ${kind} link for ${email}: ${url}`);
    return true;
  }

  const t = (await loadDictionary(locale)).emails.authLink;
  return sendEmail({
    to: email,
    subject: t[kind].subject,
    intro: t[kind].intro,
    action: { label: t[kind].button, url: url.toString() },
    rows: [{ label: t.noteLabel, value: t.note }],
    locale,
    template: `auth_${kind}`,
    profileId: profileId ?? data.user?.id,
  });
}
