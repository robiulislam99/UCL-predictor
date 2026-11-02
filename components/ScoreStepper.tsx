"use client";

import { MAX_GOALS } from "@/lib/scoring";
import { MinusIcon, PlusIcon } from "./icons";

const btn =
  "grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface-2 text-muted transition-colors hover:border-violet hover:text-fg active:bg-surface-3 disabled:pointer-events-none disabled:opacity-30 sm:h-9 sm:w-9";

/** − [n] + control for one side's goals. `null` means not picked yet. */
export default function ScoreStepper({
  value,
  onChange,
  team,
}: {
  value: number | null;
  onChange: (v: number) => void;
  team: string;
}) {
  const current = value ?? 0;
  const dec = () => onChange(value === null ? 0 : Math.max(0, current - 1));
  const inc = () => onChange(Math.min(MAX_GOALS, value === null ? 1 : current + 1));

  return (
    <div className="flex shrink-0 items-center gap-1" role="group" aria-label={`${team} goals`}>
      <button type="button" onClick={dec} disabled={value === 0} aria-label={`Fewer goals for ${team}`} className={btn}>
        <MinusIcon className="h-4 w-4" />
      </button>
      <output
        aria-live="polite"
        aria-label={`${team}: ${value ?? "no pick"}`}
        className={`grid h-10 w-10 place-items-center rounded-lg border font-mono text-xl font-bold sm:h-9 ${
          value === null
            ? "border-line bg-canvas text-muted"
            : "border-gold/30 bg-canvas text-gold shadow-[inset_0_0_12px_rgba(245,185,66,0.12)]"
        }`}
      >
        {value ?? "–"}
      </output>
      <button type="button" onClick={inc} disabled={value === MAX_GOALS} aria-label={`More goals for ${team}`} className={btn}>
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
