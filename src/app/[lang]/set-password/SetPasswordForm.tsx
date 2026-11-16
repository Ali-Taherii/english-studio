"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/load";
import { setPassword } from "../login/actions";
import { initialPasswordState } from "../login/state";

type Props = { locale: Locale; t: Dictionary["auth"]["setPassword"]; working: string };

export function SetPasswordForm({ locale, t, working }: Props) {
  const [state, formAction, isPending] = useActionState(setPassword, initialPasswordState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5 rounded-md border border-border bg-surface-0 p-6 md:p-8">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t.password}
        <input
          type="password"
          name="password"
          dir="ltr"
          required
          minLength={8}
          maxLength={200}
          autoComplete="new-password"
          aria-describedby="password-hint"
          aria-invalid={state.error === "short" ? true : undefined}
          className="rounded-sm border border-border bg-surface-0 px-3 py-2.5 font-normal text-base"
        />
        <span id="password-hint" className="text-sm font-normal text-ink-muted">
          {t.hint}
        </span>
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {t.errors[state.error]}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-accent px-8 py-3 font-bold text-surface-0 disabled:opacity-60"
      >
        {isPending ? working : t.save}
      </button>
    </form>
  );
}
