export const ACTIVE_USER_COOKIE = "active_user";

export type AppUserId = "sim" | "babait";

export type AppUser = {
  id: AppUserId;
  name: string;
  avatarSrc: string;
  defaultCalorieGoal: number;
};

export const USERS: readonly AppUser[] = [
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

export function isAppUserId(value: string): value is AppUserId {
  return value === "sim" || value === "babait";
}

export function getUser(id: AppUserId): AppUser {
  const user = USERS.find((entry) => entry.id === id);
  if (!user) throw new Error(`Unknown user: ${id}`);
  return user;
}
