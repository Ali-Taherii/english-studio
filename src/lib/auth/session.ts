import { redirect } from "next/navigation";
import { hasLocale, type Locale } from "@/i18n/config";
import { adminClient, userClient } from "./supabase";

// Who is logged in, and what they are allowed to open. Every protected page and every
// server action that changes data starts here.

export type Role = "teacher" | "student";

export type SessionUser = {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  locale: Locale;
};

type ProfileRow = {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  locale: string;
  is_active: boolean;
};

// Loads the profile for a user id that has already been verified (by a checked token or a
// fresh login). Role and is_active are read with the service role, so a person can never
// influence the fields that decide their own access. Inactive accounts count as logged out.
export async function loadSessionUser(userId: string): Promise<SessionUser | null> {
  const { data: profile } = await adminClient()
    .from("profiles")
    .select("id, role, full_name, email, locale, is_active")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();
  if (!profile || !profile.is_active) return null;

  return {
    id: profile.id,
    role: profile.role,
    fullName: profile.full_name,
    email: profile.email,
    locale: hasLocale(profile.locale) ? profile.locale : "fa",
  };
}

// The verified user behind this request, or null.
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await userClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) return null;
  return loadSessionUser(userId);
}

export const homePath = (user: Pick<SessionUser, "role">, locale: Locale) =>
  `/${locale}/${user.role === "teacher" ? "panel" : "dashboard"}`;

// For pages and actions that need a logged-in person of one role. Sends everyone else away:
// to the login page if nobody is logged in, to their own home if they have the other role.
export async function requireUser(locale: Locale, role: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== role) redirect(homePath(user, locale));

  // L2: the header's language switch is also how a logged-in person changes their language.
  if (user.locale !== locale) {
    await adminClient().from("profiles").update({ locale }).eq("id", user.id);
    user.locale = locale;
  }
  return user;
}
