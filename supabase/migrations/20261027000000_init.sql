-- English Studio: initial schema
-- Source of truth from here on; docs/schema.sql is the readable copy of this first version.
-- Payments are deferred to the last phase: packages are granted manually for now,
-- and student_packages.source leaves room for 'payment' later.

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────
create type app_locale         as enum ('en', 'fa');
create type user_role          as enum ('teacher', 'student');
create type cefr_level         as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
create type lead_source        as enum ('contact_form', 'level_test');
create type lead_status        as enum ('new', 'contacted', 'converted', 'archived');
create type class_format       as enum ('one_to_one', 'group');
create type package_status     as enum ('active', 'exhausted', 'expired', 'cancelled');
create type package_source     as enum ('manual', 'payment');
create type lesson_status      as enum ('scheduled', 'done', 'cancelled');
create type attendance_status  as enum ('present', 'absent', 'excused');
create type question_type      as enum ('mcq', 'short_text', 'long_text');
create type submission_status  as enum ('assigned', 'in_progress', 'submitted', 'resubmit_requested', 'graded');
create type test_skill         as enum ('grammar', 'vocabulary', 'reading', 'listening');
create type test_attempt_status as enum ('started', 'submitted', 'reviewed', 'result_sent');

-- Bilingual text for content the teacher writes once in both languages: {"en": "...", "fa": "..."}.
-- UI strings live in code (messages/en.json, messages/fa.json), not here.
create domain i18n_text as jsonb
  check (jsonb_typeof(value) = 'object' and value ? 'en' and value ? 'fa');

-- ─────────────────────────────────────────────────────────────
-- People
-- ─────────────────────────────────────────────────────────────

-- One row per auth.users row. Created by a trigger on sign-up / invite.
create table profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          user_role   not null default 'student',
  full_name     text        not null,
  email         text        not null unique,
  phone         text,
  level         cefr_level,                 -- teacher's current assessment
  locale        app_locale  not null default 'fa',  -- UI + email language
  timezone      text        not null default 'UTC',
  notes         text,                       -- private teacher notes (hidden from student by RLS view)
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- Anyone who reached out but isn't (yet) a student.
create table leads (
  id            uuid primary key default gen_random_uuid(),
  source        lead_source not null,
  status        lead_status not null default 'new',
  full_name     text        not null,
  email         text        not null,
  phone         text,
  message       text,
  locale        app_locale  not null,       -- site language they used; replies/emails follow it
  interested_package_id uuid,               -- fk added below
  student_id    uuid references profiles (id) on delete set null,  -- set on conversion
  created_at    timestamptz not null default now()
);
create index on leads (status, created_at desc);
create index on leads (lower(email));

-- ─────────────────────────────────────────────────────────────
-- Packages & credits
-- ─────────────────────────────────────────────────────────────

-- What's shown and sold on the public site.
create table packages (
  id             uuid primary key default gen_random_uuid(),
  slug           text         not null unique,   -- one slug for both languages: /en/packages/x, /fa/packages/x
  title          i18n_text    not null,
  description    i18n_text    not null,
  features       jsonb        not null default '[]',  -- array of i18n_text bullet points
  format         class_format not null,
  lesson_count   int          not null check (lesson_count > 0),
  lesson_minutes int          not null default 60,
  valid_days     int          not null default 90,   -- credits expire after this
  price_amount   int          not null check (price_amount >= 0),  -- minor units (cents)
  currency       char(3)      not null default 'USD',
  is_popular     boolean      not null default false,
  is_published   boolean      not null default false,
  sort_order     int          not null default 0,
  created_at     timestamptz  not null default now()
);
alter table leads add foreign key (interested_package_id) references packages (id) on delete set null;

-- A package a student owns: the credit wallet.
create table student_packages (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid           not null references profiles (id) on delete cascade,
  package_id     uuid           not null references packages (id),
  lessons_total  int            not null check (lessons_total > 0),  -- copied from package at grant time
  lessons_used   int            not null default 0 check (lessons_used >= 0),
  status         package_status not null default 'active',
  source         package_source not null default 'manual',
  starts_at      timestamptz    not null default now(),
  expires_at     timestamptz    not null,
  note           text,                                  -- e.g. "paid cash 12 Nov"
  created_at     timestamptz    not null default now(),
  check (lessons_used <= lessons_total)
);
create index on student_packages (student_id, status);

