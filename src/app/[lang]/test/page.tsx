import { Bidi } from "@/components/Bidi";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";
import { StartTestForm } from "./StartTestForm";

export async function generateMetadata() {
  const t = await getDictionary();
  return pageMetadata(t.test.metaTitle, "/test");
}

// Level test intro (S4, step 1). Starting or resuming happens in the form's server action.
export default async function TestIntro() {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16 md:py-20">
      <h1 className="font-display text-4xl font-extrabold leading-tight">{t.test.title}</h1>
      <p className="text-lg text-ink-muted">
        <Bidi>{t.test.lead}</Bidi>
      </p>
      <ul className="flex list-disc flex-col gap-2 rounded-md border border-border bg-surface-0 py-6 ps-10 pe-6">
        {t.test.facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
      <StartTestForm locale={locale} label={t.test.start} errors={t.test.errors} />
      <p className="text-sm text-ink-muted">{t.test.resumeNote}</p>
    </section>
  );
}
