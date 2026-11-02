"use client";

import { useEffect, useRef, useState } from "react";
import { fixtures } from "@/lib/fixtures";
import { groupByMatchday, isLocked, MatchdayGroup, tally } from "@/lib/scoring";
import { formatRange } from "@/lib/format";
import { Pick, Picks } from "@/lib/types";
import FixtureCard from "./FixtureCard";
import { CheckIcon } from "./icons";

const groups = groupByMatchday(fixtures);

/** The matchday to open on: the first one with an unlocked fixture, else the last. */
function defaultMatchday(now: number) {
  const open = groups.find((g) => g.fixtures.some((f) => !isLocked(f, now)));
  return (open ?? groups[groups.length - 1]).matchday;
}

function tabLabel(g: MatchdayGroup) {
  return g.matchday ? `MD${g.matchday}` : "TBD";
}

/** All fixtures, one matchday at a time. Editable unless `onChange` is omitted. */
export default function Board({
  picks,
  now,
  onChange,
}: {
  picks: Picks | undefined;
  now: number;
  onChange?: (fixtureId: string, p: Pick) => void;
}) {
  const [selected, setSelected] = useState(() => defaultMatchday(now));
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, groups.findIndex((g) => g.matchday === selected));
  const group = groups[index];
  const first = group.fixtures[0]?.kickoff;
  const last = group.fixtures[group.fixtures.length - 1]?.kickoff;
  const t = tally(picks, group.fixtures);
  const open = group.fixtures.filter((f) => !isLocked(f, now)).length;

  // Keep the selected tab visible in the horizontal scroller.
  useEffect(() => {
    tabRefs.current[index]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [index]);

  const select = (i: number) => {
    const next = (i + groups.length) % groups.length;
    setSelected(groups[next].matchday);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: groups.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      select(keys[e.key]);
    }
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Matchdays"
        onKeyDown={onKeyDown}
        className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        {groups.map((g, i) => {
          const active = i === index;
          const called = g.fixtures.filter((f) => picks?.[f.id]).length;
          const done = called === g.fixtures.length;
          return (
            <button
              key={g.matchday ?? "tbd"}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`md-tab-${i}`}
              aria-selected={active}
              aria-controls="matchday-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(g.matchday)}
              className={`flex min-w-[4.25rem] shrink-0 flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors ${
                active ? "border-violet bg-violet-soft" : "border-line bg-surface hover:border-line-strong"
              }`}
            >
              <span className="font-mono text-xs font-bold">{tabLabel(g)}</span>
              <span className={`mt-0.5 flex items-center gap-1 text-[11px] ${done ? "text-green" : "text-muted"}`}>
                {done && <CheckIcon className="h-3 w-3" />}
                {called}/{g.fixtures.length}
              </span>
            </button>
          );
        })}
      </div>

      <section id="matchday-panel" role="tabpanel" aria-labelledby={`md-tab-${index}`}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-display text-xl font-black tracking-tight">
            {group.matchday ? `Matchday ${group.matchday}` : "Schedule TBD"}
            {first && last && <span className="ml-2 font-sans text-sm font-medium text-muted">{formatRange(first, last)}</span>}
          </h2>
          <p className="text-sm text-muted">
            {open > 0 ? `${open} open` : "All locked"}
            {t.scored > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-gold">{t.points} pts</span> this matchday
              </>
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {group.fixtures.map((f) => (
            <FixtureCard
              key={f.id}
              fixture={f}
              pick={picks?.[f.id]}
              now={now}
              readOnly={!onChange}
              locked={isLocked(f, now)}
              onChange={onChange && ((p) => onChange(f.id, p))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function StatRow({ items }: { items: { label: string; value: React.ReactNode; hint?: string }[] }) {
  return (
    <dl className="mb-8 grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((s) => (
        <div key={s.label} className="card px-3 py-3 sm:px-5 sm:py-4">
          <dt className="text-[10px] font-medium uppercase tracking-widest text-muted sm:text-[11px]">{s.label}</dt>
          <dd className="mt-1 font-mono text-xl font-bold sm:text-3xl">{s.value}</dd>
          {s.hint && <dd className="mt-0.5 hidden text-xs text-muted sm:block">{s.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
