"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LoadingState } from "@/components/States";
import { useRequireUser } from "@/lib/useAuth";
import { CODE_PATTERN, createLeague, getMyLeagues, joinLeague, normalizeCode } from "@/lib/data";
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

  if (error) return <p className="text-sm text-[var(--accent-red)]">Couldn&apos;t load your leagues.</p>;
  if (!leagues) return <LoadingState label="Loading your leagues…" />;
  if (leagues.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] ticket px-5 py-6 text-center">
        You&apos;re not in any leagues yet. Create one below and send the code to your friends.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {leagues.map((l) => (
        <li key={l.code}>
          <Link
            href={`/league/?code=${l.code}`}
            className="ticket px-5 py-4 flex items-center justify-between gap-4 hover:border-[var(--accent-violet)] transition-colors"
          >
            <span className="min-w-0">
              <span className="font-semibold block truncate">{l.name}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {l.members.length} player{l.members.length === 1 ? "" : "s"}
                {l.ownerUid === user.uid && " · you run this league"}
              </span>
            </span>
            <span className="score-font text-sm text-[var(--accent-gold)] shrink-0">{l.code} →</span>
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
    <div className="grid sm:grid-cols-2 gap-4 mt-10">
      <form onSubmit={onJoin} className="ticket p-5 flex flex-col gap-3">
        <h2 className="font-semibold">Join a league</h2>
        <label htmlFor="join-code" className="text-xs text-[var(--text-muted)]">
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
          className="field score-font tracking-[0.3em] uppercase"
        />
        <button type="submit" disabled={busy !== null} className="btn-primary px-5 py-2.5">
          {busy === "join" ? "Joining…" : "Join"}
        </button>
      </form>

      <form onSubmit={onCreate} className="ticket p-5 flex flex-col gap-3">
        <h2 className="font-semibold">Start a league</h2>
        <label htmlFor="league-name" className="text-xs text-[var(--text-muted)]">
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
        <button type="submit" disabled={busy !== null || !name.trim()} className="btn-ghost px-5 py-2.5">
          {busy === "create" ? "Creating…" : "Create league"}
        </button>
      </form>

      {error && (
        <p role="alert" className="sm:col-span-2 text-sm text-[var(--accent-red)]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function LeaguesPage() {
  const { user, loading } = useRequireUser();
  if (loading || !user) return <LoadingState label="Checking sign-in…" />;

  return (
    <>
      <main className="pb-10">
        <Header user={user} />
        <section className="max-w-3xl mx-auto px-5 sm:px-10">
          <h1 className="display font-black text-2xl sm:text-3xl mb-1">Leagues</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Private tables for you and your friends. Everyone&apos;s card counts in every league
            they&apos;re in.
          </p>
          <MyLeagues user={user} />
          <Suspense>
            <Forms user={user} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
