"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { sendAuthLink } from "@/lib/auth/links";
import { getSessionUser, homePath, loadSessionUser, type SessionUser } from "@/lib/auth/session";
import { adminClient, userClient } from "@/lib/auth/supabase";
import { isRateLimited } from "@/lib/rate-limit";
import type { LoginState, PasswordState } from "./state";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINUTE = 60 * 1000;

const text = (formData: FormData, name: string, max: number) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.slice(0, max) : "";
};

const localeFrom = (formData: FormData): Locale => {
  const value = text(formData, "locale", 5);
  return hasLocale(value) ? value : defaultLocale;
};

const clientIp = async () => (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

// One form, three buttons: log in with a password, or get a one-time link by email
// (to log in without a password, or to choose a new one).
export async function logIn(previous: LoginState, formData: FormData): Promise<LoginState> {
  const attempt = previous.attempt + 1;
  const email = text(formData, "email", 254).trim().toLowerCase();
  const intent = text(formData, "intent", 12);
  if (!emailPattern.test(email)) return { attempt, error: "email", email };

  const ip = await clientIp();

  if (intent === "magiclink" || intent === "recovery") {
    if (isRateLimited(`auth-link:${ip}`, 5, 60 * MINUTE)) return { attempt, error: "rateLimited", email };
    try {
      // Links only go to accounts that exist and are active, but the answer on screen is the
      // same either way, so this form can't be used to find out who has an account.
      const { data: profile } = await adminClient()
        .from("profiles")
        .select("id, locale, is_active")
        .eq("email", email)
        .maybeSingle<{ id: string; locale: string; is_active: boolean }>();
      if (profile?.is_active) {
        await sendAuthLink({
          kind: intent,
          email,
          locale: hasLocale(profile.locale) ? profile.locale : defaultLocale,
          profileId: profile.id,
        });
      }
    } catch (error) {
      console.error(error);
    }
    return { attempt, notice: "linkSent", email };
  }

  if (isRateLimited(`login:${ip}`, 10, 15 * MINUTE)) return { attempt, error: "rateLimited", email };

  let user: SessionUser | null = null;
  try {
    const supabase = await userClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: text(formData, "password", 200),
    });
    if (error || !data.user) return { attempt, error: "invalid", email };

    user = await loadSessionUser(data.user.id);
    if (!user) {
      // A deactivated account can have a valid password; don't leave it logged in.
      await supabase.auth.signOut();
      return { attempt, error: "invalid", email };
    }
  } catch (error) {
    console.error(error);
    return { attempt, error: "generic", email };
  }

  redirect(homePath(user, user.locale));
}

export async function logOut(formData: FormData) {
  const locale = localeFrom(formData);
  try {
    await (await userClient()).auth.signOut();
  } catch (error) {
    console.error(error);
  }
  redirect(`/${locale}/login`);
}

// After an invite or a reset link: the person is logged in and chooses a password.
export async function setPassword(_previous: PasswordState, formData: FormData): Promise<PasswordState> {
  const locale = localeFrom(formData);
  const password = text(formData, "password", 200);
  if (password.length < 8) return { error: "short" };

  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login?error=link`);

  try {
    const { error } = await (await userClient()).auth.updateUser({ password });
    if (error) {
      console.error(error);
      return { error: "generic" };
    }
  } catch (error) {
    console.error(error);
    return { error: "generic" };
  }

  redirect(homePath(user, locale));
}
