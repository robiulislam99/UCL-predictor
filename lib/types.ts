export type Fixture = {
  id: string;
  matchday: number;
  date: string; // ISO date, or "TBD" if UEFA hasn't published exact kickoff yet
  home: string;
  away: string;
  homeColor: string; // hex, used for the badge
  awayColor: string;
};

export type Pick = {
  home: number;
  away: number;
};

export type PredictionDoc = {
  displayName: string;
  photoURL?: string;
  updatedAt: number;
  picks: Record<string, Pick>; // keyed by Fixture.id
};
