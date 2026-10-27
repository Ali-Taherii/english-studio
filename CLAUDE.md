# English Studio

Website for a one-teacher English school: public site, free level test, student portal (homework), teacher panel.

@AGENTS.md

## Stack
Next.js 16 (App Router, `src/`), TypeScript strict, Tailwind v4, Supabase (Postgres, Auth, Storage), Resend, Vercel. npm, not pnpm.

## Commands
- `npm run dev` / `npm run build` / `npm run lint` / `npm run typecheck`
- `npm run check:i18n`: fa.json and en.json must have the same keys
- `npm run db:start`, `npm run db:reset` (migrations + seed), `npm run db:types` (needs Docker running)

## Layout
- `src/app/[lang]/`: every route lives under the locale (`fa` default, RTL; `en` LTR). `src/proxy.ts` redirects `/` and saves the choice in a cookie.
- `src/i18n/`: `config.ts` (locales, dir), `dictionaries.ts` (`getDictionary()`, `getLocale()` via `next/root-params`), `messages/{fa,en}.json`.
- `src/lib/format.ts`: dates (Jalali in fa) and numbers. Format only at display time.
- `supabase/migrations/`: the only way to change the schema. `docs/schema.sql` is a readable copy of the first version.

## Specs
- Scenarios: `docs/user-scenarios.md` (S1–S25, L1–L6). Tasks name them: "implement S14".
- Schema decisions: `docs/schema.md`.
- Design system (tokens, README): https://claude.ai/artifact/1pcRvocsCVqbCbj7dntbay. Screens: https://claude.ai/artifact/2tvGSLEbxsmLtvtEKrSqAr

## Rules
- UI text never hard-coded: add the key to BOTH message files.
- Logical CSS only (`ms-`/`me-`/`ps-`/`pe-`, `start`/`end`), never left/right. English inside Persian goes in `<bdi>`; user-typed fields get `dir="auto"`.
- Colours and radii only from the theme tokens in `globals.css`.
- Owner-reviewed areas (see `.github/CODEOWNERS`): migrations and RLS, auth, grading, payments. Propose changes there, don't land them unreviewed.
- Visitors never write to tables directly: contact form and level test go through server actions with the service role.
- Payments are Phase 6; packages are granted manually until then.
