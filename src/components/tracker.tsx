"use client";

import { useMemo, useState, useTransition } from "react";
import { addCustomEntry, addEntry, deleteEntry, resetDay, searchFoods } from "@/app/actions";
import { foodSummary } from "@/lib/seed-foods";
import { entryLabel, entryNutrition, formatNum, scaleFood } from "@/lib/nutrition";
import type { Entry, Food, Meal } from "@/lib/types";

const MEALS: Meal[] = ["breakfast", "lunch", "dinner", "snack"];

type LogMode = "search" | "custom";
type PanelTab = "add" | "log";

type Props = {
  date: string;
  entries: Entry[];
  hasActivity: boolean;
};

const EMPTY_CUSTOM = {
  name: "",
  calories: "",
  protein_g: "",
  carbs_g: "",
  fat_g: "",
  saturated_fat_g: "",
  fiber_g: "",
  sugar_g: "",
  sodium_mg: "",
  vitamin_a_mcg: "",
  vitamin_c_mg: "",
  vitamin_d_mcg: "",
  vitamin_b12_mcg: "",
  iron_mg: "",
  calcium_mg: "",
  potassium_mg: "",
  creatine_g: "",
  omega3_g: "",
};

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none ring-emerald-500 placeholder:text-zinc-600 focus:ring-2";
const labelClass = "mb-1 block text-xs font-medium text-zinc-500";

