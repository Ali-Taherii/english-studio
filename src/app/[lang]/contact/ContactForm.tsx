"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/load";
import { submitContact } from "./actions";
import { initialContactState } from "./state";

type PackageOption = { slug: string; title: string };
type Props = { locale: Locale; t: Dictionary["contact"]["form"]; packages: PackageOption[] };

const label = "flex flex-col gap-1.5 text-sm font-semibold";
const control = "rounded-sm border border-border bg-surface-0 px-3 py-2.5 font-normal text-base";
const fieldError = "text-sm font-normal text-danger";

type SelectProps = { options: PackageOption[]; noneLabel: string; selected: string };

function PackageSelect({ options, noneLabel, selected }: SelectProps) {
  return (
    <select name="package" defaultValue={options.some((o) => o.slug === selected) ? selected : ""} className={control}>
      <option value="">{noneLabel}</option>
      {options.map((option) => (
        <option key={option.slug} value={option.slug}>
          {option.title}
        </option>
      ))}
    </select>
  );
}

// "I'm interested" links arrive as /contact?package=<slug>. Reading the query string needs
// the browser, so this part sits inside <Suspense> and the rest of the page stays static.
function PackageSelectFromUrl(props: Omit<SelectProps, "selected">) {
  const slug = useSearchParams().get("package") ?? "";
  return <PackageSelect {...props} selected={slug} />;
}

export function ContactForm({ locale, t, packages }: Props) {
  const [state, formAction, isPending] = useActionState(submitContact, initialContactState);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-md border border-border bg-surface-0 p-8">
        <h2 className="text-xl font-bold">{t.successTitle}</h2>
        <p className="text-ink-muted">{t.successText}</p>
      </div>
    );
  }

  const { values, fieldErrors, formError } = state;
  const selectProps = { options: packages, noneLabel: t.packageNone };

  return (
    <form action={formAction} noValidate className="rounded-md border border-border bg-surface-0 p-6 md:p-8">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div hidden>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>

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
            aria-describedby={fieldErrors?.name ? "contact-name-error" : undefined}
            className={control}
          />
          {fieldErrors?.name && (
            <span id="contact-name-error" className={fieldError}>
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
            aria-describedby={fieldErrors?.email ? "contact-email-error" : undefined}
            className={control}
          />
          {fieldErrors?.email && (
            <span id="contact-email-error" className={fieldError}>
              {t.errors.email}
            </span>
          )}
        </label>

        <label className={label}>
          {t.phone}
          <input
            type="tel"
            name="phone"
            dir="ltr"
            maxLength={40}
            autoComplete="tel"
            defaultValue={values?.phone}
            className={control}
          />
        </label>

        <label className={label}>
          {t.package}
          {values ? (
            <PackageSelect {...selectProps} selected={values.package} />
          ) : (
            <Suspense fallback={<PackageSelect {...selectProps} selected="" />}>
              <PackageSelectFromUrl {...selectProps} />
            </Suspense>
          )}
        </label>

        <label className={`${label} col-span-full`}>
          {t.message}
          <textarea
            name="message"
            dir="auto"
            rows={4}
            required
            maxLength={5000}
            defaultValue={values?.message}
            aria-invalid={fieldErrors?.message ? true : undefined}
            aria-describedby={fieldErrors?.message ? "contact-message-error" : undefined}
            className={`${control} resize-y`}
          />
          {fieldErrors?.message && (
            <span id="contact-message-error" className={fieldError}>
              {t.errors.message}
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
