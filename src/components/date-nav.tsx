"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatDateParts, isToday, shiftISODate, todayISO } from "@/lib/dates";

export function DateNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? todayISO();
  const { weekday, dayMonth } = formatDateParts(date);
  const today = isToday(date);

  function shiftDays(offset: number) {
    const next = shiftISODate(date, offset);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", next);
    router.push(`/today?${params.toString()}`);
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => shiftDays(-1)}
        className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
        aria-label="Previous day"
      >
        ←
      </button>
      <div className="min-w-0 flex-1 px-0.5 text-center leading-tight">
        <p className="truncate text-[11px] font-medium text-zinc-400">{weekday}</p>
        <p className="truncate text-sm font-semibold text-zinc-100">
          {dayMonth}
          {today ? <span className="ml-1 text-[10px] font-medium text-emerald-400">Today</span> : null}
        </p>
      </div>
      <button
        type="button"
        onClick={() => shiftDays(+1)}
        className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
        aria-label="Next day"
      >
        →
      </button>
    </div>
  );
}
