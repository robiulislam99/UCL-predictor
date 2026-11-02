import { describe, expect, it } from "vitest";
import { compareTallies, groupByMatchday, isLocked, scorePick, tally } from "./scoring";
import { Fixture } from "./types";

const fx = (id: string, extra: Partial<Fixture> = {}): Fixture => ({
  id,
  matchday: 1,
  kickoff: null,
  home: "A",
  away: "B",
  homeColor: "#000",
  awayColor: "#fff",
  ...extra,
});

describe("scorePick", () => {
  it("gives 3 for an exact score", () => {
    expect(scorePick({ home: 2, away: 1 }, { home: 2, away: 1 })).toBe(3);
  });
  it("gives 1 for the right outcome", () => {
    expect(scorePick({ home: 3, away: 0 }, { home: 1, away: 0 })).toBe(1);
    expect(scorePick({ home: 0, away: 0 }, { home: 2, away: 2 })).toBe(1);
  });
  it("gives 0 for the wrong outcome", () => {
    expect(scorePick({ home: 1, away: 0 }, { home: 0, away: 1 })).toBe(0);
  });
  it("returns null without a pick or result", () => {
    expect(scorePick(undefined, { home: 1, away: 0 })).toBeNull();
    expect(scorePick({ home: 1, away: 0 }, undefined)).toBeNull();
  });
});

describe("tally", () => {
  it("sums points and counts", () => {
    const list = [
      fx("a", { result: { home: 1, away: 0 } }),
      fx("b", { result: { home: 2, away: 2 } }),
      fx("c"),
    ];
    const t = tally(
      { a: { home: 1, away: 0 }, b: { home: 1, away: 1 }, c: { home: 0, away: 0 } },
      list
    );
    expect(t).toEqual({ points: 4, exact: 1, outcomes: 1, picked: 3, scored: 2 });
  });
});

describe("compareTallies", () => {
  it("breaks ties on exact scores", () => {
    const a = { points: 3, exact: 1, outcomes: 0, picked: 3, scored: 3 };
    const b = { points: 3, exact: 0, outcomes: 3, picked: 3, scored: 3 };
    expect([b, a].sort(compareTallies)[0]).toBe(a);
  });
});

describe("isLocked", () => {
  const now = Date.parse("2026-09-08T19:00:00Z");
  it("is open with no kickoff", () => expect(isLocked(fx("a"), now)).toBe(false));
  it("locks at kickoff", () => {
    expect(isLocked(fx("a", { kickoff: "2026-09-08T19:00:00Z" }), now)).toBe(true);
    expect(isLocked(fx("a", { kickoff: "2026-09-08T19:00:01Z" }), now)).toBe(false);
  });
  it("locks once a result exists", () => {
    expect(isLocked(fx("a", { result: { home: 0, away: 0 } }), now)).toBe(true);
  });
});

describe("groupByMatchday", () => {
  it("orders matchdays with unscheduled last, fixtures by kickoff", () => {
    const groups = groupByMatchday([
      fx("x", { matchday: null }),
      fx("late", { matchday: 2, kickoff: "2026-09-30T19:00:00Z" }),
      fx("early", { matchday: 2, kickoff: "2026-09-29T16:45:00Z" }),
      fx("one", { matchday: 1 }),
    ]);
    expect(groups.map((g) => g.matchday)).toEqual([1, 2, null]);
    expect(groups[1].fixtures.map((f) => f.id)).toEqual(["early", "late"]);
  });
});
