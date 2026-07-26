"use client";

import { useState, useTransition } from "react";
import { addSupplement } from "@/app/actions";
import { SUPPLEMENTS, type SupplementId } from "@/lib/supplements";

function ScoopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8l-1 14H9L8 4zM10 18h4" />
    </svg>
  );
}

function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="3" y="8" width="18" height="8" rx="4" opacity="0.35" />
      <rect x="3" y="8" width="9" height="8" rx="4" />
    </svg>
  );
}

function ShakeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8v3l-1 14H9L8 6V3zM10 20h4" />
    </svg>
  );
}

function DropIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c2.5 3.5 5 6.5 5 10a5 5 0 11-10 0c0-3.5 2.5-6.5 5-10z"
      />
    </svg>
  );
}

const ICONS: Record<SupplementId, typeof PillIcon> = {
  creatine: ScoopIcon,
  multivitamin: PillIcon,
  whey_protein: ShakeIcon,
  protein_shake: ShakeIcon,
  omega3: DropIcon,
};

const DISPLAY: Record<SupplementId, { label: string; amount: string }> = {
  creatine: { label: "Creatine", amount: "5g" },
  multivitamin: { label: "Multi", amount: "+5" },
  whey_protein: { label: "Protein", amount: "1 scoop" },
  protein_shake: { label: "Gainer", amount: "1 scoop" },
  omega3: { label: "Omega-3", amount: "0.5g" },
};

export function SupplementButtons({ date }: { date: string }) {
  const [pending, startTransition] = useTransition();
  const [lastAdded, setLastAdded] = useState<SupplementId | null>(null);

  function handleAdd(id: SupplementId) {
    startTransition(async () => {
      await addSupplement(date, id);
      setLastAdded(id);
      window.setTimeout(() => setLastAdded((current) => (current === id ? null : current)), 600);
    });
  }

  return (
    <div className="grid grid-cols-5 gap-1">
      {SUPPLEMENTS.map((supplement) => {
        const Icon = ICONS[supplement.id];
        const display = DISPLAY[supplement.id];
        const isActive = lastAdded === supplement.id;

        return (
          <button
            key={supplement.id}
            type="button"
            onClick={() => handleAdd(supplement.id)}
            disabled={pending}
            aria-label={`Add ${supplement.label}`}
            className={`group flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition disabled:opacity-40 ${
              isActive
                ? "border-orange-600/60 bg-orange-950/40"
                : "border-zinc-800/80 bg-transparent hover:border-zinc-700 hover:bg-zinc-900/50"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 ${
                isActive ? "text-orange-400" : "text-zinc-500 group-hover:text-zinc-400"
              }`}
            />
            <span
              className={`text-[9px] font-medium leading-none ${
                isActive ? "text-orange-300" : "text-zinc-600 group-hover:text-zinc-500"
              }`}
            >
              {display.label}
            </span>
            <span
              className={`text-[10px] tabular-nums leading-none ${
                isActive ? "text-orange-400/90" : "text-zinc-700 group-hover:text-zinc-600"
              }`}
            >
              {display.amount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
