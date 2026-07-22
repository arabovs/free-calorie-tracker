"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import type { AppUserId } from "@/lib/users";

export function AppChrome({ activeUserId }: { activeUserId: AppUserId | null }) {
  const pathname = usePathname();
  if (!activeUserId || pathname === "/") return null;
  return <AppNav activeUserId={activeUserId} />;
}
