import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, localeCookie, locales, type Locale } from "@/i18n/config";

// Cookie (last choice) → Accept-Language → default (fa).
function pickLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(localeCookie)?.value;
  if (saved && hasLocale(saved)) return saved;

  const accepted = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  return accepted.find(hasLocale) ?? defaultLocale;
}

// Supabase keeps the session in cookies named sb-<project>-auth-token (split into .0, .1 when long).
const hasSession = (request: NextRequest) =>
  request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));

// Login tokens are short-lived. Pages can read cookies but not write them, so a token that
// has run out is renewed here, on the way in, and the new cookies travel on to the page and
// back to the browser. Visitors without a session skip this entirely.
async function withFreshSession(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key || !hasSession(request)) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(headers ?? {})) response.headers.set(name, value);
      },
    },
  });

  // Checks the token and renews it if needed. Who the person is and what they may open is
  // decided later, in src/lib/auth/session.ts, not here.
  await supabase.auth.getClaims();
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const current = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (current) {
    const response = await withFreshSession(request);
    if (request.cookies.get(localeCookie)?.value !== current) {
      response.cookies.set(localeCookie, current, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    }
    return response;
  }

  request.nextUrl.pathname = `/${pickLocale(request)}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, API routes and files with an extension (favicon, images).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
