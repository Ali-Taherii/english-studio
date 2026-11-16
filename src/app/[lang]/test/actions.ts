"use server";

import { refresh } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { loadDictionary } from "@/i18n/load";
import { sendEmail } from "@/lib/email";
import { formatNumber } from "@/lib/format";
import { countCorrect, estimateLevel, WRITING_PROMPT } from "@/lib/level-test/engine";
import {
  attemptCookie,
  createAttempt,
  getAttempt,
  loadTestState,
  saveAnswer,
  updateAttempt,
} from "@/lib/level-test/store";
import { isRateLimited } from "@/lib/rate-limit";
import { adminInsert, adminSelect } from "@/lib/supabase/admin";
import type { FinishState, StartState } from "./state";

// S4: the free level test. Each action reloads where the attempt stands and only acts if the
// visitor is on that step, so replayed or out-of-order requests do nothing.

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOUR = 60 * 60 * 1000;

const text = (formData: FormData, name: string, max: number) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
};

const localeFrom = (formData: FormData): Locale => {
  const value = text(formData, "locale", 5);
  return hasLocale(value) ? value : defaultLocale;
};

const clientIp = async () => (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

const currentState = async () => loadTestState((await cookies()).get(attemptCookie)?.value);

// Continues an unfinished attempt if the cookie points at one, otherwise starts a new one.
async function beginAttempt(locale: Locale): Promise<StartState> {
  const cookieStore = await cookies();
  try {
    const existing = await getAttempt(cookieStore.get(attemptCookie)?.value);
    if (existing?.status === "started") return {};

    if (isRateLimited(`test-start:${await clientIp()}`, 10, HOUR)) return { error: "rateLimited" };
    const attempt = await createAttempt(locale);
    cookieStore.set(attemptCookie, attempt.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return {};
  } catch (error) {
    console.error(error);
    return { error: "generic" };
  }
}

export async function startTest(_previous: StartState, formData: FormData): Promise<StartState> {
  const locale = localeFrom(formData);
  const result = await beginAttempt(locale);
  if (result.error) return result;
  redirect(`/${locale}/test/take`);
}

// "Take the test again" on the result screen: a new attempt, linked to the same email at the end.
export async function retakeTest(formData: FormData) {
  await beginAttempt(localeFrom(formData));
  refresh();
}

export async function answerQuestion(formData: FormData) {
  try {
    const state = await currentState();
    const choice = Number(text(formData, "choice", 2) || NaN);
    if (
      state.step === "question" &&
      text(formData, "question_id", 40) === state.question.id &&
      Number.isInteger(choice) &&
      choice >= 0 &&
      choice < state.question.options.length
    ) {
      await saveAnswer(state.attempt.id, state.question, choice, state.number);
    }
  } catch (error) {
    console.error(error);
  }
  refresh();
}

export async function saveWriting(formData: FormData) {
  try {
    const state = await currentState();
    if (state.step === "writing") {
      const answer = text(formData, "intent", 10) === "skip" ? "" : text(formData, "writing", 3000);
      await updateAttempt(state.attempt.id, { writing_prompt: WRITING_PROMPT, writing_answer: answer || null });
    }
  } catch (error) {
    console.error(error);
  }
  refresh();
}

// Last step: name and email, then the result on screen and by email.
export async function finishTest(previous: FinishState, formData: FormData): Promise<FinishState> {
  const attempt = previous.attempt + 1;
  const values = { name: text(formData, "name", 120), email: text(formData, "email", 254).toLowerCase() };

  const fieldErrors: NonNullable<FinishState["fieldErrors"]> = {};
  if (!values.name) fieldErrors.name = true;
  if (!emailPattern.test(values.email)) fieldErrors.email = true;
  if (Object.keys(fieldErrors).length > 0) return { attempt, fieldErrors, values };

  if (isRateLimited(`test-finish:${await clientIp()}`, 10, HOUR)) {
    return { attempt, formError: "rateLimited", values };
  }

  try {
    const state = await currentState();
    if (state.step === "details") {
      const { id, locale, writing_answer } = state.attempt;
      const level = estimateLevel(state.answers);
      const correct = countCorrect(state.answers);
      const hasWriting = Boolean(writing_answer);

      // A retake by the same email joins the lead that email already has.
      const [existingLead] = await adminSelect<{ id: string }>("leads", {
        select: "id",
        source: "eq.level_test",
        email: `eq.${values.email}`,
        order: "created_at.desc",
        limit: "1",
      });
      const lead =
        existingLead ??
        (await adminInsert<{ id: string }>(
          "leads",
          { source: "level_test", full_name: values.name, email: values.email, locale },
          "id",
        ));

      await updateAttempt(id, {
        status: "submitted",
        submitted_at: new Date().toISOString(),
        full_name: values.name,
        email: values.email,
        lead_id: lead.id,
        auto_score: correct,
        auto_level: level,
      });

      const t = await loadDictionary(locale);
      const mail = t.emails.testResult;
      const sent = await sendEmail({
        to: values.email,
        subject: fill(mail.subject, { level }),
        intro: fill(mail.intro, { name: values.name }),
        rows: [
          { label: mail.level, value: `${t.levels[level].name} (${level})` },
          { label: mail.meaning, value: t.levels[level].text },
          {
            label: mail.score,
            value: fill(t.test.result.score, {
              correct: formatNumber(locale, correct),
              total: formatNumber(locale, state.answers.length),
            }),
          },
          ...(hasWriting ? [{ label: mail.writing, value: t.test.result.pendingWriting }] : []),
          { label: mail.next, value: `${site.url}/${locale}/packages` },
        ],
        locale,
        template: "test_result",
        ref: { table: "test_attempts", id },
      });

      // With a writing task the attempt stays "submitted" and waits for the teacher's
      // review (S5). Without one, the automatic result is the result.
      if (sent) {
        await updateAttempt(id, {
          result_sent_at: new Date().toISOString(),
          ...(hasWriting ? {} : { status: "result_sent" }),
        });
      }
    }
  } catch (error) {
    console.error(error);
    return { attempt, formError: "generic", values };
  }

  refresh();
  return { attempt };
}
