"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header, { Avatar } from "@/components/Header";
import Footer from "@/components/Footer";
import FixtureCard from "@/components/FixtureCard";
import { CheckIcon, GoogleIcon, TargetIcon, TrophyIcon } from "@/components/icons";
import { safeNext, useAuth } from "@/lib/useAuth";
import { friendlyError, loginWithGoogle } from "@/lib/firebase";
import { POINTS } from "@/lib/scoring";
import { TEAMS } from "@/lib/teams";
import { Fixture } from "@/lib/types";

function SignIn() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  if (!configured) {
    return (
      <p role="status" className="card max-w-md px-4 py-3 text-sm text-muted">
        Sign-in isn&apos;t set up on this copy of the site yet. The site owner needs to add the Firebase
        settings (see the README).
      </p>
    );
  }

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
    <div className="flex flex-col items-center gap-3 lg:items-start">
      <button
        type="button"
        onClick={signIn}
        disabled={busy || loading || !!user}
        className="btn btn-primary btn-lg w-full max-w-xs shadow-[0_10px_30px_-10px_rgba(245,185,66,0.6)] sm:w-auto"
      >
        <GoogleIcon />
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>
      <p className="text-xs text-muted">Free to play · No ads · Your email stays private</p>
      {error && (
        <p role="alert" className="text-sm text-red">
          {error}
        </p>
      )}
    </div>
  );
}

// Sample cards for the hero. No kickoff time, so the prerendered HTML doesn't
// depend on the build machine's time zone.
const sample = (home: keyof typeof TEAMS, away: keyof typeof TEAMS, result?: [number, number]): Fixture => ({
  id: `sample-${home}-${away}`,
  matchday: 1,
  kickoff: null,
  home,
  away,
  homeColor: TEAMS[home].color,
  awayColor: TEAMS[away].color,
  ...(result ? { result: { home: result[0], away: result[1] } } : {}),
});

const SAMPLE_TABLE = [
  { name: "Amira", pts: 31 },
  { name: "You", pts: 28, me: true },
  { name: "Tanvir", pts: 24 },
];

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0" aria-hidden>
      <div className="absolute inset-x-0 -inset-y-6 -z-10 rounded-[2rem] bg-violet/20 blur-3xl" />
      <div className="flex flex-col gap-3">
        <FixtureCard fixture={sample("Real Madrid", "Inter Milan", [2, 1])} pick={{ home: 2, away: 1 }} readOnly now={0} />
        <FixtureCard fixture={sample("Arsenal", "Bayern Munich", [1, 1])} pick={{ home: 2, away: 2 }} readOnly now={0} />
        <div className="card px-4 py-3">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-muted">Office Five-a-Side · table</p>
          <ol className="space-y-1.5 text-sm">
            {SAMPLE_TABLE.map((r, i) => (
              <li
                key={r.name}
                className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${r.me ? "bg-violet-soft" : ""}`}
              >
                <span className="w-4 font-mono text-xs text-muted">{i + 1}</span>
                <Avatar name={r.name} size="h-6 w-6" />
                <span className="flex-1 font-medium">{r.name}</span>
                <span className="font-mono font-bold text-gold">{r.pts}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { Icon: TargetIcon, t: "Call it", d: "Set a scoreline for every fixture. Picks save as you go and lock at kickoff." },
  {
    Icon: CheckIcon,
    t: "Score it",
    d: `${POINTS.exact} points for the exact score, ${POINTS.outcome} for the right result. Points land as results come in.`,
  },
  { Icon: TrophyIcon, t: "Beat your mates", d: "Start a private league, send the invite code, and climb the live table." },
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="mx-auto grid max-w-5xl items-center gap-12 overflow-x-clip px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="text-center lg:text-left">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
              League phase · 2026/27
            </p>
            <h1 className="font-display text-[40px] font-black leading-[1.02] tracking-tight sm:text-6xl">
              Call every scoreline before kickoff.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted lg:mx-0">
              Predict every Champions League fixture, earn points when you&apos;re right, and settle the
              argument in a private league with your friends.
            </p>
            <div className="mt-8">
              <Suspense fallback={<div className="h-[76px]" />}>
                <SignIn />
              </Suspense>
            </div>
          </div>
          <HeroPreview />
        </section>

        <section aria-labelledby="how-title" className="border-t border-line bg-surface/40">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <h2 id="how-title" className="mb-8 text-center font-display text-2xl font-black tracking-tight sm:text-3xl">
              How it works
            </h2>
            <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {STEPS.map(({ Icon, t, d }, i) => (
                <li key={t} className="card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-soft text-[#b7a6ff]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mb-1 font-semibold">{t}</h3>
                  <p className="text-sm leading-relaxed text-muted">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
