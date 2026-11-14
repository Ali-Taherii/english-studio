import Link from "next/link";
import { Bidi } from "@/components/Bidi";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/fill";
import { formatNumber, formatPrice } from "@/lib/format";
import type { Package } from "@/lib/packages";

type Props = { packages: Package[]; locale: Locale; t: Dictionary["packages"] };

// Cards for the published packages (S2). With none published, a single "get in touch" card.
export function PackageGrid({ packages, locale, t }: Props) {
  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-md border border-border bg-surface-0 p-7">
        <h3 className="text-xl font-bold">{t.emptyTitle}</h3>
        <p className="text-ink-muted">{t.emptyText}</p>
        <Link href={`/${locale}/contact`} className="rounded-md bg-accent px-7 py-3 font-bold text-surface-0">
          {t.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] items-stretch gap-6">
      {packages.map((pkg) => (
        <article
          key={pkg.id}
          className={`flex flex-col gap-4 rounded-md bg-surface-0 p-7 ${
            pkg.is_popular ? "border-2 border-brand" : "border border-border"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[22px] font-bold">
              <Bidi>{pkg.title[locale]}</Bidi>
            </h3>
            {pkg.is_popular && (
              <span className="rounded-full bg-highlight px-3 py-0.5 text-[13px] font-semibold text-ink">
                {t.popular}
              </span>
            )}
          </div>

          <p className="text-sm text-ink-muted">
            {t.format[pkg.format]} · <Bidi>{pkg.description[locale]}</Bidi>
          </p>

          <p className="text-[28px] font-extrabold">
            {pkg.price_amount > 0 ? formatPrice(locale, pkg.price_amount, pkg.currency) : t.priceOnRequest}
          </p>

          <ul className="flex list-disc flex-col gap-1.5 ps-5 text-[15px]">
            <li>
              {fill(t.lessons, {
                count: formatNumber(locale, pkg.lesson_count),
                minutes: formatNumber(locale, pkg.lesson_minutes),
              })}
            </li>
            <li>{fill(t.validity, { days: formatNumber(locale, pkg.valid_days) })}</li>
            {pkg.features.map((feature, index) => (
              <li key={index}>
                <Bidi>{feature[locale]}</Bidi>
              </li>
            ))}
          </ul>

          <Link
            href={`/${locale}/contact?package=${encodeURIComponent(pkg.slug)}`}
            className={`mt-auto rounded-md p-3 text-center font-bold ${
              pkg.is_popular ? "bg-accent text-surface-0" : "border border-brand bg-surface-0 text-brand"
            }`}
          >
            {t.interested}
          </Link>
        </article>
      ))}
    </div>
  );
}
