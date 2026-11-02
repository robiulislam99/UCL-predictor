"use client";

import { MAX_GOALS } from "@/lib/scoring";

export default function ScoreStepper({
  value,
  onChange,
  label,
  team,
}: {
  value: number | null; // null = not picked yet
  onChange: (v: number) => void;
  label: string;
  team: string;
}) {
  const current = value ?? 0;
  const dec = () => onChange(value === null ? 0 : Math.max(0, current - 1));
  const inc = () => onChange(Math.min(MAX_GOALS, value === null ? 1 : current + 1));

  const btn =
    "h-9 w-9 sm:h-7 sm:w-7 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-violet)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col items-center gap-1.5" role="group" aria-label={`${team} goals`}>
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]" aria-hidden>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          disabled={value === 0}
          aria-label={`Fewer goals for ${team}`}
          className={btn}
        >
          −
        </button>
        <output
          aria-live="polite"
          aria-label={`${team}: ${value ?? "no pick"}`}
          className="score-box score-font w-11 h-12 flex items-center justify-center rounded-lg text-2xl font-bold"
          data-empty={value === null || undefined}
        >
          {value ?? "–"}
        </output>
        <button
          type="button"
          onClick={inc}
          disabled={value === MAX_GOALS}
          aria-label={`More goals for ${team}`}
          className={btn}
        >
          +
        </button>
      </div>
    </div>
  );
}
