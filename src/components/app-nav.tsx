"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { DateNav } from "@/components/date-nav";

const links = [
  { href: "/", label: "Today" },
  { href: "/summary", label: "Summary" },
];

export function AppNav() {
  const pathname = usePathname();
  const onToday = pathname === "/";

  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-800 bg-black">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
        <div className="flex shrink-0 items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-900 text-emerald-400"
                    : "text-zinc-500 hover:bg-zinc-950 hover:text-zinc-300"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {onToday && (
          <Suspense fallback={<div className="h-9 min-w-0 flex-1 animate-pulse rounded-xl bg-zinc-900" />}>
            <DateNav />
          </Suspense>
        )}
      </div>
    </nav>
  );
}
