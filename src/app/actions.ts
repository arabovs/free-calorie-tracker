"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireActiveUserId } from "@/lib/active-user";
import { createClient } from "@/lib/supabase/server";
import { SEED_FOODS } from "@/lib/seed-foods";
import { getSupplementPreset, type SupplementId } from "@/lib/supplements";
import type { CustomEntryInput, Entry, ExerciseLog, ExerciseType, Food, Gender, Meal, MonthSummary, Profile, WeightGoal, WeightLog } from "@/lib/types";
import { buildMonthSummary } from "@/lib/month-summary";
import { getExerciseOption } from "@/lib/exercise";
import { monthRange } from "@/lib/dates";
import { ACTIVE_USER_COOKIE, getSeedUser, isAppUserId, slugifyUserId, SEED_USERS, type AppUser } from "@/lib/users";

const REVALIDATE_PATHS = ["/", "/today", "/summary"];

function revalidateAll() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

export async function setActiveUser(userId: string) {
  if (!isAppUserId(userId)) throw new Error("Unknown user");

  const users = await listAppUsers();
  if (!users.some((user) => user.id === userId)) {
    throw new Error("Unknown user");
  }

  const store = await cookies();
  store.set(ACTIVE_USER_COOKIE, userId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidateAll();
}

function mapAppUser(row: {
  id: string;
  name: string;
  avatar_url: string;
  daily_calorie_goal: number;
}): AppUser {
  return {
    id: row.id,
    name: row.name,
    avatarSrc: row.avatar_url,
    defaultCalorieGoal: Number(row.daily_calorie_goal) || 2500,
  };
}

export async function listAppUsers(): Promise<AppUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_users")
    .select("id, name, avatar_url, daily_calorie_goal")
    .order("created_at", { ascending: true });

  if (error) {
    // Table may not exist yet — fall back to seeded users.
    return [...SEED_USERS];
  }

  if (!data?.length) {
    // Seed built-in users once.
    await supabase.from("app_users").upsert(
      SEED_USERS.map((user) => ({
        id: user.id,
        name: user.name,
        avatar_url: user.avatarSrc,
        daily_calorie_goal: user.defaultCalorieGoal,
      })),
      { onConflict: "id" },
    );
    return [...SEED_USERS];
  }

  return data.map(mapAppUser);
}

export async function getAppUser(userId: string): Promise<AppUser | null> {
  const seed = getSeedUser(userId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_users")
    .select("id, name, avatar_url, daily_calorie_goal")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return seed;
  return mapAppUser(data);
}

export async function createAppUser(formData: FormData): Promise<AppUser> {
  const name = String(formData.get("name") ?? "").trim();
  const photo = formData.get("photo");
  const goalRaw = String(formData.get("calorieGoal") ?? "").trim();
  const calorieGoal = goalRaw ? Number(goalRaw) : 2500;

  if (!name) throw new Error("Name is required");
  if (!(photo instanceof File) || photo.size === 0) {
    throw new Error("Photo is required");
  }
  if (photo.size > 5 * 1024 * 1024) {
    throw new Error("Photo must be under 5MB");
  }
  if (!Number.isFinite(calorieGoal) || calorieGoal < 800 || calorieGoal > 10000) {
    throw new Error("Calorie goal must be between 800 and 10000");
  }

  let id = slugifyUserId(name);
  const supabase = await createClient();

  const { data: existing } = await supabase.from("app_users").select("id").eq("id", id).maybeSingle();
  if (existing) {
    id = `${id}-${Date.now().toString(36).slice(-4)}`;
  }

  const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
  const path = `${id}.${ext}`;
  const bytes = new Uint8Array(await photo.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, bytes, {
    contentType: photo.type || "image/jpeg",
    upsert: true,
  });

  let avatarUrl: string;
  if (uploadError) {
    // Fallback if storage bucket isn't set up yet: store a small data URL.
    if (photo.size > 900_000) {
      throw new Error(
        `Photo upload failed (${uploadError.message}). Run supabase/migration-app-users.sql, or use a smaller photo.`,
      );
    }
    const base64 = Buffer.from(bytes).toString("base64");
    avatarUrl = `data:${photo.type || "image/jpeg"};base64,${base64}`;
  } else {
    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = publicUrl.publicUrl;
  }

  const { error: insertError } = await supabase.from("app_users").insert({
    id,
    name,
    avatar_url: avatarUrl,
    daily_calorie_goal: calorieGoal,
  });
  if (insertError) throw new Error(insertError.message);

  await supabase.from("profile").upsert(
    { user_id: id, daily_calorie_goal: calorieGoal },
    { onConflict: "user_id" },
  );

  revalidateAll();
  return {
    id,
    name,
    avatarSrc: avatarUrl,
    defaultCalorieGoal: calorieGoal,
  };
}

export async function getEntries(date: string): Promise<Entry[]> {
  const supabase = await createClient();
  const userId = await requireActiveUserId();

  const { data, error } = await supabase
    .from("entries")
    .select("*, food:foods(*)")
    .eq("user_id", userId)
    .eq("logged_at", date)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    ...row,
    food: row.food as Food | undefined,
  }));
}

