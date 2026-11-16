import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/fill";
import { requireUser } from "@/lib/auth/session";
import { userClient } from "@/lib/auth/supabase";
import { formatNumber } from "@/lib/format";

// Teacher's overview: what is waiting, at a glance.
export default async function Panel() {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <Suspense fallback={<p className="text-ink-muted">{t.panel.loading}</p>}>
      <Overview locale={locale} t={t.panel} />
    </Suspense>
  );
}

async function Overview({ locale, t }: { locale: Locale; t: Dictionary["panel"] }) {
  const user = await requireUser(locale, "teacher");

  // Read as the teacher, so the database's own access rules apply to every number here.
  const supabase = await userClient();
  const head = { count: "exact", head: true } as const;
  const [leads, tests, students, classes] = await Promise.all([
    supabase.from("leads").select("id", head).eq("status", "new"),
    supabase.from("test_attempts").select("id", head).eq("status", "submitted").not("writing_answer", "is", null),
    supabase.from("profiles").select("id", head).eq("role", "student").eq("is_active", true),
    supabase.from("classes").select("id", head).eq("is_archived", false),
  ]);

  const cards = [
    { label: t.newLeads, count: leads.count },
    { label: t.testsToReview, count: tests.count },
    { label: t.students, count: students.count },
    { label: t.classes, count: classes.count },
  ];

  return (
    <>
      <h1 className="text-lg">{fill(t.welcome, { name: user.fullName })}</h1>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
        {cards.map((card) => (
          <li key={card.label} className="flex flex-col gap-1 rounded-md border border-border bg-surface-0 p-5">
            <span className="text-3xl font-extrabold">{formatNumber(locale, card.count ?? 0)}</span>
            <span className="text-sm text-ink-muted">{card.label}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
