import type { CustomEntryInput, Entry, Food, NutritionTotals } from "./types";
import { EMPTY_TOTALS } from "./types";

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
  };
}

export function customToNutrition(custom: CustomEntryInput): NutritionTotals {
  return {
    calories: custom.calories,
    protein_g: custom.protein_g,
    carbs_g: custom.carbs_g,
    fat_g: custom.fat_g,
    saturated_fat_g: custom.saturated_fat_g,
    fiber_g: custom.fiber_g,
    sugar_g: custom.sugar_g,
    sodium_mg: custom.sodium_mg,
    vitamin_a_mcg: custom.vitamin_a_mcg,
    vitamin_c_mg: custom.vitamin_c_mg,
    vitamin_d_mcg: custom.vitamin_d_mcg,
    vitamin_b12_mcg: custom.vitamin_b12_mcg,
    iron_mg: custom.iron_mg,
    calcium_mg: custom.calcium_mg,
    potassium_mg: custom.potassium_mg,
    creatine_g: custom.creatine_g,
    omega3_g: custom.omega3_g,
  };
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

    return {
      calories: totals.calories + nutrition.calories,
      protein_g: totals.protein_g + nutrition.protein_g,
      carbs_g: totals.carbs_g + nutrition.carbs_g,
      fat_g: totals.fat_g + nutrition.fat_g,
      saturated_fat_g: totals.saturated_fat_g + nutrition.saturated_fat_g,
      fiber_g: totals.fiber_g + nutrition.fiber_g,
      sugar_g: totals.sugar_g + nutrition.sugar_g,
      sodium_mg: totals.sodium_mg + nutrition.sodium_mg,
      vitamin_a_mcg: totals.vitamin_a_mcg + nutrition.vitamin_a_mcg,
      vitamin_c_mg: totals.vitamin_c_mg + nutrition.vitamin_c_mg,
      vitamin_d_mcg: totals.vitamin_d_mcg + nutrition.vitamin_d_mcg,
      vitamin_b12_mcg: totals.vitamin_b12_mcg + nutrition.vitamin_b12_mcg,
      iron_mg: totals.iron_mg + nutrition.iron_mg,
      calcium_mg: totals.calcium_mg + nutrition.calcium_mg,
      potassium_mg: totals.potassium_mg + nutrition.potassium_mg,
      creatine_g: totals.creatine_g + nutrition.creatine_g,
      omega3_g: totals.omega3_g + nutrition.omega3_g,
    };
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