-- ─────────────────────────────────────────────────────────────
-- Classes & lessons
-- ─────────────────────────────────────────────────────────────

create table classes (
  id            uuid primary key default gen_random_uuid(),
  name          text         not null,
  format        class_format not null,
  level         cefr_level,
  description   text,
  meeting_url   text,                        -- Zoom / Meet link
  is_archived   boolean      not null default false,
  created_at    timestamptz  not null default now()
);

create table class_members (
  class_id      uuid not null references classes (id) on delete cascade,
  student_id    uuid not null references profiles (id) on delete cascade,
  joined_at     timestamptz not null default now(),
  left_at       timestamptz,
  primary key (class_id, student_id)
);
create index on class_members (student_id);

create table lessons (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid          not null references classes (id) on delete cascade,
  starts_at     timestamptz   not null,
  duration_min  int           not null default 60,
  status        lesson_status not null default 'scheduled',
  topic         text,
  teacher_notes text,
  created_at    timestamptz   not null default now()
);
create index on lessons (class_id, starts_at);
create index on lessons (starts_at) where status = 'scheduled';

-- Marking 'present' (or 'absent' without notice) uses one credit.
create table attendance (
  lesson_id          uuid not null references lessons (id) on delete cascade,
  student_id         uuid not null references profiles (id) on delete cascade,
  status             attendance_status not null,
  student_package_id uuid references student_packages (id),  -- which wallet was charged; null = not charged
  marked_at          timestamptz not null default now(),
  primary key (lesson_id, student_id)
);

-- ─────────────────────────────────────────────────────────────
-- Homework
-- ─────────────────────────────────────────────────────────────

create table assignments (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid        not null references classes (id) on delete cascade,
  lesson_id     uuid        references lessons (id) on delete set null,  -- optional link to a lesson
  title         text        not null,
  instructions  text        not null,
  due_at        timestamptz,
  max_score     int         not null default 100,
  allow_late    boolean     not null default true,
  allow_files   boolean     not null default true,
  published_at  timestamptz,                -- null = draft, invisible to students
  created_at    timestamptz not null default now()
);
create index on assignments (class_id, due_at);

create table assignment_files (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments (id) on delete cascade,
  storage_path  text not null,              -- Supabase Storage: assignments/<assignment_id>/<file>
  file_name     text not null,
  created_at    timestamptz not null default now()
);

-- Optional in-browser quiz inside an assignment.
create table assignment_questions (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid          not null references assignments (id) on delete cascade,
  position       int           not null,
  type           question_type not null,
  prompt         text          not null,
  options        jsonb,                     -- mcq: ["went","goed","gone"]
  correct_answer jsonb,                     -- mcq/short_text: auto-graded; long_text: null
  points         int           not null default 1,
  unique (assignment_id, position)
);

-- One row per (assignment, student), created for every class member on publish.
create table submissions (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid              not null references assignments (id) on delete cascade,
  student_id     uuid              not null references profiles (id) on delete cascade,
  status         submission_status not null default 'assigned',
  attempt        int               not null default 1,
  text_answer    text,
  submitted_at   timestamptz,
  is_late        boolean           not null default false,
  auto_score     int,                         -- from quiz questions
  score          int,                         -- final, set by teacher
  feedback       text,
  graded_at      timestamptz,
  updated_at     timestamptz       not null default now(),
  unique (assignment_id, student_id)
);
create index on submissions (student_id, status);
create index on submissions (status) where status = 'submitted';  -- grading queue

create table submission_answers (
  submission_id  uuid  not null references submissions (id) on delete cascade,
  question_id    uuid  not null references assignment_questions (id) on delete cascade,
  answer         jsonb not null,
  is_correct     boolean,
  points_awarded int,
  primary key (submission_id, question_id)
);

