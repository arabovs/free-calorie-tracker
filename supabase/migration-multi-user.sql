-- Multi-user: Sim + Бабаит. Existing data is attributed to Sim.
-- Run once in Supabase SQL Editor.

create table if not exists user_profiles (
  user_id text primary key,
  height_cm numeric,
  daily_calorie_goal numeric not null default 2500,
  updated_at timestamptz not null default now()
);

-- Carry over singleton profile → Sim (safe if old profile table still exists)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'profile' and column_name = 'id'
  ) then
    insert into user_profiles (user_id, height_cm, daily_calorie_goal, updated_at)
    select 'sim', height_cm, coalesce(daily_calorie_goal, 2500), coalesce(updated_at, now())
    from profile
    on conflict (user_id) do nothing;
  end if;
end $$;

insert into user_profiles (user_id, daily_calorie_goal)
values ('sim', 2500), ('babait', 2000)
on conflict (user_id) do nothing;

drop table if exists profile cascade;
alter table user_profiles rename to profile;

alter table profile enable row level security;
drop policy if exists "Allow all on profile" on profile;
create policy "Allow all on profile" on profile for all using (true) with check (true);

alter table entries add column if not exists user_id text;
update entries set user_id = 'sim' where user_id is null;
alter table entries alter column user_id set default 'sim';
alter table entries alter column user_id set not null;
create index if not exists entries_user_logged_at_idx on entries (user_id, logged_at desc);

alter table weight_logs add column if not exists user_id text;
update weight_logs set user_id = 'sim' where user_id is null;
alter table weight_logs alter column user_id set default 'sim';
alter table weight_logs alter column user_id set not null;
alter table weight_logs drop constraint if exists weight_logs_logged_at_key;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'weight_logs_user_logged_at_key'
  ) then
    alter table weight_logs add constraint weight_logs_user_logged_at_key unique (user_id, logged_at);
  end if;
end $$;

alter table exercise_logs add column if not exists user_id text;
update exercise_logs set user_id = 'sim' where user_id is null;
alter table exercise_logs alter column user_id set default 'sim';
alter table exercise_logs alter column user_id set not null;
alter table exercise_logs drop constraint if exists exercise_logs_logged_at_exercise_type_key;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'exercise_logs_user_day_type_key'
  ) then
    alter table exercise_logs add constraint exercise_logs_user_day_type_key unique (user_id, logged_at, exercise_type);
  end if;
end $$;
