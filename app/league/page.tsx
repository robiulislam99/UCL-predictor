"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "firebase/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LoadingState, MessageState } from "@/components/States";
import { useRequireUser } from "@/lib/useAuth";
import { getLeague, getPrediction, joinLeague, leaveLeague, normalizeCode } from "@/lib/data";
import { friendlyError } from "@/lib/firebase";
import { fixtures } from "@/lib/fixtures";
import { compareTallies, POINTS, tally, Tally } from "@/lib/scoring";
import { shareOrCopy } from "@/lib/share";
import { League } from "@/lib/types";

type Row = { uid: string; name: string; photoURL?: string | null; t: Tally };

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error" }
  | { kind: "ready"; league: League; rows: Row[] };

async function loadTable(code: string): Promise<State> {
  const league = await getLeague(code);
  if (!league) return { kind: "missing" };
  const docs = await Promise.all(league.members.map((uid) => getPrediction(uid).catch(() => null)));
  const rows = league.members
    .map((uid, i) => ({
      uid,
      name: docs[i]?.displayName ?? "Unknown player",
      photoURL: docs[i]?.photoURL,
      t: tally(docs[i]?.picks, fixtures),
    }))
    .sort((a, b) => compareTallies(a.t, b.t) || a.name.localeCompare(b.name));
  return { kind: "ready", league, rows };
}

/** Standard competition ranking: 1, 2, 2, 4. */
function ranks(rows: Row[]) {
  return rows.map((r, i) => {
    let j = i;
    while (j > 0 && compareTallies(rows[j - 1].t, r.t) === 0) j--;
    return j + 1;
  });
}

function Table({ user }: { user: User }) {
  const code = normalizeCode(useSearchParams().get("code") ?? "");
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    loadTable(code)
      .then((s) => !cancelled && setState(s))
      .catch((e) => {
        console.error(e);
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [code, reload]);

  if (!code || state.kind === "missing") {
    return (
      <MessageState
        title="League not found"
        body="Check the invite code with whoever sent it."
        action={
          <Link href="/leagues/" className="btn-primary inline-block px-5 py-2.5">
            Back to leagues
          </Link>
        }
      />
    );
  }
  if (state.kind === "loading") return <LoadingState label="Loading league table…" />;
  if (state.kind === "error") {
    return <MessageState title="Couldn't load this league" body="Check your connection and try again." />;
  }

  const { league, rows } = state;
  const isMember = league.members.includes(user.uid);
  const isOwner = league.ownerUid === user.uid;
  const rank = ranks(rows);
  const anyResults = fixtures.some((f) => f.result);

  const invite = async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const res = await shareOrCopy({
      title: `Join ${league.name} on Matchday Calls`,
      text: `Join my Champions League prediction league "${league.name}" — code ${league.code}`,
      url: `${window.location.origin}${basePath}/leagues/?join=${league.code}`,
    });
    if (res === "copied") setMsg("Invite link copied!");
    else if (res === "failed") setMsg(`Share this code: ${league.code}`);
    if (res === "copied") setTimeout(() => setMsg(null), 2500);
  };

  const join = async () => {
    setBusy(true);
    try {
      const res = await joinLeague(user, league.code);
      if (res === "full") setMsg("This league is full.");
      else setReload((n) => n + 1);
    } catch (e) {
      console.error(e);
      setMsg(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    try {
      await leaveLeague(user.uid, league.code);
      router.push("/leagues/");
    } catch (e) {
      console.error(e);
      setMsg(friendlyError(e));
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="min-w-0">
          <p className="score-font text-xs tracking-[0.25em] uppercase text-[var(--accent-gold)] mb-1">
            League · {league.code}
          </p>
          <h1 className="display font-black text-2xl sm:text-3xl truncate">{league.name}</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {POINTS.exact} pts exact score · {POINTS.outcome} pt right result
          </p>
        </div>
        {isMember ? (
          <button onClick={invite} className="btn-primary px-5 py-2.5" aria-live="polite">
            {msg ?? "Invite friends"}
          </button>
        ) : (
          <button onClick={join} disabled={busy} className="btn-primary px-5 py-2.5">
            {busy ? "Joining…" : "Join this league"}
          </button>
        )}
      </div>

      {!anyResults && (
        <p className="text-sm text-[var(--text-muted)] ticket px-5 py-4 mb-4">
          The table fills in as results come in. Until then, everyone&apos;s level on zero.
        </p>
      )}

      <div className="ticket overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">League table for {league.name}</caption>
          <thead>
            <tr className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] text-left">
              <th scope="col" className="px-4 py-3 w-10">#</th>
              <th scope="col" className="px-2 py-3">Player</th>
              <th scope="col" className="px-2 py-3 text-right" title="Exact scores">Exact</th>
              <th scope="col" className="px-2 py-3 text-right" title="Fixtures called">Called</th>
              <th scope="col" className="px-4 py-3 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.uid}
                className={`border-t border-[var(--border)] ${r.uid === user.uid ? "bg-[var(--accent-violet-soft)]" : ""}`}
              >
                <td className="px-4 py-3 score-font text-[var(--text-muted)]">{rank[i]}</td>
                <td className="px-2 py-3">
                  <Link href={`/share/?uid=${r.uid}`} className="flex items-center gap-2 min-w-0 hover:underline">
                    {r.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photoURL} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full shrink-0" />
                    ) : (
                      <span className="h-7 w-7 rounded-full bg-[var(--surface-2)] shrink-0" aria-hidden />
                    )}
                    <span className="truncate">
                      {r.name}
                      {r.uid === user.uid && <span className="text-[var(--text-muted)]"> (you)</span>}
                    </span>
                  </Link>
                </td>
                <td className="px-2 py-3 text-right score-font">{r.t.exact}</td>
                <td className="px-2 py-3 text-right score-font text-[var(--text-muted)]">
                  {r.t.picked}/{fixtures.length}
                </td>
                <td className="px-4 py-3 text-right score-font font-bold text-[var(--accent-gold)]">{r.t.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isMember && !isOwner && (
        <div className="text-center mt-8">
          <button
            onClick={leave}
            disabled={busy}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-red)] cursor-pointer"
          >
            Leave league
          </button>
        </div>
      )}
      {!isMember && msg && (
        <p role="alert" className="text-sm text-[var(--accent-red)] mt-4">
          {msg}
        </p>
      )}
    </>
  );
}

export default function LeaguePage() {
  const { user, loading } = useRequireUser();
  if (loading || !user) return <LoadingState label="Checking sign-in…" />;

  return (
    <>
      <main className="pb-10">
        <Header user={user} />
        <section className="max-w-3xl mx-auto px-5 sm:px-10">
          <Suspense fallback={<LoadingState />}>
            <Table user={user} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
