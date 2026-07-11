export type ExerciseType = "walk" | "low" | "medium" | "hard";

export type ExerciseOption = {
  id: ExerciseType;
  label: string;
  summary: string;
  calories_burned: number;
};

export const EXERCISES: ExerciseOption[] = [
  { id: "walk", label: "Walk", summary: "~30 min · +180 kcal", calories_burned: 180 },
  { id: "low", label: "Low", summary: "Light · +220 kcal", calories_burned: 220 },
  { id: "medium", label: "Medium", summary: "Moderate · +380 kcal", calories_burned: 380 },
  { id: "hard", label: "Hard", summary: "Intense · +550 kcal", calories_burned: 550 },
];

export function getExerciseOption(id: ExerciseType): ExerciseOption {
  const found = EXERCISES.find((e) => e.id === id);
  if (!found) throw new Error(`Unknown exercise: ${id}`);
  return found;
}

export function formatExerciseSummary(types: ExerciseType[]): string {
  if (types.length === 0) return "";
  const labels = types.map((id) => getExerciseOption(id).label);
  return labels.join(", ");
}

export function totalExerciseBurn(logs: { calories_burned: number }[]): number {
  return logs.reduce((sum, log) => sum + log.calories_burned, 0);
}
