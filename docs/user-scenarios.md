# User scenarios

Every scenario lists who, the trigger, the steps, the data written (see [schema.md](schema.md)) and the edge cases. Numbers (S1, S2…) are stable, so issues and E2E tests can refer to them.

## Actors

| Actor | Who | Logged in? |
|---|---|---|
| **Visitor** | Anyone on the public site | No |
| **Lead** | A visitor who left their email (contact form or level test) | No |
| **Student** | Someone you've invited; has a `profiles` row with `role = student` | Yes |
| **Teacher** | You; `role = teacher` | Yes |
| **System** | Cron jobs and automatic emails | n/a |

## Revised phases (payments moved to last)

| Phase | Scope | Scenarios |
|---|---|---|
| 0 | Setup: repo, CI/CD, Supabase (local + staging + prod), design tokens, i18n + RTL foundation | L1, L5 |
| 1 | Public site | S1–S3, L2–L4 (as each page lands) |
| 2 | Free level test | S4–S6 |
| 3 | Accounts & classes | S7–S10 |
| 4 | Homework loop | S11–S17 |
| 5 | Lessons, attendance, packages & credits | S18–S22 |
| 6 | Payments | S23 (placeholder) |
| 7 | Polish: reminders, analytics, progress | S24–S25 |

---

## Language & direction (applies to every phase)

The site is in **Persian (fa, right-to-left, the default)** and **English (en, left-to-right)**. URLs carry the language: `/fa/...` and `/en/...`. `/` redirects based on a cookie, then the browser's `Accept-Language`, then falls back to `fa`.

### L1. Visitor switches language
- **Steps:** a language switch (فا / EN) in the header → the same page in the other language, same slug → the choice is saved in a cookie.
- **Edge:** every page must exist in both languages. CI fails if `messages/fa.json` and `messages/en.json` don't have the same keys.

### L2. Logged-in user's language
- **Steps:** after login, `profiles.locale` decides the UI language, and it can be changed in *Settings*. Switching the language in the header also updates `profiles.locale`.
- **Data:** `profiles.locale`.

### L3. Emails in the reader's language
- **System:** every email template exists in fa and en. The language comes from `profiles.locale`, or for visitors from `leads.locale` / `test_attempts.locale` (the site language they used). Persian emails are right-to-left.

### L4. Teacher writes bilingual content
- **Steps:** forms for packages have fa and en fields side by side, and publishing requires both to be filled. Homework, feedback and notes are a single field written in whatever language you choose. Text fields use `dir="auto"`, so Persian and English each display the right way round.

### L5. Formatting per language
- **fa:** Persian digits (۱۲۳), Persian (Jalali) dates (۵ آبان ۱۴۰۵), prices in Toman or Rial if you price in IRR, and a week that starts on Saturday in the calendar.
- **en:** Western digits, Gregorian dates, and a week that starts on Monday.
- The database always stores UTC and numbers. Formatting happens only at display time, through `Intl` with the `fa-IR-u-ca-persian` locale.
- **Edge:** text the student types (homework answers) is left exactly as typed: no digit conversion.

### L6. Level test in either language
- **Steps:** the intro, instructions, buttons, result explanation and email follow the site language. The questions and answer options are always in English, shown left-to-right inside a right-to-left page.
- **Data:** `test_attempts.locale`.

## Phase 1: Public site

### S1. Visitor learns about the teacher
- **Trigger:** lands on the home page from search, Instagram, or a referral.
- **Steps:** Home → About me (bio, qualifications, teaching style, video intro) → sees two calls to action: *Take the free level test* and *See packages*.
- **Data:** none (analytics only).

### S2. Visitor browses packages
- **Steps:** Packages page → cards for each `packages` row where `is_published` is true, ordered by `sort_order`, one marked *Most popular* → clicks *I'm interested* → goes to the contact form with the package preselected.
- **Data:** read `packages`.
- **Edge:** no published packages → the page shows "Get in touch for pricing" instead of an empty grid.

