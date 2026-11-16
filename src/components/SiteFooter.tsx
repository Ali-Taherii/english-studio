import Link from "next/link";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary["nav"] }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-ink-muted">
        <span>
          © <bdi>{site.name}</bdi>
        </span>
        <Link href={`/${locale}/contact`} className="py-2 hover:text-ink">
          {t.contact}
        </Link>
      </div>
    </footer>
  );
}
