// Server-only access to Supabase with the service role, over its REST API (PostgREST).
// Used for the public site, where visitors never touch tables directly (schema decision 6).
// The service role bypasses RLS: never import this from a client component, and always
// filter explicitly (for example is_published) because no policy will do it for you.
//
// Plain fetch keeps Phase 1 free of new dependencies. When accounts land (Phase 3) and
// @supabase/ssr comes in, this file is the only place to swap.

type Query = Record<string, string>;

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export const isSupabaseConfigured = () => config() !== null;

async function request<T>(method: "GET" | "POST", table: string, query: Query, body?: unknown): Promise<T[]> {
  const cfg = config();
  if (!cfg) throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");

  const params = new URLSearchParams(query).toString();
  const response = await fetch(`${cfg.url}/rest/v1/${table}${params ? `?${params}` : ""}`, {
    method,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      ...(method === "POST" ? { Prefer: "return=representation" } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase ${method} ${table} failed: ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as T[];
}

// query uses PostgREST syntax: { select: "id,slug", is_published: "eq.true", order: "sort_order.asc" }
export const adminSelect = <T>(table: string, query: Query) => request<T>("GET", table, query);

export const adminInsert = async <T>(table: string, row: Record<string, unknown>, select = "*") => {
  const rows = await request<T>("POST", table, { select }, row);
  return rows[0];
};