function MacroInput({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        type="number"
        min="0"
        step="0.1"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export function FoodLogPanel({ date, entries, hasActivity }: Props) {
  const [tab, setTab] = useState<PanelTab>(entries.length > 0 ? "log" : "add");
  const [mode, setMode] = useState<LogMode>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [meal, setMeal] = useState<Meal>("snack");
  const [custom, setCustom] = useState(EMPTY_CUSTOM);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!selected) return null;
    const qty = parseFloat(quantity) || 0;
    return scaleFood(selected, qty);
  }, [selected, quantity]);

  function handleSearch(value: string) {
    setQuery(value);
    setSelected(null);
    setError(null);

    startTransition(async () => {
      try {
        const foods = await searchFoods(value);
        setResults(foods);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
      }
    });
  }

  function pickFood(food: Food) {
    setSelected(food);
    setQuery(food.name);
    setResults([]);
    setQuantity(String(food.serving_size));
    setError(null);
  }

  function resetSearchForm() {
    setQuery("");
    setSelected(null);
    setQuantity("1");
    setResults([]);
  }

  function resetCustomForm() {
    setCustom(EMPTY_CUSTOM);
  }

  function parseOptional(value: string) {
    if (value.trim() === "") return 0;
    const num = parseFloat(value);
    return Number.isNaN(num) ? 0 : num;
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      setError("Enter a valid quantity");
      return;
    }

    startTransition(async () => {
      try {
        await addEntry({ foodId: selected.id, quantity: qty, meal, date });
        resetSearchForm();
        setError(null);
        setTab("log");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add entry");
      }
    });
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();

    const name = custom.name.trim();
    const calories = parseFloat(custom.calories);

    if (!name) {
      setError("Enter a name for this item");
      return;
    }
    if (Number.isNaN(calories) || calories < 0) {
      setError("Enter valid calories");
      return;
    }

    startTransition(async () => {
      try {
        await addCustomEntry({
          custom: {
            name,
            calories,
            protein_g: parseOptional(custom.protein_g),
            carbs_g: parseOptional(custom.carbs_g),
            fat_g: parseOptional(custom.fat_g),
            saturated_fat_g: parseOptional(custom.saturated_fat_g),
            fiber_g: parseOptional(custom.fiber_g),
            sugar_g: parseOptional(custom.sugar_g),
            sodium_mg: parseOptional(custom.sodium_mg),
            vitamin_a_mcg: parseOptional(custom.vitamin_a_mcg),
            vitamin_c_mg: parseOptional(custom.vitamin_c_mg),
            vitamin_d_mcg: parseOptional(custom.vitamin_d_mcg),
            vitamin_b12_mcg: parseOptional(custom.vitamin_b12_mcg),
            iron_mg: parseOptional(custom.iron_mg),
            calcium_mg: parseOptional(custom.calcium_mg),
            potassium_mg: parseOptional(custom.potassium_mg),
            creatine_g: parseOptional(custom.creatine_g),
            omega3_g: parseOptional(custom.omega3_g),
          },
          meal,
          date,
        });
        resetCustomForm();
        setError(null);
        setTab("log");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add custom item");
      }
    });
  }

  const showDropdown = mode === "search" && !selected && results.length > 0 && query.length > 0;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex rounded-lg bg-zinc-900 p-0.5 text-sm">
          <button
            type="button"
            onClick={() => {
              setTab("add");
              setError(null);
            }}
            className={`rounded-md px-3 py-1.5 transition ${
              tab === "add" ? "bg-zinc-800 font-medium text-emerald-400" : "text-zinc-500"
            }`}
          >
            Add food
          </button>
          <button
            type="button"
            onClick={() => setTab("log")}
            className={`rounded-md px-3 py-1.5 transition ${
              tab === "log" ? "bg-zinc-800 font-medium text-zinc-100" : "text-zinc-500"
            }`}
          >
            Today&apos;s log{entries.length > 0 ? ` · ${entries.length}` : ""}
          </button>
        </div>

        {tab === "add" && (
          <div className="flex rounded-lg bg-zinc-900 p-0.5 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode("search");
                setError(null);
              }}
              className={`rounded-md px-3 py-1.5 transition ${
                mode === "search" ? "bg-zinc-800 font-medium text-zinc-100" : "text-zinc-500"
              }`}
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("custom");
                setError(null);
              }}
              className={`rounded-md px-3 py-1.5 transition ${
                mode === "custom" ? "bg-zinc-800 font-medium text-zinc-100" : "text-zinc-500"
              }`}
            >
              Custom
            </button>
          </div>
        )}
      </div>

      {tab === "add" ? (
        mode === "search" ? (
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search eggs, cheddar, milk…"
              className={`${inputClass} px-4 py-3 text-base`}
              autoComplete="off"
            />

            {showDropdown && (
              <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                {results.map((food) => (
                  <li key={food.id}>
                    <button
                      type="button"
                      onClick={() => pickFood(food)}
                      className="w-full px-4 py-3 text-left hover:bg-zinc-800"
                    >
                      <span className="block font-medium text-zinc-100">{food.name}</span>
                      <span className="block text-sm text-zinc-500">{foodSummary(food)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selected && (
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-3 text-sm text-emerald-100">
              <p className="font-medium">{selected.name}</p>
              <p className="text-emerald-400/80">{foodSummary(selected)}</p>
              {preview && (
                <p className="mt-1 text-emerald-300/90">
                  Your portion: {formatNum(preview.calories)} kcal · {formatNum(preview.protein_g, 1)}g protein ·{" "}
                  {formatNum(preview.carbs_g, 1)}g carbs · {formatNum(preview.fat_g, 1)}g fat
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Quantity ({selected?.serving_unit ?? "amount"})</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Meal</span>
              <select
                value={meal}
                onChange={(e) => setMeal(e.target.value as Meal)}
                className={inputClass}
              >
                {MEALS.map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!selected || pending}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add to log"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <label className="block">
            <span className={labelClass}>Name</span>
            <input
              type="text"
              required
              value={custom.name}
              onChange={(e) => setCustom((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Homemade lasagna, meal prep…"
              className={`${inputClass} px-4 py-3 text-base`}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <MacroInput label="Calories (kcal)" value={custom.calories} onChange={(v) => setCustom((p) => ({ ...p, calories: v }))} required />
            <MacroInput label="Protein (g)" value={custom.protein_g} onChange={(v) => setCustom((p) => ({ ...p, protein_g: v }))} />
            <MacroInput label="Carbs (g)" value={custom.carbs_g} onChange={(v) => setCustom((p) => ({ ...p, carbs_g: v }))} />
            <MacroInput label="Fat (g)" value={custom.fat_g} onChange={(v) => setCustom((p) => ({ ...p, fat_g: v }))} />
            <MacroInput label="Saturated fat (g)" value={custom.saturated_fat_g} onChange={(v) => setCustom((p) => ({ ...p, saturated_fat_g: v }))} />
            <MacroInput label="Fibre (g)" value={custom.fiber_g} onChange={(v) => setCustom((p) => ({ ...p, fiber_g: v }))} />
            <MacroInput label="Sugars (g)" value={custom.sugar_g} onChange={(v) => setCustom((p) => ({ ...p, sugar_g: v }))} />
          </div>

          <details className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
            <summary className="cursor-pointer text-sm font-medium text-zinc-400">
              Micronutrients & vitamins (optional)
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-3 pb-1">
              <MacroInput label="Sodium (mg)" value={custom.sodium_mg} onChange={(v) => setCustom((p) => ({ ...p, sodium_mg: v }))} />
              <MacroInput label="Potassium (mg)" value={custom.potassium_mg} onChange={(v) => setCustom((p) => ({ ...p, potassium_mg: v }))} />
              <MacroInput label="Calcium (mg)" value={custom.calcium_mg} onChange={(v) => setCustom((p) => ({ ...p, calcium_mg: v }))} />
              <MacroInput label="Iron (mg)" value={custom.iron_mg} onChange={(v) => setCustom((p) => ({ ...p, iron_mg: v }))} />
              <MacroInput label="Vitamin A (mcg)" value={custom.vitamin_a_mcg} onChange={(v) => setCustom((p) => ({ ...p, vitamin_a_mcg: v }))} />
              <MacroInput label="Vitamin C (mg)" value={custom.vitamin_c_mg} onChange={(v) => setCustom((p) => ({ ...p, vitamin_c_mg: v }))} />
              <MacroInput label="Vitamin D (mcg)" value={custom.vitamin_d_mcg} onChange={(v) => setCustom((p) => ({ ...p, vitamin_d_mcg: v }))} />
              <MacroInput label="Vitamin B12 (mcg)" value={custom.vitamin_b12_mcg} onChange={(v) => setCustom((p) => ({ ...p, vitamin_b12_mcg: v }))} />
              <MacroInput label="Creatine (g)" value={custom.creatine_g} onChange={(v) => setCustom((p) => ({ ...p, creatine_g: v }))} />
              <MacroInput label="Omega-3 EPA+DHA (g)" value={custom.omega3_g} onChange={(v) => setCustom((p) => ({ ...p, omega3_g: v }))} />
            </div>
          </details>

          <label className="block">
            <span className={labelClass}>Meal</span>
            <select value={meal} onChange={(e) => setMeal(e.target.value as Meal)} className={inputClass}>
              {MEALS.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add custom item"}
          </button>
        </form>
        )
      ) : (
        <EntryListContent date={date} entries={entries} hasActivity={hasActivity} />
      )}
    </section>
  );
}

function EntryListContent({
  date,
  entries,
  hasActivity,
}: {
  date: string;
  entries: Entry[];
  hasActivity: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmReset, setConfirmReset] = useState(false);

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEntry(id);
    });
  }

  function handleResetAll() {
    startTransition(async () => {
      await resetDay(date);
      setConfirmReset(false);
    });
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-8 text-center">
          <p className="text-zinc-400">Nothing logged yet today.</p>
          <p className="mt-1 text-sm text-zinc-600">Switch to Add food to log something.</p>
        </div>

        {hasActivity && (
          <ResetAllButton
            confirmReset={confirmReset}
            pending={pending}
            onCancel={() => setConfirmReset(false)}
            onConfirm={handleResetAll}
            onRequest={() => setConfirmReset(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
      {entries.map((entry) => {
        const nutrition = entryNutrition(entry);
        if (!nutrition) return null;

        const isCustom = Boolean(entry.custom_name);

        return (
          <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-zinc-100">{entryLabel(entry)}</p>
                {isCustom && (
                  <span className="rounded-full bg-violet-950 px-2 py-0.5 text-xs text-violet-300">Custom</span>
                )}
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs capitalize text-zinc-400">
                  {entry.meal}
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                {isCustom ? (
                  <>
                    {formatNum(nutrition.calories)} kcal · {formatNum(nutrition.protein_g, 1)}g protein ·{" "}
                    {formatNum(nutrition.carbs_g, 1)}g carbs · {formatNum(nutrition.fat_g, 1)}g fat
                  </>
                ) : (
                  <>
                    {entry.quantity} {entry.food?.serving_unit} · {formatNum(nutrition.calories)} kcal ·{" "}
                    {formatNum(nutrition.protein_g, 1)}g protein
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(entry.id)}
              disabled={pending}
              className="shrink-0 rounded-lg px-2 py-1 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50"
              aria-label="Remove entry"
            >
              ✕
            </button>
          </li>
        );
      })}
      </ul>

      <ResetAllButton
        confirmReset={confirmReset}
        pending={pending}
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleResetAll}
        onRequest={() => setConfirmReset(true)}
      />
    </div>
  );
}

function ResetAllButton({
  confirmReset,
  pending,
  onRequest,
  onConfirm,
  onCancel,
}: {
  confirmReset: boolean;
  pending: boolean;
  onRequest: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (confirmReset) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3">
        <p className="text-sm text-red-200">Are you sure? This clears all food and exercise for today.</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {pending ? "Resetting…" : "Yes, reset all"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 rounded-lg border border-zinc-700 py-2 text-sm text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onRequest}
      className="w-full rounded-xl border border-zinc-800 py-2.5 text-sm text-zinc-500 transition hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400"
    >
      Reset all
    </button>
  );
}
