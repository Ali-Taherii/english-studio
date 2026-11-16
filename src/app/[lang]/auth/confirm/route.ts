import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale, hasLocale } from "@/i18n/config";
import { userClient } from "@/lib/auth/supabase";

const kinds = ["invite", "magiclink", "recovery"] as const;
type Kind = (typeof kinds)[number];
const isKind = (value: string | null): value is Kind => (kinds as readonly string[]).includes(value ?? "");

// Only paths inside this site, under a language: /fa/set-password, /en/login.
const safePath = /^\/(fa|en)(\/[a-z0-9-]+)*$/;

// Where the links in invite, login-link and reset emails land. Trades the one-time token
// for a session (saved in cookies), then sends the person on.
export async function GET(request: NextRequest, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const query = request.nextUrl.searchParams;
  const tokenHash = query.get("token_hash");
  const type = query.get("type");
  const next = query.get("next") ?? "";

  const go = (path: string, search = "") => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = search;
    return NextResponse.redirect(url);
  };

  if (!tokenHash || !isKind(type)) return go(`/${locale}/login`, "?error=link");

  try {
    const supabase = await userClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return go(`/${locale}/login`, "?error=link");
  } catch (error) {
    console.error(error);
    return go(`/${locale}/login`, "?error=link");
  }

  return go(safePath.test(next) ? next : `/${locale}/login`);
}
