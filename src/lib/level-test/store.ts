import type { Locale } from "@/i18n/config";
import { adminInsert, adminSelect, adminUpdate, SupabaseError } from "@/lib/supabase/admin";
import {
  countCorrect,
  estimateLevel,
  pickNext,
  testLength,
  type Answered,
  type Level,
  type Question,
} from "./engine";

// Database side of the level test. Everything goes through the service role (schema
// decision 6), so nothing here may be reachable without checking the attempt cookie first.

export const attemptCookie = "test_attempt";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Attempt = {
  id: string;
  status: "started" | "submitted" | "reviewed" | "result_sent";
  locale: Locale;
  full_name: string | null;
  email: string | null;
  auto_score: number | null;
  auto_level: Level | null;
  final_level: Level | null;
  writing_prompt: string | null;
  writing_answer: string | null;
  // When a result email last went out: the automatic one at the end of the test,
  // later the teacher's reviewed one (S5).
  result_sent_at: string | null;
};

const attemptColumns =
  "id,status,locale,full_name,email,auto_score,auto_level,final_level,writing_prompt,writing_answer,result_sent_at";

export async function getAttempt(id: string | undefined): Promise<Attempt | null> {
  if (!id || !uuid.test(id)) return null;
  const [attempt] = await adminSelect<Attempt>("test_attempts", {
    select: attemptColumns,
    id: `eq.${id}`,
    limit: "1",
  });
  return attempt ?? null;
}

export const createAttempt = (locale: Locale) =>
  adminInsert<{ id: string }>("test_attempts", { locale }, "id");

export const updateAttempt = (id: string, patch: Record<string, unknown>) =>
  adminUpdate<Attempt>("test_attempts", { id: `eq.${id}` }, patch, attemptColumns);

export const getActiveQuestions = () =>
  adminSelect<Question>("test_questions", {
    select: "id,level,skill,prompt,options,correct_answer",
    is_active: "eq.true",
  });

export async function getAnswers(attemptId: string): Promise<Answered[]> {
  const rows = await adminSelect<{
    question_id: string;
    is_correct: boolean;
    test_questions: { level: Level };
  }>("test_answers", {
    select: "question_id,is_correct,test_questions(level)",
    attempt_id: `eq.${attemptId}`,
  });
  return rows.map((row) => ({
    questionId: row.question_id,
    level: row.test_questions.level,
    isCorrect: row.is_correct,
  }));
}

// A double click or a resent request can try to save the same answer twice; the primary
// key (attempt, question) rejects the second one and the first stands.
export async function saveAnswer(attemptId: string, question: Question, choice: number, position: number) {
  try {
    await adminInsert("test_answers", {
      attempt_id: attemptId,
      question_id: question.id,
      answer: { choice, position },
      is_correct: choice === question.correct_answer,
    });
  } catch (error) {
    if (!(error instanceof SupabaseError && error.status === 409)) throw error;
  }
}

// Where an attempt stands. The page renders from this and every action checks it first,
// so a visitor can only ever do the step they are actually on.
export type TestState =
  | { step: "none" }
  | { step: "unavailable" }
  | { step: "question"; attempt: Attempt; question: Question; number: number; total: number; answers: Answered[] }
  | { step: "writing"; attempt: Attempt; answers: Answered[] }
  | { step: "details"; attempt: Attempt; answers: Answered[] }
  | { step: "result"; attempt: Attempt; level: Level; correct: number; total: number };

export async function loadTestState(attemptId: string | undefined): Promise<TestState> {
  const attempt = await getAttempt(attemptId);
  if (!attempt) return { step: "none" };

  const answers = await getAnswers(attempt.id);
  if (attempt.status !== "started") {
    return {
      step: "result",
      attempt,
      level: attempt.final_level ?? attempt.auto_level ?? estimateLevel(answers),
      correct: attempt.auto_score ?? countCorrect(answers),
      total: answers.length,
    };
  }

  const questions = await getActiveQuestions();
  const question = pickNext(questions, answers, attempt.id);
  if (question) {
    return {
      step: "question",
      attempt,
      question,
      number: answers.length + 1,
      total: Math.max(testLength(questions), answers.length + 1),
      answers,
    };
  }
  if (answers.length === 0) return { step: "unavailable" };
  if (attempt.writing_prompt === null) return { step: "writing", attempt, answers };
  return { step: "details", attempt, answers };
}
