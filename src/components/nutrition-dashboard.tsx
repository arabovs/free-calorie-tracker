"use client";

import { useMemo } from "react";
import { countMicroTargetsAt75, MICRO_TARGETS, SUPPLEMENT_TARGETS } from "@/lib/daily-targets";
import type { NutritionTotals } from "@/lib/types";
import { NutrientPieGrid } from "@/components/nutrient-pie-charts";

const ALL_MICRO_TARGETS = [...SUPPLEMENT_TARGETS, ...MICRO_TARGETS];

export function NutritionDashboard({ totals }: { totals: NutritionTotals }) {
  const { good, total } = useMemo(
    () => countMicroTargetsAt75(ALL_MICRO_TARGETS, totals),
    [totals],
  );
  const mostlyGood = good > total / 2;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Micronutrients</p>

        <details className="group">
          <summary className="cursor-pointer list-none text-sm text-zinc-400 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                Daily breakdown
                <span
                  className={`tabular-nums text-xs font-medium ${
                    mostlyGood ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {good}/{total}
                </span>
              </span>
              <span className="text-xs text-zinc-600 transition group-open:rotate-180">▾</span>
            </span>
          </summary>
          <div className="mt-3">
            <NutrientPieGrid targets={ALL_MICRO_TARGETS} totals={totals} />
          </div>
        </details>
      </section>
    </div>
  );
}
