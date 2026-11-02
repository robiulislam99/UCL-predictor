"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Board, { StatRow } from "@/components/Board";
import { LoadingState, MessageState } from "@/components/States";
import { useRequireUser } from "@/lib/useAuth";
import { useNow } from "@/lib/useNow";
import { getPrediction, savePrediction } from "@/lib/data";
import { fixtures } from "@/lib/fixtures";
import { isLocked, tally } from "@/lib/scoring";
import { Pick, Picks } from "@/lib/types";
import { shareOrCopy } from "@/lib/share";

type LoadState = "loading" | "ready" | "error";
type SaveState = "idle" | "saving" | "error";

const AUTOSAVE_MS = 800;

export default function PredictPage() {
  const { user, loading } = useRequireUser();
  const now = useNow();
  const [picks, setPicks] = useState<Picks>({});
  const [saved, setSaved] = useState<Picks>({}); // last version Firestore confirmed
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveAttempt, setSaveAttempt] = useState(0);
  const [everSaved, setEverSaved] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const dirty = picks !== saved;

  // Load
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getPrediction(user.uid)
      .then((d) => {
        if (cancelled) return;
        const p = d?.picks ?? {};
        setPicks(p);
        setSaved(p);
        setLoadState("ready");
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [user, loadAttempt]);

  // Autosave, debounced. Comparing against `saved` by reference means edits
  // made while a save is in flight simply schedule another save.
  useEffect(() => {
    if (!user || !dirty) return;
    const snapshot = picks;
    const t = setTimeout(async () => {
      setSaveState("saving");
      try {
        await savePrediction(user, snapshot);
        setSaved(snapshot);
        setEverSaved(true);
        setSaveState("idle");
      } catch (e) {
        console.error(e);
        setSaveState("error");
      }
    }, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [user, picks, dirty, saveAttempt]);

  // Don't let people close the tab on unsaved picks.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const updatePick = useCallback(
    (fixtureId: string, p: Pick) => {
      const f = fixtures.find((x) => x.id === fixtureId);
      if (!f || isLocked(f, Date.now())) return;
      setPicks((prev) => ({ ...prev, [fixtureId]: p }));
    },
    []
  );

  const share = async () => {
    if (!user) return;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const url = `${window.location.origin}${basePath}/share/?uid=${user.uid}`;
    const result = await shareOrCopy({
      title: "My Matchday Calls card",
      text: "Here are my Champions League predictions — think you can beat them?",
      url,
    });
    if (result === "copied") setShareMsg("Link copied!");
    else if (result === "failed") setShareMsg("Couldn't copy link");
    if (result !== "shared") setTimeout(() => setShareMsg(null), 2000);
  };

  if (loading || !user) return <LoadingState label="Checking sign-in…" />;

  const t = tally(picks, fixtures);
  const open = fixtures.filter((f) => !isLocked(f, now));
  const openUnpicked = open.filter((f) => !picks[f.id]).length;

  const statusText =
    saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Couldn't save your latest picks."
        : dirty
          ? "Unsaved changes…"
          : everSaved
            ? "All picks saved ✓"
            : "Picks save automatically";

  return (
    <>
      <main className="pb-28">
        <Header
          user={user}
          rightSlot={
            <button onClick={share} className="btn-ghost text-sm px-4 py-2" aria-live="polite">
              {shareMsg ?? "Share my card"}
            </button>
          }
        />

        <section className="max-w-3xl mx-auto px-5 sm:px-10">
          <h1 className="display font-black text-2xl sm:text-3xl mb-1">Your predictions</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {openUnpicked > 0
              ? `${openUnpicked} open fixture${openUnpicked === 1 ? "" : "s"} still to call.`
              : open.length > 0
                ? "Every open fixture is called. Nice."
                : "No open fixtures right now — check back when the next matchday is scheduled."}
          </p>

          {loadState === "loading" && <LoadingState label="Loading your card…" />}
          {loadState === "error" && (
            <MessageState
              title="Couldn't load your card"
              body="Check your connection and try again."
              action={
                <button
                  className="btn-primary px-5 py-2.5"
                  onClick={() => {
                    setLoadState("loading");
                    setLoadAttempt((n) => n + 1);
                  }}
                >
                  Retry
                </button>
              }
            />
          )}
          {loadState === "ready" && (
            <>
              <StatRow
                items={[
                  { label: "Points", value: t.points },
                  { label: "Exact", value: t.exact },
                  { label: "Called", value: `${t.picked}/${fixtures.length}` },
                ]}
              />
              <Board picks={picks} now={now} onChange={updatePick} />
            </>
          )}
        </section>
      </main>
      <Footer />

      {loadState === "ready" && (
        <div className="fixed bottom-0 inset-x-0 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-3xl mx-auto px-5 sm:px-10 py-3.5 flex items-center justify-between gap-4">
            <span
              role="status"
              className={`text-sm ${saveState === "error" ? "text-[var(--accent-red)]" : "text-[var(--text-muted)]"}`}
            >
              {statusText}
            </span>
            {saveState === "error" && (
              <button className="btn-primary px-5 py-2" onClick={() => setSaveAttempt((n) => n + 1)}>
                Retry
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
