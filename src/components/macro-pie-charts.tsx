import { getMacroTargets } from "@/lib/daily-targets";
import type { NutritionTotals } from "@/lib/types";
import { NutrientPieGrid } from "@/components/nutrient-pie-charts";

export function MacroPieCharts({
  totals,
  weightKg,
}: {
  totals: NutritionTotals;
  weightKg: number | null;
}) {
  const targets = getMacroTargets(weightKg);

  return (
    <div className="mt-4 border-t border-zinc-800 pt-4">
      <NutrientPieGrid targets={targets} totals={totals} />
    </div>
  );
}
