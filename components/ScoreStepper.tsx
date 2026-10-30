"use client";

export default function ScoreStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(Math.min(19, value + 1));

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          aria-label={`Decrease ${label} score`}
          className="h-7 w-7 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-violet)] transition-colors cursor-pointer"
        >
          −
        </button>
        <div
          className="score-font w-11 h-12 flex items-center justify-center rounded-lg text-2xl font-bold"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--accent-gold)",
            boxShadow: "inset 0 0 12px rgba(245,185,66,0.12)",
          }}
        >
          {value}
        </div>
        <button
          type="button"
          onClick={inc}
          aria-label={`Increase ${label} score`}
          className="h-7 w-7 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-violet)] transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}
