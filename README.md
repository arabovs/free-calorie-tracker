# Free Calorie Tracker

Personal calorie, macro, and vitamin tracker built with **Next.js** and **Supabase**. No ads, no accounts — just you and your food log.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Copy your project URL and anon key from **Settings → API**

### 2. Configure environment

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Load starter foods**, and start logging.

## Features

- **Daily dashboard** — calories, protein, carbs, fat at a glance
- **Micros & vitamins** — fiber, sodium, potassium, calcium, iron, A/C/D/B12
- **Food search** — type "eggs" and see protein per serving instantly
- **Quick picks** — one-tap common foods (egg, chicken, banana, salmon…)
- **Custom items** — log anything with name, calories, protein, carbs, fat, saturated fat, fibre, and sugars
- **Calorie goal bar** — 2500 kcal daily target with progress fill
- **Weight tracking** — log kg daily, see gain/loss vs last weigh-in
- **Monthly summary** — calories, weight, and trends per day
- **Mobile-first** — works great on phone and desktop
- **Date navigation** — browse any day's log

## Stack

- Next.js 16 (App Router)
- Supabase (Postgres)
- Tailwind CSS 4
