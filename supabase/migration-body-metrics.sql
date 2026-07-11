-- Run if you already set up the database before body metrics were added

create table if not exists profile (
  id int primary key default 1 check (id = 1),
  height_cm numeric,
  daily_calorie_goal numeric not null default 2500,
  updated_at timestamptz not null default now()
);

insert into profile (id) values (1) on conflict (id) do nothing;

create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  logged_at date not null unique,
  weight_kg numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists weight_logs_logged_at_idx on weight_logs (logged_at desc);

alter table profile enable row level security;
alter table weight_logs enable row level security;

drop policy if exists "Allow all on profile" on profile;
drop policy if exists "Allow all on weight_logs" on weight_logs;

create policy "Allow all on profile" on profile for all using (true) with check (true);
create policy "Allow all on weight_logs" on weight_logs for all using (true) with check (true);
