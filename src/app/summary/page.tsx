import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getMonthSummary } from "@/app/actions";
import { getActiveUserId } from "@/lib/active-user";
import { currentYearMonth, parseYearMonth } from "@/lib/dates";
import { MonthSummaryView } from "@/components/month-summary";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ month?: string }>;
};

async function SummaryContent({ monthParam }: { monthParam?: string }) {
  const { year, month } = monthParam ? parseYearMonth(monthParam) : currentYearMonth();
  const summary = await getMonthSummary(year, month);
  return <MonthSummaryView summary={summary} />;
}

export default async function SummaryPage({ searchParams }: Props) {
  const activeUserId = await getActiveUserId();
  if (!activeUserId) redirect("/");

  const params = await searchParams;

  return (
    <div className="min-h-full bg-black">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />
          </div>
        }
      >
        <SummaryContent monthParam={params.month} />
      </Suspense>
    </div>
  );
}
