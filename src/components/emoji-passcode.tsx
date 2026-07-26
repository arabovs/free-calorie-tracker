"use client";

import { useEffect, useState, useTransition } from "react";
import { ensureEmojiPalette, loginWithEmojiPassword, setupEmojiPassword } from "@/app/actions";
import { EMOJI_PASSWORD_LENGTH, shuffleEmojisClient } from "@/lib/emoji-password";
import type { AppUser } from "@/lib/users";

type Mode = "setup-pick" | "setup-confirm" | "login";

type Props = {
  user: AppUser;
  onCancel: () => void;
  onSuccess: () => void;
};

export function EmojiPasscode({ user, onCancel, onSuccess }: Props) {
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>(user.hasPassword ? "login" : "setup-pick");
  const [palette, setPalette] = useState<string[] | null>(user.emojiPalette);
  const [grid, setGrid] = useState<string[]>(() => {
    if (!user.emojiPalette) return [];
    return user.hasPassword ? shuffleEmojisClient(user.emojiPalette) : user.emojiPalette;
  });
  const [draft, setDraft] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPalette, setLoadingPalette] = useState(!user.emojiPalette);

  useEffect(() => {
    if (user.emojiPalette) return;

    let cancelled = false;
    startTransition(async () => {
      try {
        const next = await ensureEmojiPalette(user.id);
        if (cancelled) return;
        setPalette(next);
        setGrid(user.hasPassword ? shuffleEmojisClient(next) : next);
        setLoadingPalette(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not load emoji set");
        setLoadingPalette(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user.emojiPalette, user.hasPassword, user.id]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, pending]);

  const title =
    mode === "setup-pick"
      ? "Create your passcode"
      : mode === "setup-confirm"
        ? "Confirm your passcode"
        : "Enter your passcode";

  const subtitle =
    mode === "setup-pick"
      ? "Pick 3 emojis in order — remember them."
      : mode === "setup-confirm"
        ? "Same 3, same order — the grid was shuffled."
        : "Tap your 3 emojis in order.";

  function tapEmoji(emoji: string) {
    if (pending || draft.length >= EMOJI_PASSWORD_LENGTH) return;
    setError(null);
    const next = [...draft, emoji];
    setDraft(next);
    if (next.length < EMOJI_PASSWORD_LENGTH) return;

    if (mode === "setup-pick") {
      setChosen(next);
      setDraft([]);
      setGrid(shuffleEmojisClient(palette ?? grid));
      setMode("setup-confirm");
      return;
    }

    if (mode === "setup-confirm") {
      if (!chosen || chosen.join("|") !== next.join("|")) {
        setError("Didn’t match — pick your 3 again");
        setDraft([]);
        setChosen(null);
        setGrid(palette ?? grid);
        setMode("setup-pick");
        return;
      }
      startTransition(async () => {
        try {
          await setupEmojiPassword(user.id, next);
          onSuccess();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not save passcode");
          setDraft([]);
        }
      });
      return;
    }

    startTransition(async () => {
      try {
        await loginWithEmojiPassword(user.id, next);
        onSuccess();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Wrong passcode");
        setDraft([]);
        if (palette) setGrid(shuffleEmojisClient(palette));
      }
    });
  }

  function clearDraft() {
    setDraft([]);
    setError(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="emoji-passcode-title"
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p id="emoji-passcode-title" className="text-base font-medium text-zinc-100">
              {title}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {user.name} · {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex justify-center gap-2">
          {Array.from({ length: EMOJI_PASSWORD_LENGTH }, (_, i) => (
            <span
              key={i}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-2xl"
            >
              {draft[i] ?? ""}
            </span>
          ))}
        </div>

        {loadingPalette ? (
          <p className="py-8 text-center text-sm text-zinc-500">Preparing your emoji set…</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {grid.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() => tapEmoji(emoji)}
                disabled={pending || draft.length >= EMOJI_PASSWORD_LENGTH}
                className="flex aspect-square items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-3xl transition hover:border-emerald-700 hover:bg-zinc-800 disabled:opacity-50"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={clearDraft}
            disabled={pending || draft.length === 0}
            className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
          >
            Clear
          </button>
          {pending && <span className="text-xs text-zinc-500">Checking…</span>}
        </div>

        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
