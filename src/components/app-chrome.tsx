"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import type { AppUser } from "@/lib/users";

export function AppChrome({ activeUser }: { activeUser: AppUser | null }) {
  const pathname = usePathname();
  if (!activeUser || pathname === "/") return null;
  return <AppNav activeUser={activeUser} />;
}
