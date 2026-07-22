"use client";

import { useState, useTransition } from "react";
import { seedFoods } from "@/app/actions";

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 4.5h3.4L21 18.5a1.5 1.5 0 01-1.3 2.2H4.3a1.5 1.5 0 01-1.3-2.2L10.3 4.5z" />
    </svg>
  );
}

function ChevronIcon({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={`${className} transition ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

type Props = {
  missing: number;
  seedCount: number;
  empty: boolean;
};

export function SetupBanner({ missing, seedCount, empty }: Props) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done || (!empty && missing <= 0)) return null;

  function handleSeed() {
    startTransition(async () => {
      try {
        const result = await seedFoods();
        setMessage(
          result.added > 0
            ? `Added ${result.added} foods (${result.total} total). Search again!`
            : `All ${result.total} foods already loaded.`,
        );
        if (result.missing === 0) {
          setDone(true);
          window.setTimeout(() => window.location.reload(), 800);
        }
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Setup failed");
      }
    });
  }

  const title = empty
    ? "Database not ready — sync foods to continue"
    : `${missing} new foods ready to sync (KFC, McD’s, meals…)`;

  return (
    <>
      <div aria-hidden className="h-12 shrink-0" />
      <div
        role="alertdialog"
        aria-labelledby="setup-banner-title"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-900/40 bg-zinc-950"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-2xl px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <AlertIcon className="h-4 w-4 shrink-0 text-amber-500" />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="min-w-0 flex-1 text-left"
              aria-expanded={open}
            >
              <p id="setup-banner-title" className="truncate text-sm text-amber-200">
                {message ?? title}
              </p>
            </button>
            <button
              type="button"
              onClick={handleSeed}
              disabled={pending}
              className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {pending ? "…" : "Sync"}
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="shrink-0 rounded-lg p-1 text-amber-500/70 hover:bg-zinc-900 hover:text-amber-400"
              aria-label={open ? "Hide details" : "Show details"}
            >
              <ChevronIcon className="h-4 w-4" open={open} />
            </button>
          </div>
          {open && (
            <p className="mt-2 text-xs leading-relaxed text-amber-200/70">
              Food search reads from Supabase. Tap Sync to load the full catalog ({seedCount} items), including
              chicken burgers, carbonara, KFC, McDonald&apos;s, and more. Run{" "}
              <code className="rounded bg-zinc-900 px-1 text-amber-200">supabase/schema.sql</code> if tables are
              missing.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
