"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "firebase/auth";
import AppShell, { BackLink } from "@/components/AppShell";
import { Avatar } from "@/components/Header";
import { LoadingState, MessageState, PageLoading } from "@/components/States";
import { ArrowLeftIcon, LogOutIcon, ShareIcon, TrophyIcon } from "@/components/icons";
import { ordinal, plural } from "@/lib/format";
import { appUrl } from "@/lib/site";
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
        icon={<TrophyIcon className="h-6 w-6" />}
        action={
          <Link href="/leagues/" className="btn btn-primary">
            Back to leagues
          </Link>
        }
      />
    );
  }
  if (state.kind === "loading") return <LoadingState label="Loading league table…" />;
  if (state.kind === "error") {
    return (
      <MessageState
        title="Couldn't load this league"
        body="Check your connection and try again."
        action={
          <button type="button" className="btn btn-primary" onClick={() => setReload((n) => n + 1)}>
            Retry
          </button>
        }
      />
    );
  }

  const { league, rows } = state;
  const isMember = league.members.includes(user.uid);
  const isOwner = league.ownerUid === user.uid;
  const rank = ranks(rows);
  const anyResults = fixtures.some((f) => f.result);

  const invite = async () => {
    const res = await shareOrCopy({
      title: `Join ${league.name} on Matchday Calls`,
      text: `Join my Champions League prediction league "${league.name}" — code ${league.code}`,
      url: appUrl(`/leagues/?join=${league.code}`),
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

  const me = rows.findIndex((r) => r.uid === user.uid);

  return (
    <>
      <BackLink href="/leagues/">
        <ArrowLeftIcon className="h-4 w-4" />
        All leagues
      </BackLink>

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-gold">League · {league.code}</p>
          <h1 className="font-display text-[28px] font-black leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-4xl">
            {league.name}
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            {plural(rows.length, "player")} · {POINTS.exact} pts exact score · {POINTS.outcome} pt right result
          </p>
        </div>
        {isMember ? (
          <button type="button" onClick={invite} className="btn btn-primary self-start sm:self-auto" aria-live="polite">
            <ShareIcon className="h-4 w-4" />
            {msg ?? "Invite friends"}
          </button>
        ) : (
          <button type="button" onClick={join} disabled={busy} className="btn btn-primary self-start sm:self-auto">
            {busy ? "Joining…" : "Join this league"}
          </button>
        )}
      </div>

      {isMember && me >= 0 && anyResults && (
        <div className="card mb-4 flex items-center gap-4 bg-violet-soft px-5 py-4">
          <span className="font-display text-3xl font-black">{rank[me]}</span>
          <div className="text-sm">
            <p className="font-semibold">
              You&apos;re {ordinal(rank[me])} of {rows.length}
            </p>
            <p className="text-muted">
              {rows[me].t.points} pts · {rows[me].t.exact} exact {rows[me].t.exact === 1 ? "score" : "scores"}
            </p>
          </div>
        </div>
      )}

      {!anyResults && (
        <p className="card mb-4 px-5 py-4 text-sm text-muted">
          The table fills in as results come in. Until then, everyone&apos;s level on zero.
        </p>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">League table for {league.name}</caption>
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-widest text-muted">
              <th scope="col" className="w-12 py-3 pl-4 pr-1 font-medium sm:pl-5">
                #
              </th>
              <th scope="col" className="w-full px-2 py-3 font-medium">
                Player
              </th>
              <th scope="col" className="px-2 py-3 text-right font-medium" title="Exact scores">
                Exact
              </th>
              <th scope="col" className="hidden px-2 py-3 text-right font-medium sm:table-cell" title="Fixtures called">
                Called
              </th>
              <th scope="col" className="py-3 pl-2 pr-4 text-right font-medium sm:pr-5">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const mine = r.uid === user.uid;
              const podium = anyResults && rank[i] <= 3;
              return (
                <tr key={r.uid} className={`border-t border-line first:border-t-0 ${mine ? "bg-violet-soft" : ""}`}>
                  <td className="py-3 pl-4 pr-1 sm:pl-5">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full font-mono text-xs font-bold ${
                        podium ? MEDAL[rank[i] - 1] : "text-muted"
                      }`}
                    >
                      {rank[i]}
                    </span>
                  </td>
                  <td className="max-w-0 px-2 py-3">
                    <Link href={`/share/?uid=${r.uid}`} className="flex min-w-0 items-center gap-2.5 hover:underline">
                      <Avatar name={r.name} photoURL={r.photoURL} size="h-8 w-8" />
                      <span className="truncate font-medium">
                        {r.name}
                        {mine && <span className="font-normal text-muted"> (you)</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-right font-mono">{r.t.exact}</td>
                  <td className="hidden px-2 py-3 text-right font-mono text-muted sm:table-cell">
                    {r.t.picked}/{fixtures.length}
                  </td>
                  <td className="py-3 pl-2 pr-4 text-right font-mono text-base font-bold text-gold sm:pr-5">{r.t.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Ties are broken by exact scores, then correct results. Tap a player to see their card.</p>

      {isMember && !isOwner && (
        <div className="mt-10 border-t border-line pt-6 text-center">
          <button type="button" onClick={leave} disabled={busy} className="btn btn-ghost hover:text-red">
            <LogOutIcon className="h-4 w-4" />
            Leave league
          </button>
        </div>
      )}
      {!isMember && msg && (
        <p role="alert" className="mt-4 text-sm text-red">
          {msg}
        </p>
      )}
    </>
  );
}

const MEDAL = ["bg-gold text-canvas", "bg-[#c9d1e0] text-canvas", "bg-[#cd8a52] text-canvas"];

export default function LeaguePage() {
  const { user, loading } = useRequireUser();
  if (loading || !user) return <PageLoading label="Checking sign-in…" />;

  return (
    <AppShell user={user}>
      <Suspense fallback={<LoadingState />}>
        <Table user={user} />
      </Suspense>
    </AppShell>
  );
}
