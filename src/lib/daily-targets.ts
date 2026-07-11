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

/** 1 g protein per lb body weight. */
const KG_TO_LB = 2.2046226218;

export const DEFAULT_PROTEIN_TARGET_G = 90;

export function proteinTargetG(weightKg: number): number {
  return Math.round(weightKg * KG_TO_LB);
}

export function getMacroTargets(weightKg: number | null): DailyTarget[] {
  const proteinTarget =
    weightKg !== null && weightKg > 0 ? proteinTargetG(weightKg) : DEFAULT_PROTEIN_TARGET_G;

  return [
    {
      key: "protein_g",
      label: "Protein",
      unit: "g",
      value: proteinTarget,
      type: "min",
      decimals: 0,
      hint: weightKg !== null ? "1 g/lb" : "log weight",
    },
    { key: "carbs_g", label: "Carbs", unit: "g", value: 310, type: "min", decimals: 0 },
    { key: "fat_g", label: "Fat", unit: "g", value: 75, type: "min", decimals: 0 },
    { key: "fiber_g", label: "Fibre", unit: "g", value: 30, type: "min", decimals: 0 },
  ];
}

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
  { key: "magnesium_mg", label: "Magnesium", unit: "mg", value: 420, type: "min", decimals: 0 },
  { key: "phosphorus_mg", label: "Phosphorus", unit: "mg", value: 700, type: "min", decimals: 0 },
  { key: "iron_mg", label: "Iron", unit: "mg", value: 8, type: "min", decimals: 1 },
  { key: "zinc_mg", label: "Zinc", unit: "mg", value: 11, type: "min", decimals: 1 },
  { key: "selenium_mcg", label: "Selenium", unit: "mcg", value: 55, type: "min", decimals: 0 },
  { key: "iodine_mcg", label: "Iodine", unit: "mcg", value: 150, type: "min", decimals: 0 },
  { key: "chromium_mcg", label: "Chromium", unit: "mcg", value: 35, type: "min", decimals: 0 },
  { key: "molybdenum_mcg", label: "Molybdenum", unit: "mcg", value: 45, type: "min", decimals: 1 },
  { key: "vitamin_a_mcg", label: "Vitamin A", unit: "mcg", value: 900, type: "min", decimals: 0 },
  { key: "vitamin_c_mg", label: "Vitamin C", unit: "mg", value: 90, type: "min", decimals: 0 },
  { key: "vitamin_d_mcg", label: "Vitamin D", unit: "mcg", value: 20, type: "min", decimals: 0 },
  { key: "vitamin_e_mg", label: "Vitamin E", unit: "mg", value: 15, type: "min", decimals: 0 },
  { key: "vitamin_k_mcg", label: "Vitamin K", unit: "mcg", value: 120, type: "min", decimals: 0 },
  { key: "vitamin_b1_mg", label: "Vitamin B1", unit: "mg", value: 1.2, type: "min", decimals: 1 },
  { key: "vitamin_b2_mg", label: "Vitamin B2", unit: "mg", value: 1.3, type: "min", decimals: 1 },
  { key: "vitamin_b6_mg", label: "Vitamin B6", unit: "mg", value: 1.7, type: "min", decimals: 1 },
  { key: "vitamin_b12_mcg", label: "Vitamin B12", unit: "mcg", value: 2.4, type: "min", decimals: 1 },
  { key: "folate_mcg", label: "Folate", unit: "mcg", value: 400, type: "min", decimals: 0 },
  { key: "biotin_mcg", label: "Biotin", unit: "mcg", value: 30, type: "min", decimals: 0 },
  { key: "niacin_mg", label: "Niacin", unit: "mg", value: 16, type: "min", decimals: 0 },
  { key: "pantothenate_mg", label: "B5", unit: "mg", value: 5, type: "min", decimals: 0 },
  { key: "sugar_g", label: "Sugar", unit: "g", value: 50, type: "max", decimals: 0 },
  { key: "saturated_fat_g", label: "Saturated fat", unit: "g", value: 25, type: "max", decimals: 0 },
  { key: "sodium_mg", label: "Sodium", unit: "mg", value: 2300, type: "max", decimals: 0 },
];

export const TARGET_PROFILE_LABEL = "Men ~35 · healthy gain · general wellness";

const MICRO_PROGRESS_PCT = 75;

export function isMicroTargetAt75(current: number, target: DailyTarget): boolean {
  if (target.value <= 0) return false;
  const pct = (current / target.value) * 100;
  return target.type === "min" ? pct >= MICRO_PROGRESS_PCT : pct <= MICRO_PROGRESS_PCT;
}

export function countMicroTargetsAt75(
  targets: DailyTarget[],
  totals: NutritionTotals,
): { good: number; total: number } {
  let good = 0;
  for (const target of targets) {
    if (isMicroTargetAt75(totals[target.key], target)) good++;
  }
  return { good, total: targets.length };
}