### S3. Visitor sends a message
- **Steps:** Contact form (name, email, optional phone, message, optional package) → submit → thank-you message: "I'll reply within 24 hours."
- **Data:** insert `leads` (source `contact_form`, status `new`). You get an email notification, logged in `email_log`.
- **Edge:** spam is stopped by a honeypot field plus a rate limit per IP. If the same email sends again, a new lead is still created, but the panel groups leads by email.

## Phase 2: Free level test

### S4. Visitor takes the level test
- **Trigger:** *Take the free test*.
- **Steps:**
  1. Intro: about 15 minutes, 30 questions, no sign-up needed.
  2. Answers multiple-choice questions on grammar, vocabulary and reading (optionally listening). The questions get harder as they go: start at A2 and move up or down based on correct answers.
  3. Optional writing task (about 80 words).
  4. To see the result, enters name and email.
  5. Sees an estimated level (e.g. "B1, intermediate") with a short explanation and a CTA: *Book a free call* / *See packages for B1*.
- **Data:** `test_attempts` (started → submitted), `test_answers`; insert `leads` (source `level_test`) linked to the attempt; email with the result → `email_log`.
- **Edge:** if the visitor leaves mid-test, the attempt stays `started` and isn't a lead. Progress survives a page refresh (the attempt id is kept in a cookie). If they retake the test, a new attempt is linked to the same email.

### S5. Teacher reviews a test with writing
- **Trigger:** panel badge "2 tests to review".
- **Steps:** opens the attempt → sees the auto score, the auto level, and the writing → sets the final level and adds a comment → *Send result*.
- **Data:** update `test_attempts` (reviewed → result_sent, `final_level`, `teacher_comment`); email → `email_log`.

### S6. Teacher manages test questions
- **Steps:** Panel → Level test → add, edit or deactivate questions; filter by level and skill; see each question's "% correct" to spot ones that are too easy or broken.
- **Data:** `test_questions` (never hard-deleted, because old answers point at them).

## Phase 3: Accounts & classes

### S7. Teacher works the lead inbox
- **Steps:** Panel → Leads → list filtered by status → opens a lead (message, test result if any, interested package) → *Mark contacted* / *Archive* / *Convert to student*.
- **Data:** update `leads.status`.

### S8. Teacher converts a lead into a student
- **Steps:** *Convert to student* → form prefilled from the lead (name, email, level from the test) → *Send invite*.
- **Data:** Supabase Auth invite → trigger creates `profiles` (role `student`) → `leads.student_id` set, status `converted`.
- **Edge:** a student can also be added directly without a lead (someone who messaged you on WhatsApp). If the email already has an account, the existing profile is linked instead.

### S9. Student logs in for the first time
- **Steps:** clicks the invite email → sets a password (or uses a magic link) → lands on the dashboard: their classes, next lesson, homework due, and remaining lessons.
- **Data:** read only.
- **Edge:** an expired invite → *Resend invite* button in the panel.

### S10. Teacher creates a class and adds students
- **Steps:** Panel → Classes → *New class* (name, one-to-one or group, level, meeting link) → add students.
- **Data:** `classes`, `class_members`.
- **Edge:** removing a student sets `left_at` instead of deleting, so their history stays. Archiving a class hides it from active lists.

## Phase 4: Homework loop

### S11. Teacher sets homework
- **Steps:** Class → *New homework* → title, instructions, due date, optional files, optional quiz (multiple choice, short answer, or long answer), whether late work is allowed → *Save draft* or *Publish*.
- **Data:** `assignments` (`published_at` null = draft), `assignment_files`, `assignment_questions`. **On publish:** one `submissions` row per current class member with status `assigned`, plus a "New homework" email to each.
- **Edge:** a student who joins the class after publishing gets a submission row too, created when they're added. Editing a published assignment is allowed; deleting one that has submissions asks for confirmation.

### S12. Student does homework
- **Steps:** Dashboard → *Homework* (tabs: To do / Submitted / Graded) → opens one → reads the instructions and downloads the files → answers the quiz, writes text, uploads files → progress saves automatically → *Submit*.
- **Data:** `submissions` (assigned → in_progress on first save → submitted, with `submitted_at` and `is_late`), `submission_answers` (quiz questions auto-graded → `auto_score`), `submission_files` (Storage).
- **Edge:** file limits are 10 MB each, 5 files, pdf, docx, jpg, png and mp3 only. After submitting, the student can still view the work but not edit it.

