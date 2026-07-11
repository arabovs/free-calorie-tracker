import type { DaySnapshot, Entry, ExerciseLog, MonthSummary, WeightLog } from "./types";
import { monthRange } from "./dates";
import { formatExerciseSummary } from "./exercise";
import { entryNutrition } from "./nutrition";

export function caloriesByDate(entries: Entry[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const entry of entries) {
    const nutrition = entryNutrition(entry);
    if (!nutrition) continue;
    map.set(entry.logged_at, (map.get(entry.logged_at) ?? 0) + nutrition.calories);
  }

  return map;
}

function exercisesByDate(logs: ExerciseLog[]): Map<string, ExerciseLog[]> {
  const map = new Map<string, ExerciseLog[]>();
  for (const log of logs) {
    const list = map.get(log.logged_at) ?? [];
    list.push(log);
    map.set(log.logged_at, list);
  }
  return map;
}

export function buildMonthSummary(input: {
  year: number;
  month: number;
  calorieGoal: number;
  entries: Entry[];
  weightLogs: WeightLog[];
  exerciseLogs: ExerciseLog[];
}): MonthSummary {
  const { start, end } = monthRange(input.year, input.month);
  const calMap = caloriesByDate(input.entries);
  const exMap = exercisesByDate(input.exerciseLogs);

  const weightsInMonth = input.weightLogs
    .filter((w) => w.logged_at >= start && w.logged_at <= end)
    .sort((a, b) => a.logged_at.localeCompare(b.logged_at));

  const allWeights = [...input.weightLogs].sort((a, b) => a.logged_at.localeCompare(b.logged_at));

  const days: DaySnapshot[] = [];
  let cursor = start;

  while (cursor <= end) {
    const calories = calMap.get(cursor) ?? 0;
    const weightEntry = weightsInMonth.find((w) => w.logged_at === cursor);
    const weight_kg = weightEntry?.weight_kg ?? null;
    const dayExercises = exMap.get(cursor) ?? [];
    const exercise_burn = dayExercises.reduce((sum, e) => sum + e.calories_burned, 0);
    const effectiveGoal = input.calorieGoal + exercise_burn;

    let weight_change_kg: number | null = null;
    if (weight_kg !== null) {
      const prior = [...allWeights].reverse().find((w) => w.logged_at < cursor);
      if (prior) {
        weight_change_kg = weight_kg - prior.weight_kg;
      }
    }

    days.push({
      date: cursor,
      calories,
      weight_kg,
      weight_change_kg,
      goal_pct: effectiveGoal > 0 ? (calories / effectiveGoal) * 100 : 0,
      exercise_summary: formatExerciseSummary(dayExercises.map((e) => e.exercise_type)),
      exercise_burn,
    });

    const [y, m, d] = cursor.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    cursor = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
  }

  const daysWithFood = days.filter((d) => d.calories > 0);
  const daysWithExercise = days.filter((d) => d.exercise_summary.length > 0);
  const avgCalories =
    daysWithFood.length > 0
      ? daysWithFood.reduce((sum, d) => sum + d.calories, 0) / daysWithFood.length
      : 0;

  const first_weight_kg = weightsInMonth[0]?.weight_kg ?? null;
  const last_weight_kg = weightsInMonth[weightsInMonth.length - 1]?.weight_kg ?? null;
  const net_weight_change_kg =
    first_weight_kg !== null && last_weight_kg !== null ? last_weight_kg - first_weight_kg : null;

  return {
    year: input.year,
    month: input.month,
    calorie_goal: input.calorieGoal,
    days,
    first_weight_kg,
    last_weight_kg,
    net_weight_change_kg,
    avg_calories: avgCalories,
    days_with_food: daysWithFood.length,
    days_with_weight: weightsInMonth.length,
    days_with_exercise: daysWithExercise.length,
  };
}

export function formatWeightChange(kg: number | null) {
  if (kg === null) return null;
  const sign = kg > 0 ? "+" : "";
  return `${sign}${kg.toFixed(1)} kg`;
}
