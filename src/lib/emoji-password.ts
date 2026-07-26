import { createHash, randomInt } from "crypto";

export const EMOJI_PASSWORD_LENGTH = 3;
export const EMOJI_PALETTE_SIZE = 9;

/** Distinct, easy-to-tell-apart emojis for passcodes. */
const EMOJI_POOL = [
  "🍎", "🍌", "🍇", "🍓", "🍑", "🥝", "🍍", "🥭", "🍉", "🍊",
  "🍋", "🥕", "🌽", "🥑", "🌶️", "🍕", "🍔", "🌮", "🍣", "🍩",
  "🍪", "🎂", "🍦", "☕", "🍵", "🍺", "🧀", "🥚", "🍗", "🥩",
  "🐟", "🦐", "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
  "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🦄", "🐝",
  "🦋", "🌸", "🌺", "🌹", "🌻", "🌙", "⭐", "🔥", "🌈", "💎",
  "🎵", "🎮", "🚀", "🎸", "🎯", "🏆", "🎁", "🎈", "❤️", "💙",
  "💚", "💛", "💜", "🖤", "✨", "⚽", "🏀", "🎾", "🚗", "✈️",
] as const;

export function generateEmojiPalette(): string[] {
  const pool = [...EMOJI_POOL];
  const picked: string[] = [];
  while (picked.length < EMOJI_PALETTE_SIZE && pool.length > 0) {
    const index = randomInt(pool.length);
    picked.push(pool.splice(index, 1)[0]!);
  }
  return picked;
}

export function shuffleEmojis<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

/** Client-safe shuffle (browser / server). */
export function shuffleEmojisClient<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

export function hashEmojiPassword(userId: string, emojis: string[]): string {
  return createHash("sha256").update(`${userId}:${emojis.join("|")}`).digest("hex");
}

export function normalizeEmojiPassword(emojis: unknown): string[] {
  if (!Array.isArray(emojis)) throw new Error("Pick 3 emojis");
  const cleaned = emojis.map((emoji) => String(emoji));
  if (cleaned.length !== EMOJI_PASSWORD_LENGTH) {
    throw new Error("Pick exactly 3 emojis");
  }
  if (cleaned.some((emoji) => !emoji)) {
    throw new Error("Invalid emoji selection");
  }
  return cleaned;
}

export function assertPasswordInPalette(password: string[], palette: string[]) {
  const available = new Set(palette);
  for (const emoji of password) {
    if (!available.has(emoji)) {
      throw new Error("That emoji is not in your set");
    }
  }
}
