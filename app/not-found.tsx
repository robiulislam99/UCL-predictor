import Link from "next/link";
import { Logo } from "@/components/Header";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo />
      <p className="mt-6 font-mono text-6xl font-bold text-gold">4–0–4</p>
      <h1 className="font-display text-2xl font-black">Offside. This page doesn&apos;t exist.</h1>
      <p className="max-w-sm text-sm text-muted">The link may be old or mistyped.</p>
      <Link href="/" className="btn btn-primary mt-2">
        Back to Matchday Calls
      </Link>
    </main>
  );
}
