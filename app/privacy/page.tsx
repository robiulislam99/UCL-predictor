import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Privacy" };

const SECTIONS = [
  {
    title: "What we store",
    body: "When you sign in with Google we store your display name, profile photo URL and your score predictions in Google Firebase. If you join or start a league, we store the league name and which players are in it. We don't store your email address in our database, and we don't use advertising or tracking cookies.",
  },
  {
    title: "Who can see it",
    body: "Anyone with your share link can see your name, photo and predictions. Members of a league you're in can see the same on the league table.",
  },
  {
    title: "Deleting your data",
    body: "Contact the site owner and we'll delete your predictions and remove you from every league.",
  },
  {
    title: "Sign-in",
    body: "Sign-in is handled by Google Firebase Authentication; see Google's privacy policy for how they process your account data.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-gold">Matchday Calls</p>
        <h1 className="mb-8 font-display text-4xl font-black tracking-tight">Privacy</h1>
        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="mb-1.5 font-semibold text-fg">{s.title}</h2>
              <p className="leading-relaxed text-muted">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