export async function searchFoods(query: string): Promise<Food[]> {
  const supabase = await createClient();
  const trimmed = query.trim();

  let builder = supabase.from("foods").select("*").order("name").limit(20);

  if (trimmed) {
    // Match each word so "chicken burger" finds "Nando's Chicken Burger"
    for (const word of trimmed.split(/\s+/).filter(Boolean)) {
      builder = builder.ilike("name", `%${word}%`);
    }
  }

  const { data, error } = await builder;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addEntry(input: {
  foodId: string;
  quantity: number;
  meal: Meal;
  date: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const userId = await requireActiveUserId();

  const { error } = await supabase.from("entries").insert({
    user_id: userId,
    food_id: input.foodId,
    quantity: input.quantity,
    meal: input.meal,
    logged_at: input.date,
    notes: input.notes ?? null,
  });

  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function addCustomEntry(input: {
  custom: CustomEntryInput;
  meal: Meal;
  date: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const userId = await requireActiveUserId();

  const { error } = await supabase.from("entries").insert({
    user_id: userId,
    food_id: null,
    quantity: 1,
    meal: input.meal,
    logged_at: input.date,
    notes: input.notes ?? null,
    custom_name: input.custom.name.trim(),
    custom_calories: input.custom.calories,
    custom_protein_g: input.custom.protein_g,
    custom_carbs_g: input.custom.carbs_g,
    custom_fat_g: input.custom.fat_g,
    custom_saturated_fat_g: input.custom.saturated_fat_g,
    custom_fiber_g: input.custom.fiber_g,
    custom_sugar_g: input.custom.sugar_g,
    custom_sodium_mg: input.custom.sodium_mg,
    custom_vitamin_a_mcg: input.custom.vitamin_a_mcg,
    custom_vitamin_c_mg: input.custom.vitamin_c_mg,
    custom_vitamin_d_mcg: input.custom.vitamin_d_mcg,
    custom_vitamin_b12_mcg: input.custom.vitamin_b12_mcg,
    custom_iron_mg: input.custom.iron_mg,
    custom_calcium_mg: input.custom.calcium_mg,
    custom_potassium_mg: input.custom.potassium_mg,
    custom_creatine_g: input.custom.creatine_g,
    custom_omega3_g: input.custom.omega3_g,
    custom_vitamin_b1_mg: input.custom.vitamin_b1_mg,
    custom_vitamin_b2_mg: input.custom.vitamin_b2_mg,
    custom_vitamin_b6_mg: input.custom.vitamin_b6_mg,
    custom_biotin_mcg: input.custom.biotin_mcg,
    custom_vitamin_e_mg: input.custom.vitamin_e_mg,
    custom_folate_mcg: input.custom.folate_mcg,
    custom_vitamin_k_mcg: input.custom.vitamin_k_mcg,
    custom_niacin_mg: input.custom.niacin_mg,
    custom_pantothenate_mg: input.custom.pantothenate_mg,
    custom_magnesium_mg: input.custom.magnesium_mg,
    custom_phosphorus_mg: input.custom.phosphorus_mg,
    custom_chromium_mcg: input.custom.chromium_mcg,
    custom_iodine_mcg: input.custom.iodine_mcg,
    custom_molybdenum_mcg: input.custom.molybdenum_mcg,
    custom_selenium_mcg: input.custom.selenium_mcg,
    custom_zinc_mg: input.custom.zinc_mg,
  });

  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function addSupplement(date: string, supplementId: SupplementId) {
  await addCustomEntry({
    custom: getSupplementPreset(supplementId),
    meal: "snack",
    date,
  });
}

export async function getExercisesForDate(date: string): Promise<ExerciseLog[]> {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("logged_at", date)
    .order("exercise_type");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function toggleExercise(date: string, exerciseType: ExerciseType) {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const option = getExerciseOption(exerciseType);

  const { data: existing, error: fetchError } = await supabase
    .from("exercise_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("logged_at", date)
    .eq("exercise_type", exerciseType)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  if (existing) {
    const { error } = await supabase.from("exercise_logs").delete().eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("exercise_logs").insert({
      user_id: userId,
      logged_at: date,
      exercise_type: exerciseType,
      calories_burned: option.calories_burned,
    });
    if (error) throw new Error(error.message);
  }

  revalidateAll();
}

export async function getExercisesForRange(start: string, end: string): Promise<ExerciseLog[]> {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { data, error } = await supabase
    .from("exercise_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_at", start)
    .lte("logged_at", end)
    .order("logged_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteEntry(id: string) {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { error } = await supabase.from("entries").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function resetDay(date: string) {
  const supabase = await createClient();
  const userId = await requireActiveUserId();

  const [entriesResult, exerciseResult] = await Promise.all([
    supabase.from("entries").delete().eq("user_id", userId).eq("logged_at", date),
    supabase.from("exercise_logs").delete().eq("user_id", userId).eq("logged_at", date),
  ]);

  if (entriesResult.error) throw new Error(entriesResult.error.message);
  if (exerciseResult.error) throw new Error(exerciseResult.error.message);

  revalidateAll();
}

async function fetchAllFoodNames(): Promise<string[]> {
  const supabase = await createClient();
  const pageSize = 1000;
  const names: string[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("foods")
      .select("name")
      .order("name")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);
    if (!data?.length) break;

    for (const row of data) names.push(row.name);
    if (data.length < pageSize) break;
  }

  return names;
}

export async function seedFoods() {
  const existing = await fetchAllFoodNames();
  const existingNames = new Set(existing.map((name) => name.toLowerCase()));
  const toInsert = SEED_FOODS.filter((food) => !existingNames.has(food.name.toLowerCase()));

  if (toInsert.length === 0) {
    return { seeded: false, added: 0, total: existing.length, missing: 0 };
  }

  const supabase = await createClient();
  const BATCH = 100;
  let added = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const chunk = toInsert.slice(i, i + BATCH);
    const { error } = await supabase.from("foods").insert(chunk);
    if (error) throw new Error(error.message);
    added += chunk.length;
  }

  revalidateAll();

  const after = await fetchAllFoodNames();
  const afterNames = new Set(after.map((name) => name.toLowerCase()));
  const missing = SEED_FOODS.reduce(
    (count, food) => count + (afterNames.has(food.name.toLowerCase()) ? 0 : 1),
    0,
  );

  return {
    seeded: true,
    added,
    total: after.length,
    missing,
  };
}

export async function getFoodCatalogStatus() {
  const names = await fetchAllFoodNames();
  const existingNames = new Set(names.map((name) => name.toLowerCase()));
  const missing = SEED_FOODS.reduce(
    (count, food) => count + (existingNames.has(food.name.toLowerCase()) ? 0 : 1),
    0,
  );

  return {
    dbCount: names.length,
    seedCount: SEED_FOODS.length,
    missing,
  };
}

export async function getSuggestedFoods(): Promise<Food[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .order("name")
    .limit(6);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { data, error } = await supabase.from("profile").select("*").eq("user_id", userId).maybeSingle();

  if (error) throw new Error(error.message);

  return (
    data ?? {
      user_id: userId,
      height_cm: null,
      daily_calorie_goal: (await getAppUser(userId))?.defaultCalorieGoal ?? getSeedUser(userId)?.defaultCalorieGoal ?? 2500,
      gender: null,
      age_years: null,
      weight_goal: null,
    }
  );
}

export async function updateProfile(input: {
  height_cm?: number | null;
  daily_calorie_goal?: number;
  gender?: Gender | null;
  age_years?: number | null;
  weight_goal?: WeightGoal | null;
}) {
  const supabase = await createClient();
  const userId = await requireActiveUserId();

  const payload: Record<string, number | null | string> = { user_id: userId };
  if (input.height_cm !== undefined) payload.height_cm = input.height_cm;
  if (input.daily_calorie_goal !== undefined) payload.daily_calorie_goal = input.daily_calorie_goal;
  if (input.gender !== undefined) payload.gender = input.gender;
  if (input.age_years !== undefined) payload.age_years = input.age_years;
  if (input.weight_goal !== undefined) payload.weight_goal = input.weight_goal;

  const { error } = await supabase.from("profile").upsert(payload, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function getWeightForDate(date: string): Promise<WeightLog | null> {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("logged_at", date)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getLatestWeightOnOrBefore(date: string): Promise<WeightLog | null> {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .lte("logged_at", date)
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getPreviousWeight(date: string): Promise<WeightLog | null> {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .lt("logged_at", date)
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertWeight(date: string, weight_kg: number) {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { error } = await supabase.from("weight_logs").upsert(
    { user_id: userId, logged_at: date, weight_kg },
    { onConflict: "user_id,logged_at" },
  );
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function getEntriesForRange(start: string, end: string): Promise<Entry[]> {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { data, error } = await supabase
    .from("entries")
    .select("*, food:foods(*)")
    .eq("user_id", userId)
    .gte("logged_at", start)
    .lte("logged_at", end)
    .order("logged_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    ...row,
    food: row.food as Food | undefined,
  }));
}

export async function getAllWeightLogs(): Promise<WeightLog[]> {
  const supabase = await createClient();
  const userId = await requireActiveUserId();
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMonthSummary(year: number, month: number): Promise<MonthSummary> {
  const { start, end } = monthRange(year, month);
  const [profile, entries, allWeights, exerciseLogs] = await Promise.all([
    getProfile(),
    getEntriesForRange(start, end),
    getAllWeightLogs(),
    getExercisesForRange(start, end),
  ]);

  return buildMonthSummary({
    year,
    month,
    calorieGoal: profile.daily_calorie_goal,
    entries,
    weightLogs: allWeights,
    exerciseLogs,
  });
}
