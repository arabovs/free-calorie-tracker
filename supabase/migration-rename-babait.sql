-- Rename kaybe → babait (Бабаит) if the multi-user migration already ran with kaybe.

update profile set user_id = 'babait' where user_id = 'kaybe';
update entries set user_id = 'babait' where user_id = 'kaybe';
update weight_logs set user_id = 'babait' where user_id = 'kaybe';
update exercise_logs set user_id = 'babait' where user_id = 'kaybe';

insert into profile (user_id, daily_calorie_goal)
values ('babait', 2000)
on conflict (user_id) do nothing;
