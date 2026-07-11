"use client";

import { useTransition } from "react";
import { toggleExercise } from "@/app/actions";
import { EXERCISES, type ExerciseType } from "@/lib/exercise";
import type { ExerciseLog } from "@/lib/types";

function WalkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <circle cx="13" cy="4.5" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 22l1.5-5.5 2.5 1.5 2-6.5 3.5 1" />
    </svg>
  );
}

function LowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" d="M4 14h16M7 10h10M10 6h4" />
    </svg>
  );
}

function MediumIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 9.5h3v8h-3v-8zM14.5 7h3v10.5h-3V7z" />
    </svg>
  );
}

function HardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c1.5 2.5 4 4.5 4 8a4 4 0 11-8 0c0-3.5 2.5-5.5 4-8z"
      />
    </svg>
  );
}

const ICONS: Record<ExerciseType, typeof WalkIcon> = {
  walk: WalkIcon,
  low: LowIcon,
  medium: MediumIcon,
  hard: HardIcon,
};

type Props = {
  date: string;
  logs: ExerciseLog[];
};

export function ExerciseButtons({ date, logs }: Props) {
  const [pending, startTransition] = useTransition();
  const active = new Set(logs.map((log) => log.exercise_type));

  function handleToggle(type: ExerciseType) {
    startTransition(async () => {
      await toggleExercise(date, type);
    });
  }

  return (
    <div className="mt-2.5 grid grid-cols-4 gap-1">
      {EXERCISES.map((exercise) => {
        const isActive = active.has(exercise.id);
        const Icon = ICONS[exercise.id];

        return (
          <button
            key={exercise.id}
            type="button"
            onClick={() => handleToggle(exercise.id)}
            disabled={pending}
            aria-pressed={isActive}
            aria-label={`${exercise.label}, ${exercise.calories_burned} kcal burned`}
            className={`group flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition disabled:opacity-40 ${
              isActive
                ? "border-orange-600/60 bg-orange-950/40"
                : "border-zinc-800/80 bg-transparent hover:border-zinc-700 hover:bg-zinc-900/50"
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 ${isActive ? "text-orange-400" : "text-zinc-500 group-hover:text-zinc-400"}`}
            />
            <span
              className={`text-[9px] font-medium leading-none ${
                isActive ? "text-orange-300" : "text-zinc-600 group-hover:text-zinc-500"
              }`}
            >
              {exercise.label}
            </span>
            <span
              className={`text-[10px] tabular-nums leading-none ${
                isActive ? "text-orange-400/90" : "text-zinc-700 group-hover:text-zinc-600"
              }`}
            >
              −{exercise.calories_burned}
            </span>
          </button>
        );
      })}
    </div>
  );
}
