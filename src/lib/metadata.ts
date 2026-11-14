import type { Metadata } from "next";
import { locales } from "@/i18n/config";

// Title plus hreflang links for a page that lives at /<locale><path> in every language.
export const pageMetadata = (title: string, path: string): Metadata => ({
  title,
  alternates: { languages: Object.fromEntries(locales.map((locale) => [locale, `/${locale}${path}`])) },
});
