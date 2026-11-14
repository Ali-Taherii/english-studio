import { intlLocale, type Locale } from "@/i18n/config";

// Display-only formatting. The database stores UTC timestamps and plain numbers.

export const formatDate = (locale: Locale, date: Date | string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", ...options }).format(new Date(date));

export const formatNumber = (locale: Locale, value: number) =>
  new Intl.NumberFormat(intlLocale[locale]).format(value);

// Prices are stored in minor units (schema decision 7). How many minor units make one unit
// depends on the currency: 100 for USD, 1 for IRR (Intl gives the rial no decimals).
export function formatPrice(locale: Locale, amountMinor: number, currency: string) {
  const formatter = new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: currency.trim() });
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 0;
  return formatter.format(amountMinor / 10 ** digits);
}
