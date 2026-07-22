"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { DateNav } from "@/components/date-nav";
import type { AppUser } from "@/lib/users";

const links = [
  { href: "/today", label: "Today" },
  { href: "/summary", label: "Summary" },
];

type Props = {
  activeUser: AppUser;
};

export function AppNav({ activeUser }: Props) {
  const pathname = usePathname();
  const onToday = pathname === "/today";
  const isData = activeUser.avatarSrc.startsWith("data:");

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
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
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

        <Link
          href="/"
          className="ml-auto shrink-0 overflow-hidden rounded-full ring-2 ring-emerald-500 ring-offset-2 ring-offset-black"
          aria-label={`Signed in as ${activeUser.name}. Switch user`}
          title={`Switch user (${activeUser.name})`}
        >
          {isData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeUser.avatarSrc}
              alt={activeUser.name}
              className="h-9 w-9 object-cover"
            />
          ) : (
            <Image
              src={activeUser.avatarSrc}
              alt={activeUser.name}
              width={36}
              height={36}
              className="h-9 w-9 object-cover"
              priority
            />
          )}
        </Link>
      </div>
    </nav>
  );
}
