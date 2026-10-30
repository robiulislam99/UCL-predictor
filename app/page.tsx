"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/lib/useAuth";
import { loginWithGoogle } from "@/lib/firebase";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/predict/");
    }
  }, [loading, user, router]);

  return (
    <main>
      <Header />
      <section className="max-w-3xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-20 text-center">
        <p
          className="score-font text-xs tracking-[0.3em] uppercase mb-4"
          style={{ color: "var(--accent-gold)" }}
        >
          League Phase · 2026/27
        </p>
        <h1 className="display font-black text-4xl sm:text-6xl leading-[1.05] mb-6">
          Call every scoreline
          <br />
          before kickoff.
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto mb-10">
          Sign in, predict every Champions League fixture, and share your
          card with friends to see who really knows the game.
        </p>

        <button
          onClick={() => loginWithGoogle().catch(console.error)}
          className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-[var(--bg)] cursor-pointer transition-transform hover:scale-[1.02]"
          style={{ background: "var(--accent-gold)" }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path
              fill="#4285F4"
              d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h11.8c-.5 2.7-2.1 5-4.4 6.6v5.5h7.1c4.2-3.9 6.6-9.6 6.6-16.6z"
            />
            <path
              fill="#34A853"
              d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.6-3.9-12.4-9.1H4.3v5.7C7.9 41 15.3 46 24 46z"
            />
            <path
              fill="#FBBC05"
              d="M11.6 28.1c-.5-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3C2.8 17.1 2 20.5 2 24s.8 6.9 2.3 9.8l7.3-5.7z"
            />
            <path
              fill="#EA4335"
              d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C34.9 4.2 30 2 24 2 15.3 2 7.9 7 4.3 14.2l7.3 5.7c1.8-5.2 6.6-9.1 12.4-9.1z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mt-16 grid sm:grid-cols-3 gap-4 text-left">
          {[
            {
              n: "01",
              t: "Sign in",
              d: "One tap with Google — no password to manage.",
            },
            {
              n: "02",
              t: "Predict",
              d: "Set a scoreline for every fixture on the board.",
            },
            {
              n: "03",
              t: "Share",
              d: "Send friends your card link and compare calls.",
            },
          ].map((s) => (
            <div key={s.n} className="ticket p-5">
              <span
                className="score-font text-xs"
                style={{ color: "var(--accent-violet)" }}
              >
                {s.n}
              </span>
              <h3 className="font-semibold mt-1 mb-1">{s.t}</h3>
              <p className="text-sm text-[var(--text-muted)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