### S13. Student submits late
- **Steps:** after `due_at`: if `allow_late`, they can still submit and the work is marked *Late*. If not, the homework shows "Closed, talk to your teacher".
- **Data:** `submissions.is_late = true`.

### S14. Teacher grades
- **Steps:** Panel → *Grading queue* (all `submitted`, oldest first, across classes) → opens a submission: the quiz with auto-marked answers (any can be overridden), the text, the files → enters a score and feedback → *Return* (graded) or *Ask for resubmission*.
- **Data:** `submissions.score`, `feedback`, `graded_at`, status → `graded` or `resubmit_requested`; email to the student.

### S15. Student resubmits
- **Steps:** gets the email → homework is back in *To do* with your feedback shown → edits → submits again.
- **Data:** `attempt` +1, status → `submitted`; new `submission_files` rows have the new `attempt`, and old files are kept.

### S16. Student reviews feedback
- **Steps:** *Graded* tab → score, feedback, and quiz answers with the correct ones now revealed.

### S17. Teacher tracks a class's homework
- **Steps:** Class → Homework tab → a grid of students × assignments, each cell coloured by status (not started, in progress, submitted, late, graded with score).
- **Data:** read `submissions`.

## Phase 5: Lessons, attendance & credits

### S18. Teacher grants a package (manual, until payments exist)
- **Steps:** Student profile → *Add package* → pick a package → start date (expiry is worked out from `valid_days`) → note ("paid by bank transfer 3 Nov") → *Grant*.
- **Data:** `student_packages` (source `manual`, `lessons_total` copied from the package).

### S19. Teacher schedules lessons
- **Steps:** Class → *Schedule* → a single lesson or a repeating one (e.g. every Mon and Wed at 18:00 for 8 weeks) → the lessons appear in the panel calendar and on the student dashboard, in each student's timezone.
- **Data:** `lessons`.
- **Edge:** cancelling a lesson sets status `cancelled` and emails the students; no credit is used.

### S20. Teacher marks attendance
- **Steps:** after the lesson → a "Mark attendance" prompt → each student: present / absent / excused → optional topic and notes, optionally linking homework → *Save*.
- **Data:** `attendance`; for present or absent (not excused), one credit is used from the student's oldest active `student_packages` → `lessons_used` +1, and its id is stored on the attendance row. Lesson status becomes `done`.
- **Edge:** if the student has no active package, attendance is still recorded but the panel flags it as "unpaid". Correcting a mark refunds or re-charges the credit.

### S21. Student checks their package
- **Steps:** Dashboard → *My package*: lessons used and left, expiry date, and the history of which lessons used credits.

### S22. Package runs out or expires
- **System:** when `lessons_used = lessons_total` → status `exhausted`. A daily cron sets packages past `expires_at` to `expired`. When 2 lessons are left, or 7 days before expiry, the student and you get emails (deduplicated through `email_log.dedupe_key`).

## Phase 6: Payments (placeholder)

### S23. Student buys or renews a package online
To be designed once the payment situation is clear. It will create `student_packages` with source `payment` from a payment webhook, replacing S18 for online sales.

## Phase 7: Polish

### S24. System sends homework reminders
- 24 hours before `due_at`, students whose submission isn't `submitted` or `graded` get a reminder. You get a daily digest: tests to review, submissions to grade, today's lessons.

### S25. Student and teacher see progress
- A student's chart: homework scores over time, attendance rate, level changes. For you: a dashboard of active students, credits outstanding, new leads per week, and how many test takers become students.

---

## Open questions
1. **Group classes and credits:** does a group lesson use one credit from each student's package, the same as one-to-one? (Assumed yes.)
2. **Absent without notice:** charge a credit? (Assumed yes, and *excused* doesn't.)
3. **Students booking their own lessons**, or you always schedule them? (Assumed you schedule them; self-booking could come in Phase 7.)
4. **Pricing currency:** IRR/Toman only, or both Toman and USD (different prices for students inside and outside Iran)? (`packages` has a single price and currency for now.)
