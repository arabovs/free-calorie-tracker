-- Run this if you already have entries and need custom micronutrient columns

alter table entries add column if not exists custom_sodium_mg numeric;
alter table entries add column if not exists custom_vitamin_a_mcg numeric;
alter table entries add column if not exists custom_vitamin_c_mg numeric;
alter table entries add column if not exists custom_vitamin_d_mcg numeric;
alter table entries add column if not exists custom_vitamin_b12_mcg numeric;
alter table entries add column if not exists custom_iron_mg numeric;
alter table entries add column if not exists custom_calcium_mg numeric;
alter table entries add column if not exists custom_potassium_mg numeric;
