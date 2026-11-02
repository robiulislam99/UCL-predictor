"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Avatar } from "@/components/Header";
import Board, { StatRow } from "@/components/Board";
import { LoadingState, MessageState } from "@/components/States";
import { CardIcon } from "@/components/icons";
import { getPrediction } from "@/lib/data";
import { fixtures } from "@/lib/fixtures";
import { tally } from "@/lib/scoring";
import { useAuth } from "@/lib/useAuth";
import { useNow } from "@/lib/useNow";
import { PredictionDoc } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error" }
  | { kind: "ready"; data: PredictionDoc };

function ShareContent() {
  const uid = useSearchParams().get("uid");
  const { user } = useAuth();
  const now = useNow();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    getPrediction(uid)
      .then((data) => !cancelled && setState(data ? { kind: "ready", data } : { kind: "missing" }))
      .catch((e) => {
        console.error(e);
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const cta = (
    <Link href={user ? "/predict/" : "/"} className="btn btn-primary">
      {user ? "Go to my card" : "Make your own predictions"}
    </Link>
  );

  if (!uid) {
    return (
      <MessageState
        icon={<CardIcon className="h-6 w-6" />}
        title="No card selected"
        body="Ask your friend for their share link."
        action={cta}
      />
    );
  }
  if (state.kind === "loading") return <LoadingState label="Loading prediction card…" />;
  if (state.kind === "missing") {
    return (
      <MessageState
        icon={<CardIcon className="h-6 w-6" />}
        title="Card not found"
        body="This prediction card doesn't exist, or the link is wrong."
        action={cta}
      />
    );
  }
  if (state.kind === "error") {
    return <MessageState title="Couldn't load this card" body="Check your connection and try again." />;
  }

  const { data } = state;
  const t = tally(data.picks, fixtures);
  const isMine = user?.uid === uid;

  return (
    <>
      <div className="mb-6 flex items-center gap-4 sm:mb-8">
        <Avatar name={data.displayName} photoURL={data.photoURL} size="h-14 w-14 text-base" />
        <div className="min-w-0">
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.22em] text-gold">Prediction card</p>
          <h1 className="font-display text-[26px] font-black leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-4xl">
            {isMine ? "Your card" : `${data.displayName}'s card`}
          </h1>
          <p className="text-sm text-muted">Read-only · picks lock at kickoff</p>
        </div>
      </div>

      <StatRow
        items={[
          { label: "Points", value: t.points },
          { label: "Exact", value: t.exact },
          { label: "Called", value: `${t.picked}/${fixtures.length}` },
        ]}
      />
      <Board picks={data.picks} now={now} />
      {!isMine && (
        <div className="card mt-10 flex flex-col items-center gap-3 px-6 py-8 text-center">
          <p className="font-display text-xl font-black">Think you can do better?</p>
          <p className="max-w-md text-sm text-muted">Make your own predictions and start a league with your friends. It&apos;s free.</p>
          {cta}
        </div>
      )}
    </>
  );
}

export default function SharePage() {
  const { user } = useAuth();
  return (
    <AppShell user={user}>
      <Suspense fallback={<LoadingState />}>
        <ShareContent />
      </Suspense>
    </AppShell>
  );
}
