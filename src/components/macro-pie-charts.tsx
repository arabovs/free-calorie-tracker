import { MACRO_TARGETS } from "@/lib/daily-targets";
import type { NutritionTotals } from "@/lib/types";
import { NutrientPieGrid } from "@/components/nutrient-pie-charts";

export function MacroPieCharts({ totals }: { totals: NutritionTotals }) {
  return (
    <div className="mt-4 border-t border-zinc-800 pt-4">
      <NutrientPieGrid targets={MACRO_TARGETS} totals={totals} />
    </div>
  );
}
