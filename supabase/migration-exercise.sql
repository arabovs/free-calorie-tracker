-- Run if you already set up the database before exercise tracking

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  logged_at date not null,
  exercise_type text not null check (exercise_type in ('walk', 'low', 'medium', 'hard')),
  calories_burned numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (logged_at, exercise_type)
);

create index if not exists exercise_logs_logged_at_idx on exercise_logs (logged_at desc);

alter table exercise_logs enable row level security;

drop policy if exists "Allow all on exercise_logs" on exercise_logs;
create policy "Allow all on exercise_logs" on exercise_logs for all using (true) with check (true);
