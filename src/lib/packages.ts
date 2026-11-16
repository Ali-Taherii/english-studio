import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/i18n/config";
import { adminSelect, isSupabaseConfigured } from "@/lib/supabase/admin";

type I18nText = Record<Locale, string>;

export type Package = {
  id: string;
  slug: string;
  title: I18nText;
  description: I18nText;
  features: I18nText[];
  format: "one_to_one" | "group";
  lesson_count: number;
  lesson_minutes: number;
  valid_days: number;
  price_amount: number;
  currency: string;
  is_popular: boolean;
};

const columns =
  "id,slug,title,description,features,format,lesson_count,lesson_minutes,valid_days,price_amount,currency,is_popular";

// Cached for an hour; call updateTag("packages") when the teacher panel edits a package.
// It throws when the database can't be reached, so a failure is never what gets cached.
async function loadPublishedPackages(): Promise<Package[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("packages");

  return adminSelect<Package>("packages", {
    select: columns,
    is_published: "eq.true",
    order: "sort_order.asc,created_at.asc",
  });
}

// Published packages in display order (S2). Without a database (a CI build, a fresh clone)
// or on an error it returns [], and the pages fall back to "get in touch for pricing".
export async function getPublishedPackages(): Promise<Package[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    return await loadPublishedPackages();
  } catch (error) {
    console.error(error);
    return [];
  }
}
