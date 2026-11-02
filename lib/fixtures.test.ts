import { describe, expect, it } from "vitest";
import { fixtures } from "./fixtures";
import { TEAMS, TeamName } from "./teams";

// UEFA league-phase format: 36 clubs, 8 matchdays, 8 different opponents
// each (4 home, 4 away), 2 from each pot (1 home + 1 away per pot).
describe("league-phase fixtures follow the UEFA format", () => {
  const teams = Object.keys(TEAMS) as TeamName[];

  it("has 144 matches with unique ids", () => {
    expect(fixtures).toHaveLength(144);
    expect(new Set(fixtures.map((f) => f.id)).size).toBe(144);
  });

  it("has 18 matches per matchday, nobody playing twice in one", () => {
    for (let md = 1; md <= 8; md++) {
      const day = fixtures.filter((f) => f.matchday === md);
      expect(day, `matchday ${md}`).toHaveLength(18);
      const playing = day.flatMap((f) => [f.home, f.away]);
      expect(new Set(playing).size, `matchday ${md}`).toBe(36);
    }
  });

  it("gives every club 4 home and 4 away games against 8 different opponents", () => {
    for (const t of teams) {
      const home = fixtures.filter((f) => f.home === t);
      const away = fixtures.filter((f) => f.away === t);
      expect(home, t).toHaveLength(4);
      expect(away, t).toHaveLength(4);
      const opponents = [...home.map((f) => f.away), ...away.map((f) => f.home)];
      expect(new Set(opponents).size, t).toBe(8);
    }
  });

  it("draws 1 home + 1 away opponent from each pot", () => {
    for (const t of teams) {
      for (const pot of [1, 2, 3, 4]) {
        const home = fixtures.filter((f) => f.home === t && TEAMS[f.away as TeamName].pot === pot);
        const away = fixtures.filter((f) => f.away === t && TEAMS[f.home as TeamName].pot === pot);
        expect([home.length, away.length], `${t} vs pot ${pot}`).toEqual([1, 1]);
      }
    }
  });

  it("uses valid UTC kickoffs inside the league-phase window", () => {
    for (const f of fixtures) {
      expect(f.kickoff).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:00Z$/);
      const t = Date.parse(f.kickoff!);
      expect(t).toBeGreaterThan(Date.parse("2026-09-01"));
      expect(t).toBeLessThan(Date.parse("2027-02-01"));
    }
  });

  it("only has results for matches that have kicked off", () => {
    for (const f of fixtures.filter((x) => x.result)) {
      expect(Date.parse(f.kickoff!)).toBeLessThan(Date.now());
    }
  });
});
