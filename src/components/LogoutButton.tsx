import { logOut } from "@/app/[lang]/login/actions";
import type { Locale } from "@/i18n/config";

export function LogoutButton({ locale, label }: { locale: Locale; label: string }) {
  return (
    <form action={logOut}>
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className="rounded-md border border-border bg-surface-0 px-4 py-2 text-sm font-semibold text-brand">
        {label}
      </button>
    </form>
  );
}
