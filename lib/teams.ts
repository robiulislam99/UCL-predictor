// The 36 clubs in the 2026/27 league phase, by seeding pot.
// `color` only tints the badge; `code` is the 3-letter badge label.
export const TEAMS = {
  // Pot 1
  "Paris Saint-Germain": { code: "PSG", color: "#004170", pot: 1 },
  "Bayern Munich": { code: "FCB", color: "#DC052D", pot: 1 },
  "Real Madrid": { code: "RMA", color: "#FFFFFF", pot: 1 },
  Liverpool: { code: "LIV", color: "#C8102E", pot: 1 },
  "Inter Milan": { code: "INT", color: "#0068A8", pot: 1 },
  "Manchester City": { code: "MCI", color: "#6CABDD", pot: 1 },
  Arsenal: { code: "ARS", color: "#EF0107", pot: 1 },
  Barcelona: { code: "BAR", color: "#A50044", pot: 1 },
  "Atlético Madrid": { code: "ATM", color: "#CB3524", pot: 1 },
  // Pot 2
  "Borussia Dortmund": { code: "BVB", color: "#FDE100", pot: 2 },
  Roma: { code: "ROM", color: "#8E1F2F", pot: 2 },
  "Sporting CP": { code: "SCP", color: "#00843D", pot: 2 },
  "Aston Villa": { code: "AVL", color: "#670E36", pot: 2 },
  Porto: { code: "POR", color: "#00428C", pot: 2 },
  "Manchester United": { code: "MUN", color: "#DA291C", pot: 2 },
  "Club Brugge": { code: "BRU", color: "#0067CE", pot: 2 },
  "Real Betis": { code: "BET", color: "#00954C", pot: 2 },
  "PSV Eindhoven": { code: "PSV", color: "#ED1C24", pot: 2 },
  // Pot 3
  Feyenoord: { code: "FEY", color: "#E00000", pot: 3 },
  Lille: { code: "LIL", color: "#E01E13", pot: 3 },
  "Bodø/Glimt": { code: "BOD", color: "#FFE600", pot: 3 },
  Napoli: { code: "NAP", color: "#12A0D7", pot: 3 },
  "RB Leipzig": { code: "RBL", color: "#DD0741", pot: 3 },
  Villarreal: { code: "VIL", color: "#FFE667", pot: 3 },
  Fenerbahçe: { code: "FEN", color: "#163962", pot: 3 },
  "Shakhtar Donetsk": { code: "SHA", color: "#F26522", pot: 3 },
  Galatasaray: { code: "GAL", color: "#A90432", pot: 3 },
  // Pot 4
  "Slavia Prague": { code: "SLA", color: "#E30613", pot: 4 },
  "Slovan Bratislava": { code: "SLO", color: "#6CACE4", pot: 4 },
  "VfB Stuttgart": { code: "VFB", color: "#E32219", pot: 4 },
  "AEK Athens": { code: "AEK", color: "#FFD200", pot: 4 },
  LASK: { code: "LASK", color: "#1F1F1F", pot: 4 },
  Como: { code: "COM", color: "#1E4FA0", pot: 4 },
  Lens: { code: "RCL", color: "#FFD100", pot: 4 },
  Viking: { code: "VIK", color: "#00205B", pot: 4 },
  Sabah: { code: "SAB", color: "#1D4E9E", pot: 4 },
} as const satisfies Record<string, { code: string; color: string; pot: 1 | 2 | 3 | 4 }>;

export type TeamName = keyof typeof TEAMS;

export function teamCode(name: string) {
  return (TEAMS as Record<string, { code: string }>)[name]?.code;
}
