import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { getSessionUser } from "@/lib/auth/session";
import { SetPasswordForm } from "./SetPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.auth.setPassword.metaTitle, robots: { index: false } };
}

// Only for someone a one-time link has just logged in; anyone else is sent to ask for a link.
async function PasswordStep({ locale, t }: { locale: Locale; t: Dictionary["auth"] }) {
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login?error=link`);
  return <SetPasswordForm locale={locale} t={t.setPassword} working={t.working} />;
}

// Where invite and reset links land (S9): choose a password, then on to the dashboard or panel.
export default async function SetPassword() {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16 md:py-20">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-extrabold leading-tight">{t.auth.setPassword.title}</h1>
        <p className="text-ink-muted">{t.auth.setPassword.lead}</p>
      </div>
      <Suspense fallback={<p className="text-ink-muted">{t.auth.working}</p>}>
        <PasswordStep locale={locale} t={t.auth} />
      </Suspense>
    </section>
  );
}
