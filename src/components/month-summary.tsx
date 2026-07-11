"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatMonthYear, formatShortDate, shiftMonth } from "@/lib/dates";
import { formatWeightChange } from "@/lib/month-summary";
import { formatNum } from "@/lib/nutrition";
import type { MonthSummary } from "@/lib/types";

type Props = {
  summary: MonthSummary;
};

function WeightBadge({ change }: { change: number | null }) {
  if (change === null) return <span className="text-zinc-600">—</span>;
  const label = formatWeightChange(change);
  const color =
    change > 0 ? "text-amber-400" : change < 0 ? "text-emerald-400" : "text-zinc-500";
  return <span className={color}>{label}</span>;
}

export function MonthSummaryView({ summary }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthKey = `${summary.year}-${String(summary.month).padStart(2, "0")}`;

  function navigateMonth(offset: number) {
    const next = shiftMonth(summary.year, summary.month, offset);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", `${next.year}-${String(next.month).padStart(2, "0")}`);
    router.push(`/summary?${params.toString()}`);
  }

  const activeDays = summary.days.filter(
    (d) => d.calories > 0 || d.weight_kg !== null || d.exercise_summary.length > 0,
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-6 pb-10">
      <header className="space-y-1">
        <p className="text-sm font-medium text-emerald-400">Monthly summary</p>
        <h1 className="text-2xl font-bold text-zinc-100">{formatMonthYear(summary.year, summary.month)}</h1>
      </header>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
        >
          ←
        </button>
        <p className="text-sm text-zinc-500">{monthKey}</p>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Avg calories</p>
          <p className="mt-1 text-xl font-bold text-zinc-100">{formatNum(summary.avg_calories)} kcal</p>
          <p className="mt-1 text-xs text-zinc-600">Goal: {formatNum(summary.calorie_goal)} / day</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Weight change</p>
          <p
            className={`mt-1 text-xl font-bold ${
              summary.net_weight_change_kg === null
                ? "text-zinc-500"
                : summary.net_weight_change_kg > 0
                  ? "text-amber-400"
                  : summary.net_weight_change_kg < 0
                    ? "text-emerald-400"
                    : "text-zinc-300"
            }`}
          >
            {summary.net_weight_change_kg === null
              ? "—"
              : formatWeightChange(summary.net_weight_change_kg)}
          </p>
          {summary.first_weight_kg !== null && summary.last_weight_kg !== null && (
            <p className="mt-1 text-xs text-zinc-600">
              {summary.first_weight_kg.toFixed(1)} → {summary.last_weight_kg.toFixed(1)} kg
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 border-b border-zinc-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <span>Day</span>
          <span className="text-right">Kcal</span>
          <span className="text-right">Exercise</span>
          <span className="text-right">Weight</span>
          <span className="text-right">Δ</span>
        </div>

        {activeDays.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-600">No data logged this month yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {activeDays.map((day) => (
              <li key={day.date}>
                <Link
                  href={`/?date=${day.date}`}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-4 py-3 text-sm hover:bg-zinc-900"
                >
                  <span className="text-zinc-300">{formatShortDate(day.date)}</span>
                  <span className="text-right text-zinc-400">
                    {day.calories > 0 ? formatNum(day.calories) : "—"}
                  </span>
                  <span className="text-right text-xs text-orange-400/90">
                    {day.exercise_summary || "—"}
                  </span>
                  <span className="text-right text-zinc-400">
                    {day.weight_kg !== null ? `${day.weight_kg.toFixed(1)}` : "—"}
                  </span>
                  <span className="text-right">
                    <WeightBadge change={day.weight_change_kg} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-zinc-600">
        {summary.days_with_food} days with food · {summary.days_with_exercise} with exercise ·{" "}
        {summary.days_with_weight} weigh-ins
      </p>
    </div>
  );
}
