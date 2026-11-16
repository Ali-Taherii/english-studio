import type { Metadata } from "next";
import { Suspense } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/fill";
import { requireUser } from "@/lib/auth/session";
import { userClient } from "@/lib/auth/supabase";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.dashboard.metaTitle, robots: { index: false } };
}

type ClassRow = {
  id: string;
  name: string;
  format: "one_to_one" | "group";
  level: string | null;
  meeting_url: string | null;
  is_archived: boolean;
};

// Student's home (S9). Classes for now; next lesson, homework due and remaining lessons
// join it as phases 4 and 5 land.
export default async function Dashboard() {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex justify-end">
        <LogoutButton locale={locale} label={t.auth.logout} />
      </div>
      <Suspense fallback={<p className="text-ink-muted">{t.dashboard.loading}</p>}>
        <MyClasses locale={locale} t={t.dashboard} />
      </Suspense>
    </section>
  );
}

async function MyClasses({ locale, t }: { locale: Locale; t: Dictionary["dashboard"] }) {
  const user = await requireUser(locale, "student");

  // Read as the student: the database only returns classes they are a current member of.
  const supabase = await userClient();
  const { data } = await supabase
    .from("class_members")
    .select("classes(id, name, format, level, meeting_url, is_archived)")
    .eq("student_id", user.id)
    .is("left_at", null);
  const rows = (data ?? []) as unknown as { classes: ClassRow | null }[];
  const classes = rows.flatMap((row) => (row.classes && !row.classes.is_archived ? [row.classes] : []));

  return (
    <>
      <h1 className="font-display text-3xl font-semibold rtl:font-bold">
        <bdi>{fill(t.title, { name: user.fullName })}</bdi>
      </h1>
      <h2 className="text-lg font-semibold">{t.classesTitle}</h2>
      {classes.length === 0 ? (
        <p className="rounded-md border border-border bg-surface-0 p-5 text-ink-muted">{t.noClasses}</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
          {classes.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 rounded-md border border-border bg-surface-0 p-5">
              <h3 dir="auto" className="text-lg font-semibold">
                {item.name}
              </h3>
              <p className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                {t.format[item.format]}
                {item.level && (
                  <bdi className="rounded-full bg-surface-200 px-3 py-0.5 font-sans text-[13px] font-semibold text-ink">
                    {item.level}
                  </bdi>
                )}
              </p>
              {item.meeting_url && /^https?:\/\//i.test(item.meeting_url) && (
                <a
                  href={item.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto self-start rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-surface-0"
                >
                  {t.joinLesson}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
