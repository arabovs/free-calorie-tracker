import type { NutritionTotals } from "./types";

/** Daily targets: man ~35, healthy weight gain, general wellness (not athlete). */
export type DailyTarget = {
  key: keyof NutritionTotals;
  label: string;
  unit: string;
  value: number;
  type: "min" | "max";
  decimals?: number;
  hint?: string;
};

export const MACRO_TARGETS: DailyTarget[] = [
  { key: "protein_g", label: "Protein", unit: "g", value: 90, type: "min", decimals: 0 },
  { key: "carbs_g", label: "Carbs", unit: "g", value: 310, type: "min", decimals: 0 },
  { key: "fat_g", label: "Fat", unit: "g", value: 75, type: "min", decimals: 0 },
  { key: "fiber_g", label: "Fibre", unit: "g", value: 30, type: "min", decimals: 0 },
];

export const CREATINE_TARGET: DailyTarget = {
  key: "creatine_g",
  label: "Creatine",
  unit: "g",
  value: 5,
  type: "min",
  decimals: 1,
  hint: "1 dose daily",
};

export const OMEGA3_TARGET: DailyTarget = {
  key: "omega3_g",
  label: "Omega-3 (EPA+DHA)",
  unit: "g",
  value: 1,
  type: "min",
  decimals: 1,
  hint: "2 softgels",
};

export const SUPPLEMENT_TARGETS: DailyTarget[] = [CREATINE_TARGET, OMEGA3_TARGET];

export const MICRO_TARGETS: DailyTarget[] = [
  { key: "potassium_mg", label: "Potassium", unit: "mg", value: 3400, type: "min", decimals: 0 },
  { key: "calcium_mg", label: "Calcium", unit: "mg", value: 1000, type: "min", decimals: 0 },
  { key: "iron_mg", label: "Iron", unit: "mg", value: 8, type: "min", decimals: 1 },
  { key: "vitamin_a_mcg", label: "Vitamin A", unit: "mcg", value: 900, type: "min", decimals: 0 },
  { key: "vitamin_c_mg", label: "Vitamin C", unit: "mg", value: 90, type: "min", decimals: 0 },
  { key: "vitamin_d_mcg", label: "Vitamin D", unit: "mcg", value: 20, type: "min", decimals: 0 },
  { key: "vitamin_b12_mcg", label: "Vitamin B12", unit: "mcg", value: 2.4, type: "min", decimals: 1 },
  { key: "sugar_g", label: "Sugar", unit: "g", value: 50, type: "max", decimals: 0 },
  { key: "saturated_fat_g", label: "Saturated fat", unit: "g", value: 25, type: "max", decimals: 0 },
  { key: "sodium_mg", label: "Sodium", unit: "mg", value: 2300, type: "max", decimals: 0 },
];

export const TARGET_PROFILE_LABEL = "Men ~35 · healthy gain · general wellness";
