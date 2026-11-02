"use client";

import { Fixture, Pick } from "@/lib/types";
import { POINTS, scorePick } from "@/lib/scoring";
import { teamCode } from "@/lib/teams";
import ScoreStepper from "./ScoreStepper";

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
    <div
      aria-hidden
      className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-[11px] tracking-tight shrink-0 ring-1 ring-white/10"
      style={{ background: color, color: textOn(color) }}
    >
      {label}
    </div>
  );
}

const kickoffFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function countdown(ms: number) {
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ${mins % 60}m`;
  return `${Math.floor(hours / 24)}d`;
}

function Status({ fixture, locked, now }: { fixture: Fixture; locked: boolean; now: number }) {
  if (fixture.result) {
    return (
      <span className="chip">
        FT {fixture.result.home}–{fixture.result.away}
      </span>
    );
  }
  if (locked) {
    const started = fixture.kickoff ? now - Date.parse(fixture.kickoff) : 0;
    return (
      <span className="chip chip-muted">
        {started > 2.5 * 3_600_000 ? "Locked · awaiting result" : "Locked · in play"}
      </span>
    );
  }
  if (!fixture.kickoff) return <span className="text-[var(--text-muted)]">Kickoff TBD</span>;
  const left = Date.parse(fixture.kickoff) - now;
  return (
    <span className="text-[var(--text-muted)]">
      {kickoffFormat.format(new Date(fixture.kickoff))}
      {left < 72 * 3_600_000 && (
        <span className="ml-1.5 text-[var(--accent-gold)]">· locks in {countdown(left)}</span>
      )}
    </span>
  );
}

function PointsBadge({ points }: { points: number }) {
  const tone =
    points === POINTS.exact ? "chip-gold" : points === POINTS.outcome ? "chip-green" : "chip-muted";
  return <span className={`chip ${tone}`}>+{points} pt{points === 1 ? "" : "s"}</span>;
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
  const showStatic = readOnly || locked;

  return (
    <article
      className="ticket px-5 py-4"
      aria-label={`${fixture.home} vs ${fixture.away}`}
      data-locked={locked || undefined}
    >
      <div className="flex items-center justify-between gap-2 text-xs mb-3 min-h-5">
        <Status fixture={fixture} locked={locked} now={now} />
        {points !== null && <PointsBadge points={points} />}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Badge team={fixture.home} color={fixture.homeColor} />
          <p className="font-semibold truncate text-sm sm:text-base">{fixture.home}</p>
        </div>

        <div className="ticket-divider px-2 sm:px-4 flex items-center gap-2 sm:gap-3">
          {showStatic ? (
            <div
              className="score-font flex items-center gap-2 text-2xl font-bold"
              aria-label={pick ? `Pick ${pick.home}–${pick.away}` : "No pick"}
            >
              <span className={pick ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]"}>
                {pick?.home ?? "–"}
              </span>
              <span className="text-[var(--text-muted)]">:</span>
              <span className={pick ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]"}>
                {pick?.away ?? "–"}
              </span>
            </div>
          ) : (
            <>
              <ScoreStepper
                label="Home"
                team={fixture.home}
                value={pick?.home ?? null}
                onChange={(v) => onChange?.({ home: v, away: pick?.away ?? 0 })}
              />
              <span className="text-[var(--text-muted)] score-font pt-5" aria-hidden>
                :
              </span>
              <ScoreStepper
                label="Away"
                team={fixture.away}
                value={pick?.away ?? null}
                onChange={(v) => onChange?.({ home: pick?.home ?? 0, away: v })}
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-3 min-w-0 justify-end">
          <p className="font-semibold truncate text-right text-sm sm:text-base">{fixture.away}</p>
          <Badge team={fixture.away} color={fixture.awayColor} />
        </div>
      </div>
    </article>
  );
}
