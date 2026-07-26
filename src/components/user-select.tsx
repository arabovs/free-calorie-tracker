"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createAppUser } from "@/app/actions";
import { EmojiPasscode } from "@/components/emoji-passcode";
import type { AppUser } from "@/lib/users";

type Props = {
  users: AppUser[];
};

function UserAvatar({ user }: { user: AppUser }) {
  const isData = user.avatarSrc.startsWith("data:");
  if (isData) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.avatarSrc} alt={user.name} className="h-full w-full object-cover" />;
  }
  return (
    <Image src={user.avatarSrc} alt={user.name} fill sizes="112px" className="object-cover" priority />
  );
}

export function UserSelect({ users: initialUsers }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState(initialUsers);
  const [pending, startTransition] = useTransition();
  const [authUser, setAuthUser] = useState<AppUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [calorieGoal, setCalorieGoal] = useState("2500");
  const [preview, setPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startAuth(user: AppUser) {
    setCreating(false);
    setError(null);
    setAuthUser(user);
  }

  function onPhotoChange(file: File | null) {
    setPhotoFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!photoFile) {
      setError("Add a profile photo");
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("calorieGoal", calorieGoal);
    formData.set("photo", photoFile);

    setError(null);
    startTransition(async () => {
      try {
        const user = await createAppUser(formData);
        setUsers((current) => [...current, user]);
        setCreating(false);
        setName("");
        setCalorieGoal("2500");
        onPhotoChange(null);
        if (fileRef.current) fileRef.current.value = "";
        setAuthUser(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create user");
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-500">Calorie Tracker</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Who&apos;s tracking?</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {users.map((user) => {
          const isSelected = authUser?.id === user.id;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => startAuth(user)}
              disabled={pending}
              className={`group flex flex-col items-center gap-3 rounded-2xl border p-4 transition disabled:opacity-60 ${
                isSelected
                  ? "border-emerald-600 bg-emerald-950/40"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900"
              }`}
            >
              <span className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-zinc-800 transition group-hover:ring-zinc-600">
                <UserAvatar user={user} />
              </span>
              <span className="text-lg font-medium text-zinc-100">{user.name}</span>
              <span className="text-[11px] text-zinc-600">
                {user.hasPassword ? "Enter passcode" : "Set passcode"}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setAuthUser(null);
            setCreating(true);
            setError(null);
          }}
          disabled={pending}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 p-4 text-zinc-400 transition hover:border-emerald-700 hover:text-emerald-400 disabled:opacity-60"
        >
          <span className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-zinc-700 text-4xl">
            +
          </span>
          <span className="text-lg font-medium">Add user</span>
        </button>
      </div>

      {authUser && (
        <EmojiPasscode
          key={authUser.id}
          user={authUser}
          onCancel={() => setAuthUser(null)}
          onSuccess={() => router.push("/today")}
        />
      )}

      {creating && (
        <form
          onSubmit={handleCreate}
          className="mt-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
        >
          <p className="text-sm font-medium text-zinc-200">Create user</p>

          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-emerald-500 focus:ring-2"
              placeholder="Name"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">Daily calorie goal</span>
            <input
              type="number"
              min={800}
              max={10000}
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-emerald-500 focus:ring-2"
            />
          </label>

          <div>
            <span className="mb-1 block text-xs text-zinc-500">Photo</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
              >
                {photoFile ? "Change photo" : "Upload photo"}
              </button>
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-12 w-12 rounded-full object-cover" />
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setError(null);
              }}
              className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create & set passcode"}
            </button>
          </div>
        </form>
      )}

      {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
    </main>
  );
}
