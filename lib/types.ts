export type Score = {
  home: number;
  away: number;
};

export type Fixture = {
  id: string; // stable — saved picks are keyed by this, never rename it
  matchday: number | null; // null until UEFA publishes the schedule
  kickoff: string | null; // ISO 8601 with timezone, e.g. "2026-09-08T19:00:00Z"
  home: string;
  away: string;
  homeColor: string; // hex, used for the badge
  awayColor: string;
  result?: Score; // full-time score; add it once the match is played
};

export type Pick = Score;

export type Picks = Record<string, Pick>; // keyed by Fixture.id

export type PredictionDoc = {
  displayName: string;
  photoURL?: string | null;
  updatedAt?: unknown; // Firestore Timestamp
  picks?: Picks;
};

export type League = {
  code: string;
  name: string;
  ownerUid: string;
  members: string[];
};
