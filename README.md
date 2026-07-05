# Meal Rotation Planner

Plan a repeating weekly meal rotation, put it on a real calendar, and share it with your
household — no accounts required.

## What it does

- Build a meal rotation of any length (e.g. 8 weeks). For each day (Monday–Sunday) in each
  week, set a meal name, a recipe link, an ingredient list, and notes.
- Pick a start date and the rotation is projected onto the actual calendar, repeating forever
  after the last week — so you always know what's for dinner on any given date without having
  to track which week of the cycle you're on.
- Share a plan via two links: an **edit link** (full access) and a **view & shopping link**
  (read-only calendar, plus grocery checkbox collaboration) — perfect for a spouse or partner.
- Weekly grocery list: ingredients needed that week are aggregated automatically, and anyone
  with a share link can check items off as they're bought.
- Skip a day or a whole week (date night, vacation, etc.) — everything after it shifts forward
  instead of being lost, so nothing in the rotation is skipped, just delayed.

## Getting started (local development)

You need a Postgres database to run this locally (see below for how to get one for free in
under a minute if you don't already have one).

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL
npx prisma migrate deploy   # creates the tables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. **Create a Postgres database.** Easiest path: `vercel link` this project, then in the
   Vercel dashboard go to your project → **Storage** → **Create Database** → Postgres (Neon).
   It will offer to add `DATABASE_URL` to your project's environment variables automatically.
2. **Apply the schema to that database** (one-time, and again after future schema changes):
   ```bash
   vercel env pull .env          # pulls DATABASE_URL from the Vercel project
   npx prisma migrate deploy
   ```
3. **Deploy:**
   ```bash
   npx vercel --prod
   ```
   (or push to the branch/repo you've connected in the Vercel dashboard for automatic deploys)

That's it — no other environment variables are required. Access to a plan is capability-based
(the edit/share links themselves are the credentials), so there's no auth provider to configure.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, with Prisma/PostgreSQL for storage. Access to
a plan is capability-based: possession of its edit or share link determines what you can do,
there are no user accounts.
