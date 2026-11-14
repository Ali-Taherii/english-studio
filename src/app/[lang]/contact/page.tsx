import { site } from "@/config/site";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";
import { getPublishedPackages } from "@/lib/packages";
import { ContactForm } from "./ContactForm";

export async function generateMetadata() {
  const t = await getDictionary();
  return pageMetadata(t.contact.metaTitle, "/contact");
}

const channelOrder = ["telegram", "whatsapp", "instagram", "email"] as const;

// Contact (S3): the form, plus whichever direct channels are filled in src/config/site.ts.
export default async function Contact() {
  const locale = await getLocale();
  const t = await getDictionary();
  const packages = await getPublishedPackages();
  const channels = channelOrder.filter((channel) => site.contact[channel]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-wrap gap-12 px-6 py-16 md:py-20">
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
        <h1 className="font-display text-4xl font-extrabold leading-tight">{t.contact.title}</h1>
        <p className="text-ink-muted">{t.contact.lead}</p>
        {channels.length > 0 && (
          <ul className="mt-2 flex flex-col gap-3 text-[15px]">
            {channels.map((channel) => (
              <li key={channel}>
                {t.contact.channels[channel]}: <bdi>{site.contact[channel]}</bdi>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="min-w-0 flex-[2_1_480px]">
        <ContactForm
          locale={locale}
          t={t.contact.form}
          packages={packages.map((pkg) => ({ slug: pkg.slug, title: pkg.title[locale] }))}
        />
      </div>
    </section>
  );
}
