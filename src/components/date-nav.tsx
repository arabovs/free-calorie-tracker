"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatDisplayDate, isToday, shiftISODate, todayISO } from "@/lib/dates";

export function DateNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? todayISO();
  const label = formatDisplayDate(date);
  const today = isToday(date);

  function shiftDays(offset: number) {
    const next = shiftISODate(date, offset);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", next);
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => shiftDays(-1)}
        className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
      >
        ←
      </button>
      <div className="min-w-0 text-center">
        <p className="truncate text-sm font-semibold text-zinc-100">{label}</p>
        {today && <p className="text-[10px] leading-tight text-emerald-400">Today</p>}
      </div>
      <button
        type="button"
        onClick={() => shiftDays(+1)}
        className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900"
      >
        →
      </button>
    </div>
  );
}
