"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell, { PageHeader } from "@/components/AppShell";
import Board, { StatRow } from "@/components/Board";
import { LoadingState, MessageState, PageLoading } from "@/components/States";
import { AlertIcon, CheckIcon, ShareIcon } from "@/components/icons";
import { plural } from "@/lib/format";
import { appUrl } from "@/lib/site";
import { useRequireUser } from "@/lib/useAuth";
import { useNow } from "@/lib/useNow";
import { getPrediction, savePrediction } from "@/lib/data";
import { fixtures } from "@/lib/fixtures";
import { isLocked, POINTS, tally } from "@/lib/scoring";
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
    const url = appUrl(`/share/?uid=${user.uid}`);
    const result = await shareOrCopy({
      title: "My Matchday Calls card",
      text: "Here are my Champions League predictions — think you can beat them?",
      url,
    });
    if (result === "copied") setShareMsg("Link copied!");
    else if (result === "failed") setShareMsg("Couldn't copy link");
    if (result !== "shared") setTimeout(() => setShareMsg(null), 2000);
  };

  if (loading || !user) return <PageLoading label="Checking sign-in…" />;

  const t = tally(picks, fixtures);
  const open = fixtures.filter((f) => !isLocked(f, now));
  const openUnpicked = open.filter((f) => !picks[f.id]).length;

  const status =
    loadState !== "ready" ? null : saveState === "error" ? (
      <button
        type="button"
        onClick={() => setSaveAttempt((n) => n + 1)}
        className="chip bg-red/15 py-1 text-red"
        role="status"
      >
        <AlertIcon className="h-3.5 w-3.5" />
        Not saved · Retry
      </button>
    ) : (
      <span role="status" className={`chip py-1 ${saveState === "saving" || dirty ? "chip-muted" : everSaved ? "chip-green" : "chip-muted"}`}>
        {saveState === "saving" ? (
          <>
            <span className="spinner h-3 w-3 border-[1.5px]" aria-hidden />
            Saving…
          </>
        ) : dirty ? (
          "Unsaved…"
        ) : everSaved ? (
          <>
            <CheckIcon className="h-3.5 w-3.5" />
            Saved
          </>
        ) : (
          "Autosave"
        )}
      </span>
    );

  return (
    <AppShell user={user} status={status}>
      <PageHeader
        eyebrow="League phase · 2026/27"
        title="Your predictions"
        description={
          openUnpicked > 0
            ? `${plural(openUnpicked, "open fixture")} still to call. Picks save automatically and lock at kickoff.`
            : open.length > 0
              ? "Every open fixture is called. Nice work."
              : "No open fixtures right now. Check back when the next matchday is scheduled."
        }
        actions={
          <button type="button" onClick={share} className="btn btn-secondary" aria-live="polite">
            <ShareIcon className="h-4 w-4" />
            {shareMsg ?? "Share my card"}
          </button>
        }
      />

      {loadState === "loading" && <LoadingState label="Loading your card…" />}
      {loadState === "error" && (
        <MessageState
          title="Couldn't load your card"
          body="Check your connection and try again."
          action={
            <button
              className="btn btn-primary"
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
              { label: "Points", value: t.points, hint: `${POINTS.exact} per exact · ${POINTS.outcome} per result` },
              { label: "Exact", value: t.exact, hint: "Spot-on scorelines" },
              { label: "Called", value: `${t.picked}/${fixtures.length}`, hint: "Fixtures predicted" },
            ]}
          />
          <Board picks={picks} now={now} onChange={updatePick} />
        </>
      )}
    </AppShell>
  );
}
