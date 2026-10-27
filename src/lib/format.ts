import { intlLocale, type Locale } from "@/i18n/config";

// Display-only formatting. The database stores UTC timestamps and plain numbers.

export const formatDate = (locale: Locale, date: Date | string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", ...options }).format(new Date(date));

export const formatNumber = (locale: Locale, value: number) =>
  new Intl.NumberFormat(intlLocale[locale]).format(value);