create table submission_files (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions (id) on delete cascade,
  attempt       int  not null,
  storage_path  text not null,              -- submissions/<student_id>/<submission_id>/<file>
  file_name     text not null,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Free level test
-- ─────────────────────────────────────────────────────────────

create table test_questions (
  id             uuid primary key default gen_random_uuid(),
  level          cefr_level    not null,
  skill          test_skill    not null,
  prompt         text          not null,
  options        jsonb         not null,
  correct_answer jsonb         not null,
  media_path     text,                       -- audio for listening
  is_active      boolean       not null default true,
  created_at     timestamptz   not null default now()
);
create index on test_questions (level, skill) where is_active;

create table test_attempts (
  id              uuid primary key default gen_random_uuid(),
  status          test_attempt_status not null default 'started',
  locale          app_locale  not null,      -- language of instructions + result email (questions are always English)
  full_name       text,
  email           text,                      -- asked at the end, before the result
  lead_id         uuid references leads (id) on delete set null,
  student_id      uuid references profiles (id) on delete set null,  -- if a logged-in student retakes it
  started_at      timestamptz not null default now(),
  submitted_at    timestamptz,
  auto_score      int,
  auto_level      cefr_level,
  writing_prompt  text,
  writing_answer  text,
  final_level     cefr_level,                -- after teacher review of the writing part
  teacher_comment text,
  result_sent_at  timestamptz
);
create index on test_attempts (status, submitted_at desc);

create table test_answers (
  attempt_id    uuid  not null references test_attempts (id) on delete cascade,
  question_id   uuid  not null references test_questions (id),
  answer        jsonb not null,
  is_correct    boolean not null,
  primary key (attempt_id, question_id)
);

-- ─────────────────────────────────────────────────────────────
-- Notifications (one log for every email the app sends)
-- ─────────────────────────────────────────────────────────────

create table email_log (
  id            uuid primary key default gen_random_uuid(),
  to_email      text        not null,
  profile_id    uuid references profiles (id) on delete set null,
  template      text        not null,        -- 'homework_assigned', 'test_result', ...
  locale        app_locale  not null,
  ref_table     text,
  ref_id        uuid,
  dedupe_key    text unique,                 -- e.g. 'due_soon:<submission_id>' so cron never double-sends
  sent_at       timestamptz not null default now(),
  provider_id   text                         -- Resend message id
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security (YOUR AREA: sketch only, finalize in review)
-- ─────────────────────────────────────────────────────────────

create function is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'teacher');
$$;

alter table profiles             enable row level security;
alter table leads                enable row level security;
alter table packages             enable row level security;
alter table student_packages     enable row level security;
alter table classes              enable row level security;
alter table class_members        enable row level security;
alter table lessons              enable row level security;
alter table attendance           enable row level security;
alter table assignments          enable row level security;
alter table assignment_files     enable row level security;
alter table assignment_questions enable row level security;
alter table submissions          enable row level security;
alter table submission_answers   enable row level security;
alter table submission_files     enable row level security;
alter table test_questions       enable row level security;
alter table test_attempts        enable row level security;
alter table test_answers         enable row level security;
alter table email_log            enable row level security;

-- Pattern for every table: teacher can do everything.
--   create policy teacher_all on <table> for all using (is_teacher()) with check (is_teacher());
-- Student-facing reads (sketch):
--   packages:          anyone (anon) can select where is_published
--   profiles:          student selects own row (notes column exposed only via a view)
--   student_packages:  student selects where student_id = auth.uid()
--   classes/lessons:   student selects where member of class (via class_members)
--   assignments(+files,+questions): member of class AND published_at is not null
--                      (questions exposed via a view WITHOUT correct_answer)
--   submissions:       student selects/updates own row; update only while status in
--                      ('assigned','in_progress','resubmit_requested'); score/feedback
--                      columns writable by teacher only (column privileges or RPC)
--   submission_*:      via owning submission
--   leads, test_*:     no client access: written by server actions with the service role,
--                      so anonymous visitors never touch these tables directly
--   email_log:         teacher only

-- ─────────────────────────────────────────────────────────────
-- New auth user → profile (role student; promote the teacher by hand once)
-- ─────────────────────────────────────────────────────────────

create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'locale')::app_locale, 'fa')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
