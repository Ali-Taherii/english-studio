import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// The two Supabase clients the server uses once people can log in.
//
// userClient():  acts as the logged-in person. Their session lives in cookies and row level
//                security decides what they can see. Use it for everything a teacher or
//                student does.
// adminClient(): the service role. It bypasses row level security, so only use it for what
//                no logged-in person may do themselves: creating accounts and login links,
//                and reading the fields that decide access (role, is_active).

function publicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return { url, key };
}

export async function userClient() {
  const { url, key } = publicConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components can't write cookies. The proxy refreshes the session on the
          // way in, so there is nothing to save here.
        }
      },
    },
  });
}

export function adminClient() {
  const { url } = publicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Supabase is not configured: set SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
