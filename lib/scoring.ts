import { Fixture, Pick, Picks, Score } from "./types";

export const POINTS = { exact: 3, outcome: 1 } as const;

export const MAX_GOALS = 19;

function outcome(s: Score) {
  return Math.sign(s.home - s.away);
}

/** Points for one pick, or null if the match has no result yet / no pick. */
export function scorePick(pick: Pick | undefined, result: Score | undefined) {
  if (!pick || !result) return null;
  if (pick.home === result.home && pick.away === result.away) return POINTS.exact;
  if (outcome(pick) === outcome(result)) return POINTS.outcome;
  return 0;
}

export type Tally = {
  points: number;
  exact: number;
  outcomes: number;
  picked: number;
  scored: number; // fixtures with a result that the player picked
};

export function tally(picks: Picks | undefined, list: Fixture[]): Tally {
  const t: Tally = { points: 0, exact: 0, outcomes: 0, picked: 0, scored: 0 };
  for (const f of list) {
    const pick = picks?.[f.id];
    if (pick) t.picked++;
    const pts = scorePick(pick, f.result);
    if (pts === null) continue;
    t.scored++;
    t.points += pts;
    if (pts === POINTS.exact) t.exact++;
    else if (pts === POINTS.outcome) t.outcomes++;
  }
  return t;
}

/** Leaderboard order: points, then exact scores, then correct outcomes. */
export function compareTallies(a: Tally, b: Tally) {
  return b.points - a.points || b.exact - a.exact || b.outcomes - a.outcomes;
}

/** A fixture is locked from kickoff onwards, or once it has a result. */
export function isLocked(f: Fixture, now: number) {
  if (f.result) return true;
  if (!f.kickoff) return false;
  return Date.parse(f.kickoff) <= now;
}

export type MatchdayGroup = { matchday: number | null; fixtures: Fixture[] };

/** Group by matchday (unscheduled last), each group sorted by kickoff. */
export function groupByMatchday(list: Fixture[]): MatchdayGroup[] {
  const map = new Map<number | null, Fixture[]>();
  for (const f of list) {
    const g = map.get(f.matchday) ?? [];
    g.push(f);
    map.set(f.matchday, g);
  }
  const time = (f: Fixture) => (f.kickoff ? Date.parse(f.kickoff) : Infinity);
  return [...map.entries()]
    .sort(([a], [b]) => (a ?? Infinity) - (b ?? Infinity))
    .map(([matchday, fs]) => ({
      matchday,
      fixtures: [...fs].sort((x, y) => time(x) - time(y)),
    }));
}
