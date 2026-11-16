"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/load";
import { finishTest } from "../actions";
import { initialFinishState } from "../state";

const label = "flex flex-col gap-1.5 text-sm font-semibold";
const control = "rounded-sm border border-border bg-surface-0 px-3 py-2.5 font-normal text-base";
const fieldError = "text-sm font-normal text-danger";

// Last step of the level test: name and email, asked only now (S4, step 4).
export function DetailsForm({ t }: { t: Dictionary["test"]["details"] }) {
  const [state, formAction, isPending] = useActionState(finishTest, initialFinishState);
  const { values, fieldErrors, formError } = state;

  return (
    <form action={formAction} noValidate>
      {/* Remount after a failed submit, so the fields show what was sent. */}
      <div key={state.attempt} className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-5">
        <label className={label}>
          {t.name}
          <input
            type="text"
            name="name"
            dir="auto"
            required
            maxLength={120}
            autoComplete="name"
            defaultValue={values?.name}
            aria-invalid={fieldErrors?.name ? true : undefined}
            aria-describedby={fieldErrors?.name ? "test-name-error" : undefined}
            className={control}
          />
          {fieldErrors?.name && (
            <span id="test-name-error" className={fieldError}>
              {t.errors.name}
            </span>
          )}
        </label>

        <label className={label}>
          {t.email}
          <input
            type="email"
            name="email"
            dir="ltr"
            required
            maxLength={254}
            autoComplete="email"
            defaultValue={values?.email}
            aria-invalid={fieldErrors?.email ? true : undefined}
            aria-describedby={fieldErrors?.email ? "test-email-error" : undefined}
            className={control}
          />
          {fieldErrors?.email && (
            <span id="test-email-error" className={fieldError}>
              {t.errors.email}
            </span>
          )}
        </label>

        {formError && (
          <p role="alert" className="col-span-full text-sm text-danger">
            {t.errors[formError]}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="col-span-full justify-self-start rounded-md bg-accent px-8 py-3 font-bold text-surface-0 disabled:opacity-60"
        >
          {isPending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}
