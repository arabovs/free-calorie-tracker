"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getPreviousWeight, updateProfile, upsertWeight } from "@/app/actions";
import { ExerciseButtons } from "@/components/exercise-buttons";
import { MacroPieCharts } from "@/components/macro-pie-charts";
import { calculateDailyCalorieGoal } from "@/lib/calorie-goal";
import { formatWeightChange } from "@/lib/month-summary";
import { formatExerciseSummary } from "@/lib/exercise";
import { formatNum } from "@/lib/nutrition";
import type { ExerciseLog, Gender, NutritionTotals, Profile, WeightGoal, WeightLog } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-emerald-500 focus:ring-2";

function MaleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <circle cx="12" cy="7" r="3.5" />
      <path strokeLinecap="round" d="M6 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
    </svg>
  );
}

function FemaleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <circle cx="12" cy="6.5" r="3.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 20c0-2.8 1.6-4.5 3.5-4.5s3.5 1.7 3.5 4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5h6l-1.2 4H10.2L9 12.5z" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 4.5L7 14h4l-1 5.5L17 10h-4l1-5.5z" />
    </svg>
  );
}

type Props = {
  date: string;
  calories: number;
  goal: number;
  exerciseBurn: number;
  exercises: ExerciseLog[];
  totals: NutritionTotals;
  profile: Profile;
  weightLog: WeightLog | null;
  previousWeight: WeightLog | null;
  latestWeightKg: number | null;
};

