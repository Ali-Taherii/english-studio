import Link from "next/link";
import { Bidi } from "@/components/Bidi";
import { FeatureCards } from "@/components/FeatureCards";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const t = await getDictionary();
  return pageMetadata(t.about.metaTitle, "/about");
}

const h2 = "font-display text-2xl font-semibold rtl:font-bold";

// About me (S1): bio, qualifications, teaching style, intro photo or video, then the two calls to action.
export default async function About() {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <>
      <section className="mx-auto flex w-full max-w-6xl flex-wrap items-start gap-14 px-6 py-16 md:py-20">
        <div className="flex aspect-[4/5] w-full max-w-[400px] min-w-0 flex-[1_1_320px] items-center justify-center rounded-md border border-border bg-surface-200 p-4 text-center text-sm text-ink-muted">
          {t.about.mediaPlaceholder}
        </div>

        <div className="flex min-w-0 flex-[2_1_480px] flex-col gap-5">
          <p className="text-[13px] font-semibold text-brand">{t.about.eyebrow}</p>
          <h1 className="font-display text-4xl font-extrabold leading-tight">{t.about.title}</h1>
          <p className="text-[17px] text-ink-muted">
            <Bidi>{t.about.bio}</Bidi>
          </p>
          <FeatureCards features={t.about.features} />
        </div>
      </section>

      <section className="bg-surface-200">
        <div className="mx-auto grid max-w-6xl grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-6 px-6 py-16">
          <div className="flex flex-col gap-4 rounded-md bg-surface-0 p-6">
            <h2 className={h2}>{t.about.qualificationsTitle}</h2>
            <ul className="flex list-disc flex-col gap-2 ps-5">
              {t.about.qualifications.map((item) => (
                <li key={item}>
                  <Bidi>{item}</Bidi>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-md bg-surface-0 p-6">
            <h2 className={h2}>{t.about.styleTitle}</h2>
            <p className="text-ink-muted">
              <Bidi>{t.about.style}</Bidi>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-wrap gap-3 px-6 py-16">
        <Link href={`/${locale}/test`} className="rounded-md bg-accent px-7 py-3.5 font-bold text-surface-0">
          {t.home.ctaTest}
        </Link>
        <Link
          href={`/${locale}/packages`}
          className="rounded-md border border-border bg-surface-0 px-7 py-3.5 font-bold text-brand"
        >
          {t.home.ctaPackages}
        </Link>
      </section>
    </>
  );
}
