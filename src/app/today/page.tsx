import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  getEntries,
  getExercisesForDate,
  getFoodCatalogStatus,
  getLatestWeightOnOrBefore,
  getPreviousWeight,
  getProfile,
  getWeightForDate,
} from "@/app/actions";
import { getActiveUserId } from "@/lib/active-user";
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
  let missingFoods = 0;
  let seedCount = 0;
  let dbEmpty = true;

  let profile = {
    user_id: "sim",
    height_cm: null as number | null,
    daily_calorie_goal: 2500,
    gender: null as "male" | "female" | null,
    age_years: null as number | null,
    weight_goal: null as "maintain" | "lose" | "gain" | null,
  };
  let weightLog = null;
  let previousWeight = null;
  let exercises: ExerciseLog[] = [];

  let latestWeight = null;

  try {
    const [catalog, ...rest] = await Promise.all([
      getFoodCatalogStatus(),
      getEntries(date),
      getProfile(),
      getWeightForDate(date),
      getPreviousWeight(date),
      getExercisesForDate(date),
      getLatestWeightOnOrBefore(date),
    ]);
    [entries, profile, weightLog, previousWeight, exercises, latestWeight] = rest;
    missingFoods = catalog.missing;
    seedCount = catalog.seedCount;
    dbEmpty = catalog.dbCount === 0;
    needsSetup = dbEmpty || missingFoods > 0;
  } catch {
    needsSetup = true;
    dbEmpty = true;
  }

  const totals = sumNutrition(entries);
  const exerciseBurn = totalExerciseBurn(exercises);

  return (
    <div
      className={`mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 ${needsSetup ? "pb-28 md:pb-6" : "pb-4 md:pb-6"}`}
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
        latestWeightKg={latestWeight?.weight_kg ?? null}
      />
      <NutritionDashboard totals={totals} />
      <FoodLogPanel
        date={date}
        entries={entries}
        hasActivity={entries.length > 0 || exercises.length > 0}
      />

      {needsSetup && (
        <SetupBanner missing={missingFoods} seedCount={seedCount} empty={dbEmpty} />
      )}
    </div>
  );
}

export default async function TodayPage({ searchParams }: Props) {
  const activeUserId = await getActiveUserId();
  if (!activeUserId) redirect("/");

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
