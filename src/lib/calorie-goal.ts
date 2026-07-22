/** Mifflin–St Jeor BMR + sedentary TDEE, then goal adjustment. */

export type Gender = "male" | "female";
export type WeightGoal = "maintain" | "lose" | "gain";

export type CalorieGoalInput = {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: Gender;
  goal: WeightGoal;
};

/** Sedentary multiplier — logged exercise is added on top of the daily goal. */
const ACTIVITY = 1.2;

const GOAL_DELTA: Record<WeightGoal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function calculateBmr(input: Omit<CalorieGoalInput, "goal">): number {
  const { weightKg, heightCm, ageYears, gender } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return gender === "male" ? base + 5 : base - 161;
}

export function calculateDailyCalorieGoal(input: CalorieGoalInput): number {
  const bmr = calculateBmr(input);
  const tdee = bmr * ACTIVITY;
  const goal = Math.round(tdee + GOAL_DELTA[input.goal]);
  return Math.max(1200, goal);
}

export function goalLabel(goal: WeightGoal): string {
  if (goal === "lose") return "Lose weight (−500 kcal)";
  if (goal === "gain") return "Gain weight (+300 kcal)";
  return "Maintain";
}
