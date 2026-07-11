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
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => shiftDays(-1)}
        className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
      >
        ←
      </button>
      <div className="text-center">
        <p className="font-semibold text-zinc-100">{label}</p>
        {today && <p className="text-xs text-emerald-400">Today</p>}
      </div>
      <button
        type="button"
        onClick={() => shiftDays(+1)}
        className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
      >
        →
      </button>
    </div>
  );
}
