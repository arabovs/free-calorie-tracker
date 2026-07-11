import type { DailyTarget } from "@/lib/daily-targets";
import { formatNum } from "@/lib/nutrition";
import type { NutritionTotals } from "@/lib/types";

type NutrientColors = { fill: string; over: string; warn?: string };

const DEFAULT_COLORS: NutrientColors = { fill: "#71717a", over: "#f59e0b", warn: "#fbbf24" };

const NUTRIENT_COLORS: Partial<Record<keyof NutritionTotals, NutrientColors>> = {
  protein_g: { fill: "#38bdf8", over: "#f59e0b" },
  carbs_g: { fill: "#fbbf24", over: "#f59e0b" },
  fat_g: { fill: "#c084fc", over: "#f59e0b" },
  fiber_g: { fill: "#34d399", over: "#f59e0b" },
  creatine_g: { fill: "#22d3ee", over: "#f59e0b" },
  omega3_g: { fill: "#60a5fa", over: "#f59e0b" },
  potassium_mg: { fill: "#a78bfa", over: "#f59e0b" },
  calcium_mg: { fill: "#e2e8f0", over: "#f59e0b" },
  iron_mg: { fill: "#fb7185", over: "#f59e0b" },
  vitamin_a_mcg: { fill: "#f97316", over: "#f59e0b" },
  vitamin_c_mg: { fill: "#fde047", over: "#f59e0b" },
  vitamin_d_mcg: { fill: "#fcd34d", over: "#f59e0b" },
  vitamin_b12_mcg: { fill: "#c4b5fd", over: "#f59e0b" },
  sugar_g: { fill: "#34d399", over: "#ef4444", warn: "#f59e0b" },
  saturated_fat_g: { fill: "#34d399", over: "#ef4444", warn: "#f59e0b" },
  sodium_mg: { fill: "#34d399", over: "#ef4444", warn: "#f59e0b" },
};

function strokeForStatus(
  type: "min" | "max",
  pct: number,
  colors: NutrientColors,
): string {
  if (type === "max") {
    if (pct > 100) return colors.over;
    if (pct >= 85) return colors.warn ?? "#f59e0b";
    return colors.fill;
  }
  if (pct >= 100) return colors.over;
  return colors.fill;
}

function textClassForStatus(type: "min" | "max", pct: number): string {
  if (type === "max") {
    if (pct > 100) return "text-red-400";
    if (pct >= 85) return "text-amber-400";
    return "text-zinc-400";
  }
  return pct >= 100 ? "text-emerald-400" : "text-zinc-400";
}

function valueClassForStatus(type: "min" | "max", pct: number): string {
  if (type === "max") {
    if (pct > 100) return "text-red-400";
    if (pct >= 85) return "text-amber-400";
    return "text-zinc-300";
  }
  return pct >= 100 ? "text-emerald-400" : "text-zinc-300";
}

export function NutrientPieChart({
  label,
  current,
  target,
  unit,
  type,
  decimals = 0,
  colors = DEFAULT_COLORS,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  type: "min" | "max";
  decimals?: number;
  colors?: NutrientColors;
}) {
  const pct = target > 0 ? (current / target) * 100 : 0;
  const displayPct = Math.min(pct, 100);
  const radius = 15.915;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - displayPct / 100);
  const stroke = strokeForStatus(type, pct, colors);

  return (
    <div className="flex flex-col items-center gap-1 px-1 py-3">
      <div className="relative h-12 w-12 sm:h-14 sm:w-14">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="18" cy="18" r={radius} fill="none" stroke="#27272a" strokeWidth="3" />
          {displayPct > 0 && (
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={stroke}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          )}
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-[9px] font-semibold sm:text-[10px] ${textClassForStatus(type, pct)}`}
        >
          {formatNum(pct, 0)}%
        </span>
      </div>
      <span className="max-w-full truncate text-center text-[10px] font-medium text-zinc-400 sm:text-xs">
        {label}
      </span>
      <span className="text-center text-[10px] leading-tight text-zinc-500">
        <span className={valueClassForStatus(type, pct)}>{formatNum(current, decimals)}</span>
        <span className="text-zinc-600">
          {" "}
          / {formatNum(target, decimals)}
          {unit}
        </span>
      </span>
    </div>
  );
}

export function NutrientPieGrid({
  targets,
  totals,
  columns = 4,
}: {
  targets: DailyTarget[];
  totals: NutritionTotals;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/20">
      <div
        className="grid divide-x divide-y divide-zinc-800/60"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {targets.map((target) => (
          <NutrientPieChart
            key={target.key}
            label={target.label}
            current={totals[target.key]}
            target={target.value}
            unit={target.unit}
            type={target.type}
            decimals={target.decimals}
            colors={NUTRIENT_COLORS[target.key] ?? DEFAULT_COLORS}
          />
        ))}
      </div>
    </div>
  );
}
