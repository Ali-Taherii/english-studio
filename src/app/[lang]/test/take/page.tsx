import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/i18n/fill";
import { formatNumber } from "@/lib/format";
import { WRITING_PROMPT } from "@/lib/level-test/engine";
import { attemptCookie, loadTestState, type TestState } from "@/lib/level-test/store";
import { answerQuestion, retakeTest, saveWriting } from "../actions";
import { DetailsForm } from "./DetailsForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.test.metaTitle, robots: { index: false } };
}

const card = "flex flex-col gap-6 rounded-md border border-border bg-surface-0 p-6 md:p-8";
const primary = "rounded-md bg-accent px-7 py-3 font-bold text-surface-0";
const secondary = "rounded-md border border-border bg-surface-0 px-7 py-3 font-bold text-brand";

// The level test itself (S4). One URL for every step: the server decides from the attempt
// (found through its cookie) whether to show a question, the writing task, the details form
// or the result. That is what lets a refresh, or a return days later, land on the right step.
export default async function TakeTest() {
  const locale = await getLocale();
  const t = await getDictionary();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10 md:py-14">
      <Suspense fallback={<p className="text-ink-muted">{t.test.loading}</p>}>
        <TestStep locale={locale} t={t} />
      </Suspense>
    </section>
  );
}

type StepProps = { locale: Locale; t: Dictionary };

async function TestStep({ locale, t }: StepProps) {
  const attemptId = (await cookies()).get(attemptCookie)?.value;

  let state: TestState;
  try {
    state = await loadTestState(attemptId);
  } catch (error) {
    console.error(error);
    return <Notice title={t.test.unavailableTitle} text={t.test.errors.generic} />;
  }

  // No cookie, or it points at nothing: back to the intro.
  if (state.step === "none") redirect(`/${locale}/test`);

  switch (state.step) {
    case "unavailable":
      return (
        <Notice title={t.test.unavailableTitle} text={t.test.unavailableText}>
          <Link href={`/${locale}/contact`} className={`${primary} self-start`}>
            {t.packages.emptyCta}
          </Link>
        </Notice>
      );
    case "question":
      return <QuestionStep state={state} locale={locale} t={t.test} />;
    case "writing":
      return <WritingStep t={t.test.writing} />;
    case "details":
      return (
        <div className={card}>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-semibold rtl:font-bold">{t.test.details.title}</h1>
            <p className="text-ink-muted">{t.test.details.lead}</p>
          </div>
          <DetailsForm t={t.test.details} />
        </div>
      );
    case "result":
      return <ResultStep state={state} locale={locale} t={t} />;
  }
}

function Notice({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className={card}>
      <h1 className="font-display text-2xl font-semibold rtl:font-bold">{title}</h1>
      <p className="text-ink-muted">{text}</p>
      {children}
    </div>
  );
}

type QuestionState = Extract<TestState, { step: "question" }>;

function QuestionStep({ state, locale, t }: { state: QuestionState; locale: Locale; t: Dictionary["test"] }) {
  const { question, number, total } = state;
  // Reading questions are stored as "passage, blank line, question".
  const split = question.prompt.lastIndexOf("\n\n");
  const passage = split === -1 ? null : question.prompt.slice(0, split);
  const ask = split === -1 ? question.prompt : question.prompt.slice(split + 2);

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <h1 className="font-semibold">
            {fill(t.questionOf, { number: formatNumber(locale, number), total: formatNumber(locale, total) })}
          </h1>
          <span className="rounded-full bg-surface-200 px-3 py-0.5 text-[13px] font-semibold">
            {t.skills[question.skill]}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={t.progressLabel}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={number - 1}
          className="h-2 overflow-hidden rounded-full bg-surface-200"
        >
          <div className="h-full rounded-full bg-brand" style={{ width: `${((number - 1) / total) * 100}%` }} />
        </div>
      </div>

      {/* key: a fresh form per question, so the last choice never carries over. */}
      <form key={question.id} action={answerQuestion} className="flex flex-col gap-6">
        <input type="hidden" name="question_id" value={question.id} />
        <div className={card}>
          <p className="text-sm text-ink-muted">{t.instruction}</p>
          <div dir="ltr" lang="en" className="flex flex-col gap-5 font-sans">
            {passage && <p className="whitespace-pre-line leading-7">{passage}</p>}
            <p className="text-xl font-semibold leading-8 md:text-2xl">{ask}</p>
            <div role="radiogroup" aria-label={t.instruction} className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className="flex min-h-14 cursor-pointer items-center gap-3.5 rounded-md border border-border bg-surface-0 px-4 py-3 text-[17px] has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand"
                >
                  <input type="radio" name="choice" value={index} required className="peer sr-only" />
                  <span className="flex size-8 flex-none items-center justify-center rounded-full bg-surface-200 text-sm font-semibold peer-checked:bg-brand peer-checked:text-surface-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <button type="submit" className={`${primary} self-end`}>
          {t.next}
        </button>
      </form>

      <p className="text-sm text-ink-muted">{t.note}</p>
    </>
  );
}

function WritingStep({ t }: { t: Dictionary["test"]["writing"] }) {
  return (
    <form action={saveWriting} className={card}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold rtl:font-bold">{t.title}</h1>
        <p className="text-ink-muted">{t.lead}</p>
      </div>
      <p dir="ltr" lang="en" className="font-sans text-lg font-semibold">
        {WRITING_PROMPT}
      </p>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t.label}
        <textarea
          name="writing"
          dir="ltr"
          lang="en"
          rows={8}
          maxLength={3000}
          className="resize-y rounded-sm border border-border bg-surface-0 px-3 py-2.5 font-sans text-base font-normal"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="submit" name="intent" value="save" className={primary}>
          {t.save}
        </button>
        <button type="submit" name="intent" value="skip" className={secondary}>
          {t.skip}
        </button>
      </div>
    </form>
  );
}

type ResultState = Extract<TestState, { step: "result" }>;

function ResultStep({ state, locale, t }: { state: ResultState; locale: Locale; t: Dictionary }) {
  const { attempt, level, correct, total } = state;
  const result = t.test.result;
  const awaitingReview = attempt.status === "submitted" && Boolean(attempt.writing_answer);

  return (
    <>
      <div className={card}>
        <h1 className="text-sm font-semibold text-brand">{result.title}</h1>
        <div className="flex flex-wrap items-center gap-4">
          <span
            dir="ltr"
            className="rounded-full bg-highlight px-5 py-2 font-sans text-3xl font-semibold text-ink"
          >
            {level}
          </span>
          <p className="font-display text-3xl font-semibold rtl:font-bold">{t.levels[level].name}</p>
        </div>
        <p className="text-lg">{t.levels[level].text}</p>
        <p className="text-sm text-ink-muted">
          {fill(result.score, { correct: formatNumber(locale, correct), total: formatNumber(locale, total) })}
        </p>
        {awaitingReview && <p className="rounded-md bg-brand-tint p-4">{result.pendingWriting}</p>}
        {attempt.result_sent_at && <p className="text-sm text-ink-muted">{result.emailNote}</p>}
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/contact`} className={primary}>
            {result.ctaCall}
          </Link>
          <Link href={`/${locale}/packages`} className={secondary}>
            {result.ctaPackages}
          </Link>
        </div>
      </div>

      <form action={retakeTest}>
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="py-2 text-sm font-semibold text-ink-muted underline">
          {result.retake}
        </button>
      </form>
    </>
  );
}
