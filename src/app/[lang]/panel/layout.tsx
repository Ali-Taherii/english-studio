import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.panel.metaTitle, robots: { index: false } };
}

// Frame around every teacher page. It holds no private data and checks nobody: each page
// under it calls requireUser(locale, "teacher") itself before it reads anything.
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl font-semibold rtl:font-bold">{t.panel.title}</p>
        <LogoutButton locale={locale} label={t.auth.logout} />
      </div>
      {children}
    </div>
  );
}
