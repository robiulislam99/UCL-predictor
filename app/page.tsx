"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { safeNext, useAuth } from "@/lib/useAuth";
import { friendlyError, loginWithGoogle } from "@/lib/firebase";
import { POINTS } from "@/lib/scoring";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h11.8c-.5 2.7-2.1 5-4.4 6.6v5.5h7.1c4.2-3.9 6.6-9.6 6.6-16.6z" />
      <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7C7.9 41 15.3 46 24 46z" />
      <path fill="#FBBC05" d="M11.6 28.1c-.5-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3C2.8 17.1 2 20.5 2 24s.8 6.9 2.3 9.8l7.3-5.7z" />
      <path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C34.9 4.2 30 2 24 2 15.3 2 7.9 7 4.3 14.2l7.3 5.7c1.8-5.2 6.6-9.1 12.4-9.1z" />
    </svg>
  );
}

function SignIn() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={signIn}
        disabled={busy || loading || !!user}
        className="btn-primary inline-flex items-center gap-3 px-6 py-3.5 text-base"
      >
        <GoogleIcon />
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-[var(--accent-red)]">
          {error}
        </p>
      )}
    </div>
  );
}

const STEPS = [
  { n: "01", t: "Call it", d: "Set a scoreline for every fixture. Picks lock at kickoff." },
  { n: "02", t: "Score it", d: `${POINTS.exact} pts for the exact score, ${POINTS.outcome} for the right result.` },
  { n: "03", t: "Beat your mates", d: "Start a private league, send the invite code, climb the table." },
];

export default function Home() {
  return (
    <>
      <main>
        <Header />
        <section className="max-w-3xl mx-auto px-6 sm:px-10 pt-14 sm:pt-24 pb-12 text-center">
          <p className="score-font text-xs tracking-[0.3em] uppercase mb-4 text-[var(--accent-gold)]">
            League Phase · 2026/27
          </p>
          <h1 className="display font-black text-4xl sm:text-6xl leading-[1.05] mb-6">
            Call every scoreline
            <br />
            before kickoff.
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto mb-10">
            Predict every Champions League fixture, earn points when you&apos;re right, and settle
            the argument in a private league with your friends.
          </p>

          <Suspense fallback={<div className="h-[52px]" />}>
            <SignIn />
          </Suspense>

          <ol className="mt-16 grid sm:grid-cols-3 gap-4 text-left">
            {STEPS.map((s) => (
              <li key={s.n} className="ticket p-5">
                <span className="score-font text-xs text-[var(--accent-violet)]">{s.n}</span>
                <h3 className="font-semibold mt-1 mb-1">{s.t}</h3>
                <p className="text-sm text-[var(--text-muted)]">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
