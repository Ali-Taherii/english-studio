import type { Metadata } from "next";
import { Fraunces, Inter, Vazirmatn } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/config/site";
import { dir, locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import "../globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["600"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const vazirmatn = Vazirmatn({ variable: "--font-vazirmatn", subsets: ["arabic", "latin"] });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return {
    metadataBase: new URL(site.url),
    title: { default: meta.title, template: `%s | ${site.name}` },
    description: meta.description,
    alternates: { languages: { fa: "/fa", en: "/en" } },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const t = await getDictionary();
  return (
    <html
      lang={locale}
      dir={dir[locale]}
      className={`${fraunces.variable} ${inter.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader locale={locale} t={t.nav} />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter locale={locale} t={t.nav} />
      </body>
    </html>
  );
}
