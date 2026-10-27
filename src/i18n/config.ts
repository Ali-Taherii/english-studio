export const locales = ["fa", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fa";
export const localeCookie = "NEXT_LOCALE";

export const dir: Record<Locale, "rtl" | "ltr"> = { fa: "rtl", en: "ltr" };

// Persian dates use the Jalali calendar; digits follow the locale.
export const intlLocale: Record<Locale, string> = {
  fa: "fa-IR-u-ca-persian",
  en: "en-GB",
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
