export const ACTIVE_USER_COOKIE = "active_user";

export type AppUserId = string;

export type AppUser = {
  id: AppUserId;
  name: string;
  avatarSrc: string;
  defaultCalorieGoal: number;
};

/** Built-in users used to seed the DB and as offline fallback. */
export const SEED_USERS: readonly AppUser[] = [
  {
    id: "sim",
    name: "Sim",
    avatarSrc: "/avatars/sim-avatar.png",
    defaultCalorieGoal: 2500,
  },
  {
    id: "babait",
    name: "Бабаит",
    avatarSrc: "/avatars/babait-avatar.png",
    defaultCalorieGoal: 2000,
  },
] as const;

/** @deprecated Use SEED_USERS or listAppUsers() */
export const USERS = SEED_USERS;

export function isAppUserId(value: string): value is AppUserId {
  return typeof value === "string" && value.length > 0 && value.length <= 64;
}

export function slugifyUserId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return base || `user-${Date.now().toString(36)}`;
}

export function getSeedUser(id: AppUserId): AppUser | null {
  return SEED_USERS.find((entry) => entry.id === id) ?? null;
}
