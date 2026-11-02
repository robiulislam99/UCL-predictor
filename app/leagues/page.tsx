"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell, { PageHeader } from "@/components/AppShell";
import { LoadingState, PageLoading } from "@/components/States";
import { ChevronRightIcon, TrophyIcon, UsersIcon } from "@/components/icons";
import { plural } from "@/lib/format";
import { useRequireUser } from "@/lib/useAuth";
import { CODE_PATTERN, createLeague, getMyLeagues, joinLeague, MAX_LEAGUE_MEMBERS, normalizeCode } from "@/lib/data";
import { friendlyError } from "@/lib/firebase";
import { League } from "@/lib/types";
import { User } from "firebase/auth";

function MyLeagues({ user }: { user: User }) {
  const [leagues, setLeagues] = useState<League[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyLeagues(user.uid)
      .then((l) => !cancelled && setLeagues(l))
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (error) return <p className="card px-5 py-4 text-sm text-red">Couldn&apos;t load your leagues. Refresh to try again.</p>;
  if (!leagues) return <LoadingState label="Loading your leagues…" />;
  if (leagues.length === 0) {
    return (
      <div className="card flex flex-col items-center px-6 py-10 text-center">
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-violet-soft text-[#b7a6ff]">
          <TrophyIcon className="h-6 w-6" />
        </span>
        <p className="font-semibold">No leagues yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Start one below and send the invite code to your friends, or join theirs with a code.
        </p>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {leagues.map((l) => (
        <li key={l.code}>
          <Link
            href={`/league/?code=${l.code}`}
            className="card group flex items-center gap-4 px-4 py-4 transition-colors hover:border-line-strong hover:bg-surface-2 sm:px-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-soft font-display text-sm font-black text-[#b7a6ff]">
              {l.name.trim().charAt(0).toUpperCase() || "L"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{l.name}</span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <UsersIcon className="h-3.5 w-3.5" />
                  {plural(l.members.length, "player")}
                </span>
                {l.ownerUid === user.uid && <span className="chip chip-violet">Owner</span>}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-gold">
              {l.code}
              <ChevronRightIcon className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Forms({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const joinParam = useSearchParams().get("join");
  const [code, setCode] = useState(() => normalizeCode(joinParam ?? "").slice(0, 6));
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy("create");
    setError(null);
    try {
      const newCode = await createLeague(user, name);
      router.push(`/league/?code=${newCode}`);
    } catch (err) {
      console.error(err);
      setError(friendlyError(err));
      setBusy(null);
    }
  };

  const onJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = normalizeCode(code);
    if (!CODE_PATTERN.test(c)) {
      setError("League codes are 6 letters/numbers, like K7MX2Q.");
      return;
    }
    setBusy("join");
    setError(null);
    try {
      const res = await joinLeague(user, c);
      if (res === "not-found") throw new Error("not-found");
      if (res === "full") {
        setError("That league is full.");
        setBusy(null);
        return;
      }
      router.push(`/league/?code=${c}`);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && err.message === "not-found"
          ? "No league with that code. Double-check it with your friend."
          : friendlyError(err)
      );
      setBusy(null);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="mb-4 font-display text-xl font-black tracking-tight">Join or start a league</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <form onSubmit={onJoin} className="card flex flex-col gap-3 p-5">
          <div>
            <h3 className="font-semibold">Join with a code</h3>
            <p className="mt-0.5 text-sm text-muted">Got an invite? Enter the 6-character code.</p>
          </div>
          <label htmlFor="join-code" className="sr-only">
            Invite code
          </label>
          <input
            id="join-code"
            value={code}
            onChange={(e) => setCode(normalizeCode(e.target.value).slice(0, 6))}
            placeholder="K7MX2Q"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            inputMode="text"
            className="field font-mono uppercase tracking-[0.3em]"
          />
          <button type="submit" disabled={busy !== null} className="btn btn-primary mt-auto">
            {busy === "join" ? "Joining…" : "Join league"}
          </button>
        </form>

        <form onSubmit={onCreate} className="card flex flex-col gap-3 p-5">
          <div>
            <h3 className="font-semibold">Start a new league</h3>
            <p className="mt-0.5 text-sm text-muted">You&apos;ll get a code to share. Up to {MAX_LEAGUE_MEMBERS} players.</p>
          </div>
          <label htmlFor="league-name" className="sr-only">
            League name
          </label>
          <input
            id="league-name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 40))}
            placeholder="Sunday League Legends"
            className="field"
            required
          />
          <button type="submit" disabled={busy !== null || !name.trim()} className="btn btn-secondary mt-auto">
            {busy === "create" ? "Creating…" : "Create league"}
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red">
          {error}
        </p>
      )}
    </div>
  );
}

export default function LeaguesPage() {
  const { user, loading } = useRequireUser();
  if (loading || !user) return <PageLoading label="Checking sign-in…" />;

  return (
    <AppShell user={user}>
      <PageHeader
        title="Leagues"
        description="Private tables for you and your friends. Your one prediction card counts in every league you're in."
      />
      <MyLeagues user={user} />
      <Suspense>
        <Forms user={user} />
      </Suspense>
    </AppShell>
  );
}
