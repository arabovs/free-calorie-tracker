-- App users (name + avatar). Run in Supabase SQL Editor.

create table if not exists app_users (
  id text primary key,
  name text not null,
  avatar_url text not null,
  daily_calorie_goal numeric not null default 2500,
  created_at timestamptz not null default now()
);

alter table app_users enable row level security;
drop policy if exists "Allow all on app_users" on app_users;
create policy "Allow all on app_users" on app_users for all using (true) with check (true);

insert into app_users (id, name, avatar_url, daily_calorie_goal) values
  ('sim', 'Sim', '/avatars/sim-avatar.png', 2500),
  ('babait', 'Бабаит', '/avatars/babait-avatar.png', 2000)
on conflict (id) do nothing;

insert into profile (user_id, daily_calorie_goal) values
  ('sim', 2500),
  ('babait', 2000)
on conflict (user_id) do nothing;

-- Public avatars bucket for uploaded profile photos
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Public upload avatars" on storage.objects;
drop policy if exists "Public update avatars" on storage.objects;

create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Public upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

create policy "Public update avatars"
  on storage.objects for update
  using (bucket_id = 'avatars');
