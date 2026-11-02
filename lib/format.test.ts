import { describe, expect, it } from "vitest";
import { countdown, initials, ordinal, plural } from "./format";

const MIN = 60_000;
const HOUR = 60 * MIN;

describe("countdown", () => {
  it("shows minutes under an hour", () => {
    expect(countdown(45 * MIN)).toBe("45m");
    expect(countdown(0)).toBe("0m");
  });

  it("never goes negative", () => {
    expect(countdown(-5 * MIN)).toBe("0m");
  });

  it("shows hours and minutes under two days", () => {
    expect(countdown(5 * HOUR + 12 * MIN)).toBe("5h 12m");
    expect(countdown(47 * HOUR + 59 * MIN)).toBe("47h 59m");
  });

  it("shows whole days from two days out", () => {
    expect(countdown(48 * HOUR)).toBe("2d");
    expect(countdown(80 * HOUR)).toBe("3d");
  });
});

describe("initials", () => {
  it("uses the first and last name", () => {
    expect(initials("Robiul Islam")).toBe("RI");
    expect(initials("Md Robiul Islam")).toBe("MI");
  });

  it("handles single names, extra spaces and missing names", () => {
    expect(initials("  amira  ")).toBe("A");
    expect(initials("")).toBe("?");
    expect(initials(null)).toBe("?");
  });
});

describe("ordinal", () => {
  it("handles st, nd, rd and the teens", () => {
    expect([1, 2, 3, 4].map(ordinal)).toEqual(["1st", "2nd", "3rd", "4th"]);
    expect([11, 12, 13].map(ordinal)).toEqual(["11th", "12th", "13th"]);
    expect([21, 22, 23, 101, 111].map(ordinal)).toEqual(["21st", "22nd", "23rd", "101st", "111th"]);
  });
});

describe("plural", () => {
  it("adds an s except for one", () => {
    expect(plural(1, "player")).toBe("1 player");
    expect(plural(0, "player")).toBe("0 players");
    expect(plural(5, "fixture")).toBe("5 fixtures");
  });
});
