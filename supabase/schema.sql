-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists pg_trgm;

create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  serving_size numeric not null default 1,
  serving_unit text not null default 'serving',
  calories numeric not null,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric not null default 0,
  sugar_g numeric not null default 0,
  sodium_mg numeric not null default 0,
  vitamin_a_mcg numeric not null default 0,
  vitamin_c_mg numeric not null default 0,
  vitamin_d_mcg numeric not null default 0,
  vitamin_b12_mcg numeric not null default 0,
  iron_mg numeric not null default 0,
  calcium_mg numeric not null default 0,
  potassium_mg numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  food_id uuid references foods(id) on delete cascade,
  quantity numeric not null default 1,
  meal text not null default 'snack' check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at date not null default current_date,
  notes text,
  custom_name text,
  custom_calories numeric,
  custom_protein_g numeric,
  custom_carbs_g numeric,
  custom_fat_g numeric,
  custom_saturated_fat_g numeric,
  custom_fiber_g numeric,
  custom_sugar_g numeric,
  custom_sodium_mg numeric,
  custom_vitamin_a_mcg numeric,
  custom_vitamin_c_mg numeric,
  custom_vitamin_d_mcg numeric,
  custom_vitamin_b12_mcg numeric,
  custom_iron_mg numeric,
  custom_calcium_mg numeric,
  custom_potassium_mg numeric,
  custom_creatine_g numeric,
  custom_omega3_g numeric,
  custom_vitamin_b1_mg numeric,
  custom_vitamin_b2_mg numeric,
  custom_vitamin_b6_mg numeric,
  custom_biotin_mcg numeric,
  custom_vitamin_e_mg numeric,
  custom_folate_mcg numeric,
  custom_vitamin_k_mcg numeric,
  custom_niacin_mg numeric,
  custom_pantothenate_mg numeric,
  custom_magnesium_mg numeric,
  custom_phosphorus_mg numeric,
  custom_chromium_mcg numeric,
  custom_iodine_mcg numeric,
  custom_molybdenum_mcg numeric,
  custom_selenium_mcg numeric,
  custom_zinc_mg numeric,
  user_id text not null default 'sim',
  created_at timestamptz not null default now(),
  check (
    (food_id is not null and custom_name is null)
    or (food_id is null and custom_name is not null)
  )
);

create index if not exists foods_name_idx on foods using gin (name gin_trgm_ops);
create index if not exists entries_logged_at_idx on entries (logged_at desc);
create index if not exists entries_user_logged_at_idx on entries (user_id, logged_at desc);

create table if not exists profile (
  user_id text primary key,
  height_cm numeric,
  daily_calorie_goal numeric not null default 2500,
  updated_at timestamptz not null default now()
);

insert into profile (user_id, daily_calorie_goal) values
  ('sim', 2500),
  ('babait', 2000)
on conflict (user_id) do nothing;

create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'sim',
  logged_at date not null,
  weight_kg numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, logged_at)
);

create index if not exists weight_logs_logged_at_idx on weight_logs (logged_at desc);

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'sim',
  logged_at date not null,
  exercise_type text not null check (exercise_type in ('walk', 'low', 'medium', 'hard')),
  calories_burned numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, logged_at, exercise_type)
);

create index if not exists exercise_logs_logged_at_idx on exercise_logs (logged_at desc);

alter table foods enable row level security;
alter table entries enable row level security;
alter table profile enable row level security;
alter table weight_logs enable row level security;
alter table exercise_logs enable row level security;

drop policy if exists "Allow all on foods" on foods;
drop policy if exists "Allow all on entries" on entries;
drop policy if exists "Allow all on profile" on profile;
drop policy if exists "Allow all on weight_logs" on weight_logs;
drop policy if exists "Allow all on exercise_logs" on exercise_logs;

create policy "Allow all on foods" on foods for all using (true) with check (true);
create policy "Allow all on entries" on entries for all using (true) with check (true);
create policy "Allow all on profile" on profile for all using (true) with check (true);
create policy "Allow all on weight_logs" on weight_logs for all using (true) with check (true);
create policy "Allow all on exercise_logs" on exercise_logs for all using (true) with check (true);
