import { PackageGrid } from "@/components/PackageGrid";
import { TestCta } from "@/components/TestCta";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";
import { getPublishedPackages } from "@/lib/packages";

export async function generateMetadata() {
  const t = await getDictionary();
  return pageMetadata(t.packages.metaTitle, "/packages");
}

// Packages (S2): published packages in sort order; "I'm interested" opens the contact form
// with that package preselected.
export default async function Packages() {
  const locale = await getLocale();
  const t = await getDictionary();
  const packages = await getPublishedPackages();

  return (
    <>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 md:py-20">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-extrabold leading-tight">{t.packages.title}</h1>
          <p className="text-ink-muted">{t.packages.lead}</p>
        </div>
        <PackageGrid packages={packages} locale={locale} t={t.packages} />
      </section>

      <TestCta locale={locale} t={t.testCta} />
    </>
  );
}
