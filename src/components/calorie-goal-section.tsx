"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getPreviousWeight, updateProfile, upsertWeight } from "@/app/actions";
import { ExerciseButtons } from "@/components/exercise-buttons";
import { MacroPieCharts } from "@/components/macro-pie-charts";
import { formatWeightChange } from "@/lib/month-summary";
import { formatExerciseSummary } from "@/lib/exercise";
import { formatNum } from "@/lib/nutrition";
import type { ExerciseLog, NutritionTotals, Profile, WeightLog } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-emerald-500 focus:ring-2";

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <circle cx="12" cy="7" r="3.5" />
      <path strokeLinecap="round" d="M6 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
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
  const [weight, setWeight] = useState(weightLog?.weight_kg.toString() ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [weightChange, setWeightChange] = useState<number | null>(
    weightLog && previousWeight ? weightLog.weight_kg - previousWeight.weight_kg : null,
  );
  const [proteinWeightKg, setProteinWeightKg] = useState<number | null>(latestWeightKg);

  useEffect(() => {
    setProteinWeightKg(latestWeightKg);
  }, [latestWeightKg]);

  const effectiveGoal = goal + exerciseBurn;
  const pct = effectiveGoal > 0 ? Math.min((calories / effectiveGoal) * 100, 100) : 0;
  const remaining = effectiveGoal - calories;
  const over = calories > effectiveGoal;
  const hasBodyData = profile.height_cm !== null || weightLog !== null;

  useEffect(() => {
    setHeight(profile.height_cm?.toString() ?? "");
  }, [profile.height_cm]);

  useEffect(() => {
    setWeight(weightLog?.weight_kg.toString() ?? "");
    setWeightChange(
      weightLog && previousWeight ? weightLog.weight_kg - previousWeight.weight_kg : null,
    );
  }, [weightLog, previousWeight]);

  function saveHeight() {
    const cm = height.trim() === "" ? null : parseFloat(height);
    if (cm !== null && (Number.isNaN(cm) || cm <= 0)) {
      setMessage("Enter a valid height in cm");
      return;
    }

    startTransition(async () => {
      try {
        await updateProfile({ height_cm: cm });
        setMessage("Height saved");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Could not save height");
      }
    });
  }

  function saveWeight() {
    const kg = parseFloat(weight);
    if (Number.isNaN(kg) || kg <= 0) {
      setMessage("Enter a valid weight in kg");
      return;
    }

    startTransition(async () => {
      try {
        await upsertWeight(date, kg);
        const prev = await getPreviousWeight(date);
        setWeightChange(prev ? kg - prev.weight_kg : null);
        setProteinWeightKg(kg);
        setMessage("Weight saved");
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Could not save weight");
      }
    });
  }

  const bmi =
    profile.height_cm && weightLog
      ? weightLog.weight_kg / (profile.height_cm / 100) ** 2
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
      </p>

      <MacroPieCharts totals={totals} weightKg={proteinWeightKg} />

      {open && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Height (cm)</span>
              <input
                type="number"
                min="1"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Weight today (kg)</span>
              <input
                type="number"
                min="1"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75.0"
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveHeight}
              disabled={pending}
              className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
            >
              Save height
            </button>
            <button
              type="button"
              onClick={saveWeight}
              disabled={pending}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Save weight
            </button>
          </div>

          <div className="mt-3 space-y-1 text-sm">
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
