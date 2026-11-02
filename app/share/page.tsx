"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Board, { StatRow } from "@/components/Board";
import { LoadingState, MessageState } from "@/components/States";
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
    <Link href={user ? "/predict/" : "/"} className="btn-primary inline-block px-5 py-2.5">
      {user ? "Go to my card" : "Make your own predictions"}
    </Link>
  );

  if (!uid) {
    return <MessageState title="No card selected" body="Ask your friend for their share link." action={cta} />;
  }
  if (state.kind === "loading") return <LoadingState label="Loading prediction card…" />;
  if (state.kind === "missing") {
    return (
      <MessageState
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
      <div className="flex items-center gap-3 mb-6">
        {data.photoURL && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="h-12 w-12 rounded-full border border-[var(--border)]"
          />
        )}
        <div className="min-w-0">
          <h1 className="display font-black text-2xl sm:text-3xl truncate">
            {isMine ? "Your card" : `${data.displayName}'s card`}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Read-only · picks lock at kickoff</p>
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
      {!isMine && <div className="text-center mt-10">{cta}</div>}
    </>
  );
}

function ShareHeader() {
  const { user } = useAuth();
  return <Header user={user} />;
}

export default function SharePage() {
  return (
    <>
      <main className="pb-10">
        <ShareHeader />
        <section className="max-w-3xl mx-auto px-5 sm:px-10">
          <Suspense fallback={<LoadingState />}>
            <ShareContent />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
