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

## Getting started

```bash
npm install
cp .env.example .env
npx prisma migrate deploy   # creates the local SQLite database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, with Prisma/SQLite for storage. Access to a
plan is capability-based: possession of its edit or share link determines what you can do,
there are no user accounts.
