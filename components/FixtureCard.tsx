"use client";

import { Fixture, Pick } from "@/lib/types";
import { POINTS, scorePick } from "@/lib/scoring";
import { teamCode } from "@/lib/teams";
import { countdown, formatKickoff } from "@/lib/format";
import ScoreStepper from "./ScoreStepper";
import { ClockIcon, LockIcon } from "./icons";

/** Dark or light text, whichever reads better on the badge colour. */
function textOn(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.18 ? "#0a0f1e" : "#ffffff";
}

function Badge({ team, color }: { team: string; color: string }) {
  const label =
    teamCode(team) ??
    team
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  return (
    <span
      aria-hidden
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-bold tracking-tight ring-1 ring-white/10"
      style={{ background: color, color: textOn(color) }}
    >
      {label}
    </span>
  );
}

const HOUR = 3_600_000;

function StatusLine({ fixture, locked, now }: { fixture: Fixture; locked: boolean; now: number }) {
  const when = fixture.kickoff ? formatKickoff(fixture.kickoff) : null;
  const whenText = when ? `${when.day} · ${when.time}` : "Kickoff TBD";

  if (fixture.result) {
    return (
      <span className="flex items-center gap-2 text-muted">
        <span className="chip">FT</span>
        {when?.day}
      </span>
    );
  }
  if (locked) {
    const started = fixture.kickoff ? now - Date.parse(fixture.kickoff) : 0;
    return (
      <span className="flex items-center gap-1.5 text-muted">
        <LockIcon className="h-3.5 w-3.5" />
        {started > 2.5 * HOUR ? "Locked · awaiting result" : "Locked · in play"}
      </span>
    );
  }
  return <span className="text-muted">{whenText}</span>;
}

function Aside({ fixture, locked, now, points }: { fixture: Fixture; locked: boolean; now: number; points: number | null }) {
  if (points !== null) {
    const tone = points === POINTS.exact ? "chip-gold" : points === POINTS.outcome ? "chip-green" : "chip-muted";
    const label = points === POINTS.exact ? "Exact" : points === POINTS.outcome ? "Result" : "Miss";
    return (
      <span className={`chip ${tone}`}>
        +{points} pt{points === 1 ? "" : "s"} · {label}
      </span>
    );
  }
  if (fixture.result) return <span className="chip chip-muted">No pick</span>;
  if (locked || !fixture.kickoff) return null;
  const left = Date.parse(fixture.kickoff) - now;
  if (left >= 72 * HOUR) return null;
  return (
    <span className={`chip ${left < 3 * HOUR ? "chip-gold" : "chip-violet"}`}>
      <ClockIcon className="h-3 w-3" />
      Locks in {countdown(left)}
    </span>
  );
}

function ScoreValue({ value, tone }: { value: number | undefined; tone: "result" | "pick" }) {
  return (
    <span
      className={`grid h-9 w-10 place-items-center rounded-lg font-mono text-lg font-bold ${
        tone === "result" ? "bg-surface-2 text-fg" : value === undefined ? "text-muted" : "text-gold"
      }`}
    >
      {value ?? "–"}
    </span>
  );
}

export default function FixtureCard({
  fixture,
  pick,
  onChange,
  readOnly = false,
  locked = false,
  now,
}: {
  fixture: Fixture;
  pick?: Pick;
  onChange?: (p: Pick) => void;
  readOnly?: boolean;
  locked?: boolean;
  now: number;
}) {
  const points = scorePick(pick, fixture.result);
  const editable = !readOnly && !locked;
  const sides = [
    { key: "home" as const, team: fixture.home, color: fixture.homeColor },
    { key: "away" as const, team: fixture.away, color: fixture.awayColor },
  ];

  return (
    <article
      className={`card overflow-hidden transition-colors ${editable ? "hover:border-line-strong" : "bg-surface/70"}`}
      aria-label={`${fixture.home} vs ${fixture.away}`}
    >
      <div className="flex min-h-11 items-center justify-between gap-2 border-b border-line px-4 py-2 text-xs">
        <StatusLine fixture={fixture} locked={locked} now={now} />
        <Aside fixture={fixture} locked={locked} now={now} points={points} />
      </div>

      {!editable && (
        <div className="flex justify-end gap-1 px-4 pt-2 text-[10px] uppercase tracking-widest text-muted" aria-hidden>
          {fixture.result && <span className="w-10 text-center">FT</span>}
          <span className="w-10 text-center">Pick</span>
        </div>
      )}

      <div className={`px-4 ${editable ? "py-2" : "pb-2"}`}>
        {sides.map(({ key, team, color }) => (
          <div key={key} className="flex items-center gap-3 py-1.5">
            <Badge team={team} color={color} />
            <span className="min-w-0 flex-1 text-[15px] font-semibold leading-tight">{team}</span>
            {editable ? (
              <ScoreStepper
                team={team}
                value={pick ? pick[key] : null}
                onChange={(v) => {
                  const base = pick ?? { home: 0, away: 0 };
                  onChange?.({ ...base, [key]: v });
                }}
              />
            ) : (
              <span className="flex gap-1" aria-label={`${team}: ${fixture.result ? `scored ${fixture.result[key]}, ` : ""}pick ${pick ? pick[key] : "none"}`}>
                {fixture.result && <ScoreValue value={fixture.result[key]} tone="result" />}
                <ScoreValue value={pick?.[key]} tone="pick" />
              </span>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}
