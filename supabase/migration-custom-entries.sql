-- Run this if you already created the tables from an earlier schema.sql

alter table entries alter column food_id drop not null;

alter table entries add column if not exists custom_name text;
alter table entries add column if not exists custom_calories numeric;
alter table entries add column if not exists custom_protein_g numeric;
alter table entries add column if not exists custom_carbs_g numeric;
alter table entries add column if not exists custom_fat_g numeric;
alter table entries add column if not exists custom_saturated_fat_g numeric;
alter table entries add column if not exists custom_fiber_g numeric;
alter table entries add column if not exists custom_sugar_g numeric;
alter table entries add column if not exists custom_sodium_mg numeric;
alter table entries add column if not exists custom_vitamin_a_mcg numeric;
alter table entries add column if not exists custom_vitamin_c_mg numeric;
alter table entries add column if not exists custom_vitamin_d_mcg numeric;
alter table entries add column if not exists custom_vitamin_b12_mcg numeric;
alter table entries add column if not exists custom_iron_mg numeric;
alter table entries add column if not exists custom_calcium_mg numeric;
alter table entries add column if not exists custom_potassium_mg numeric;

alter table entries drop constraint if exists entries_food_or_custom_check;
alter table entries add constraint entries_food_or_custom_check check (
  (food_id is not null and custom_name is null)
  or (food_id is null and custom_name is not null)
);
