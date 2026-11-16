import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

// Teal band inviting visitors to the free level test. Shown near the end of public pages.
export function TestCta({ locale, t }: { locale: Locale; t: Dictionary["testCta"] }) {
  return (
    <section className="bg-brand text-surface-0">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8 px-6 py-16">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
          <h2 className="font-display text-3xl font-semibold rtl:font-bold">{t.title}</h2>
          <p className="text-[17px]">{t.text}</p>
        </div>
        <Link href={`/${locale}/test`} className="rounded-md bg-highlight px-8 py-3.5 font-bold text-ink">
          {t.button}
        </Link>
      </div>
    </section>
  );
}
