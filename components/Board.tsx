"use client";

import { useState } from "react";
import { fixtures } from "@/lib/fixtures";
import { groupByMatchday, isLocked, MatchdayGroup, tally } from "@/lib/scoring";
import { Pick, Picks } from "@/lib/types";
import FixtureCard from "./FixtureCard";

const groups = groupByMatchday(fixtures);

/** The matchday to open on: the first one with an unlocked fixture, else the last. */
function defaultMatchday(now: number) {
  const open = groups.find((g) => g.fixtures.some((f) => !isLocked(f, now)));
  return (open ?? groups[groups.length - 1]).matchday;
}

function tabLabel(g: MatchdayGroup) {
  return g.matchday ? `MD${g.matchday}` : "TBD";
}

const dayFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

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
  const group = groups.find((g) => g.matchday === selected) ?? groups[0];
  const first = group.fixtures[0]?.kickoff;
  const last = group.fixtures[group.fixtures.length - 1]?.kickoff;
  const t = tally(picks, group.fixtures);
  const open = group.fixtures.filter((f) => !isLocked(f, now)).length;

  return (
    <div>
      <div role="tablist" aria-label="Matchdays" className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {groups.map((g) => {
          const active = g.matchday === selected;
          const called = g.fixtures.filter((f) => picks?.[f.id]).length;
          const done = called === g.fixtures.length;
          return (
            <button
              key={g.matchday ?? "tbd"}
              role="tab"
              aria-selected={active}
              aria-controls="matchday-panel"
              onClick={() => setSelected(g.matchday)}
              className={`shrink-0 rounded-lg px-3 py-2 text-left border transition-colors cursor-pointer ${
                active
                  ? "border-[var(--accent-violet)] bg-[var(--accent-violet-soft)]"
                  : "border-[var(--border)] hover:border-[var(--accent-violet)]"
              }`}
            >
              <span className="score-font text-xs font-bold block">{tabLabel(g)}</span>
              <span className={`text-[10px] ${done ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>
                {called}/{g.fixtures.length}
              </span>
            </button>
          );
        })}
      </div>

      <section id="matchday-panel" role="tabpanel" aria-label={group.matchday ? `Matchday ${group.matchday}` : "Unscheduled"}>
        <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
          <h2 className="score-font text-xs tracking-[0.25em] uppercase text-[var(--accent-gold)]">
            {group.matchday ? `Matchday ${group.matchday}` : "Schedule TBD"}
            {first && last && (
              <span className="text-[var(--text-muted)] tracking-normal normal-case ml-2">
                {dayFormat.format(new Date(first))}
                {dayFormat.format(new Date(first)) !== dayFormat.format(new Date(last)) &&
                  ` – ${dayFormat.format(new Date(last))}`}
              </span>
            )}
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            {open > 0 ? `${open} open` : "All locked"}
            {t.scored > 0 && ` · ${t.points} pts this matchday`}
          </span>
        </div>
        <div className="flex flex-col gap-3">
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

export function StatRow({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-3 gap-3 mb-8">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <dt className="text-[11px] uppercase tracking-widest text-[var(--text-muted)]">{s.label}</dt>
          <dd className="score-font text-2xl font-bold mt-1">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
