import { Fixture } from "./types";

// Seeded from the 2026/27 UEFA Champions League league-phase draw
// (Monaco, 27 August 2026). UEFA publishes exact matchday-by-matchday
// dates and kick-off times by 29 August 2026 — swap in real dates below
// as soon as they're out. Matchday 1 window: 8–10 September 2026.
//
// Add / edit matches freely — this file is the single source of truth
// for what shows up on the prediction board. `homeColor` / `awayColor`
// just tint the badge, they don't need to be exact club colours.
export const fixtures: Fixture[] = [
  {
    id: "md1-psg-barcelona",
    matchday: 1,
    date: "TBD",
    home: "Paris Saint-Germain",
    away: "Barcelona",
    homeColor: "#1E3A8A",
    awayColor: "#A50044",
  },
  {
    id: "md1-arsenal-realmadrid",
    matchday: 1,
    date: "TBD",
    home: "Arsenal",
    away: "Real Madrid",
    homeColor: "#EF4444",
    awayColor: "#FFFFFF",
  },
  {
    id: "md1-mancity-psg",
    matchday: 1,
    date: "TBD",
    home: "Manchester City",
    away: "Paris Saint-Germain",
    homeColor: "#6CABDD",
    awayColor: "#1E3A8A",
  },
  {
    id: "md1-manutd-bayern",
    matchday: 1,
    date: "TBD",
    home: "Manchester United",
    away: "Bayern Munich",
    homeColor: "#DA291C",
    awayColor: "#DC052D",
  },
  {
    id: "md1-liverpool-atletico",
    matchday: 1,
    date: "TBD",
    home: "Liverpool",
    away: "Atletico Madrid",
    homeColor: "#C8102E",
    awayColor: "#272E61",
  },
  {
    id: "md1-arsenal-dortmund",
    matchday: 1,
    date: "TBD",
    home: "Arsenal",
    away: "Borussia Dortmund",
    homeColor: "#EF4444",
    awayColor: "#FDE100",
  },
  {
    id: "md1-mancity-sporting",
    matchday: 1,
    date: "TBD",
    home: "Manchester City",
    away: "Sporting CP",
    homeColor: "#6CABDD",
    awayColor: "#00843D",
  },
  {
    id: "md1-manutd-roma",
    matchday: 1,
    date: "TBD",
    home: "Manchester United",
    away: "Roma",
    homeColor: "#DA291C",
    awayColor: "#8E1F2F",
  },
  {
    id: "md1-psg-roma",
    matchday: 1,
    date: "TBD",
    home: "Paris Saint-Germain",
    away: "Roma",
    homeColor: "#1E3A8A",
    awayColor: "#8E1F2F",
  },
  {
    id: "md1-liverpool-porto",
    matchday: 1,
    date: "TBD",
    home: "Liverpool",
    away: "Porto",
    homeColor: "#C8102E",
    awayColor: "#00447C",
  },
];
