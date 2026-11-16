"use client";

import { useActionState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/load";
import { startTest } from "./actions";
import { initialStartState } from "./state";

type Props = { locale: Locale; label: string; errors: Dictionary["test"]["errors"] };

export function StartTestForm({ locale, label, errors }: Props) {
  const [state, formAction, isPending] = useActionState(startTest, initialStartState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-3">
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-accent px-8 py-3.5 font-bold text-surface-0 disabled:opacity-60"
      >
        {label}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {errors[state.error]}
        </p>
      )}
    </form>
  );
}
