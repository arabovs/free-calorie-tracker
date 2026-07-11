export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

export type Food = {
  id: string;
  name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  vitamin_a_mcg: number;
  vitamin_c_mg: number;
  vitamin_d_mcg: number;
  vitamin_b12_mcg: number;
  iron_mg: number;
  calcium_mg: number;
  potassium_mg: number;
};

export type Entry = {
  id: string;
  food_id: string | null;
  quantity: number;
  meal: Meal;
  logged_at: string;
  notes: string | null;
  custom_name: string | null;
  custom_calories: number | null;
  custom_protein_g: number | null;
  custom_carbs_g: number | null;
  custom_fat_g: number | null;
  custom_saturated_fat_g: number | null;
  custom_fiber_g: number | null;
  custom_sugar_g: number | null;
  custom_sodium_mg: number | null;
  custom_vitamin_a_mcg: number | null;
  custom_vitamin_c_mg: number | null;
  custom_vitamin_d_mcg: number | null;
  custom_vitamin_b12_mcg: number | null;
  custom_iron_mg: number | null;
  custom_calcium_mg: number | null;
  custom_potassium_mg: number | null;
  custom_creatine_g: number | null;
  custom_omega3_g: number | null;
  custom_vitamin_b1_mg: number | null;
  custom_vitamin_b2_mg: number | null;
  custom_vitamin_b6_mg: number | null;
  custom_biotin_mcg: number | null;
  custom_vitamin_e_mg: number | null;
  custom_folate_mcg: number | null;
  custom_vitamin_k_mcg: number | null;
  custom_niacin_mg: number | null;
  custom_pantothenate_mg: number | null;
  custom_magnesium_mg: number | null;
  custom_phosphorus_mg: number | null;
  custom_chromium_mcg: number | null;
  custom_iodine_mcg: number | null;
  custom_molybdenum_mcg: number | null;
  custom_selenium_mcg: number | null;
  custom_zinc_mg: number | null;
  food?: Food;
};

export type CustomEntryInput = {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  saturated_fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  vitamin_a_mcg: number;
  vitamin_c_mg: number;
  vitamin_d_mcg: number;
  vitamin_b12_mcg: number;
  iron_mg: number;
  calcium_mg: number;
  potassium_mg: number;
  creatine_g: number;
  omega3_g: number;
  vitamin_b1_mg: number;
  vitamin_b2_mg: number;
  vitamin_b6_mg: number;
  biotin_mcg: number;
  vitamin_e_mg: number;
  folate_mcg: number;
  vitamin_k_mcg: number;
  niacin_mg: number;
  pantothenate_mg: number;
  magnesium_mg: number;
  phosphorus_mg: number;
  chromium_mcg: number;
  iodine_mcg: number;
  molybdenum_mcg: number;
  selenium_mcg: number;
  zinc_mg: number;
};

export type NutritionTotals = Omit<CustomEntryInput, "name">;

export const EMPTY_TOTALS: NutritionTotals = {
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

export type Profile = {
  id: number;
  height_cm: number | null;
  daily_calorie_goal: number;
};

export type WeightLog = {
  id: string;
  logged_at: string;
  weight_kg: number;
};

export type ExerciseType = "walk" | "low" | "medium" | "hard";

export type ExerciseLog = {
  id: string;
  logged_at: string;
  exercise_type: ExerciseType;
  calories_burned: number;
};

export type DaySnapshot = {
  date: string;
  calories: number;
  weight_kg: number | null;
  weight_change_kg: number | null;
  goal_pct: number;
  exercise_summary: string;
  exercise_burn: number;
};

export type MonthSummary = {
  year: number;
  month: number;
  calorie_goal: number;
  days: DaySnapshot[];
  first_weight_kg: number | null;
  last_weight_kg: number | null;
  net_weight_change_kg: number | null;
  avg_calories: number;
  days_with_food: number;
  days_with_weight: number;
  days_with_exercise: number;
};
