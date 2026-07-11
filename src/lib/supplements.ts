import type { CustomEntryInput } from "./types";

export type SupplementId = "creatine" | "multivitamin" | "protein_shake" | "omega3";

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
};

export const MULTIVITAMIN_TABLET: CustomEntryInput = {
  ...emptyMacros,
  name: "Multivitamin (1 tablet)",
  calories: 5,
  carbs_g: 1,
  vitamin_a_mcg: 900,
  vitamin_c_mg: 90,
  vitamin_d_mcg: 25,
  vitamin_b12_mcg: 6,
  calcium_mg: 210,
};

export const CREATINE_DOSE: CustomEntryInput = {
  ...emptyMacros,
  name: "Creatine (1 dose)",
  creatine_g: 5,
};

export const PROTEIN_SHAKE: CustomEntryInput = {
  ...emptyMacros,
  name: "Whey protein shake",
  calories: 120,
  protein_g: 24,
  carbs_g: 3,
  fat_g: 1.5,
  sugar_g: 2,
  sodium_mg: 130,
  calcium_mg: 120,
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
    summary: "A, C, D, B12, calcium · ~5 kcal",
    preset: MULTIVITAMIN_TABLET,
  },
  {
    id: "protein_shake",
    label: "+ 1 protein shake",
    summary: "24g protein · ~120 kcal",
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
