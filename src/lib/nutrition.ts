import type { CustomEntryInput, Entry, Food, NutritionTotals } from "./types";
import { EMPTY_TOTALS } from "./types";

function sumTotals(a: NutritionTotals, b: NutritionTotals): NutritionTotals {
  const out = { ...a };
  for (const key of Object.keys(EMPTY_TOTALS) as (keyof NutritionTotals)[]) {
    out[key] = a[key] + b[key];
  }
  return out;
}

export function scaleFood(food: Food, quantity: number): NutritionTotals {
  const factor = quantity / food.serving_size;

  return {
    calories: food.calories * factor,
    protein_g: food.protein_g * factor,
    carbs_g: food.carbs_g * factor,
    fat_g: food.fat_g * factor,
    saturated_fat_g: 0,
    fiber_g: food.fiber_g * factor,
    sugar_g: food.sugar_g * factor,
    sodium_mg: food.sodium_mg * factor,
    vitamin_a_mcg: food.vitamin_a_mcg * factor,
    vitamin_c_mg: food.vitamin_c_mg * factor,
    vitamin_d_mcg: food.vitamin_d_mcg * factor,
    vitamin_b12_mcg: food.vitamin_b12_mcg * factor,
    iron_mg: food.iron_mg * factor,
    calcium_mg: food.calcium_mg * factor,
    potassium_mg: food.potassium_mg * factor,
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
}

export function customToNutrition(custom: CustomEntryInput): NutritionTotals {
  return { ...custom };
}

export function entryNutrition(entry: Entry): NutritionTotals | null {
  if (entry.custom_name) {
    return customToNutrition({
      name: entry.custom_name,
      calories: entry.custom_calories ?? 0,
      protein_g: entry.custom_protein_g ?? 0,
      carbs_g: entry.custom_carbs_g ?? 0,
      fat_g: entry.custom_fat_g ?? 0,
      saturated_fat_g: entry.custom_saturated_fat_g ?? 0,
      fiber_g: entry.custom_fiber_g ?? 0,
      sugar_g: entry.custom_sugar_g ?? 0,
      sodium_mg: entry.custom_sodium_mg ?? 0,
      vitamin_a_mcg: entry.custom_vitamin_a_mcg ?? 0,
      vitamin_c_mg: entry.custom_vitamin_c_mg ?? 0,
      vitamin_d_mcg: entry.custom_vitamin_d_mcg ?? 0,
      vitamin_b12_mcg: entry.custom_vitamin_b12_mcg ?? 0,
      iron_mg: entry.custom_iron_mg ?? 0,
      calcium_mg: entry.custom_calcium_mg ?? 0,
      potassium_mg: entry.custom_potassium_mg ?? 0,
      creatine_g: entry.custom_creatine_g ?? 0,
      omega3_g: entry.custom_omega3_g ?? 0,
      vitamin_b1_mg: entry.custom_vitamin_b1_mg ?? 0,
      vitamin_b2_mg: entry.custom_vitamin_b2_mg ?? 0,
      vitamin_b6_mg: entry.custom_vitamin_b6_mg ?? 0,
      biotin_mcg: entry.custom_biotin_mcg ?? 0,
      vitamin_e_mg: entry.custom_vitamin_e_mg ?? 0,
      folate_mcg: entry.custom_folate_mcg ?? 0,
      vitamin_k_mcg: entry.custom_vitamin_k_mcg ?? 0,
      niacin_mg: entry.custom_niacin_mg ?? 0,
      pantothenate_mg: entry.custom_pantothenate_mg ?? 0,
      magnesium_mg: entry.custom_magnesium_mg ?? 0,
      phosphorus_mg: entry.custom_phosphorus_mg ?? 0,
      chromium_mcg: entry.custom_chromium_mcg ?? 0,
      iodine_mcg: entry.custom_iodine_mcg ?? 0,
      molybdenum_mcg: entry.custom_molybdenum_mcg ?? 0,
      selenium_mcg: entry.custom_selenium_mcg ?? 0,
      zinc_mg: entry.custom_zinc_mg ?? 0,
    });
  }

  if (entry.food) {
    return scaleFood(entry.food, entry.quantity);
  }

  return null;
}

export function sumNutrition(entries: Entry[]): NutritionTotals {
  return entries.reduce((totals, entry) => {
    const nutrition = entryNutrition(entry);
    if (!nutrition) return totals;
    return sumTotals(totals, nutrition);
  }, { ...EMPTY_TOTALS });
}

export function formatNum(value: number, decimals = 0) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

export function entryLabel(entry: Entry): string {
  return entry.custom_name ?? entry.food?.name ?? "Unknown";
}
