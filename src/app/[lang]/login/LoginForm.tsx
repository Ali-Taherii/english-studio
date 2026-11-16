"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/load";
import { logIn } from "./actions";
import { initialLoginState } from "./state";

const label = "flex flex-col gap-1.5 text-sm font-semibold";
const control = "rounded-sm border border-border bg-surface-0 px-3 py-2.5 font-normal text-base";
const linkButton = "py-2 text-start text-sm font-semibold text-brand underline disabled:opacity-60";

// Shown when a one-time link was expired or already used (/login?error=link).
function LinkError({ message }: { message: string }) {
  if (useSearchParams().get("error") !== "link") return null;
  return (
    <p role="alert" className="text-sm text-danger">
      {message}
    </p>
  );
}

export function LoginForm({ locale, t }: { locale: Locale; t: Dictionary["auth"] }) {
  const [state, formAction, isPending] = useActionState(logIn, initialLoginState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5 rounded-md border border-border bg-surface-0 p-6 md:p-8">
      <input type="hidden" name="locale" value={locale} />

      <Suspense fallback={null}>
        <LinkError message={t.errors.link} />
      </Suspense>

      {/* Remount after a submit, so the email field shows what was sent. */}
      <div key={state.attempt} className="flex flex-col gap-5">
        <label className={label}>
          {t.email}
          <input
            type="email"
            name="email"
            dir="ltr"
            required
            maxLength={254}
            autoComplete="username"
            defaultValue={state.email}
            className={control}
          />
        </label>
        <label className={label}>
          {t.password}
          <input type="password" name="password" dir="ltr" maxLength={200} autoComplete="current-password" className={control} />
        </label>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {t.errors[state.error]}
        </p>
      )}
      {state.notice && (
        <p role="status" className="rounded-md bg-brand-tint p-4 text-sm">
          {t.linkSent}
        </p>
      )}

      <button
        type="submit"
        name="intent"
        value="password"
        disabled={isPending}
        className="self-start rounded-md bg-accent px-8 py-3 font-bold text-surface-0 disabled:opacity-60"
      >
        {isPending ? t.working : t.signIn}
      </button>

      <div className="flex flex-col border-t border-border pt-4">
        <p className="text-sm text-ink-muted">{t.or}</p>
        <button type="submit" name="intent" value="magiclink" disabled={isPending} className={linkButton}>
          {t.emailLink}
        </button>
        <button type="submit" name="intent" value="recovery" disabled={isPending} className={linkButton}>
          {t.resetPassword}
        </button>
      </div>
    </form>
  );
}
