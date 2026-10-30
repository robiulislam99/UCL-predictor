"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Header from "@/components/Header";
import FixtureCard from "@/components/FixtureCard";
import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/firebase";
import { fixtures } from "@/lib/fixtures";
import { Pick } from "@/lib/types";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function PredictPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [loadingPicks, setLoadingPicks] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, "predictions", user.uid));
      if (snap.exists()) {
        setPicks((snap.data().picks as Record<string, Pick>) ?? {});
      }
      setLoadingPicks(false);
    })();
  }, [user]);

  const updatePick = useCallback((fixtureId: string, p: Pick) => {
    setPicks((prev) => ({ ...prev, [fixtureId]: p }));
  }, []);

  const save = useCallback(async () => {
    if (!user) return;
    setSaveState("saving");
    try {
      await setDoc(
        doc(db, "predictions", user.uid),
        {
          displayName: user.displayName ?? "Anonymous",
          photoURL: user.photoURL ?? null,
          updatedAt: serverTimestamp(),
          picks,
        },
        { merge: true }
      );
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (e) {
      console.error(e);
      setSaveState("error");
    }
  }, [user, picks]);

  const shareLink = useCallback(() => {
    if (!user) return "";
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return `${window.location.origin}${basePath}/share/?uid=${user.uid}`;
  }, [user]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user || loadingPicks) {
    return (
      <main className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">
        Loading your card…
      </main>
    );
  }

  const madePickCount = Object.keys(picks).length;

  return (
    <main className="pb-24">
      <Header
        user={user}
        rightSlot={
          <button
            onClick={copyLink}
            className="text-sm px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent-violet)] transition-colors cursor-pointer"
          >
            {copied ? "Link copied!" : "Share my card"}
          </button>
        }
      />

      <section className="max-w-3xl mx-auto px-6 sm:px-10">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="display font-black text-2xl sm:text-3xl">
              Your predictions
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {madePickCount} of {fixtures.length} fixtures called
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {fixtures.map((f) => (
            <FixtureCard
              key={f.id}
              fixture={f}
              pick={picks[f.id]}
              onChange={(p) => updatePick(f.id, p)}
            />
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">
            {saveState === "saved"
              ? "Saved to your account ✓"
              : saveState === "error"
              ? "Couldn't save — try again"
              : "Changes save to your account"}
          </span>
          <button
            onClick={save}
            disabled={saveState === "saving"}
            className="px-6 py-2.5 rounded-lg font-semibold text-[var(--bg)] cursor-pointer disabled:opacity-60"
            style={{ background: "var(--accent-gold)" }}
          >
            {saveState === "saving" ? "Saving…" : "Save predictions"}
          </button>
        </div>
      </div>
    </main>
  );
}
