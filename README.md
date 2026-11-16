# English Studio

Bilingual (Persian / English) website for an English teacher: public site, free level test, student homework portal and teacher panel.

## Getting started

Requires Node 20+ and Docker Desktop (for the local database).

```bash
npm install
cp .env.example .env.local   # then fill in the keys printed by db:start
npm run db:start             # local Supabase, applies migrations + seed
npm run dev                  # http://localhost:3000 → redirects to /fa
```

## Docs

- [User scenarios](docs/user-scenarios.md): what the app does, scenario by scenario
- [Schema](docs/schema.md): tables, ER diagram, design decisions
- [CLAUDE.md](CLAUDE.md): conventions for working in this repo

## Environments

| Env | App | Database |
|---|---|---|
| Local | `npm run dev` | Supabase CLI in Docker |
| Preview | Vercel preview per PR | Supabase staging project |
| Production | Vercel, from `main` | Supabase production project |

Migrations run through `.github/workflows/migrate.yml`: staging on PRs, production after merge, with approval.

## Accounts

People don't sign up. The teacher invites students from the panel, and the invite email lets them choose a password.

The first teacher account is made by hand, once per Supabase project:

1. Supabase dashboard → Authentication → Users → *Add user*: your email and a password, with "Auto confirm user" on. The database creates a profile for it, as a student.
2. SQL editor: `update profiles set role = 'teacher' where email = 'you@example.com';`
3. Log in at `/login`. Teachers land on `/panel`, students on `/dashboard`.

Login links (invite, "email me a link", password reset) are sent through Resend. In development without `RESEND_API_KEY`, the link is printed in the `npm run dev` terminal instead.
