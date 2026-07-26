-- Emoji passcode for app users. Run in Supabase SQL Editor.

alter table app_users
  add column if not exists emoji_palette text[],
  add column if not exists emoji_password_hash text;

comment on column app_users.emoji_palette is 'Fixed set of 9 emojis for this user';
comment on column app_users.emoji_password_hash is 'SHA-256 of userId:emoji1|emoji2|emoji3';
