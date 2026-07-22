"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setActiveUser } from "@/app/actions";
import { USERS, type AppUserId } from "@/lib/users";

export function UserSelect() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AppUserId | null>(null);

  function choose(userId: AppUserId) {
    setSelected(userId);
    startTransition(async () => {
      await setActiveUser(userId);
      router.push("/today");
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-500">Calorie Tracker</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Who&apos;s tracking?</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {USERS.map((user) => {
          const isSelected = selected === user.id;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => choose(user.id)}
              disabled={pending}
              className={`group flex flex-col items-center gap-3 rounded-2xl border p-4 transition disabled:opacity-60 ${
                isSelected
                  ? "border-emerald-600 bg-emerald-950/40"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900"
              }`}
            >
              <span className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-zinc-800 transition group-hover:ring-zinc-600">
                <Image
                  src={user.avatarSrc}
                  alt={user.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                  priority
                />
              </span>
              <span className="text-lg font-medium text-zinc-100">{user.name}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