export function CalorieGoalSection({
  date,
  calories,
  goal,
  exerciseBurn,
  exercises,
  totals,
  profile,
  weightLog,
  previousWeight,
  latestWeightKg,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(profile.height_cm?.toString() ?? "");
  const [weight, setWeight] = useState(weightLog?.weight_kg.toString() ?? latestWeightKg?.toString() ?? "");
  const [age, setAge] = useState(profile.age_years?.toString() ?? "");
  const [gender, setGender] = useState<Gender | null>(profile.gender);
  const [weightGoal, setWeightGoal] = useState<WeightGoal | null>(profile.weight_goal);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [weightChange, setWeightChange] = useState<number | null>(
    weightLog && previousWeight ? weightLog.weight_kg - previousWeight.weight_kg : null,
  );
  const [proteinWeightKg, setProteinWeightKg] = useState<number | null>(latestWeightKg);

  useEffect(() => {
    setProteinWeightKg(latestWeightKg);
  }, [latestWeightKg]);

  useEffect(() => {
    setHeight(profile.height_cm?.toString() ?? "");
    setAge(profile.age_years?.toString() ?? "");
    setGender(profile.gender);
    setWeightGoal(profile.weight_goal);
  }, [profile.height_cm, profile.age_years, profile.gender, profile.weight_goal]);

  useEffect(() => {
    setWeight(weightLog?.weight_kg.toString() ?? latestWeightKg?.toString() ?? "");
    setWeightChange(
      weightLog && previousWeight ? weightLog.weight_kg - previousWeight.weight_kg : null,
    );
  }, [weightLog, previousWeight, latestWeightKg]);

  const previewGoal = useMemo(() => {
    const cm = parseFloat(height);
    const kg = parseFloat(weight);
    const years = parseFloat(age);
    if (
      !gender ||
      !weightGoal ||
      Number.isNaN(cm) ||
      cm <= 0 ||
      Number.isNaN(kg) ||
      kg <= 0 ||
      Number.isNaN(years) ||
      years < 10 ||
      years > 100
    ) {
      return null;
    }
    return calculateDailyCalorieGoal({
      weightKg: kg,
      heightCm: cm,
      ageYears: years,
      gender,
      goal: weightGoal,
    });
  }, [height, weight, age, gender, weightGoal]);

  const effectiveGoal = goal + exerciseBurn;
  const pct = effectiveGoal > 0 ? Math.min((calories / effectiveGoal) * 100, 100) : 0;
  const remaining = effectiveGoal - calories;
  const over = calories > effectiveGoal;
  const hasBodyData = profile.height_cm !== null || weightLog !== null || profile.gender !== null;
  const PersonIcon = gender === "female" || profile.gender === "female" ? FemaleIcon : MaleIcon;

  function saveBodyMetrics() {
    const cm = height.trim() === "" ? null : parseFloat(height);
    const kg = weight.trim() === "" ? null : parseFloat(weight);
    const years = age.trim() === "" ? null : parseFloat(age);

    if (cm !== null && (Number.isNaN(cm) || cm <= 0)) {
      setMessage("Enter a valid height in cm");
      return;
    }
    if (kg !== null && (Number.isNaN(kg) || kg <= 0)) {
      setMessage("Enter a valid weight in kg");
      return;
    }
    if (years !== null && (Number.isNaN(years) || years < 10 || years > 100)) {
      setMessage("Enter a valid age (10–100)");
      return;
    }
    if (!gender) {
      setMessage("Select gender");
      return;
    }
    if (!weightGoal) {
      setMessage("Select maintain, lose, or gain");
      return;
    }
    if (cm === null || kg === null || years === null) {
      setMessage("Height, weight, and age are needed to calculate calories");
      return;
    }

    const nextGoal = calculateDailyCalorieGoal({
      weightKg: kg,
      heightCm: cm,
      ageYears: years,
      gender,
      goal: weightGoal,
    });

    startTransition(async () => {
      try {
        await updateProfile({
          height_cm: cm,
          age_years: years,
          gender,
          weight_goal: weightGoal,
          daily_calorie_goal: nextGoal,
        });
        await upsertWeight(date, kg);
        const prev = await getPreviousWeight(date);
        setWeightChange(prev ? kg - prev.weight_kg : null);
        setProteinWeightKg(kg);
        setMessage(`Saved · goal set to ${formatNum(nextGoal)} kcal/day`);
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Could not save");
      }
    });
  }

  const bmi =
    profile.height_cm && (weightLog?.weight_kg ?? latestWeightKg)
      ? (weightLog?.weight_kg ?? latestWeightKg)! / (profile.height_cm / 100) ** 2
      : null;

  const hasExercise = exercises.length > 0;
  const exerciseSummary = formatExerciseSummary(exercises.map((log) => log.exercise_type));

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Calorie goal</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">
            {formatNum(calories)}{" "}
            <span className="text-base font-normal text-zinc-500">/ {formatNum(effectiveGoal)} kcal</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <p className={`text-sm font-medium ${over ? "text-amber-400" : "text-emerald-400"}`}>
            {over ? `+${formatNum(calories - effectiveGoal)}` : formatNum(remaining)}
          </p>
          {hasExercise && (
            <span
              className="relative rounded-xl border border-orange-600/60 bg-orange-950/40 p-2 text-orange-400"
              title={`Exercised today: ${exerciseSummary}`}
              aria-label={`Exercised today: ${exerciseSummary}`}
            >
              <ActivityIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-500" />
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Hide body metrics" : "Show body metrics"}
            aria-expanded={open}
            className={`relative rounded-xl border p-2 transition ${
              open
                ? "border-emerald-700 bg-emerald-950 text-emerald-400"
                : hasBodyData
                  ? "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                  : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
            }`}
          >
            <PersonIcon className="h-5 w-5" />
            {weightLog && !open && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ExerciseButtons date={date} logs={exercises} />

      <p className="mt-2 text-xs text-zinc-600">
        {formatNum(pct, 0)}% of daily target
        {exerciseBurn > 0 && (
          <span className="text-orange-400/80"> · +{formatNum(exerciseBurn)} from exercise</span>
        )}
        {profile.weight_goal && (
          <span className="text-zinc-500">
            {" "}
            · {profile.weight_goal === "lose" ? "lose" : profile.weight_goal === "gain" ? "gain" : "maintain"}
          </span>
        )}
      </p>

      <MacroPieCharts totals={totals} weightKg={proteinWeightKg} />

      {open && (
        <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-500">Gender</p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "male" as const, label: "Male", Icon: MaleIcon },
                  { id: "female" as const, label: "Female", Icon: FemaleIcon },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGender(id)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    gender === id
                      ? "border-emerald-600 bg-emerald-950/50 text-emerald-300"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-500">Goal</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "lose" as const, label: "Lose" },
                  { id: "maintain" as const, label: "Maintain" },
                  { id: "gain" as const, label: "Gain" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setWeightGoal(id)}
                  className={`rounded-xl border px-2 py-2.5 text-sm transition ${
                    weightGoal === id
                      ? "border-emerald-600 bg-emerald-950/50 text-emerald-300"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Height</span>
              <input
                type="number"
                min="1"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="cm"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Weight</span>
              <input
                type="number"
                min="1"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="kg"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Age</span>
              <input
                type="number"
                min="10"
                max="100"
                step="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="yrs"
                className={inputClass}
              />
            </label>
          </div>

          {previewGoal !== null && (
            <p className="text-sm text-emerald-400">
              Suggested goal: <span className="font-semibold">{formatNum(previewGoal)} kcal/day</span>
              <span className="text-zinc-500"> (exercise adds on top)</span>
            </p>
          )}

          <button
            type="button"
            onClick={saveBodyMetrics}
            disabled={pending}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save & update calorie goal"}
          </button>

          <div className="space-y-1 text-sm">
            {weightLog && (
              <p className="text-zinc-500">Logged today: {weightLog.weight_kg.toFixed(1)} kg</p>
            )}
            {weightChange !== null && (
              <p
                className={
                  weightChange > 0 ? "text-amber-400" : weightChange < 0 ? "text-emerald-400" : "text-zinc-400"
                }
              >
                vs last weigh-in: {formatWeightChange(weightChange)}
                {weightChange > 0 ? " gained" : weightChange < 0 ? " lost" : " unchanged"}
              </p>
            )}
            {bmi !== null && <p className="text-zinc-500">BMI: {bmi.toFixed(1)}</p>}
            {message && <p className="text-zinc-400">{message}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
