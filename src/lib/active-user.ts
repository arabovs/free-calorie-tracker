import { cookies } from "next/headers";
import {
  ACTIVE_USER_COOKIE,
  getUser,
  isAppUserId,
  type AppUser,
  type AppUserId,
} from "@/lib/users";

export async function getActiveUserId(): Promise<AppUserId | null> {
  const store = await cookies();
  const value = store.get(ACTIVE_USER_COOKIE)?.value;
  return value && isAppUserId(value) ? value : null;
}

export async function requireActiveUserId(): Promise<AppUserId> {
  const userId = await getActiveUserId();
  if (!userId) throw new Error("No user selected");
  return userId;
}

export async function getActiveUser(): Promise<AppUser | null> {
  const userId = await getActiveUserId();
  return userId ? getUser(userId) : null;
}
