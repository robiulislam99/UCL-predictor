"use client";

import { Fixture, Pick } from "@/lib/types";
import ScoreStepper from "./ScoreStepper";

function Badge({ team, color }: { team: string; color: string }) {
  const initials = team
    .split(" ")
    .filter((w) => !["de", "of", "cp", "fc"].includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
      style={{ background: color, color: "#0a0f1e" }}
    >
      {initials}
    </div>
  );
}

export default function FixtureCard({
  fixture,
  pick,
  onChange,
  readOnly = false,
}: {
  fixture: Fixture;
  pick?: Pick;
  onChange?: (p: Pick) => void;
  readOnly?: boolean;
}) {
  const home = pick?.home ?? 0;
  const away = pick?.away ?? 0;

  return (
    <div className="ticket px-5 py-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Badge team={fixture.home} color={fixture.homeColor} />
        <div className="min-w-0">
          <p className="font-semibold truncate">{fixture.home}</p>
          <p className="text-xs text-[var(--text-muted)]">
            MD{fixture.matchday} · {fixture.date === "TBD" ? "Date TBD" : fixture.date}
          </p>
        </div>
      </div>

      <div className="ticket-divider px-4 flex items-center gap-3">
        {readOnly ? (
          <div className="score-font flex items-center gap-2 text-2xl font-bold">
            <span style={{ color: "var(--accent-gold)" }}>{home}</span>
            <span className="text-[var(--text-muted)]">–</span>
            <span style={{ color: "var(--accent-gold)" }}>{away}</span>
          </div>
        ) : (
          <>
            <ScoreStepper
              label="HOME"
              value={home}
              onChange={(v) => onChange?.({ home: v, away })}
            />
            <span className="text-[var(--text-muted)] score-font pb-5">–</span>
            <ScoreStepper
              label="AWAY"
              value={away}
              onChange={(v) => onChange?.({ home, away: v })}
            />
          </>
        )}
      </div>

      <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
        <div className="min-w-0 text-right">
          <p className="font-semibold truncate">{fixture.away}</p>
          <p className="text-xs text-[var(--text-muted)]">Away</p>
        </div>
        <Badge team={fixture.away} color={fixture.awayColor} />
      </div>
    </div>
  );
}
