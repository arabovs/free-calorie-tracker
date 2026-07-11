-- Extended vitamins & minerals for multivitamin tracking

alter table entries add column if not exists custom_vitamin_b1_mg numeric;
alter table entries add column if not exists custom_vitamin_b2_mg numeric;
alter table entries add column if not exists custom_vitamin_b6_mg numeric;
alter table entries add column if not exists custom_biotin_mcg numeric;
alter table entries add column if not exists custom_vitamin_e_mg numeric;
alter table entries add column if not exists custom_folate_mcg numeric;
alter table entries add column if not exists custom_vitamin_k_mcg numeric;
alter table entries add column if not exists custom_niacin_mg numeric;
alter table entries add column if not exists custom_pantothenate_mg numeric;
alter table entries add column if not exists custom_magnesium_mg numeric;
alter table entries add column if not exists custom_phosphorus_mg numeric;
alter table entries add column if not exists custom_chromium_mcg numeric;
alter table entries add column if not exists custom_iodine_mcg numeric;
alter table entries add column if not exists custom_molybdenum_mcg numeric;
alter table entries add column if not exists custom_selenium_mcg numeric;
alter table entries add column if not exists custom_zinc_mg numeric;
