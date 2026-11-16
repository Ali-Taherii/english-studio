// The adaptive level test (S4), as pure functions: which question comes next, and what
// level the answers add up to. No database or request access here, so it is easy to test.

export const levels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof levels)[number];

export const skills = ["grammar", "vocabulary", "reading"] as const;
export type Skill = (typeof skills)[number] | "listening";

export const TEST_LENGTH = 30;
const START_LEVEL = levels.indexOf("A2");

// Always English: it is part of the test (L6).
export const WRITING_PROMPT =
  "Write about 80 words: Why are you learning English, and how do you plan to use it?";

export type Question = {
  id: string;
  level: Level;
  skill: Skill;
  prompt: string;
  options: string[];
  correct_answer: number; // 0-based index into options
};

export type Answered = { questionId: string; level: Level; isCorrect: boolean };

// Start at A2; every two more right answers than wrong ones move the test up a level,
// every two more wrong than right move it down. Depends only on the totals, not on the
// order of answers, so a refresh or a repeated request can never change the path.
export function targetLevelIndex(answers: Answered[], maxIndex: number): number {
  const correct = answers.filter((a) => a.isCorrect).length;
  const net = correct - (answers.length - correct);
  return Math.min(Math.max(START_LEVEL + Math.trunc(net / 2), 0), maxIndex);
}

// Stable pseudo-random order per attempt (FNV-1a), so two visitors get different questions
// but one visitor always sees the same next question.
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export const testLength = (questions: Question[]) => Math.min(TEST_LENGTH, questions.length);

// The next question, or null when the test is over (30 answered, or the bank ran out).
export function pickNext(questions: Question[], answers: Answered[], attemptId: string): Question | null {
  if (answers.length >= TEST_LENGTH) return null;
  const answered = new Set(answers.map((a) => a.questionId));
  const remaining = questions.filter((q) => !answered.has(q.id));
  if (remaining.length === 0) return null;

  const maxIndex = Math.max(...questions.map((q) => levels.indexOf(q.level)));
  const target = targetLevelIndex(answers, maxIndex);
  const skill = skills[answers.length % skills.length];

  // Target level first, then the nearest levels (lower before higher) if it has run dry.
  const byDistance = [...remaining].sort((a, b) => {
    const da = Math.abs(levels.indexOf(a.level) - target);
    const db = Math.abs(levels.indexOf(b.level) - target);
    if (da !== db) return da - db;
    if (a.level !== b.level) return levels.indexOf(a.level) - levels.indexOf(b.level);
    if ((a.skill === skill) !== (b.skill === skill)) return a.skill === skill ? -1 : 1;
    return hash(`${attemptId}:${a.id}`) - hash(`${attemptId}:${b.id}`);
  });
  return byDistance[0];
}

const MIN_ANSWERS = 3;
const PASS_RATE = 0.6;

// The highest level the visitor holds: walking up from A1, a level counts once it has at
// least three answers with 60% or more correct, and the walk stops at the first level they
// don't hold. Levels with fewer than three answers say too little and are skipped.
export function estimateLevel(answers: Answered[]): Level {
  let result: Level = "A1";
  for (const level of levels) {
    const atLevel = answers.filter((a) => a.level === level);
    if (atLevel.length < MIN_ANSWERS) continue;
    const rate = atLevel.filter((a) => a.isCorrect).length / atLevel.length;
    if (rate < PASS_RATE) break;
    result = level;
  }
  return result;
}

export const countCorrect = (answers: Answered[]) => answers.filter((a) => a.isCorrect).length;
