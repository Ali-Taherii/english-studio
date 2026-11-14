import Link from "next/link";
import { Bidi } from "@/components/Bidi";
import { FeatureCards } from "@/components/FeatureCards";
import { PackageGrid } from "@/components/PackageGrid";
import { TestCta } from "@/components/TestCta";
import { cefrLevels } from "@/config/site";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { formatNumber } from "@/lib/format";
import { getPublishedPackages } from "@/lib/packages";

const h2 = "font-display text-3xl font-semibold rtl:font-bold";

// Home (S1): who the teacher is, how it works, and the two calls to action.
export default async function Home() {
  const locale = await getLocale();
  const t = await getDictionary();
  const packages = await getPublishedPackages();

  return (
    <>
      <section className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-12 px-6 py-16 md:py-20">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
          <span className="self-start rounded-full bg-highlight px-3 py-1 text-[13px] font-semibold text-ink">
            {t.home.badge}
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">{t.home.title}</h1>
          <p className="max-w-xl text-lg text-ink-muted">{t.home.lead}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/test`} className="rounded-md bg-accent px-7 py-3.5 font-bold text-surface-0">
              {t.home.ctaTest}
            </Link>
            <Link
              href={`/${locale}/packages`}
              className="rounded-md border border-border bg-surface-0 px-7 py-3.5 font-bold text-brand"
            >
              {t.home.ctaPackages}
            </Link>
          </div>
          <p className="text-sm text-ink-muted">{t.home.heroNote}</p>
        </div>

        <div className="flex min-w-0 flex-[1_1_420px] justify-center">
          <div className="relative h-[440px] w-full max-w-[460px]">
            <div
              aria-hidden="true"
              className="absolute start-0 top-0 flex h-[380px] w-[72%] flex-col gap-3.5 rounded-md bg-brand px-7 py-8"
            >
              <div className="h-4 w-[55%] self-start rounded-full bg-surface-100" />
              <div className="h-4 w-[60%] self-end rounded-full bg-surface-100" />
              <div className="h-4 w-[70%] self-start rounded-full bg-surface-100" />
              <div className="h-4 w-[40%] self-start rounded-full bg-surface-100" />
              <div className="h-4 w-[50%] self-end rounded-full bg-surface-100" />
            </div>
            <div className="absolute end-0 top-16 flex h-[300px] w-[52%] items-center justify-center rounded-md border border-border bg-surface-200 p-4 text-center text-sm text-ink-muted">
              {t.home.photoPlaceholder}
            </div>
            <div aria-hidden="true" className="absolute bottom-0 end-6 size-28 rounded-full bg-highlight" />
            <div aria-hidden="true" className="absolute bottom-4 start-6 h-10 w-24 rounded-full bg-accent" />
          </div>
        </div>
      </section>

      <section className="bg-surface-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-7">
          <p className="font-semibold">
            <Bidi>{t.home.levels}</Bidi>
          </p>
          <ul dir="ltr" className="flex flex-wrap gap-2 font-sans text-[13px] font-semibold">
            {cefrLevels.map((level) => (
              <li key={level} className="rounded-full border border-border bg-surface-0 px-3.5 py-1">
                {level}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20">
        <p className="text-[13px] font-semibold text-brand">{t.about.eyebrow}</p>
        <h2 className={h2}>{t.about.title}</h2>
        <FeatureCards features={t.about.features} />
        <Link href={`/${locale}/about`} className="self-start py-2 font-semibold text-brand underline">
          {t.home.aboutLink}
        </Link>
      </section>

      <section className="bg-surface-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20">
          <h2 className={h2}>{t.how.title}</h2>
          <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
            {t.how.steps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2 rounded-md bg-surface-0 p-6">
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-full bg-brand font-bold text-surface-0"
                >
                  {formatNumber(locale, index + 1)}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-ink-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20">
        <div className="flex flex-col gap-2">
          <h2 className={h2}>{t.packages.title}</h2>
          <p className="text-ink-muted">{t.packages.lead}</p>
        </div>
        <PackageGrid packages={packages} locale={locale} t={t.packages} />
      </section>

      <TestCta locale={locale} t={t.testCta} />
    </>
  );
}
