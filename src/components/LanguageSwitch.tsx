"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

// Same page, other language. The proxy saves the choice in a cookie.
export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const other: Locale = locale === "fa" ? "en" : "fa";
  const href = pathname.replace(/^\/(fa|en)(?=\/|$)/, `/${other}`);

  return (
    <Link href={href} hrefLang={other} lang={other} className="text-sm font-semibold text-ink-muted hover:text-ink">
      {label}
    </Link>
  );
}
