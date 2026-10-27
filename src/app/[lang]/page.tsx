import Link from "next/link";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

// Phase 0 placeholder: proves routing, RTL, fonts and tokens. The real home page is Phase 1 (S1).
export default async function Home() {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <span className="font-serif text-2xl font-semibold">
            <bdi>English Studio</bdi>
          </span>
          <LanguageSwitch locale={locale} label={t.nav.switchTo} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20">
        <span className="self-start rounded-full bg-highlight px-3 py-1 text-[13px] font-semibold">{t.home.badge}</span>
        <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">{t.home.title}</h1>
        <p className="max-w-xl text-lg text-ink-muted">{t.home.lead}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/test`} className="rounded-md bg-accent px-7 py-3.5 font-bold text-white">
            {t.home.ctaTest}
          </Link>
          <Link
            href={`/${locale}/packages`}
            className="rounded-md border border-border bg-surface-0 px-7 py-3.5 font-bold text-brand"
          >
            {t.home.ctaPackages}
          </Link>
        </div>
      </main>
    </>
  );
}
