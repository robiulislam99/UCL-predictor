/** Time until kickoff, compact: "45m", "5h 12m", "3d". */
export function countdown(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60_000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ${mins % 60}m`;
  return `${Math.floor(hours / 24)}d`;
}

/** Up to two initials for an avatar placeholder: "Robiul Islam" -> "RI". */
export function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** 1 -> "1st", 2 -> "2nd", 11 -> "11th", 23 -> "23rd". */
export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** "1 player" / "3 players". */
export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// Kickoffs are shown in the visitor's own time zone and locale.
const kickoffDay = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });
const kickoffTime = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
const shortDay = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

export function formatKickoff(iso: string) {
  const d = new Date(iso);
  return { day: kickoffDay.format(d), time: kickoffTime.format(d) };
}

/** "3 Nov" or "3 Nov – 4 Nov" for a matchday's first and last kickoff. */
export function formatRange(firstIso: string, lastIso: string) {
  const a = shortDay.format(new Date(firstIso));
  const b = shortDay.format(new Date(lastIso));
  return a === b ? a : `${a} – ${b}`;
}
