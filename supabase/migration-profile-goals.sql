-- Profile: gender, age, weight goal for calorie calculation

alter table profile add column if not exists gender text
  check (gender is null or gender in ('male', 'female'));

alter table profile add column if not exists age_years numeric;

alter table profile add column if not exists weight_goal text
  check (weight_goal is null or weight_goal in ('maintain', 'lose', 'gain'));
