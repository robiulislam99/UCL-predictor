import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <main className="max-w-2xl mx-auto px-5 sm:px-10 py-14">
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          ← Matchday Calls
        </Link>
        <h1 className="display font-black text-3xl mt-6 mb-6">Privacy</h1>
        <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
          <p>
            <strong className="text-[var(--text-primary)]">What we store.</strong> When you sign in
            with Google we store your display name, profile photo URL and your score predictions in
            Google Firebase. If you join or start a league, we store the league name and which
            players are in it. We don&apos;t store your email address in our database, and we
            don&apos;t use advertising or tracking cookies.
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">Who can see it.</strong> Anyone with your
            share link can see your name, photo and predictions. Members of a league you&apos;re in
            can see the same on the league table.
          </p>
          <p>
            <strong className="text-[var(--text-primary)]">Deleting your data.</strong> Contact the
            site owner and we&apos;ll delete your predictions and remove you from every league.
          </p>
          <p>
            Sign-in is handled by Google Firebase Authentication; see Google&apos;s privacy policy
            for how they process your account data.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
