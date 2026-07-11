import { Suspense } from "react";
import {
  getEntries,
  getExercisesForDate,
  getPreviousWeight,
  getProfile,
  getSuggestedFoods,
  getWeightForDate,
} from "@/app/actions";
import { todayISO } from "@/lib/dates";
import { totalExerciseBurn } from "@/lib/exercise";
import { sumNutrition } from "@/lib/nutrition";
import type { Entry, ExerciseLog } from "@/lib/types";
import { FoodLogPanel } from "@/components/tracker";
import { CalorieGoalSection } from "@/components/calorie-goal-section";
import { NutritionDashboard } from "@/components/nutrition-dashboard";
import { SetupBanner } from "@/components/setup-banner";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

async function TrackerContent({ date }: { date: string }) {
  let entries: Entry[] = [];
  let needsSetup = false;

  let profile = { id: 1, height_cm: null as number | null, daily_calorie_goal: 2500 };
  let weightLog = null;
  let previousWeight = null;
  let exercises: ExerciseLog[] = [];

  try {
    const [suggestions, ...rest] = await Promise.all([
      getSuggestedFoods(),
      getEntries(date),
      getProfile(),
      getWeightForDate(date),
      getPreviousWeight(date),
      getExercisesForDate(date),
    ]);
    [entries, profile, weightLog, previousWeight, exercises] = rest;
    needsSetup = suggestions.length === 0;
  } catch {
    needsSetup = true;
  }

  const totals = sumNutrition(entries);
  const exerciseBurn = totalExerciseBurn(exercises);

  return (
    <div
      className={`mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 ${needsSetup ? "pb-4 md:pb-6" : "pb-28 md:pb-6"}`}
    >
      <CalorieGoalSection
        date={date}
        calories={totals.calories}
        goal={profile.daily_calorie_goal}
        exerciseBurn={exerciseBurn}
        exercises={exercises}
        totals={totals}
        profile={profile}
        weightLog={weightLog}
        previousWeight={previousWeight}
      />
      <NutritionDashboard totals={totals} date={date} />
      <FoodLogPanel
        date={date}
        entries={entries}
        hasActivity={entries.length > 0 || exercises.length > 0}
      />

      {needsSetup && <SetupBanner />}
    </div>
  );
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const date = params.date ?? todayISO();

  return (
    <div className="min-h-full bg-black">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />
          </div>
        }
      >
        <TrackerContent date={date} />
      </Suspense>
    </div>
  );
}
