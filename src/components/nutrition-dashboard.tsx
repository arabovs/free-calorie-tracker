"use client";

import { SUPPLEMENT_TARGETS, MICRO_TARGETS } from "@/lib/daily-targets";
import type { NutritionTotals } from "@/lib/types";
import { NutrientPieGrid } from "@/components/nutrient-pie-charts";
import { SupplementButtons } from "@/components/supplement-buttons";

const ALL_MICRO_TARGETS = [...SUPPLEMENT_TARGETS, ...MICRO_TARGETS];

export function NutritionDashboard({
  totals,
  date,
}: {
  totals: NutritionTotals;
  date: string;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <SupplementButtons date={date} />

        <div className="mt-4">
          <NutrientPieGrid targets={ALL_MICRO_TARGETS} totals={totals} />
        </div>
      </section>
    </div>
  );
}
