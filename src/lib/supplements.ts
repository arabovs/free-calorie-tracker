import type { CustomEntryInput } from "./types";

export type SupplementId = "creatine" | "multivitamin" | "whey_protein" | "protein_shake" | "omega3";

export type SupplementPreset = {
  id: SupplementId;
  label: string;
  summary: string;
  preset: CustomEntryInput;
};

const emptyMacros: CustomEntryInput = {
  name: "",
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  saturated_fat_g: 0,
  fiber_g: 0,
  sugar_g: 0,
  sodium_mg: 0,
  vitamin_a_mcg: 0,
  vitamin_c_mg: 0,
  vitamin_d_mcg: 0,
  vitamin_b12_mcg: 0,
  iron_mg: 0,
  calcium_mg: 0,
  potassium_mg: 0,
  creatine_g: 0,
  omega3_g: 0,
  vitamin_b1_mg: 0,
  vitamin_b2_mg: 0,
  vitamin_b6_mg: 0,
  biotin_mcg: 0,
  vitamin_e_mg: 0,
  folate_mcg: 0,
  vitamin_k_mcg: 0,
  niacin_mg: 0,
  pantothenate_mg: 0,
  magnesium_mg: 0,
  phosphorus_mg: 0,
  chromium_mcg: 0,
  iodine_mcg: 0,
  molybdenum_mcg: 0,
  selenium_mcg: 0,
  zinc_mg: 0,
};

/** Per 1 tablet label (user multivitamin). */
export const MULTIVITAMIN_TABLET: CustomEntryInput = {
  ...emptyMacros,
  name: "Multivitamin (1 tablet)",
  calories: 5,
  carbs_g: 1,
  vitamin_a_mcg: 400,
  vitamin_c_mg: 200,
  vitamin_d_mcg: 5,
  vitamin_b12_mcg: 3.75,
  vitamin_b1_mg: 1.65,
  vitamin_b2_mg: 2.1,
  vitamin_b6_mg: 2.1,
  biotin_mcg: 75,
  vitamin_e_mg: 12,
  folate_mcg: 400,
  vitamin_k_mcg: 20,
  niacin_mg: 16,
  pantothenate_mg: 6,
  calcium_mg: 200,
  magnesium_mg: 100,
  phosphorus_mg: 125,
  chromium_mcg: 12,
  iodine_mcg: 100,
  molybdenum_mcg: 12.5,
  selenium_mcg: 30,
  zinc_mg: 5,
};

export const CREATINE_DOSE: CustomEntryInput = {
  ...emptyMacros,
  name: "Creatine (1 dose)",
  creatine_g: 5,
};

export const WHEY_PROTEIN: CustomEntryInput = {
  ...emptyMacros,
  name: "Whey protein (1 scoop)",
  calories: 120,
  protein_g: 24,
  carbs_g: 3,
  fat_g: 1.5,
  sugar_g: 2,
  sodium_mg: 130,
  calcium_mg: 100,
  potassium_mg: 150,
  vitamin_b12_mcg: 0.5,
};

export const PROTEIN_SHAKE: CustomEntryInput = {
  ...emptyMacros,
  name: "Gainer shake (1 scoop)",
  calories: 180,
  protein_g: 12.4,
  carbs_g: 32.5,
};

/** Typical 1000mg fish oil softgel, ~500mg EPA+DHA combined. */
export const OMEGA3_SOFTGEL: CustomEntryInput = {
  ...emptyMacros,
  name: "Omega-3 (1 softgel)",
  calories: 10,
  fat_g: 1,
  omega3_g: 0.5,
};

export const SUPPLEMENTS: SupplementPreset[] = [
  {
    id: "creatine",
    label: "+ 1 creatine dose",
    summary: "5g monohydrate · 0 kcal",
    preset: CREATINE_DOSE,
  },
  {
    id: "multivitamin",
    label: "+ 1 multivitamin",
    summary: "Full spectrum · ~5 kcal",
    preset: MULTIVITAMIN_TABLET,
  },
  {
    id: "whey_protein",
    label: "+ 1 whey scoop",
    summary: "24g protein · 3g carbs · ~120 kcal",
    preset: WHEY_PROTEIN,
  },
  {
    id: "protein_shake",
    label: "+ 1 gainer scoop",
    summary: "12.4g protein · 32.5g carbs · ~180 kcal",
    preset: PROTEIN_SHAKE,
  },
  {
    id: "omega3",
    label: "+ 1 omega-3",
    summary: "500mg EPA+DHA · ~10 kcal",
    preset: OMEGA3_SOFTGEL,
  },
];

export function getSupplementPreset(id: SupplementId): CustomEntryInput {
  const found = SUPPLEMENTS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown supplement: ${id}`);
  return found.preset;
}
