import Link from "next/link";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary["nav"] }) {
  const links = [
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/packages`, label: t.packages },
    { href: `/${locale}/test`, label: t.test },
    { href: `/${locale}/contact`, label: t.contact },
  ];

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <Link href={`/${locale}`} className="font-serif text-2xl font-semibold text-ink">
          <bdi>{site.name}</bdi>
        </Link>

        <nav aria-label={t.label} className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="py-2 text-ink hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>

        <LanguageSwitch locale={locale} label={t.switchTo} />
      </div>
    </header>
  );
}
