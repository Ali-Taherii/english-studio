import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { getSessionUser, homePath } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/metadata";
import { LoginForm } from "./LoginForm";

export async function generateMetadata() {
  const t = await getDictionary();
  return pageMetadata(t.auth.metaTitle, "/login");
}

// Someone who is already logged in (or just arrived through a one-time link) goes straight
// to their own home. Reads the session, so it sits behind <Suspense> and the form shows first.
async function ForwardIfLoggedIn() {
  const user = await getSessionUser();
  if (user) redirect(homePath(user, user.locale));
  return null;
}

// Login for students and the teacher (S9).
export default async function Login() {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16 md:py-20">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-extrabold leading-tight">{t.auth.title}</h1>
        <p className="text-ink-muted">{t.auth.lead}</p>
      </div>
      <LoginForm locale={locale} t={t.auth} />
      <Suspense fallback={null}>
        <ForwardIfLoggedIn />
      </Suspense>
    </section>
  );
}
